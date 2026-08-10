import { theOddsApi } from "./provider";
import { normalizeSport, normalizeEvent } from "./normalizer";
import { upsertSport, upsertEvent, upsertMarkets } from "./db";

/**
 * Sync service — persists provider data into PostgreSQL using UPSERTs.
 * Intentionally NOT an aggressive polling loop (would waste quota).
 * Trigger manually via the protected admin endpoints, or wire to a scheduled
 * job (cron / Railway cron) at a conservative cadence.
 */

export async function syncSports(): Promise<number> {
  const raw = await theOddsApi.getSports();
  for (const s of raw) {
    await upsertSport(normalizeSport(s));
  }
  return raw.length;
}

export async function syncEvents(sportKey?: string): Promise<number> {
  if (!sportKey) {
    const sports = await theOddsApi.getSports();
    let total = 0;
    for (const s of sports.filter((s) => s.active).slice(0, 10)) {
      total += await syncEvents(s.key);
    }
    return total;
  }

  const raw = await theOddsApi.getOddsForSport(sportKey);
  for (const e of raw) {
    const normalized = normalizeEvent(e);
    await upsertEvent(normalized);
    await upsertMarkets(normalized);
  }
  return raw.length;
}