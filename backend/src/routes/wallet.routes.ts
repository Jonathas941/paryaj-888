import { Router } from "express";
import { z } from "zod";
import { query, one, transaction } from "../db/pool";
import { requireAuth, validateBody } from "../middleware";
import { notFound, badRequest } from "../utils/errors";
import { lockWallet, lockFunds, ensureWallet } from "../services/wallet.service";
import { money } from "../utils/money";

export const walletRouter = Router();

walletRouter.get("/", requireAuth, async (req, res, next) => {
  try {
    await transaction(client => ensureWallet(client, req.user!.sub));
    const wallet = await one("SELECT * FROM wallets WHERE user_id = $1", [req.user!.sub]);
    if (!wallet) return next(notFound("Wallet not found."));
    res.json(wallet);
  } catch (err) {
    next(err);
  }
});

walletRouter.get("/transactions", requireAuth, async (req, res, next) => {
  try {
    const { type, limit } = req.query;
    const params: any[] = [req.user!.sub];
    let where = "user_id = $1";
    if (type) {
      params.push(String(type).toUpperCase());
      where += ` AND type = $${params.length}`;
    }
    params.push(Math.min(parseInt(String(limit ?? "50"), 10) || 50, 200));

    res.json(
      await query(
        `SELECT * FROM wallet_transactions WHERE ${where} ORDER BY created_at DESC LIMIT $${params.length}`,
        params
      )
    );
  } catch (err) {
    next(err);
  }
});

const depositSchema = z.object({
  amount: z.number().positive().max(100000),
  method: z.string().min(2).max(40),
  reference: z.string().max(120).optional()
});

/**
 * Records an intent to deposit. No payment provider is connected, so this
 * does NOT credit the balance — an administrator (or, later, a verified
 * provider webhook) completes it via /admin/deposits/:id/approve.
 */
walletRouter.post("/deposits", requireAuth, validateBody(depositSchema), async (req, res, next) => {
  try {
    const row = await one(
      `INSERT INTO deposits (user_id, amount, method, reference, status)
       VALUES ($1,$2,$3,$4,'PENDING') RETURNING *`,
      [req.user!.sub, money(req.body.amount), req.body.method, req.body.reference || null]
    );
    res.status(201).json({
      deposit: row,
      status: "PENDING",
      message: "Your deposit request has been received and is awaiting confirmation."
    });
  } catch (err) {
    next(err);
  }
});

const withdrawalSchema = z.object({
  amount: z.number().positive().max(100000),
  method: z.string().min(2).max(40),
  destination: z.string().max(200).optional()
});

/**
 * Creates a withdrawal request and moves the amount from available into
 * locked in the same transaction, so the funds cannot also be staked while
 * the request is pending.
 */
walletRouter.post("/withdrawals", requireAuth, validateBody(withdrawalSchema), async (req, res, next) => {
  try {
    const result = await transaction(async client => {
      const wallet = await lockWallet(client, req.user!.sub);
      if (parseFloat(wallet.available_balance) < req.body.amount) {
        throw badRequest("You do not have enough available balance for this withdrawal.");
      }
      await lockFunds(client, wallet.id, req.body.amount);
      const { rows } = await client.query(
        `INSERT INTO withdrawals (user_id, amount, method, destination, status)
         VALUES ($1,$2,$3,$4,'PENDING') RETURNING *`,
        [req.user!.sub, money(req.body.amount), req.body.method, req.body.destination || null]
      );
      return rows[0];
    });
    res.status(201).json({
      withdrawal: result,
      status: "PENDING",
      message: "Your withdrawal request is pending review."
    });
  } catch (err) {
    next(err);
  }
});

walletRouter.get("/payment-methods", requireAuth, async (_req, res) => {
  // Static until a payment provider is integrated.
  res.json([
    { id: "bank_transfer", name: "Bank Transfer", type: "bank", min: 10, max: 10000, enabled: true },
    { id: "card", name: "Debit / Credit Card", type: "card", min: 10, max: 5000, enabled: false },
    { id: "crypto", name: "Crypto", type: "crypto", min: 20, max: 50000, enabled: false }
  ]);
});
