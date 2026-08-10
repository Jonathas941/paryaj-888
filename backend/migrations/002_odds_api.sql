-- PARYAJ 888 — The Odds API sync tables (migration 002)
-- Run with: psql "$DATABASE_URL" -f migrations/002_odds_api.sql
-- All tables use provider external IDs as primary keys so repeated syncs UPSERT
-- without duplicating rows.

CREATE TABLE IF NOT EXISTS odds_sports (
  external_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS odds_events (
  external_id TEXT PRIMARY KEY,
  sport_key TEXT NOT NULL,
  sport_name TEXT,
  start_time TIMESTAMPTZ,
  home_team TEXT,
  away_team TEXT,
  status TEXT NOT NULL DEFAULT 'upcoming',
  is_live BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS odds_events_sport_key_idx ON odds_events (sport_key);
CREATE INDEX IF NOT EXISTS odds_events_start_time_idx ON odds_events (start_time);
CREATE INDEX IF NOT EXISTS odds_events_live_idx ON odds_events (is_live) WHERE is_live;

CREATE TABLE IF NOT EXISTS odds_selections (
  id BIGSERIAL PRIMARY KEY,
  event_external_id TEXT NOT NULL REFERENCES odds_events (external_id) ON DELETE CASCADE,
  market_key TEXT NOT NULL,
  selection_name TEXT NOT NULL,
  odds NUMERIC(10,4) NOT NULL,
  bookmaker TEXT,
  point NUMERIC(10,4),
  last_updated TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_external_id, market_key, selection_name)
);
CREATE INDEX IF NOT EXISTS odds_selections_event_idx ON odds_selections (event_external_id);
CREATE INDEX IF NOT EXISTS odds_selections_market_idx ON odds_selections (market_key);