import { oddsConfig } from "./config";
import type { ProviderEvent, ProviderBookmaker, ProviderSport } from "./provider";

/**
 * Normalization layer: converts raw The Odds API objects into PARYAJ 888's
 * internal, frontend-friendly structures. The frontend never sees raw
 * provider objects.
 */

export interface NormalizedSelection {
  id: string;
  name: string;
  odds: number;
  bookmaker: string;
  lastUpdated: string;
  point?: number;
}

export interface NormalizedMarket {
  id: string;
  key: string;
  name: string;
  selections: NormalizedSelection[];
}

export interface NormalizedEvent {
  id: string;
  externalId: string;
  sportKey: string;
  sportName: string;
  startTime: string;
  homeTeam: string;
  awayTeam: string;
  status: string;
  isLive: boolean;
  markets: NormalizedMarket[];
}

export interface NormalizedSport {
  id: string;
  externalId: string;
  name: string;
  slug: string;
  active: boolean;
}

const MARKET_NAMES: Record<string, string> = {
  h2h: "Match Winner",
  spreads: "Spreads",
  totals: "Totals",
};

const LIVE_WINDOW_MS = 6 * 60 * 60 * 1000; // an event is "live" if it started within the last 6h

/** Order bookmakers by ODDS_PREFERRED_BOOKMAKERS when configured. */
function orderedBookmakers(event: ProviderEvent): ProviderBookmaker[] {
  const bms = event.bookmakers ?? [];
  const preferred = oddsConfig.preferredBookmakers;
  if (!preferred.length) return bms;
  const ordered = preferred
    .map((key) => bms.find((b) => b.key === key))
    .filter((b): b is ProviderBookmaker => Boolean(b));
  return ordered.length ? ordered : bms;
}

/**
 * h2h (moneyline / 1X2): no point value, so a best-price-per-outcome display
 * across bookmakers is valid and standard. Each outcome keeps the highest price
 * and the bookmaker that offered it.
 */
function normalizeH2h(event: ProviderEvent): NormalizedMarket | null {
  const bms = orderedBookmakers(event);
  if (!bms.length) return null;

  const best = new Map<string, { price: number; bookmaker: string; lastUpdate: string }>();
  for (const bm of bms) {
    const market = bm.markets.find((m) => m.key === "h2h");
    if (!market) continue;
    for (const outcome of market.outcomes) {
      const current = best.get(outcome.name);
      if (!current || outcome.price > current.price) {
        best.set(outcome.name, { price: outcome.price, bookmaker: bm.key, lastUpdate: bm.last_update });
      }
    }
  }
  if (!best.size) return null;

  const selections: NormalizedSelection[] = [...best.entries()].map(([name, v]) => ({
    id: `${event.id}:h2h:${name}`,
    name,
    odds: v.price,
    bookmaker: v.bookmaker,
    lastUpdated: v.lastUpdate,
  }));

  return { id: `${event.id}:h2h`, key: "h2h", name: MARKET_NAMES.h2h, selections };
}

/**
 * Spreads and totals carry a point value. To avoid combining incompatible
 * lines from different bookmakers, we use a SINGLE bookmaker's line
 * (first preferred, else first available) for the whole market.
 */
function normalizePointMarket(event: ProviderEvent, key: "spreads" | "totals"): NormalizedMarket | null {
  const bms = orderedBookmakers(event);
  for (const bm of bms) {
    const market = bm.markets.find((m) => m.key === key);
    if (market && market.outcomes.length) {
      const selections: NormalizedSelection[] = market.outcomes.map((o) => ({
        id: `${event.id}:${key}:${o.name}:${o.point ?? 0}`,
        name: o.name,
        odds: o.price,
        bookmaker: bm.key,
        lastUpdated: bm.last_update,
        point: o.point,
      }));
      return { id: `${event.id}:${key}`, key, name: MARKET_NAMES[key], selections };
    }
  }
  return null;
}

export function normalizeEvent(event: ProviderEvent): NormalizedEvent {
  const markets: NormalizedMarket[] = [];
  const h2h = normalizeH2h(event);
  if (h2h) markets.push(h2h);
  const spreads = normalizePointMarket(event, "spreads");
  if (spreads) markets.push(spreads);
  const totals = normalizePointMarket(event, "totals");
  if (totals) markets.push(totals);

  const startMs = new Date(event.commence_time).getTime();
  const now = Date.now();
  const isLive = !Number.isNaN(startMs) && startMs <= now && startMs > now - LIVE_WINDOW_MS;

  return {
    id: event.id,
    externalId: event.id,
    sportKey: event.sport_key,
    sportName: event.sport_title,
    startTime: event.commence_time,
    homeTeam: event.home_team,
    awayTeam: event.away_team,
    status: isLive ? "live" : "upcoming",
    isLive,
    markets,
  };
}

export function normalizeSport(sport: ProviderSport): NormalizedSport {
  return {
    id: sport.key,
    externalId: sport.key,
    name: sport.title,
    slug: sport.key,
    active: sport.active,
  };
}