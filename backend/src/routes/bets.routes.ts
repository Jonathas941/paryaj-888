import { Router } from "express";
import { z } from "zod";
import { query, one, pool } from "../db/pool";
import { requireAuth, validateBody, rateLimit } from "../middleware";
import { placeBet, hydrateBet } from "../services/bet.service";

export const betsRouter = Router();

const placeSchema = z.object({
  stake: z.number().positive(),
  betType: z.enum(["SINGLE", "MULTIPLE"]).default("SINGLE"),
  idempotencyKey: z.string().min(8).max(120),
  selections: z
    .array(
      z.object({
        eventId: z.string().uuid(),
        marketId: z.string().uuid(),
        selectionId: z.string().uuid(),
        displayOdds: z.number().positive().optional()
      })
    )
    .min(1)
});

betsRouter.post(
  "/place",
  requireAuth,
  rateLimit({ windowMs: 60_000, max: 30, key: req => req.user?.sub || req.ip || "anon" }),
  validateBody(placeSchema),
  async (req, res, next) => {
    try {
      const result = await placeBet(req.user!.sub, req.body);
      res.status(result.duplicate ? 200 : 201).json({
        bet: {
          id: result.bet.id,
          stake: result.bet.stake,
          totalOdds: result.bet.total_odds,
          potentialPayout: result.bet.potential_payout,
          status: result.bet.status,
          currency: result.bet.currency
        },
        duplicate: result.duplicate
      });
    } catch (err) {
      next(err);
    }
  }
);

betsRouter.get("/", requireAuth, async (req, res, next) => {
  try {
    const { status, limit } = req.query;
    const params: any[] = [req.user!.sub];
    let where = "b.user_id = $1";
    if (status) {
      params.push(String(status).toUpperCase());
      where += ` AND b.status = $${params.length}`;
    }
    params.push(Math.min(parseInt(String(limit ?? "50"), 10) || 50, 200));

    const bets = await query(
      `SELECT * FROM bets b WHERE ${where} ORDER BY b.created_at DESC LIMIT $${params.length}`,
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

betsRouter.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const bet = await one("SELECT * FROM bets WHERE id = $1 AND user_id = $2", [
      req.params.id,
      req.user!.sub
    ]);
    if (!bet) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Bet not found." } });

    const client = await pool.connect();
    try {
      res.json(await hydrateBet(client, bet));
    } finally {
      client.release();
    }
  } catch (err) {
    next(err);
  }
});
