// Centralized API service layer for PARYAJ 888.
// All backend requests go through here. The authoritative source of truth
// for balances, odds, bet validation and settlement is the external Railway backend.
//
// Configure the backend URL with the VITE_PARYAJ_API_URL environment variable,
// set to the backend's /api/v1 base, e.g. https://your-app.up.railway.app/api/v1
// When no backend URL is configured, clearly-marked SAMPLE data is returned so
// the UI is fully explorable. Real money logic never runs on the frontend.

import * as sample from "./sampleData";

const API_URL = (import.meta.env?.VITE_PARYAJ_API_URL || "").replace(/\/$/, "");
const SAMPLE_MODE = !API_URL;

const TOKEN_KEY = "paryaj_api_token";

export function setApiToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}
export function getApiToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export class ApiError extends Error {
  constructor(status, message, code, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const FRIENDLY = {
  400: "Request could not be processed. Please check your input.",
  401: "Your session has expired. Please log in again.",
  403: "You are not allowed to perform this action.",
  404: "The requested resource could not be found.",
  409: "This action conflicts with the current state. Please refresh and try again.",
  422: "Some information provided is invalid. Please review and try again.",
  429: "Too many requests. Please wait a moment and try again.",
  500: "Something went wrong on our end. Please try again shortly.",
  503: "This service is temporarily unavailable. Please try again later."
};

function authHeaders() {
  const token = getApiToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, { method = "GET", body, query } = {}) {
  if (SAMPLE_MODE) throw new ApiError(0, "sample", "SAMPLE_MODE");
  const url = new URL(API_URL + path);
  if (query) Object.entries(query).forEach(([k, v]) => v != null && url.searchParams.set(k, v));
  let res;
  try {
    res = await fetch(url.toString(), {
      method,
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: body ? JSON.stringify(body) : undefined
    });
  } catch (e) {
    throw new ApiError(0, "Network error. Check your connection and try again.", "NETWORK_ERROR");
  }
  const text = await res.text();
  let data = null;
  if (text) { try { data = JSON.parse(text); } catch { data = { raw: text }; } }
  if (!res.ok) {
    const err = (data && data.error) || {};
    const message = err.message || FRIENDLY[res.status] || "Unexpected error.";
    throw new ApiError(res.status, message, err.code, err.details);
  }
  // Backend wraps all responses in { success, data }
  return data && data.data !== undefined ? data.data : data;
}

async function call(path, opts, sampleFn) {
  try {
    return await request(path, opts);
  } catch (e) {
    if (e.status === 0 && sampleFn) return sampleFn();
    throw e;
  }
}

// ---- Response normalizers (backend snake_case → frontend shapes) ----

function normalizeEvent(e) {
  return {
    id: e.id,
    sport: e.sport || null,
    league: e.league,
    home: e.home_team,
    away: e.away_team,
    start_time: e.start_time,
    status: e.is_live ? "live" : "upcoming",
    score: e.home_score != null || e.away_score != null ? { home: e.home_score, away: e.away_score } : null,
    is_live: !!e.is_live,
    markets: null
  };
}

function normalizeEventDetail(data) {
  const ev = data.event || data;
  const marketMap = {};
  for (const m of (data.markets || [])) {
    const key = (m.market_name || m.type || "Main").toLowerCase().replace(/\s+/g, "_");
    if (!marketMap[key]) marketMap[key] = [];
    marketMap[key].push({
      id: m.selection_id,
      marketId: m.market_id,
      marketName: m.market_name,
      label: m.selection_name,
      odds: parseFloat(m.odds),
      status: m.selection_status
    });
  }
  return {
    ...normalizeEvent(ev),
    markets: marketMap,
    stats: null
  };
}

const BET_STATUS_MAP = {
  ACCEPTED: "open", WON: "won", LOST: "lost", VOID: "void",
  CASHED_OUT: "cashed_out", REFUNDED: "void", REJECTED: "rejected", PENDING: "open"
};

function normalizeBet(b) {
  return {
    id: b.id,
    date: b.created_at,
    bet_type: (b.bet_type || "single").toLowerCase(),
    stake: parseFloat(b.stake),
    total_odds: parseFloat(b.total_odds),
    potential_payout: parseFloat(b.potential_payout),
    actual_payout: b.actual_payout != null ? parseFloat(b.actual_payout) : null,
    status: BET_STATUS_MAP[b.status] || (b.status || "open").toLowerCase(),
    settled_at: b.settled_at,
    currency: b.currency,
    selections: (b.selections || []).map(s => ({
      event: s.event || null,
      eventId: s.eventId,
      market: s.market,
      pick: s.selection,
      odds: parseFloat(s.odds),
      result: s.result
    }))
  };
}

function normalizeWallet(w) {
  if (!w) return null;
  return {
    id: w.id,
    currency: w.currency,
    available_balance: parseFloat(w.available_balance),
    locked_balance: parseFloat(w.locked_balance || 0),
    bonus_balance: parseFloat(w.bonus_balance || 0),
    updated_at: w.updated_at
  };
}

function normalizeTransaction(t) {
  const amt = parseFloat(t.amount);
  return {
    id: t.id,
    date: t.created_at,
    type: (t.type || "").toLowerCase(),
    amount: amt,
    currency: t.currency,
    direction: t.direction,
    status: (t.status || "").toLowerCase(),
    reference_type: t.reference_type,
    reference_id: t.reference_id,
    balance_impact: t.direction === "DEBIT" ? -Math.abs(amt) : Math.abs(amt)
  };
}

function normalizeAdminOverview(o) {
  return {
    registered_users: o.registered_users || 0,
    bets_today: o.bets_today || 0,
    stakes_today: parseFloat(o.stakes_today || 0),
    payouts_today: parseFloat(o.payouts_today || 0),
    open_bets: o.open_bets || 0
  };
}

function normalizeAdminBet(b) {
  return {
    ...normalizeBet(b),
    email: b.email,
    username: b.username
  };
}

// ---- Public API ----

export const api = {
  isSampleMode: () => SAMPLE_MODE,
  apiUrl: () => API_URL,

  // Auth — stores JWT on success
  login: async (email, password) => {
    const data = await call("/auth/login", { method: "POST", body: { email, password } }, () => sample.sampleLogin(email));
    if (data && data.accessToken) setApiToken(data.accessToken);
    return data;
  },
  register: async (payload) => {
    const data = await call("/auth/register", { method: "POST", body: payload }, () => sample.sampleRegister(payload));
    if (data && data.accessToken) setApiToken(data.accessToken);
    return data;
  },
  getMe: () => call("/auth/me", {}, () => sample.profile),
  logout: () => { setApiToken(null); },

  // Sportsbook
  getSports: () => call("/sports", {}, () => sample.sports),
  getEvents: (params = {}) => call("/sports/events", { query: params }, () => sample.getEvents(params)).then(r => SAMPLE_MODE ? r : r.map(normalizeEvent)),
  getLiveEvents: () => call("/sports/events", { query: { live: true } }, () => sample.liveEvents).then(r => SAMPLE_MODE ? r : r.map(normalizeEvent)),
  getEvent: (id) => call(`/sports/events/${id}`, {}, () => sample.getEvent(id)).then(data => SAMPLE_MODE ? data : normalizeEventDetail(data)),

  // Bets
  placeBet: (payload) => {
    const backendPayload = {
      stake: Number(payload.stake),
      betType: (payload.betType || "single").toUpperCase() === "SYSTEM" ? "MULTIPLE" : (payload.betType || "single").toUpperCase(),
      idempotencyKey: payload.idempotencyKey || `b44-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
      selections: (payload.selections || []).map(s => ({
        eventId: s.eventId,
        marketId: s.marketId || s.market,
        selectionId: s.selectionId,
        displayOdds: s.displayOdds || s.odds
      }))
    };
    return call("/bets/place", { method: "POST", body: backendPayload }, () => sample.samplePlaceBet(payload))
      .then(data => SAMPLE_MODE ? data : {
        accepted: true,
        bet_id: data?.bet?.id || null,
        status: "accepted",
        reason: null,
        stake: data?.bet?.stake ?? payload.stake,
        potential_payout: data?.bet?.potentialPayout ?? 0
      });
  },
  getUserBets: (params = {}) => call("/bets", { query: params }, () => sample.getUserBets(params)).then(r => SAMPLE_MODE ? r : r.map(normalizeBet)),

  // Wallet
  getWallet: () => call("/wallet", {}, () => sample.wallet).then(data => SAMPLE_MODE ? data : normalizeWallet(data)),
  getTransactions: (params = {}) => call("/wallet/transactions", { query: params }, () => sample.getTransactions(params)).then(r => SAMPLE_MODE ? r : r.map(normalizeTransaction)),

  // Deposits / withdrawals / payment methods — not yet in backend, sample fallback
  createDeposit: (payload) => call("/wallet/deposits", { method: "POST", body: payload }, () => sample.sampleDeposit(payload)),
  createWithdrawal: (payload) => call("/wallet/withdrawals", { method: "POST", body: payload }, () => sample.sampleWithdrawal(payload)),
  getPaymentMethods: () => call("/wallet/payment-methods", {}, () => sample.paymentMethods),

  // Casino — not yet in backend, sample fallback
  getGames: (params = {}) => call("/casino/games", { query: params }, () => sample.getGames(params)),
  launchGame: (gameId) => call(`/casino/games/${gameId}/launch`, { method: "POST" }, () => ({ launch_url: "about:blank" })),

  // Misc — not yet in backend, sample fallback
  getPromotions: () => call("/promotions", {}, () => sample.promotions),
  getNotifications: () => call("/notifications", {}, () => sample.notifications),
  getProfile: () => call("/auth/me", {}, () => sample.profile),
  updateProfile: (payload) => call("/auth/me", { method: "PATCH", body: payload }, () => ({ ...sample.profile, ...payload })),

  // Admin
  getAdminOverview: () => call("/admin/overview", {}, () => sample.adminOverview).then(data => SAMPLE_MODE ? data : ({ ...sample.adminOverview, ...normalizeAdminOverview(data) })),
  getAdminUsers: () => call("/admin/users", {}, () => sample.adminUsers),
  getAdminBets: (params = {}) => call("/admin/bets", { query: params }, () => sample.adminBets).then(r => SAMPLE_MODE ? r : r.map(normalizeAdminBet)),

  // Health
  health: () => call("/health", {}, () => ({ status: "ok" })).catch(() => ({ status: "offline" })),
};

export default api;