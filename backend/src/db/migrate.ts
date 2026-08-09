import fs from "fs";
import path from "path";
import { pool } from "./pool";

/**
 * Applies every .sql file in ./migrations in filename order, exactly once.
 * Each file runs inside its own transaction and is recorded in
 * schema_migrations, so re-running is a no-op and a failing migration
 * leaves no partial schema behind.
 */
async function migrate() {
  const dir = path.join(__dirname, "migrations");
  if (!fs.existsSync(dir)) {
    throw new Error(`Migrations directory not found at ${dir}`);
  }

  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename   TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    const applied = new Set(
      (await client.query<{ filename: string }>("SELECT filename FROM schema_migrations")).rows.map(
        r => r.filename
      )
    );

    const files = fs.readdirSync(dir).filter(f => f.endsWith(".sql")).sort();
    let ran = 0;

    for (const file of files) {
      if (applied.has(file)) {
        console.log(`[migrate] skip ${file} (already applied)`);
        continue;
      }
      const sql = fs.readFileSync(path.join(dir, file), "utf8");
      console.log(`[migrate] applying ${file}`);
      try {
        await client.query("BEGIN");
        await client.query(sql);
        await client.query("INSERT INTO schema_migrations (filename) VALUES ($1)", [file]);
        await client.query("COMMIT");
        ran++;
      } catch (err) {
        await client.query("ROLLBACK");
        throw new Error(`Migration ${file} failed: ${(err as Error).message}`);
      }
    }

    console.log(`[migrate] done — ${ran} applied, ${files.length - ran} already up to date`);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch(err => {
  console.error("[migrate] FAILED:", err.message);
  process.exit(1);
});
