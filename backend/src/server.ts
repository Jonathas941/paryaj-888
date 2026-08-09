import { createApp } from "./app";
import { env } from "./config/env";
import { pool } from "./db/pool";

const app = createApp();

const server = app.listen(env.port, "0.0.0.0", () => {
  console.log(`[server] PARYAJ 888 API listening on :${env.port} (${env.nodeEnv})`);
});

/**
 * Graceful shutdown. Railway sends SIGTERM on redeploy; draining in-flight
 * requests before closing the pool avoids tearing down a connection in the
 * middle of a money transaction.
 */
function shutdown(signal: string) {
  console.log(`[server] ${signal} received — shutting down`);
  server.close(async () => {
    try {
      await pool.end();
    } catch {
      /* pool already closed */
    }
    process.exit(0);
  });
  // Don't hang forever if a socket refuses to close.
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

process.on("unhandledRejection", err => {
  console.error("[server] unhandled rejection", err);
});
