import express from "express";
import helmet from "helmet";
import cors from "cors";
import { env } from "./config/env";
import { pool } from "./db/pool";
import { requestId, errorHandler, notFoundHandler, rateLimit } from "./middleware";
import { authRouter } from "./routes/auth.routes";
import { sportsRouter } from "./routes/sports.routes";
import { betsRouter } from "./routes/bets.routes";
import { walletRouter } from "./routes/wallet.routes";
import { adminRouter } from "./routes/admin.routes";

export function createApp() {
  const app = express();

  // Railway terminates TLS upstream; trust it so req.ip is the real client.
  app.set("trust proxy", 1);

  app.use(helmet());
  app.use(
    cors({
      origin: env.frontendOrigins.includes("*") ? true : env.frontendOrigins,
      credentials: true
    })
  );
  app.use(express.json({ limit: "256kb" }));
  app.use(requestId);
  app.use(rateLimit({ windowMs: 60_000, max: 300 }));

  /**
   * Liveness. Deliberately does NOT touch Postgres: a transient database
   * problem should not make Railway think the HTTP process is unhealthy and
   * restart it into a crash loop. Use /api/v1/health/db for readiness.
   */
  app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "paryaj888-backend", uptime: process.uptime() });
  });

  const v1 = express.Router();

  v1.get("/health/db", async (_req, res) => {
    const started = Date.now();
    try {
      await pool.query("SELECT 1");
      res.json({ status: "ok", database: "connected", latencyMs: Date.now() - started });
    } catch (err) {
      res.status(503).json({
        status: "degraded",
        database: "unreachable",
        message: (err as Error).message
      });
    }
  });

  v1.use("/auth", authRouter);
  v1.use("/sports", sportsRouter);
  v1.use("/bets", betsRouter);
  v1.use("/wallet", walletRouter);
  v1.use("/admin", adminRouter);

  app.use("/api/v1", v1);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
