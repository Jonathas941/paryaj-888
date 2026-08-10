import dotenv from "dotenv";

dotenv.config();

/**
 * Centralized configuration for The Odds API integration.
 * All values come from environment variables. ODDS_API_KEY is NEVER exposed
 * to the frontend — it stays server-side and is read lazily so tests can set it.
 */
export const oddsConfig = {
  baseUrl: (process.env.ODDS_API_BASE_URL ?? "https://api.the-odds-api.com").replace(/\/$/, ""),
  regions: process.env.ODDS_API_REGIONS ?? "us",
  markets: process.env.ODDS_API_MARKETS ?? "h2h,spreads,totals",
  format: process.env.ODDS_API_FORMAT ?? "decimal",
  preferredBookmakers: (process.env.ODDS_PREFERRED_BOOKMAKERS ?? "")
    .split(",")
    .map((b) => b.trim())
    .filter(Boolean),
  timeouts: {
    requestMs: Number(process.env.ODDS_API_TIMEOUT_MS ?? 8000),
  },
  cache: {
    sportsTtlMs: Number(process.env.ODDS_CACHE_SPORTS_TTL_MS ?? 30 * 60 * 1000),
    oddsTtlMs: Number(process.env.ODDS_CACHE_ODDS_TTL_MS ?? 45 * 1000),
    liveTtlMs: Number(process.env.ODDS_CACHE_LIVE_TTL_MS ?? 10 * 1000),
  },
};

/** Read the API key lazily so tests/runtime can set it after module load. */
export function getOddsApiKey(): string {
  return process.env.ODDS_API_KEY ?? "";
}

export function hasOddsApiKey(): boolean {
  return getOddsApiKey().length > 0;
}