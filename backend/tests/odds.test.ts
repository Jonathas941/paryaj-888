/**
 * Validation tests for the Odds API integration.
 * Run: npx tsx backend/tests/odds.test.ts
 *
 * No test framework — a tiny assertion harness with fetch mocking.
 * These cover the provider error paths, normalization, and bet validation
 * without hitting the real provider or database.
 */

// Set env BEFORE importing modules that read it.
process.env.ODDS_API_KEY = "test-key";
process.env.ODDS_API_BASE_URL = "https://api.test-odds.local";
process.env.ODDS_API_REGIONS = "us";
process.env.ODDS_API_MARKETS = "h2h,spreads,totals";
process.env.ODDS_API_FORMAT = "decimal";
process.env.ODDS_PREFERRED_BOOKMAKERS = "draftkings";

import { theOddsApi, OddsProviderError } from "../src/odds/provider";
import { normalizeEvent, normalizeSport } from "../src/odds/normalizer";
import { validateBetOdds, BetValidationError } from "../src/odds/betValidation";

let passed = 0;
let failed = 0;
const failures: string[] = [];

function assert(cond: boolean, msg: string): void {
  if (cond) {
    passed++;
  } else {
    failed++;
    failures.push(msg);
    console.error(`  ✗ ${msg}`);
  }
}

function assertEqual<T>(actual: T, expected: T, msg: string): void {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  assert(a === e, `${msg} (got ${a}, expected ${e})`);
}

type FetchMock = (url: string, init?: RequestInit) => Promise<Response>;
let fetchMock: FetchMock | null = null;
const realFetch = globalThis.fetch;

function setFetch(mock: FetchMock): void {
  fetchMock = mock;
  (globalThis as any).fetch = (url: string, init?: RequestInit) => fetchMock!(url, init);
}
function restoreFetch(): void {
  fetchMock = null;
  (globalThis as any).fetch = realFetch;
}

function jsonResponse(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "x-requests-remaining": "100", ...headers },
  });
}

// ---- Provider error tests ----

async function testMissingApiKey(): Promise<void> {
  const saved = process.env.ODDS_API_KEY;
  delete process.env.ODDS_API_KEY;
  try {
    await theOddsApi.getSports();
    assert(false, "missing key should throw");
  } catch (e) {
    assert(e instanceof OddsProviderError && e.code === "ODDS_API_KEY_MISSING", "ODDS_API_KEY_MISSING thrown");
  } finally {
    process.env.ODDS_API_KEY = saved;
  }
}

async function testSportsFetchSuccess(): Promise<void> {
  setFetch(() => Promise.resolve(jsonResponse([{ key: "soccer_epl", group: "Soccer", title: "EPL", description: "x", active: true }])));
  try {
    const sports = await theOddsApi.getSports();
    assertEqual(sports.length, 1, "sports fetch returns 1");
    assertEqual(sports[0].key, "soccer_epl", "sport key");
  } finally {
    restoreFetch();
  }
}

async function testProviderTimeout(): Promise<void> {
  setFetch(() => new Promise((_, reject) => setTimeout(() => reject(new DOMException("aborted", "AbortError")), 10)));
  process.env.ODDS_API_TIMEOUT_MS = "5";
  try {
    await theOddsApi.getSports();
    assert(false, "timeout should throw");
  } catch (e) {
    assert(e instanceof OddsProviderError && e.code === "ODDS_PROVIDER_TIMEOUT", "timeout error code");
  } finally {
    process.env.ODDS_API_TIMEOUT_MS = "8000";
    restoreFetch();
  }
}

async function testProvider401(): Promise<void> {
  setFetch(() => Promise.resolve(jsonResponse({ message: "Invalid API key" }, 401)));
  try {
    await theOddsApi.getSports();
    assert(false, "401 should throw");
  } catch (e) {
    assert(e instanceof OddsProviderError && e.code === "ODDS_API_KEY_INVALID", "401 -> ODDS_API_KEY_INVALID");
  } finally {
    restoreFetch();
  }
}

