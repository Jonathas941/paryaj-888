import { TtlCache } from "./cache";
import { theOddsApi, OddsProviderError } from "./provider";
import { normalizeEvent, normalizeSport } from "./normalizer";
import type { NormalizedEvent, NormalizedSport } from "./normalizer";
import { oddsConfig } from "./config";
import { upsertSport, upsertEvent, upsertMarkets } from "./db";

/**
 * Odds service: cached provider access + best-effort DB persistence.
 * Caching tiers (configurable via env):
 *   - sports list: 30 min
 *   - upcoming odds: 45 s
 *   - live odds: 10 s
 * Bet validation (betValidation.ts) bypasses these caches for fresh odds.
 */

const sportsCache = new TtlCache<NormalizedSport[]>(oddsConfig.cache.sportsTtlMs);
const oddsCache = new TtlCache<NormalizedEvent[]>(oddsConfig.cache.oddsTtlMs);
const liveCache = new TtlCache<NormalizedEvent[]>(oddsConfig.cache.liveTtlMs);

interface EventQuery {
  live?: boolean;
  upcoming?: boolean;
  limit?: number;
}

function filterAndLimit(events: NormalizedEvent[], opts?: EventQuery): NormalizedEvent[] {
  let out = events;
  if (opts?.live) out = out.filter((e) => e.isLive);
  if (opts?.upcoming) out = out.filter((e) => !e.isLive);
  const limit = opts?.limit ?? 100;
  return out.slice(0, limit);
}

/** Best-effort persistence — never let a DB issue crash an API response. */
async function persistSport(s: NormalizedSport): Promise<void> {
  try {
    await upsertSport(s);
  } catch (e) {
    console.warn("[odds] sport upsert failed:", (e as Error).message);
  }
}

async function persistEvent(e: NormalizedEvent): Promise<void> {
  try {
    await upsertEvent(e);
    await upsertMarkets(e);
  } catch (e2) {
    console.warn("[odds] event upsert failed:", (e2 as Error).message);
  }
}

export async function listSports(): Promise<NormalizedSport[]> {
  const cached = sportsCache.get("sports");
  if (cached) return cached;

  const raw = await theOddsApi.getSports();
  const sports = raw.map(normalizeSport);
  sportsCache.set("sports", sports);
  for (const s of sports) await persistSport(s);
  return sports;
}

export async function listEvents(sportKey?: string, opts?: EventQuery): Promise<NormalizedEvent[]> {
  if (!sportKey) {
    // Aggregate across a slice of active sports (bounded to protect quota).
    const sports = await listSports();
    const active = sports.filter((s) => s.active).slice(0, 6);
    const all: NormalizedEvent[] = [];
    for (const s of active) {
      try {
        all.push(...(await listEvents(s.slug)));
      } catch (e) {
        console.warn(`[odds] failed to fetch ${s.slug}:`, (e as Error).message);
      }
    }
    return filterAndLimit(all, opts);
  }

  const cacheKey = `events:${sportKey}`;
  const cached = oddsCache.get(cacheKey);
  if (cached) return filterAndLimit(cached, opts);

  const raw = await theOddsApi.getOddsForSport(sportKey);
  const events = raw.map(normalizeEvent);
  oddsCache.set(cacheKey, events);
  for (const e of events) await persistEvent(e);
  return filterAndLimit(events, opts);
}

export async function getEvent(eventId: string, sportKey?: string): Promise<NormalizedEvent> {
  if (!sportKey) {
    throw new OddsProviderError(
      400,
      "The sportKey query parameter is required for event lookup (e.g. ?sportKey=soccer_epl).",
      "SPORT_KEY_REQUIRED",
    );
  }
  const raw = await theOddsApi.getEventOdds(sportKey, eventId);
  const event = normalizeEvent(raw);
  await persistEvent(event);
  return event;
}

export async function listLive(): Promise<NormalizedEvent[]> {
  const cached = liveCache.get("live");
  if (cached) return cached;

  // The Odds API has no single "global live" endpoint; live/in-play odds come
  // from the per-sport odds endpoint for events whose start time is in the live
  // window. If the account has no live capability, this returns an empty array
  // — we never fabricate matches or scores.
  const sports = await listSports();
  const active = sports.filter((s) => s.active).slice(0, 6);
  const live: NormalizedEvent[] = [];
  for (const s of active) {
    try {
      const raw = await theOddsApi.getOddsForSport(s.slug);
      live.push(...raw.map(normalizeEvent).filter((e) => e.isLive));
    } catch (e) {
      console.warn(`[odds] live fetch failed for ${s.slug}:`, (e as Error).message);
    }
  }
  liveCache.set("live", live);
  return live;
}

export async function getScores(sportKey: string, daysFrom = 3) {
  return theOddsApi.getScores(sportKey, daysFrom);
}