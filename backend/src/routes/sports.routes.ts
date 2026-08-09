import { Router } from "express";
import { query, one } from "../db/pool";
import { notFound } from "../utils/errors";

export const sportsRouter = Router();

// Field names below are the contract the frontend's normalizeEvent() reads.
const EVENT_COLUMNS = `
  e.id,
  e.sport_id                     AS sport,
  COALESCE(l.name, '')           AS league,
  e.home_team,
  e.away_team,
  e.start_time,
  (e.status = 'LIVE')            AS is_live,
  e.home_score,
  e.away_score,
  e.minute
`;

sportsRouter.get("/", async (_req, res, next) => {
  try {
    const rows = await query(
      `SELECT s.id, s.name, s.icon,
              (SELECT COUNT(*) FROM events ev
                WHERE ev.sport_id = s.id AND ev.status IN ('SCHEDULED','LIVE'))::int AS count
         FROM sports s
        WHERE s.active
        ORDER BY s.display_order`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

sportsRouter.get("/:sportId/leagues", async (req, res, next) => {
  try {
    res.json(await query("SELECT id, name, country, sport_id FROM leagues WHERE sport_id = $1 ORDER BY name", [
      req.params.sportId
    ]));
  } catch (err) {
    next(err);
  }
});

sportsRouter.get("/events", async (req, res, next) => {
  try {
    const { sport, league, live, limit } = req.query;
    const where: string[] = ["e.status IN ('SCHEDULED','LIVE')"];
    const params: any[] = [];

    if (live === "true" || live === "1") where.push("e.status = 'LIVE'");
    if (sport) { params.push(sport); where.push(`e.sport_id = $${params.length}`); }
    if (league) { params.push(league); where.push(`e.league_id = $${params.length}`); }

    params.push(Math.min(parseInt(String(limit ?? "100"), 10) || 100, 200));

    res.json(
      await query(
        `SELECT ${EVENT_COLUMNS}
           FROM events e
           LEFT JOIN leagues l ON l.id = e.league_id
          WHERE ${where.join(" AND ")}
          ORDER BY (e.status = 'LIVE') DESC, e.start_time ASC
          LIMIT $${params.length}`,
        params
      )
    );
  } catch (err) {
    next(err);
  }
});

sportsRouter.get("/events/:id", async (req, res, next) => {
  try {
    const event = await one(
      `SELECT ${EVENT_COLUMNS}
         FROM events e
         LEFT JOIN leagues l ON l.id = e.league_id
        WHERE e.id = $1`,
      [req.params.id]
    );
    if (!event) return next(notFound("Event not found."));

    // Flat rows — normalizeEventDetail() groups these by market_name.
    const markets = await query(
      `SELECT m.id   AS market_id,
              m.name AS market_name,
              s.id   AS selection_id,
              s.name AS selection_name,
              s.odds,
              s.status AS selection_status
         FROM markets m
         JOIN selections s ON s.market_id = m.id
        WHERE m.event_id = $1 AND m.status <> 'CANCELLED'
        ORDER BY m.name, s.sort_order`,
      [req.params.id]
    );

    res.json({ event, markets });
  } catch (err) {
    next(err);
  }
});