async function testProviderQuotaFailure(): Promise<void> {
  setFetch(() => Promise.resolve(jsonResponse({ message: "quota exceeded" }, 429)));
  try {
    await theOddsApi.getSports();
    assert(false, "429 should throw");
  } catch (e) {
    assert(e instanceof OddsProviderError && e.code === "ODDS_PROVIDER_QUOTA_EXCEEDED", "429 -> QUOTA_EXCEEDED");
  } finally {
    restoreFetch();
  }
}

async function testEmptySportResponse(): Promise<void> {
  setFetch(() => Promise.resolve(jsonResponse([])));
  try {
    const sports = await theOddsApi.getSports();
    assertEqual(sports.length, 0, "empty sports array");
  } finally {
    restoreFetch();
  }
}

// ---- Normalization tests ----

const sampleEvent = {
  id: "evt123",
  sport_key: "soccer_epl",
  sport_title: "EPL",
  commence_time: new Date(Date.now() + 3600_000).toISOString(),
  home_team: "Manchester City",
  away_team: "Liverpool",
  bookmakers: [
    {
      key: "draftkings",
      title: "DraftKings",
      last_update: "2026-01-01T00:00:00Z",
      markets: [
        { key: "h2h", outcomes: [{ name: "Manchester City", price: 1.65 }, { name: "Draw", price: 4.1 }, { name: "Liverpool", price: 4.9 }] },
        { key: "spreads", outcomes: [{ name: "Manchester City", price: 1.95, point: -1.5 }, { name: "Liverpool", price: 1.95, point: 1.5 }] },
        { key: "totals", outcomes: [{ name: "Over", price: 1.9, point: 2.5 }, { name: "Under", price: 1.9, point: 2.5 }] },
      ],
    },
    {
      key: "fanduel",
      title: "FanDuel",
      last_update: "2026-01-01T00:00:00Z",
      markets: [
        { key: "h2h", outcomes: [{ name: "Manchester City", price: 1.7 }, { name: "Draw", price: 4.0 }, { name: "Liverpool", price: 5.0 }] },
      ],
    },
  ],
};

function testEventNormalization(): void {
  const e = normalizeEvent(sampleEvent as any);
  assertEqual(e.id, "evt123", "event id");
  assertEqual(e.homeTeam, "Manchester City", "home team");
  assertEqual(e.status, "upcoming", "upcoming status");
  assert(!e.isLive, "not live");
}

function testH2hNormalization(): void {
  const e = normalizeEvent(sampleEvent as any);
  const h2h = e.markets.find((m) => m.key === "h2h");
  assert(!!h2h, "h2h market present");
  // Best price: City 1.7 (fanduel), Draw 4.1 (draftkings), Liverpool 5.0 (fanduel)
  const city = h2h!.selections.find((s) => s.name === "Manchester City");
  assertEqual(city!.odds, 1.7, "h2h best price City 1.7");
  const liverpool = h2h!.selections.find((s) => s.name === "Liverpool");
  assertEqual(liverpool!.odds, 5.0, "h2h best price Liverpool 5.0");
}

function testSpreadsNormalization(): void {
  const e = normalizeEvent(sampleEvent as any);
  const spreads = e.markets.find((m) => m.key === "spreads");
  assert(!!spreads, "spreads market present");
  // Preferred bookmaker draftkings -> single line, point preserved
  const city = spreads!.selections.find((s) => s.name === "Manchester City");
  assertEqual(city!.point, -1.5, "spread point preserved");
  assertEqual(city!.bookmaker, "draftkings", "spread from preferred bookmaker");
}

function testTotalsNormalization(): void {
  const e = normalizeEvent(sampleEvent as any);
  const totals = e.markets.find((m) => m.key === "totals");
  assert(!!totals, "totals market present");
  const over = totals!.selections.find((s) => s.name === "Over");
  assertEqual(over!.point, 2.5, "totals point preserved");
}

