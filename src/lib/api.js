// Centralized API service layer for PARYAJ 888.
// All backend requests go through here. The authoritative source of truth
// for balances, odds, bet validation and settlement is the external Railway backend.
//
// Configure the backend URL with the VITE_PARYAJ_API_URL environment variable.
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

export class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
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

async function request(path, { method = "GET", body, query } = {}) {
  if (SAMPLE_MODE) throw new ApiError(0, "sample");
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
    throw new ApiError(0, "Network error. Check your connection and try again.");
  }
  let data = null;
  const text = await res.text();
  if (text) { try { data = JSON.parse(text); } catch { data = { raw: text }; } }
  if (!res.ok) {
    const message = (data && (data.message || data.error)) || FRIENDLY[res.status] || "Unexpected error.";
    throw new ApiError(res.status, message, data);
  }
  return data;
}

function authHeaders() {
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function call(path, opts, sampleFn) {
  try {
    return await request(path, opts);
  } catch (e) {
    if (e.status === 0 && sampleFn) return sampleFn();
    throw e;
  }
}

export const api = {
  isSampleMode: () => SAMPLE_MODE,

  // Auth
  login: (email, password) => call("/api/auth/login", { method: "POST", body: { email, password } }, () => sample.sampleLogin(email)),
  register: (payload) => call("/api/auth/register", { method: "POST", body: payload }, () => sample.sampleRegister(payload)),

  // Sportsbook
  getSports: () => call("/api/sports", {}, () => sample.sports),
  getEvents: (params) => call("/api/events", { query: params }, () => sample.getEvents(params)),
  getLiveEvents: () => call("/api/events/live", {}, () => sample.liveEvents),
  getEvent: (id) => call(`/api/events/${id}`, {}, () => sample.getEvent(id)),
  getEventMarkets: (id) => call(`/api/events/${id}/markets`, {}, () => sample.getEventMarkets(id)),

  // Bets
  placeBet: (payload) => call("/api/bets/place", { method: "POST", body: payload }, () => sample.samplePlaceBet(payload)),
  getUserBets: (params) => call("/api/bets", { query: params }, () => sample.getUserBets(params)),

  // Wallet
  getWallet: () => call("/api/wallet", {}, () => sample.wallet),
  getTransactions: (params) => call("/api/transactions", { query: params }, () => sample.getTransactions(params)),
  createDeposit: (payload) => call("/api/deposits", { method: "POST", body: payload }, () => sample.sampleDeposit(payload)),
  createWithdrawal: (payload) => call("/api/withdrawals", { method: "POST", body: payload }, () => sample.sampleWithdrawal(payload)),
  getPaymentMethods: () => call("/api/payment-methods", {}, () => sample.paymentMethods),

  // Casino
  getGames: (params) => call("/api/games", { query: params }, () => sample.getGames(params)),
  launchGame: (gameId) => call(`/api/games/${gameId}/launch`, { method: "POST" }, () => ({ launch_url: "about:blank" })),

  // Misc
  getPromotions: () => call("/api/promotions", {}, () => sample.promotions),
  getNotifications: () => call("/api/notifications", {}, () => sample.notifications),
  getProfile: () => call("/api/profile", {}, () => sample.profile),
  updateProfile: (payload) => call("/api/profile", { method: "PUT", body: payload }, () => ({ ...sample.profile, ...payload })),

  // Admin
  getAdminOverview: () => call("/api/admin/overview", {}, () => sample.adminOverview),
  getAdminUsers: () => call("/api/admin/users", {}, () => sample.adminUsers),
  getAdminBets: (params) => call("/api/admin/bets", { query: params }, () => sample.adminBets),
};

export default api;