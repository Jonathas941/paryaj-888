import { Pool } from "pg";
import type { NormalizedSport, NormalizedEvent } from "./normalizer";

/**
 * PostgreSQL persistence for synced provider data.
 * Uses UPSERT on provider/external IDs so repeated syncs never duplicate rows.
 *
 * NOTE: This creates its own pool from DATABASE_URL. If your backend already
 * has a shared pg pool, replace getPool() to return that pool instead.
 */

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : undefined,
    });
  }
  return pool;
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

export async function upsertSport(s: NormalizedSport): Promise<void> {
  await getPool().query(
    `INSERT INTO odds_sports (external_id, name, slug, active, updated_at)
     VALUES ($1, $2, $3, $4, now())
     ON CONFLICT (external_id) DO UPDATE
       SET name = EXCLUDED.name, active = EXCLUDED.active, updated_at = now()`,
    [s.externalId, s.name, s.slug, s.active],
  );
}

export async function upsertEvent(e: NormalizedEvent): Promise<void> {
  await getPool().query(
    `INSERT INTO odds_events (external_id, sport_key, sport_name, start_time, home_team, away_team, status, is_live, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now())
     ON CONFLICT (external_id) DO UPDATE
       SET sport_name = EXCLUDED.sport_name, start_time = EXCLUDED.start_time,
           status = EXCLUDED.status, is_live = EXCLUDED.is_live, updated_at = now()`,
    [e.externalId, e.sportKey, e.sportName, e.startTime, e.homeTeam, e.awayTeam, e.status, e.isLive],
  );
}

export async function upsertMarkets(e: NormalizedEvent): Promise<void> {
  const client = getPool();
  for (const market of e.markets) {
    for (const sel of market.selections) {
      await client.query(
        `INSERT INTO odds_selections (event_external_id, market_key, selection_name, odds, bookmaker, point, last_updated, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, now())
         ON CONFLICT (event_external_id, market_key, selection_name) DO UPDATE
           SET odds = EXCLUDED.odds, bookmaker = EXCLUDED.bookmaker,
               point = EXCLUDED.point, last_updated = EXCLUDED.last_updated, updated_at = now()`,
        [e.externalId, market.key, sel.name, sel.odds, sel.bookmaker, sel.point ?? null, sel.lastUpdated],
      );
    }
  }
}