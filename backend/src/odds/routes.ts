import { Router, type Request, type Response } from "express";
import { listSports, listEvents, getEvent, listLive } from "./service";
import { syncSports, syncEvents } from "./sync";
import { validateBetOdds, computePayout, BetValidationError } from "./betValidation";
import { hasOddsApiKey } from "./config";
import { OddsProviderError } from "./provider";

/**
 * All Odds API-backed routes, mounted under /api/v1 in your Express app:
 *   app.use("/api/v1", oddsRouter)
 *
 * Base44 contract:
 *   GET  /api/v1/sports
 *   GET  /api/v1/events?sportKey=&live=&upcoming=&limit=
 *   GET  /api/v1/events/live
 *   GET  /api/v1/sports/:sportKey/events
 *   GET  /api/v1/events/:eventId?sportKey=
 *   GET  /api/v1/events/:eventId/markets?sportKey=
 *   POST /api/v1/admin/sync/sports      (protected)
 *   POST /api/v1/admin/sync/events       (protected)
 *   GET  /api/v1/health/providers
 */

export const oddsRouter = Router();

function ok(res: Response, data: unknown): void {
  res.json({ success: true, data });
}

function fail(res: Response, status: number, code: string, message: string, data?: unknown): void {
  res.status(status).json({ success: false, error: { code, message }, ...(data ? { data } : {}) });
}

function handleProviderError(res: Response, e: unknown): void {
  if (e instanceof OddsProviderError) {
    if (e.code === "ODDS_API_KEY_MISSING") {
      return fail(res, 500, "ODDS_API_KEY_MISSING", "Server is missing the ODDS_API_KEY environment variable. Add it in Railway Variables.");
    }
    if (e.code === "ODDS_API_KEY_INVALID") {
      return fail(res, 503, "ODDS_PROVIDER_UNAVAILABLE", "Sports data provider rejected credentials.");
    }
    if (e.code === "ODDS_PROVIDER_QUOTA_EXCEEDED") {
      return fail(res, 503, "ODDS_PROVIDER_UNAVAILABLE", "Sports data is temporarily unavailable (provider quota exceeded).");
    }
    if (e.code === "ODDS_PROVIDER_TIMEOUT" || e.code === "ODDS_PROVIDER_NETWORK") {
      return fail(res, 503, "ODDS_PROVIDER_UNAVAILABLE", "Sports data is temporarily unavailable.");
    }
    if (e.code === "SPORT_KEY_REQUIRED") {
      return fail(res, 400, "SPORT_KEY_REQUIRED", e.message);
    }
    return fail(res, e.status || 503, e.code, e.message);
  }
  console.error("[odds] unexpected error:", e);
  return fail(res, 500, "INTERNAL_ERROR", "Unexpected error.");
}

function adminGuard(req: Request, res: Response): boolean {
  const token = process.env.ADMIN_SYNC_TOKEN;
  if (!token) {
    fail(res, 503, "ADMIN_SYNC_NOT_CONFIGURED", "Set ADMIN_SYNC_TOKEN to use admin sync endpoints.");
    return false;
  }
  if (req.header("x-admin-token") !== token) {
    fail(res, 401, "UNAUTHORIZED", "Admin token required.");
    return false;
  }
  return true;
}

// ---- Health ----
oddsRouter.get("/health/providers", async (_req, res) => {
  if (!hasOddsApiKey()) return ok(res, { oddsProvider: "unconfigured" });
  try {
    await listSports();
    ok(res, { oddsProvider: "online" });
  } catch {
    ok(res, { oddsProvider: "offline" });
  }
});

// ---- Sports ----
oddsRouter.get("/sports", async (_req, res) => {
  try {
    ok(res, await listSports());
  } catch (e) {
    handleProviderError(res, e);
  }
});

// ---- Events ----
// NOTE: /events/live MUST be declared before /events/:eventId.
oddsRouter.get("/events/live", async (_req, res) => {
  try {
    ok(res, await listLive());
  } catch (e) {
    handleProviderError(res, e);
  }
});

oddsRouter.get("/events", async (req, res) => {
  try {
    const { sportKey, live, upcoming, limit } = req.query;
    ok(
      res,
      await listEvents(sportKey as string | undefined, {
        live: live === "true" || live === "1",
        upcoming: upcoming === "true" || upcoming === "1",
        limit: limit ? Number(limit) : undefined,
      }),
    );
  } catch (e) {
    handleProviderError(res, e);
  }
});

oddsRouter.get("/sports/:sportKey/events", async (req, res) => {
  try {
    ok(res, await listEvents(req.params.sportKey));
  } catch (e) {
    handleProviderError(res, e);
  }
});

oddsRouter.get("/events/:eventId", async (req, res) => {
  try {
    const sportKey = req.query.sportKey as string | undefined;
    ok(res, await getEvent(req.params.eventId, sportKey));
  } catch (e) {
    handleProviderError(res, e);
  }
});

oddsRouter.get("/events/:eventId/markets", async (req, res) => {
  try {
    const sportKey = req.query.sportKey as string | undefined;
    const event = await getEvent(req.params.eventId, sportKey);
    ok(res, event.markets);
  } catch (e) {
    handleProviderError(res, e);
  }
});

// ---- Admin sync (protected) ----
oddsRouter.post("/admin/sync/sports", async (req, res) => {
  if (!adminGuard(req, res)) return;
  try {
    ok(res, { synced: await syncSports() });
  } catch (e) {
    handleProviderError(res, e);
  }
});

oddsRouter.post("/admin/sync/events", async (req, res) => {
  if (!adminGuard(req, res)) return;
  try {
    const sportKey = req.query.sportKey as string | undefined;
    ok(res, { synced: await syncEvents(sportKey) });
  } catch (e) {
    handleProviderError(res, e);
  }
});

// ---- Bet validation helper (use inside your existing POST /bets/place) ----
// Exported so your bets route can call it. Example usage in README.
export async function validateSelection(input: {
  sportKey: string;
  eventId: string;
  marketKey: string;
  selectionName: string;
  displayedOdds: number;
  stake: number;
}): Promise<{ currentOdds: number; potentialPayout: number }> {
  const result = await validateBetOdds(input);
  return {
    currentOdds: result.currentOdds,
    potentialPayout: computePayout(input.stake, result.currentOdds),
  };
}

export { BetValidationError };