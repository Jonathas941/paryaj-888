-- PARYAJ 888 — initial schema
-- Money is NUMERIC(18,2) everywhere. All balance arithmetic happens in SQL
-- inside a transaction with the wallet row locked; never in JS floats.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------- users ----------
CREATE TABLE IF NOT EXISTS users (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email          TEXT NOT NULL UNIQUE,
  username       TEXT NOT NULL UNIQUE,
  password_hash  TEXT NOT NULL,
  role           TEXT NOT NULL DEFAULT 'USER' CHECK (role IN ('USER','ADMIN')),
  status         TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','SUSPENDED','CLOSED')),
  date_of_birth  DATE,
  country        TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- wallets ----------
-- available_balance = spendable. locked_balance = reserved (pending withdrawals).
-- Invariant: both >= 0, enforced by CHECK so an over-debit aborts the transaction.
CREATE TABLE IF NOT EXISTS wallets (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  currency          TEXT NOT NULL DEFAULT 'USD',
  available_balance NUMERIC(18,2) NOT NULL DEFAULT 0 CHECK (available_balance >= 0),
  locked_balance    NUMERIC(18,2) NOT NULL DEFAULT 0 CHECK (locked_balance >= 0),
  bonus_balance     NUMERIC(18,2) NOT NULL DEFAULT 0 CHECK (bonus_balance >= 0),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, currency)
);

-- ---------- ledger ----------
-- Append-only. Every balance change writes exactly one row here in the same
-- transaction that moves the money, so the ledger always reconciles.
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id      UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type           TEXT NOT NULL CHECK (type IN
                   ('DEPOSIT','WITHDRAWAL','BET_STAKE','BET_PAYOUT','BET_REFUND','ADJUSTMENT','BONUS')),
  direction      TEXT NOT NULL CHECK (direction IN ('DEBIT','CREDIT')),
  amount         NUMERIC(18,2) NOT NULL CHECK (amount > 0),
  currency       TEXT NOT NULL DEFAULT 'USD',
  status         TEXT NOT NULL DEFAULT 'COMPLETED' CHECK (status IN ('PENDING','COMPLETED','FAILED','CANCELLED')),
  balance_after  NUMERIC(18,2) NOT NULL,
  reference_type TEXT,
  reference_id   UUID,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_wtx_user_created ON wallet_transactions (user_id, created_at DESC);

-- ---------- sportsbook catalogue ----------
CREATE TABLE IF NOT EXISTS sports (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  icon         TEXT,
  display_order INT NOT NULL DEFAULT 0,
  active       BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS leagues (
  id       TEXT PRIMARY KEY,
  sport_id TEXT NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
  name     TEXT NOT NULL,
  country  TEXT
);

CREATE TABLE IF NOT EXISTS events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sport_id    TEXT NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
  league_id   TEXT REFERENCES leagues(id) ON DELETE SET NULL,
  home_team   TEXT NOT NULL,
  away_team   TEXT NOT NULL,
  start_time  TIMESTAMPTZ NOT NULL,
  status      TEXT NOT NULL DEFAULT 'SCHEDULED'
                CHECK (status IN ('SCHEDULED','LIVE','FINISHED','CANCELLED','POSTPONED')),
  home_score  INT,
  away_score  INT,
  minute      TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_events_status_start ON events (status, start_time);

CREATE TABLE IF NOT EXISTS markets (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,           -- e.g. '1X2', 'Over/Under 2.5'
  status      TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN','SUSPENDED','SETTLED','CANCELLED')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_markets_event ON markets (event_id);

CREATE TABLE IF NOT EXISTS selections (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id  UUID NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,            -- e.g. 'Home', 'Draw', 'Away'
  odds       NUMERIC(10,3) NOT NULL CHECK (odds > 1),
  status     TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN','SUSPENDED','SETTLED')),
  result     TEXT CHECK (result IN ('WON','LOST','VOID')),
  sort_order INT NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_selections_market ON selections (market_id);

-- ---------- bets ----------
-- idempotency_key is UNIQUE: a retried placement returns the original bet
-- instead of debiting the stake twice.
CREATE TABLE IF NOT EXISTS bets (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bet_type          TEXT NOT NULL DEFAULT 'SINGLE' CHECK (bet_type IN ('SINGLE','MULTIPLE')),
  stake             NUMERIC(18,2) NOT NULL CHECK (stake > 0),
  total_odds        NUMERIC(12,3) NOT NULL CHECK (total_odds > 1),
  potential_payout  NUMERIC(18,2) NOT NULL,
  actual_payout     NUMERIC(18,2),
  currency          TEXT NOT NULL DEFAULT 'USD',
  status            TEXT NOT NULL DEFAULT 'ACCEPTED'
                      CHECK (status IN ('ACCEPTED','WON','LOST','VOID','REJECTED','CASHED_OUT')),
  idempotency_key   TEXT NOT NULL UNIQUE,
  settled_at        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_bets_user_created ON bets (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bets_status ON bets (status);

-- odds_at_placement is the price the bet is settled at, frozen at placement.
CREATE TABLE IF NOT EXISTS bet_selections (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bet_id             UUID NOT NULL REFERENCES bets(id) ON DELETE CASCADE,
  event_id           UUID NOT NULL REFERENCES events(id),
  market_id          UUID NOT NULL REFERENCES markets(id),
  selection_id       UUID NOT NULL REFERENCES selections(id),
  odds_at_placement  NUMERIC(10,3) NOT NULL,
  result             TEXT CHECK (result IN ('WON','LOST','VOID'))
);
CREATE INDEX IF NOT EXISTS idx_betsel_bet ON bet_selections (bet_id);
CREATE INDEX IF NOT EXISTS idx_betsel_event ON bet_selections (event_id);

-- ---------- cashier ----------
-- These record intent only. No payment provider is wired up: an approved
-- deposit/withdrawal is an admin action, not a real money movement.
CREATE TABLE IF NOT EXISTS deposits (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount         NUMERIC(18,2) NOT NULL CHECK (amount > 0),
  currency       TEXT NOT NULL DEFAULT 'USD',
  method         TEXT NOT NULL,
  status         TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','COMPLETED','FAILED','CANCELLED')),
  reference      TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at   TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS withdrawals (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount         NUMERIC(18,2) NOT NULL CHECK (amount > 0),
  currency       TEXT NOT NULL DEFAULT 'USD',
  method         TEXT NOT NULL,
  destination    TEXT,
  status         TEXT NOT NULL DEFAULT 'PENDING'
                   CHECK (status IN ('PENDING','APPROVED','REJECTED','COMPLETED','CANCELLED')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at   TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS audit_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,
  entity_type TEXT,
  entity_id   UUID,
  metadata    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
