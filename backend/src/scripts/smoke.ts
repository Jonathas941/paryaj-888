/**
 * End-to-end smoke test of the money path. Exercises the paths where a bug
 * would cost real money: idempotent placement, insufficient funds, concurrent
 * placement against one balance, and settlement payout.
 */
import { createApp } from "../app";
import { pool, query } from "../db/pool";
import type { Server } from "http";

let base = "";
let server: Server;

const j = async (path: string, opts: any = {}) => {
  const res = await fetch(base + path, {
    method: opts.method || "GET",
    headers: { "Content-Type": "application/json", ...(opts.token ? { Authorization: `Bearer ${opts.token}` } : {}) },
    body: opts.body ? JSON.stringify(opts.body) : undefined
  });
  return { status: res.status, body: await res.json().catch(() => null) };
};

let passed = 0;
let failed = 0;
function check(name: string, cond: boolean, extra?: any) {
  if (cond) { console.log(`  PASS  ${name}`); passed++; }
  else { console.log(`  FAIL  ${name}`, extra != null ? JSON.stringify(extra) : ""); failed++; }
}

async function main() {
  const app = createApp();
  await new Promise<void>(r => { server = app.listen(0, () => r()); });
  base = `http://127.0.0.1:${(server.address() as any).port}`;

  console.log("\n--- health ---");
  check("GET /health ok", (await j("/health")).body?.status === "ok");
  check("GET /api/v1/health/db connected", (await j("/api/v1/health/db")).body?.database === "connected");

  console.log("\n--- catalogue ---");
  const events = await j("/api/v1/sports/events?live=true");
  check("live events seeded", Array.isArray(events.body) && events.body.length === 5, events.body?.length);
  const mc = (events.body || []).find((e: any) => e.home_team === "Man City");
  check("event shape matches frontend contract",
    !!mc && mc.is_live === true && mc.home_score === 2 && typeof mc.league === "string", mc);

  const detail = await j(`/api/v1/sports/events/${mc.id}`);
  check("event detail returns flat market rows",
    Array.isArray(detail.body?.markets) && detail.body.markets.length === 3 &&
    detail.body.markets[0].selection_id && detail.body.markets[0].market_name === "1X2",
    detail.body?.markets?.[0]);

  console.log("\n--- auth ---");
  const email = `t${Date.now()}@example.com`;
  const reg = await j("/api/v1/auth/register", {
    method: "POST",
    body: { email, username: `u${Date.now()}`.slice(0, 20), password: "correct-horse-battery" }
  });
  check("register returns accessToken", !!reg.body?.accessToken, reg.status);
  const token = reg.body.accessToken;

  check("underage registration blocked",
    (await j("/api/v1/auth/register", { method: "POST", body: {
      email: `kid${Date.now()}@example.com`, username: `k${Date.now()}`.slice(0,20),
      password: "correct-horse-battery", dateOfBirth: "2015-01-01" } })).status === 403);

  check("wrong password rejected",
    (await j("/api/v1/auth/login", { method: "POST", body: { email, password: "wrong" } })).status === 401);

  console.log("\n--- wallet starts empty, stake is refused ---");
  const w0 = await j("/api/v1/wallet", { token });
  check("new wallet is zero", parseFloat(w0.body.available_balance) === 0, w0.body);

  const sel = detail.body.markets[0];
  const brokeBet = await j("/api/v1/bets/place", { method: "POST", token, body: {
    stake: 50, betType: "SINGLE", idempotencyKey: `k-broke-${Date.now()}`,
    selections: [{ eventId: mc.id, marketId: sel.market_id, selectionId: sel.selection_id, displayOdds: parseFloat(sel.odds) }]
  }});
  check("bet with no funds is rejected", brokeBet.status === 422, brokeBet.body);
  check("rejection names insufficient funds", brokeBet.body?.error?.code === "INSUFFICIENT_FUNDS", brokeBet.body?.error);

  // Credit the account the way an admin would.
  const userId = (await query("SELECT id FROM users WHERE email = $1", [email]))[0].id;
  await query("UPDATE users SET role = 'ADMIN' WHERE id = $1", [userId]);
  const adminTok = (await j("/api/v1/auth/login", { method: "POST", body: { email, password: "correct-horse-battery" } })).body.accessToken;
  const dep = await j("/api/v1/wallet/deposits", { method: "POST", token, body: { amount: 100, method: "bank_transfer" } });
  check("deposit starts PENDING (not credited)", dep.body?.deposit?.status === "PENDING");
  check("balance still zero before approval",
    parseFloat((await j("/api/v1/wallet", { token })).body.available_balance) === 0);

  await j(`/api/v1/admin/deposits/${dep.body.deposit.id}/approve`, { method: "POST", token: adminTok });
  const w1 = await j("/api/v1/wallet", { token });
  check("approval credits 100.00", parseFloat(w1.body.available_balance) === 100, w1.body);

  console.log("\n--- placement, idempotency, concurrency ---");
  const key = `k-${Date.now()}`;
  const payload = { stake: 10, betType: "SINGLE", idempotencyKey: key,
    selections: [{ eventId: mc.id, marketId: sel.market_id, selectionId: sel.selection_id, displayOdds: parseFloat(sel.odds) }] };

  const b1 = await j("/api/v1/bets/place", { method: "POST", token, body: payload });
  check("bet accepted", b1.status === 201 && b1.body?.bet?.id, b1.body);
  check("payout = stake x odds", parseFloat(b1.body.bet.potentialPayout) === 16.2, b1.body.bet);
  check("stake debited", parseFloat((await j("/api/v1/wallet", { token })).body.available_balance) === 90);

  const b2 = await j("/api/v1/bets/place", { method: "POST", token, body: payload });
  check("replayed idempotency key does NOT double-charge",
    b2.body?.bet?.id === b1.body.bet.id &&
    parseFloat((await j("/api/v1/wallet", { token })).body.available_balance) === 90, b2.body);

  check("odds drift beyond tolerance rejected",
    (await j("/api/v1/bets/place", { method: "POST", token, body: { ...payload,
      idempotencyKey: `k-drift-${Date.now()}`,
      selections: [{ ...payload.selections[0], displayOdds: 9.99 }] } })).body?.error?.code === "ODDS_CHANGED");

  // 12 concurrent 10.00 bets against a 90.00 balance: at most 9 may succeed.
  const results = await Promise.all(
    Array.from({ length: 12 }, (_, i) =>
      j("/api/v1/bets/place", { method: "POST", token, body: {
        ...payload, idempotencyKey: `race-${Date.now()}-${i}` } }))
  );
  const ok = results.filter(r => r.status === 201).length;
  const bal = parseFloat((await j("/api/v1/wallet", { token })).body.available_balance);
  check(`concurrent placement cannot overdraw (accepted ${ok}, balance ${bal})`, bal >= 0 && ok <= 9, { ok, bal });

  const ledger = await query(
    `SELECT COALESCE(SUM(CASE WHEN direction='CREDIT' THEN amount ELSE -amount END),0) AS net
       FROM wallet_transactions WHERE user_id = $1`, [userId]);
  check("ledger reconciles with wallet balance", parseFloat(ledger[0].net) === bal, { ledger: ledger[0].net, bal });

  console.log("\n--- settlement ---");
  const before = parseFloat((await j("/api/v1/wallet", { token })).body.available_balance);
  const openBets = await query("SELECT COUNT(*)::int AS n FROM bets WHERE user_id = $1 AND status = 'ACCEPTED'", [userId]);
  const settle = await j(`/api/v1/admin/markets/${sel.market_id}/settle`, { method: "POST", token: adminTok,
    body: { results: [{ selectionId: sel.selection_id, result: "WON" }] } });
  check("settle reports bets settled", settle.body?.betsSettled === openBets[0].n, settle.body);

  const after = parseFloat((await j("/api/v1/wallet", { token })).body.available_balance);
  check(`winnings credited (${before} -> ${after})`, after > before, { before, after });

  const resettle = await j(`/api/v1/admin/markets/${sel.market_id}/settle`, { method: "POST", token: adminTok,
    body: { results: [{ selectionId: sel.selection_id, result: "WON" }] } });
  const after2 = parseFloat((await j("/api/v1/wallet", { token })).body.available_balance);
  check("re-settling the same market does NOT pay twice", after2 === after, { after, after2, resettle: resettle.body });

  console.log("\n--- withdrawal locks funds ---");
  const wd = await j("/api/v1/wallet/withdrawals", { method: "POST", token, body: { amount: 5, method: "bank_transfer" } });
  const w3 = (await j("/api/v1/wallet", { token })).body;
  check("withdrawal moves funds available -> locked",
    parseFloat(w3.locked_balance) === 5 && parseFloat(w3.available_balance) === after2 - 5, w3);
  await j(`/api/v1/admin/withdrawals/${wd.body.withdrawal.id}/reject`, { method: "POST", token: adminTok });
  const w4 = (await j("/api/v1/wallet", { token })).body;
  check("rejection returns locked funds",
    parseFloat(w4.locked_balance) === 0 && parseFloat(w4.available_balance) === after2, w4);

  console.log("\n--- authorization ---");
  // A genuinely separate non-admin account (the first user was promoted).
  const plain = await j("/api/v1/auth/register", { method: "POST", body: {
    email: `plain${Date.now()}@example.com`,
    username: `p${Date.now()}`.slice(0, 20),
    password: "correct-horse-battery" } });
  check("non-admin blocked from admin routes",
    (await j("/api/v1/admin/overview", { token: plain.body.accessToken })).status === 403);
  check("anonymous blocked from admin routes", (await j("/api/v1/admin/overview")).status === 401);
  check("anonymous blocked from wallet", (await j("/api/v1/wallet")).status === 401);

  console.log(`\n================  ${passed} passed, ${failed} failed  ================\n`);
  server.close();
  await pool.end();
  process.exit(failed ? 1 : 0);
}

main().catch(async e => {
  console.error("SMOKE TEST CRASHED:", e);
  try { server?.close(); await pool.end(); } catch {}
  process.exit(1);
});
