import { theOddsApi } from "./provider";
import { normalizeEvent } from "./normalizer";
import type { NormalizedEvent, NormalizedMarket, NormalizedSelection } from "./normalizer";

/**
 * Authoritative odds validation for bet placement.
 * The frontend's odds are display-only. Before accepting a bet we re-fetch
 * fresh odds from the provider (no cache) and verify the event, market,
 * selection, and that betting is still open. Payout is always computed from
 * backend odds.
 */

export interface BetSelectionInput {
  sportKey: string;
  eventId: string;
  marketKey: string;
  selectionName: string;
  /** The odds the frontend displayed to the user. */
  displayedOdds: number;
}

export interface ValidationResult {
  ok: boolean;
  event: NormalizedEvent;
  market: NormalizedMarket;
  selection: NormalizedSelection;
  /** Authoritative current odds from the provider. */
  currentOdds: number;
}

const ODDS_TOLERANCE = 0.001;

export class BetValidationError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
    public details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "BetValidationError";
  }
}

/**
 * Validate a single selection against live provider odds.
 * Throws BetValidationError on any failure; returns the authoritative odds on success.
 */
export async function validateBetOdds(input: BetSelectionInput): Promise<ValidationResult> {
  // 1. Retrieve current authoritative odds (bypass cache — always fresh).
  const raw = await theOddsApi.getEventOdds(input.sportKey, input.eventId);
  const event = normalizeEvent(raw);

  // 2. Verify event exists (implicit — provider would 404 otherwise).

  // 3. Verify betting is still open.
  if (event.status !== "upcoming" && !event.isLive) {
    throw new BetValidationError(
      "EVENT_CLOSED",
      "Betting is closed for this event.",
      409,
      { eventStatus: event.status },
    );
  }

  // 4. Verify market exists.
  const market = event.markets.find((m) => m.key === input.marketKey);
  if (!market) {
    throw new BetValidationError("MARKET_UNAVAILABLE", "This market is no longer available.", 409);
  }

  // 5. Verify selection exists.
  const selection = market.selections.find((s) => s.name === input.selectionName);
  if (!selection) {
    throw new BetValidationError("SELECTION_UNAVAILABLE", "This selection is no longer available.", 409);
  }

  // 6. Compare against frontend displayed odds.
  const currentOdds = selection.odds;
  if (Math.abs(currentOdds - input.displayedOdds) > ODDS_TOLERANCE) {
    throw new BetValidationError(
      "ODDS_CHANGED",
      "Odds have changed.",
      409,
      { oldOdds: input.displayedOdds, newOdds: currentOdds },
    );
  }

  return { ok: true, event, market, selection, currentOdds };
}

/** Compute payout using backend-authoritative odds only. */
export function computePayout(stake: number, odds: number): number {
  return Number((stake * odds).toFixed(2));
}