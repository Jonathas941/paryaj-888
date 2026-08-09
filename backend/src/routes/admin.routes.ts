import { Router } from "express";
import { z } from "zod";
import { query, one, transaction, pool } from "../db/pool";
import { requireAuth, requireAdmin, validateBody } from "../middleware";
import { notFound, badRequest } from "../utils/errors";
import { settleMarket } from "../services/settlement.service";
import { hydrateBet } from "../services/bet.service";
import { lockWallet, postTransaction, releaseFunds, settleLockedFunds } from "../services/wallet.service";

export const adminRouter = Router();
adminRouter.use(requireAuth, requireAdmin);

adminRouter.get("/overview", async (_req, res, next) => {
  try {
    const row = await one(`
      SELECT
        (SELECT COUNT(*) FROM users)::int AS registered_users,
        (SELECT COUNT(*) FROM bets WHERE created_at >= date_trunc('day', now()))::int AS bets_today,
        (SELECT COALESCE(SUM(stake),0) FROM bets WHERE created_at >= date_trunc('day', now())) AS stakes_today,
        (SELECT COALESCE(SUM(actual_payout),0) FROM bets
          WHERE settled_at >= date_trunc('day', now())) AS payouts_today,
        (SELECT COUNT(*) FROM bets WHERE status = 'ACCEPTED')::int AS open_bets
    `);
    res.json(row);
  } catch (err) {
    next(err);
  }
});

adminRouter.get("/users", async (_req, res, next) => {
  try {
    res.json(
      await query(`
        SELECT u.id, u.email, u.username, u.role, u.status, u.country, u.created_at,
               w.available_balance, w.currency
          FROM users u
          LEFT JOIN wallets w ON w.user_id = u.id
         ORDER BY u.created_at DESC
         LIMIT 200
      `)
    );
  } catch (err) {
    next(err);
  }
});

adminRouter.get("/bets", async (req, res, next) => {
  try {
    const params: any[] = [];
    let where = "1=1";
    if (req.query.status) {
      params.push(String(req.query.status).toUpperCase());
      where += ` AND b.status = $${params.length}`;
    }
    const bets = await query(
      `SELECT b.*, u.email, u.username
         FROM bets b JOIN users u ON u.id = b.user_id
        WHERE ${where}
        ORDER BY b.created_at DESC LIMIT 200`,
      params
    );
    const client = await pool.connect();
    try {
      res.json(await Promise.all(bets.map(b => hydrateBet(client, b))));
    } finally {
      client.release();
    }
  } catch (err) {
    next(err);
  }
});

const settleSchema = z.object({
  results: z
    .array(
      z.object({
        selectionId: z.string().uuid(),
        result: z.enum(["WON", "LOST", "VOID"])
      })
    )
    .min(1)
});

adminRouter.post("/markets/:id/settle", validateBody(settleSchema), async (req, res, next) => {
  try {
    res.json(await settleMarket(req.params.id, req.body.results, req.user!.sub));
  } catch (err) {
    next(err);
  }
});

/** Completes a pending deposit and credits the balance. */
adminRouter.post("/deposits/:id/approve", async (req, res, next) => {
  try {
    const result = await transaction(async client => {
      const { rows } = await client.query(
        "SELECT * FROM deposits WHERE id = $1 FOR UPDATE",
        [req.params.id]
      );
      if (!rows.length) throw notFound("Deposit not found.");
      const dep = rows[0];
      if (dep.status !== "PENDING") throw badRequest(`This deposit is already ${dep.status.toLowerCase()}.`);

      const wallet = await lockWallet(client, dep.user_id);
      await postTransaction(client, {
        userId: dep.user_id,
        walletId: wallet.id,
        type: "DEPOSIT",
        direction: "CREDIT",
        amount: parseFloat(dep.amount),
        currency: dep.currency,
        referenceType: "DEPOSIT",
        referenceId: dep.id
      });
      await client.query(
        "UPDATE deposits SET status = 'COMPLETED', completed_at = now() WHERE id = $1",
        [dep.id]
      );
      await client.query(
        `INSERT INTO audit_log (actor_id, action, entity_type, entity_id) VALUES ($1,'APPROVE_DEPOSIT','DEPOSIT',$2)`,
        [req.user!.sub, dep.id]
      );
      return { ...dep, status: "COMPLETED" };
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

/** Pays out a withdrawal: burns the locked funds it reserved. */
adminRouter.post("/withdrawals/:id/approve", async (req, res, next) => {
  try {
    const result = await transaction(async client => {
      const { rows } = await client.query("SELECT * FROM withdrawals WHERE id = $1 FOR UPDATE", [
        req.params.id
      ]);
      if (!rows.length) throw notFound("Withdrawal not found.");
      const wd = rows[0];
      if (wd.status !== "PENDING") throw badRequest(`This withdrawal is already ${wd.status.toLowerCase()}.`);

      const wallet = await lockWallet(client, wd.user_id);
      await settleLockedFunds(client, wallet.id, parseFloat(wd.amount));
      await client.query(
        `INSERT INTO wallet_transactions
           (wallet_id, user_id, type, direction, amount, currency, status, balance_after, reference_type, reference_id)
         VALUES ($1,$2,'WITHDRAWAL','DEBIT',$3,$4,'COMPLETED',
                 (SELECT available_balance FROM wallets WHERE id = $1),'WITHDRAWAL',$5)`,
        [wallet.id, wd.user_id, wd.amount, wd.currency, wd.id]
      );
      await client.query(
        "UPDATE withdrawals SET status = 'COMPLETED', processed_at = now() WHERE id = $1",
        [wd.id]
      );
      return { ...wd, status: "COMPLETED" };
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

/** Rejects a withdrawal and returns the locked funds to available. */
adminRouter.post("/withdrawals/:id/reject", async (req, res, next) => {
  try {
    const result = await transaction(async client => {
      const { rows } = await client.query("SELECT * FROM withdrawals WHERE id = $1 FOR UPDATE", [
        req.params.id
      ]);
      if (!rows.length) throw notFound("Withdrawal not found.");
      const wd = rows[0];
      if (wd.status !== "PENDING") throw badRequest(`This withdrawal is already ${wd.status.toLowerCase()}.`);

      const wallet = await lockWallet(client, wd.user_id);
      await releaseFunds(client, wallet.id, parseFloat(wd.amount));
      await client.query(
        "UPDATE withdrawals SET status = 'REJECTED', processed_at = now() WHERE id = $1",
        [wd.id]
      );
      return { ...wd, status: "REJECTED" };
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

adminRouter.get("/deposits", async (_req, res, next) => {
  try {
    res.json(await query(
      `SELECT d.*, u.email FROM deposits d JOIN users u ON u.id = d.user_id
        ORDER BY d.created_at DESC LIMIT 200`));
  } catch (err) { next(err); }
});

adminRouter.get("/withdrawals", async (_req, res, next) => {
  try {
    res.json(await query(
      `SELECT w.*, u.email FROM withdrawals w JOIN users u ON u.id = w.user_id
        ORDER BY w.created_at DESC LIMIT 200`));
  } catch (err) { next(err); }
});
