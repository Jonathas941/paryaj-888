import { Pool, PoolClient } from "pg";
import { env } from "../config/env";

export const pool = new Pool({
  connectionString: env.databaseUrl,
  // Railway's managed Postgres terminates TLS with its own CA.
  ssl: env.isProd ? { rejectUnauthorized: false } : undefined,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000
});

pool.on("error", err => {
  console.error("[db] idle client error", err.message);
});

export async function query<T = any>(text: string, params: any[] = []): Promise<T[]> {
  const res = await pool.query(text, params);
  return res.rows as T[];
}

export async function one<T = any>(text: string, params: any[] = []): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows.length ? rows[0] : null;
}

/**
 * Run `fn` inside a single database transaction. Commits on success, rolls
 * back on any thrown error. Every money movement in this codebase goes
 * through here, so a partial write can never leave the ledger out of sync
 * with the wallet balance.
 */
export async function transaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    try {
      await client.query("ROLLBACK");
    } catch {
      /* connection already dead — nothing to roll back */
    }
    throw err;
  } finally {
    client.release();
  }
}
