import { PoolClient } from "pg";
import { transaction } from "../db/pool";
import { env } from "../config/env";
import { badRequest, conflict, unprocessable } from "../utils/errors";
import { combineOdds, money } from "../utils/money";
import { lockWallet, postTransaction } from "./wallet.service";

export interface PlaceBetInput {
  stake: number;
  betType: "SINGLE" | "MULTIPLE";
  idempotencyKey: string;
  selections: Array<{
    eventId: string;
    marketId: string;
    selectionId: string;
    displayOdds?: number;
  }>;
}

// Accept a price move of up to 2% against the punter without rejecting; beyond
// that the odds have moved materially and the bet needs re-confirming.
const ODDS_TOLERANCE = 0.02;

export async function placeBet(userId: string, input: PlaceBetInput) {
  if (!input.selections?.length) throw badRequest("Your betslip is empty.");
  if (input.selections.length > env.maxSelectionsPerBet) {
    throw badRequest(`A bet can contain at most ${env.maxSelectionsPerBet} selections.`);
  }
  if (input.stake < env.minStake) {
    throw unprocessable("STAKE_TOO_LOW", `The minimum stake is ${money(env.minStake)}.`);
  }
  if (input.stake > env.maxStake) {
    throw unprocessable("STAKE_TOO_HIGH", `The maximum stake is ${money(env.maxStake)}.`);
  }

  // Duplicate selections would silently multiply the same price into the odds.
  const ids = input.selections.map(s => s.selectionId);
  if (new Set(ids).size !== ids.length) {
    throw badRequest("The same selection appears more than once on your betslip.");
  }

  return transaction(async client => {
    // Idempotency first: a retried request returns the original bet rather
    // than debiting the stake a second time.
    const existing = await client.query(
      "SELECT * FROM bets WHERE idempotency_key = $1",
      [input.idempotencyKey]
    );
    if (existing.rows.length) {
      return { bet: await hydrateBet(client, existing.rows[0]), duplicate: true };
    }

    // Lock every selection row so odds cannot change under us mid-placement.
    const { rows: sels } = await client.query(
      `SELECT s.id AS selection_id, s.name AS selection_name, s.odds, s.status AS selection_status,
              m.id AS market_id, m.name AS market_name, m.status AS market_status,
              e.id AS event_id, e.status AS event_status, e.start_time,
              e.home_team, e.away_team
         FROM selections s
         JOIN markets m ON m.id = s.market_id
         JOIN events  e ON e.id = m.event_id
        WHERE s.id = ANY($1::uuid[])
        FOR UPDATE OF s`,
      [ids]
    );

    if (sels.length !== ids.length) {
      throw unprocessable("SELECTION_UNAVAILABLE", "One or more selections are no longer available.");
    }

    for (const s of sels) {
      if (s.selection_status !== "OPEN" || s.market_status !== "OPEN") {
        throw unprocessable("MARKET_SUSPENDED", `Betting on ${s.market_name} is currently suspended.`);
      }
      if (!["SCHEDULED", "LIVE"].includes(s.event_status)) {
        throw unprocessable("EVENT_CLOSED", "This event is no longer accepting bets.");
      }
      const requested = input.selections.find(x => x.selectionId === s.selection_id)?.displayOdds;
      if (requested != null) {
        const current = parseFloat(s.odds);
        if (Math.abs(current - requested) / requested > ODDS_TOLERANCE) {
          throw unprocessable(
            "ODDS_CHANGED",
            `The odds changed from ${requested} to ${current}. Please review your betslip.`
          );
        }
      }
    }

    const totalOdds = combineOdds(sels.map(s => s.odds));
    const potentialPayout = parseFloat(money(input.stake * totalOdds));

    if (potentialPayout > env.maxPayout) {
      throw unprocessable(
        "PAYOUT_LIMIT",
        `The potential return exceeds the maximum payout of ${money(env.maxPayout)}.`
      );
    }

    const betType = sels.length > 1 ? "MULTIPLE" : "SINGLE";

    // Debit the stake first — if funds are short this throws and the whole
    // transaction rolls back before any bet row exists.
    const wallet = await lockWallet(client, userId);
    const { rows: betRows } = await client.query(
      `INSERT INTO bets (user_id, bet_type, stake, total_odds, potential_payout, currency, status, idempotency_key)
       VALUES ($1,$2,$3,$4,$5,$6,'ACCEPTED',$7)
       RETURNING *`,
      [
        userId,
        betType,
        money(input.stake),
        totalOdds,
        money(potentialPayout),
        wallet.currency,
        input.idempotencyKey
      ]
    );
    const bet = betRows[0];

    for (const s of sels) {
      await client.query(
        `INSERT INTO bet_selections (bet_id, event_id, market_id, selection_id, odds_at_placement)
         VALUES ($1,$2,$3,$4,$5)`,
        [bet.id, s.event_id, s.market_id, s.selection_id, s.odds]
      );
    }

    await postTransaction(client, {
      userId,
      walletId: wallet.id,
      type: "BET_STAKE",
      direction: "DEBIT",
      amount: input.stake,
      currency: wallet.currency,
      referenceType: "BET",
      referenceId: bet.id
    });

    return { bet: await hydrateBet(client, bet), duplicate: false };
  }).catch(err => {
    // Unique violation on idempotency_key: another request won the race.
    if (err?.code === "23505") throw conflict("This bet has already been placed.");
    throw err;
  });
}

/** Attaches selection detail in the shape the frontend's normalizeBet expects. */
export async function hydrateBet(client: PoolClient, bet: any) {
  const { rows } = await client.query(
    `SELECT bs.event_id       AS "eventId",
            bs.odds_at_placement AS odds,
            bs.result,
            m.name            AS market,
            s.name            AS selection,
            e.home_team || ' vs ' || e.away_team AS event
       FROM bet_selections bs
       JOIN markets m ON m.id = bs.market_id
       JOIN selections s ON s.id = bs.selection_id
       JOIN events e ON e.id = bs.event_id
      WHERE bs.bet_id = $1`,
    [bet.id]
  );
  return { ...bet, selections: rows };
}
