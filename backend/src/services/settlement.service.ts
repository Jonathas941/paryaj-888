import { transaction } from "../db/pool";
import { badRequest, notFound } from "../utils/errors";
import { money } from "../utils/money";
import { lockWallet, postTransaction } from "./wallet.service";

/**
 * Settles one market: marks each selection WON/LOST/VOID, then resolves every
 * bet that touches it.
 *
 * Idempotent by construction — only bets still in ACCEPTED are considered, so
 * running this twice pays out once. A bet is resolved only when *all* of its
 * legs have a result, which is what makes multiples safe to settle
 * incrementally as their events finish.
 *
 * VOID legs are treated as odds 1.0 (stake returned for that leg) rather than
 * losing the bet, which is standard sportsbook behaviour.
 */
export async function settleMarket(
  marketId: string,
  results: Array<{ selectionId: string; result: "WON" | "LOST" | "VOID" }>,
  actorId?: string
) {
  if (!results?.length) throw badRequest("No selection results supplied.");

  return transaction(async client => {
    const { rows: marketRows } = await client.query(
      "SELECT * FROM markets WHERE id = $1 FOR UPDATE",
      [marketId]
    );
    if (!marketRows.length) throw notFound("Market not found.");

    for (const r of results) {
      await client.query(
        "UPDATE selections SET result = $2, status = 'SETTLED' WHERE id = $1 AND market_id = $3",
        [r.selectionId, r.result, marketId]
      );
    }
    await client.query("UPDATE markets SET status = 'SETTLED' WHERE id = $1", [marketId]);

    // Propagate results onto the frozen bet legs.
    await client.query(
      `UPDATE bet_selections bs
          SET result = s.result
         FROM selections s
        WHERE s.id = bs.selection_id
          AND s.market_id = $1
          AND s.result IS NOT NULL`,
      [marketId]
    );

    // Candidate bets: unsettled, and touching this market.
    // Note: Postgres rejects DISTINCT combined with FOR UPDATE, so the
    // de-duplication happens in a subquery and the lock applies to bets only.
    const { rows: candidates } = await client.query(
      `SELECT b.id
         FROM bets b
        WHERE b.status = 'ACCEPTED'
          AND b.id IN (SELECT bs.bet_id FROM bet_selections bs WHERE bs.market_id = $1)
        FOR UPDATE`,
      [marketId]
    );

    const settled: Array<{ betId: string; status: string; payout: string }> = [];

    for (const { id: betId } of candidates) {
      const { rows: legs } = await client.query(
        "SELECT odds_at_placement, result FROM bet_selections WHERE bet_id = $1",
        [betId]
      );

      // Any leg still open → the bet stays open.
      if (legs.some(l => l.result == null)) continue;

      const { rows: betRows } = await client.query("SELECT * FROM bets WHERE id = $1", [betId]);
      const bet = betRows[0];

      const lost = legs.some(l => l.result === "LOST");
      let status: "WON" | "LOST" | "VOID";
      let payout = 0;

      if (lost) {
        status = "LOST";
        payout = 0;
      } else if (legs.every(l => l.result === "VOID")) {
        // Whole bet voided — return the stake.
        status = "VOID";
        payout = parseFloat(bet.stake);
      } else {
        status = "WON";
        const effectiveOdds = legs.reduce(
          (acc, l) => acc * (l.result === "VOID" ? 1 : parseFloat(l.odds_at_placement)),
          1
        );
        payout = parseFloat(money(parseFloat(bet.stake) * effectiveOdds));
      }

      await client.query(
        `UPDATE bets SET status = $2, actual_payout = $3, settled_at = now() WHERE id = $1`,
        [betId, status, money(payout)]
      );

      if (payout > 0) {
        const wallet = await lockWallet(client, bet.user_id);
        await postTransaction(client, {
          userId: bet.user_id,
          walletId: wallet.id,
          type: status === "VOID" ? "BET_REFUND" : "BET_PAYOUT",
          direction: "CREDIT",
          amount: payout,
          currency: bet.currency,
          referenceType: "BET",
          referenceId: betId
        });
      }

      settled.push({ betId, status, payout: money(payout) });
    }

    await client.query(
      `INSERT INTO audit_log (actor_id, action, entity_type, entity_id, metadata)
       VALUES ($1,'SETTLE_MARKET','MARKET',$2,$3)`,
      [actorId || null, marketId, JSON.stringify({ results, settled })]
    );

    return { marketId, betsSettled: settled.length, settled };
  });
}
