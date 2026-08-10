# PARYAJ 888 — The Odds API Integration (Railway Backend)

Drop-in module that connects the Express + TypeScript + PostgreSQL backend to
[The Odds API](https://the-odds-api.com) so the Base44 frontend can show real
sports, events, markets, and bookmaker odds. **Base44 never calls The Odds API
directly** — Railway is the only trusted source.

## Architecture

```
Base44 frontend  ──HTTP──▶  Railway backend  ──HTTPS──▶  The Odds API
 (display only)            (normalizes, caches,        (provider, key hidden)
                           validates bets, persists)
                                     │
                                     ▼
                              PostgreSQL (synced)
```

- Provider keys stay server-side (`ODDS_API_KEY`).
- Frontend odds are display-only; bet placement re-fetches authoritative odds.
- Provider outages return `503 ODDS_PROVIDER_UNAVAILABLE`, never crash the API.

## Files

```
backend/
  src/odds/
    config.ts          env config + lazy key read
    cache.ts           in-process TTL cache
    provider.ts        The Odds API HTTP client (timeout, errors, quota)
    normalizer.ts      provider → PARYAJ 888 structures
    db.ts              pg UPSERTs for sports/events/selections
    service.ts         cached fetch (sports, events, live, event detail)
    sync.ts            manual sync → PostgreSQL
    betValidation.ts   authoritative odds check for /bets/place
    routes.ts          Express router (the Base44 contract)
  migrations/
    002_odds_api.sql   odds_sports / odds_events / odds_selections tables
  tests/
    odds.test.ts       validation + normalization tests (no network/db)
  .env.example
```

## Setup

### 1. Environment variables (Railway → Variables)

Copy from `.env.example`. The only strictly required one is:

```
ODDS_API_KEY=<your key from the-odds-api.com>
```

Also set `ADMIN_SYNC_TOKEN` to protect the sync endpoints, and ensure
`DATABASE_URL` / `DATABASE_SSL` are set (your backend already uses them).

If `ODDS_API_KEY` is missing, provider endpoints return:

```json
{ "success": false, "error": { "code": "ODDS_API_KEY_MISSING", "message": "..." } }
```

### 2. Database migration

```bash
psql "$DATABASE_URL" -f backend/migrations/002_odds_api.sql
# or, if you use the existing migrate script, add it to your migrations folder
```

### 3. Mount the router in your existing `src/server.ts`

```ts
import { oddsRouter } from "./odds/routes";

// ...after your existing json/cors/helmet middleware, before app.listen:
app.use("/api/v1", oddsRouter);

// keep your existing liveness health check separate:
app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));
```

> `/api/v1/health/providers` is a separate provider-status check and does NOT
> affect Railway's `/health` liveness probe.

### 4. Wire bet validation into your existing `POST /api/v1/bets/place`

Frontend odds are never trusted. Before accepting a bet:

```ts
import { validateSelection, BetValidationError } from "./odds/routes";
// (or import from "./odds/betValidation" + computePayout directly)

app.post("/api/v1/bets/place", async (req, res) => {
  const { sportKey, eventId, marketKey, selectionName, displayedOdds, stake } = req.body;
  try {
    const { currentOdds, potentialPayout } = await validateSelection({
      sportKey, eventId, marketKey, selectionName, displayedOdds, stake,
    });
    // ...create the bet using currentOdds + potentialPayout (backend only)...
    res.json({ success: true, data: { odds: currentOdds, potentialPayout } });
  } catch (e) {
    if (e instanceof BetValidationError) {
      return res.status(e.status).json({
        success: false,
        error: { code: e.code, message: e.message },
        ...(e.details ? { data: e.details } : {}),
      });
    }
    throw e;
  }
});
```

When odds drift, the client gets HTTP 409:

```json
{
  "success": false,
  "error": { "code": "ODDS_CHANGED", "message": "Odds have changed." },
  "data": { "oldOdds": 1.8, "newOdds": 1.7 }
}
```

### 5. Run tests

```bash
npx tsx backend/tests/odds.test.ts
```

### 6. Build & start

```bash
npm run build
npm run migrate:prod   # your existing migrate script + 002_odds_api.sql
npm start
```

## Base44 API contract

| Method | Path | Notes |
| ------ | ---- | ---- |
| GET | `/api/v1/sports` | real active sports, cached ~30 min |
| GET | `/api/v1/events?sportKey=&live=&upcoming=&limit=` | normalized events + main odds |
| GET | `/api/v1/events/live` | in-window live events (empty array if none) |
| GET | `/api/v1/sports/:sportKey/events` | upcoming events for one sport |
| GET | `/api/v1/events/:eventId?sportKey=soccer_epl` | event detail + markets |
| GET | `/api/v1/events/:eventId/markets?sportKey=` | h2h / spreads / totals |
| POST | `/api/v1/admin/sync/sports` | protected (x-admin-token) |
| POST | `/api/v1/admin/sync/events?sportKey=` | protected (x-admin-token) |
| GET | `/api/v1/health/providers` | `{ oddsProvider: "online" }` |

All responses: `{ success: true, data: ... }` or
`{ success: false, error: { code, message }, data? }`.

## Bookmaker strategy

- `ODDS_PREFERRED_BOOKMAKERS=draftkings,fanduel` (comma-separated, optional).
- **h2h**: best price per outcome across configured bookmakers (valid — no point).
- **spreads / totals**: a single bookmaker's line is used (point must stay
  consistent — never mix incompatible lines across bookmakers).
- If preferred bookmakers aren't configured, a consistent deterministic
  bookmaker is selected.

## Security

- `ODDS_API_KEY` is read server-side only and never sent to Base44.
- Provider errors never leak stack traces.
- Bet validation always re-fetches fresh odds (no cache).
- No secrets are committed; everything comes from Railway Variables.