import { oddsConfig, getOddsApiKey, hasOddsApiKey } from "./config";

/**
 * Provider service for The Odds API (v4).
 * All HTTP to The Odds API happens here — the frontend never calls this directly.
 * Includes: request timeout, structured errors, quota/status handling.
 */

export class OddsProviderError extends Error {
  constructor(
    public status: number,
    message: string,
    public code: string = "ODDS_PROVIDER_ERROR",
  ) {
    super(message);
    this.name = "OddsProviderError";
  }
}

// ---- Raw provider shapes (The Odds API v4) ----

export interface ProviderSport {
  key: string;
  group: string;
  title: string;
  description: string;
  active: boolean;
  has_outrights?: boolean;
}

export interface ProviderOutcome {
  name: string;
  price: number;
  point?: number;
}

export interface ProviderBookmakerMarket {
  key: string;
  outcomes: ProviderOutcome[];
}

export interface ProviderBookmaker {
  key: string;
  title: string;
  last_update: string;
  markets: ProviderBookmakerMarket[];
}

export interface ProviderEvent {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: ProviderBookmaker[];
}

export interface ProviderScoreEvent {
  id: string;
  sport_key: string;
  commence_time: string;
  completed: boolean;
  home_team: string;
  away_team: string;
  scores?: { name: string; score: string }[];
  last_update?: string;
}

function buildUrl(path: string, params: Record<string, string | undefined>): string {
  const url = new URL(oddsConfig.baseUrl + path);
  url.searchParams.set("apiKey", getOddsApiKey());
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") url.searchParams.set(k, v);
  }
  return url.toString();
}

async function getJson<T>(path: string, params: Record<string, string | undefined>): Promise<T> {
  if (!hasOddsApiKey()) {
    throw new OddsProviderError(
      0,
      "ODDS_API_KEY is not configured on the server.",
      "ODDS_API_KEY_MISSING",
    );
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), oddsConfig.timeouts.requestMs);

  try {
    const res = await fetch(buildUrl(path, params), { signal: controller.signal });

    if (!res.ok) {
      const body = await res.text();
      let message = `Provider returned HTTP ${res.status}`;
      try {
        const parsed = JSON.parse(body);
        if (parsed.message) message = parsed.message;
      } catch {
        /* keep default */
      }
      let code = "ODDS_PROVIDER_ERROR";
      if (res.status === 401) code = "ODDS_API_KEY_INVALID";
      else if (res.status === 422) code = "ODDS_PROVIDER_INVALID_REQUEST";
      else if (res.status === 429) code = "ODDS_PROVIDER_QUOTA_EXCEEDED";
      // Log quota headers when available (no secrets).
      const remaining = res.headers.get("x-requests-remaining");
      const used = res.headers.get("x-requests-used");
      if (remaining || used) {
        console.warn(`[odds] provider quota — used: ${used ?? "?"}, remaining: ${remaining ?? "?"}`);
      }
      throw new OddsProviderError(res.status, message, code);
    }

    // Log quota headers on success too.
    const remaining = res.headers.get("x-requests-remaining");
    if (remaining) console.log(`[odds] quota remaining: ${remaining}`);

    return (await res.json()) as T;
  } catch (e: unknown) {
    if (e instanceof OddsProviderError) throw e;
    if (e instanceof Error && e.name === "AbortError") {
      throw new OddsProviderError(0, "Provider request timed out.", "ODDS_PROVIDER_TIMEOUT");
    }
    throw new OddsProviderError(0, "Provider network error.", "ODDS_PROVIDER_NETWORK");
  } finally {
    clearTimeout(timer);
  }
}

export const theOddsApi = {
  /** GET /v4/sports — all sports, active and inactive. */
  async getSports(): Promise<ProviderSport[]> {
    return getJson<ProviderSport[]>("/v4/sports", {});
  },

  /** GET /v4/sports/{sportKey}/odds — upcoming events with odds for a sport. */
  async getOddsForSport(sportKey: string): Promise<ProviderEvent[]> {
    return getJson<ProviderEvent[]>(`/v4/sports/${encodeURIComponent(sportKey)}/odds`, {
      regions: oddsConfig.regions,
      markets: oddsConfig.markets,
      oddsFormat: oddsConfig.format,
      dateFormat: "iso",
    });
  },

  /** GET /v4/sports/{sportKey}/events/{eventId}/odds — single event odds. */
  async getEventOdds(sportKey: string, eventId: string): Promise<ProviderEvent> {
    return getJson<ProviderEvent>(
      `/v4/sports/${encodeURIComponent(sportKey)}/events/${encodeURIComponent(eventId)}/odds`,
      {
        regions: oddsConfig.regions,
        markets: oddsConfig.markets,
        oddsFormat: oddsConfig.format,
        dateFormat: "iso",
      },
    );
  },

  /** GET /v4/sports/{sportKey}/scores — completed/in-progress scores (requires scores plan). */
  async getScores(sportKey: string, daysFrom = 3): Promise<ProviderScoreEvent[]> {
    return getJson<ProviderScoreEvent[]>(`/v4/sports/${encodeURIComponent(sportKey)}/scores`, {
      daysFrom: String(daysFrom),
    });
  },
};