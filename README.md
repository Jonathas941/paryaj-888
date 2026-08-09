# PARYAJ 888 Backend

Clean Railway-ready Express + TypeScript + PostgreSQL sportsbook API.

## Requirements satisfied

- Express server uses `process.env.PORT`
- PostgreSQL through `DATABASE_URL`
- `GET /health`
- Production database migrations
- Sportsbook endpoints under `/api/v1`
- npm scripts: `build`, `start`, `migrate:prod`

## Main endpoints

- `GET /health`
- `GET /api/v1/health/db`
- `GET /api/v1/sports`
- `GET /api/v1/sports/:sportId/leagues`
- `GET /api/v1/events`
- `GET /api/v1/events?live=true`
- `GET /api/v1/events/live`
- `GET /api/v1/events/:eventId`
- `GET /api/v1/events/:eventId/markets`

## Local setup

```bash
cp .env.example .env
npm install
npm run build
npm run migrate
npm start
```

Open:

```text
http://localhost:3000/health
```

## Railway setup

1. Create a new GitHub repository.
2. Upload the CONTENTS of this folder so `package.json` is at repository root.
3. Create a Railway project from that GitHub repository.
4. Add a Railway PostgreSQL service.
5. In the API service Variables add/reference:
   - `NODE_ENV=production`
   - `DATABASE_URL=${{Postgres.DATABASE_URL}}`
   - `FRONTEND_ORIGIN=<your Base44 origin>`
6. Do not manually set `PORT`; Railway supplies it.
7. Railway config in `railway.json` will:
   - run `npm run build`
   - run `npm run migrate:prod && npm start`
   - health-check `/health`

## Important

`/health` deliberately does not query PostgreSQL. This prevents a temporary DB problem
from being confused with an HTTP-process health problem.

Use `/api/v1/health/db` to check actual database connectivity.

## Base44

After Railway generates a public domain, use:

```text
PARYAJ_API_URL=https://YOUR-SERVICE.up.railway.app/api/v1
```

Do not expose database credentials or provider secret keys to the Base44 frontend.