function testSportNormalization(): void {
  const s = normalizeSport({ key: "soccer_epl", group: "Soccer", title: "EPL", description: "x", active: true });
  assertEqual(s.id, "soccer_epl", "sport id = key");
  assertEqual(s.slug, "soccer_epl", "sport slug = key");
  assert(s.active, "sport active");
}

// ---- Bet validation tests ----

async function testOddsChanged(): Promise<void> {
  setFetch(() => Promise.resolve(jsonResponse(sampleEvent)));
  try {
    await validateBetOdds({
      sportKey: "soccer_epl",
      eventId: "evt123",
      marketKey: "h2h",
      selectionName: "Manchester City",
      displayedOdds: 1.8, // current best is 1.7
      stake: 10,
    });
    assert(false, "odds changed should throw");
  } catch (e) {
    assert(e instanceof BetValidationError && e.code === "ODDS_CHANGED", "ODDS_CHANGED thrown");
    assertEqual((e as BetValidationError).details?.newOdds, 1.7, "newOdds in details");
  } finally {
    restoreFetch();
  }
}

async function testOddsAccepted(): Promise<void> {
  setFetch(() => Promise.resolve(jsonResponse(sampleEvent)));
  try {
    const r = await validateBetOdds({
      sportKey: "soccer_epl",
      eventId: "evt123",
      marketKey: "h2h",
      selectionName: "Manchester City",
      displayedOdds: 1.7,
      stake: 10,
    });
    assertEqual(r.currentOdds, 1.7, "current odds accepted");
  } finally {
    restoreFetch();
  }
}

async function testClosedEventRejection(): Promise<void> {
  const closed = { ...sampleEvent, commence_time: new Date(Date.now() - 10 * 3600_000).toISOString() };
  setFetch(() => Promise.resolve(jsonResponse(closed)));
  try {
    await validateBetOdds({
      sportKey: "soccer_epl",
      eventId: "evt123",
      marketKey: "h2h",
      selectionName: "Manchester City",
      displayedOdds: 1.7,
      stake: 10,
    });
    assert(false, "closed event should throw");
  } catch (e) {
    assert(e instanceof BetValidationError && e.code === "EVENT_CLOSED", "EVENT_CLOSED thrown");
  } finally {
    restoreFetch();
  }
}

async function testInvalidEventRejection(): Promise<void> {
  // valid event but unknown market
  setFetch(() => Promise.resolve(jsonResponse(sampleEvent)));
  try {
    await validateBetOdds({
      sportKey: "soccer_epl",
      eventId: "evt123",
      marketKey: "does_not_exist",
      selectionName: "x",
      displayedOdds: 1.7,
      stake: 10,
    });
    assert(false, "invalid market should throw");
  } catch (e) {
    assert(e instanceof BetValidationError && e.code === "MARKET_UNAVAILABLE", "MARKET_UNAVAILABLE thrown");
  } finally {
    restoreFetch();
  }
}

async function run(): Promise<void> {
  console.log("Running Odds API integration tests...\n");

  await testMissingApiKey();
  await testSportsFetchSuccess();
  await testProviderTimeout();
  await testProvider401();
  await testProviderQuotaFailure();
  await testEmptySportResponse();

  testEventNormalization();
  testH2hNormalization();
  testSpreadsNormalization();
  testTotalsNormalization();
  testSportNormalization();

  await testOddsChanged();
  await testOddsAccepted();
  await testClosedEventRejection();
  await testInvalidEventRejection();

  console.log(`\n${passed} passed, ${failed} failed.`);
  if (failed) {
    failures.forEach((f) => console.error(" - " + f));
    process.exit(1);
  }
}

run().catch((e) => {
  console.error("Test runner crashed:", e);
  process.exit(1);
});