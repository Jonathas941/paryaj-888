// Clearly-marked SAMPLE data for PARYAJ 888.
// Used only when no PARYAJ_API_URL backend is configured. None of these values
// represent real money, real bets, or real balances.

export const SAMPLE_BANNER = "SAMPLE CONTENT — connect backend to load real data";

const mk = (id, home, away, league, sport, startTime, score = null, markets = defaultMarkets()) => ({
  id, sport, league, home, away, start_time: startTime,
  status: score ? "live" : "upcoming", score, minute: score ? `${15 + (home.length % 45)}'` : null,
  markets, is_live: !!score
});

function defaultMarkets() {
  return {
    "1x2": [
      { id: "h", label: "Home", odds: 2.10 },
      { id: "d", label: "Draw", odds: 3.30 },
      { id: "a", label: "Away", odds: 3.05 }
    ],
    "over_under": [
      { id: "o25", label: "Over 2.5", odds: 1.85 },
      { id: "u25", label: "Under 2.5", odds: 1.95 }
    ],
    "btts": [
      { id: "y", label: "Yes", odds: 1.75 },
      { id: "n", label: "No", odds: 2.00 }
    ]
  };
}

export const sports = [
  { id: "soccer", name: "Football", icon: "soccer", count: 1284 },
  { id: "basketball", name: "Basketball", icon: "basketball", count: 892 },
  { id: "tennis", name: "Tennis", icon: "tennis", count: 512 },
  { id: "baseball", name: "Baseball", icon: "baseball", count: 98 },
  { id: "american_football", name: "American Football", icon: "football", count: 64 },
  { id: "hockey", name: "Hockey", icon: "hockey", count: 120 },
  { id: "boxing", name: "Boxing", icon: "boxing", count: 312 },
  { id: "mma", name: "MMA", icon: "mma", count: 286 },
  { id: "cricket", name: "Cricket", icon: "cricket", count: 76 },
  { id: "volleyball", name: "Volleyball", icon: "volleyball", count: 54 },
  { id: "table_tennis", name: "Table Tennis", icon: "table-tennis", count: 190 },
  { id: "esports", name: "Esports", icon: "esports", count: 568 }
];

export const leagues = [
  { id: "epl", name: "Premier League", country: "England", sport: "soccer" },
  { id: "laliga", name: "La Liga", country: "Spain", sport: "soccer" },
  { id: "seriea", name: "Serie A", country: "Italy", sport: "soccer" },
  { id: "nba", name: "NBA", country: "USA", sport: "basketball" },
  { id: "atp", name: "ATP Rome", country: "International", sport: "tennis" },
  { id: "ufc", name: "UFC Fight Night", country: "International", sport: "mma" }
];

// Three-way (1 / X / 2) and two-way (1 / 2) odds sets.
const three = (h, d, a) => ({
  "1x2": [
    { id: "h", label: "Home", odds: h },
    { id: "d", label: "Draw", odds: d },
    { id: "a", label: "Away", odds: a }
  ],
  over_under: [
    { id: "o25", label: "Over 2.5", odds: 1.85 },
    { id: "u25", label: "Under 2.5", odds: 1.95 }
  ]
});

const two = (h, a) => ({
  "1x2": [
    { id: "h", label: "Home", odds: h },
    { id: "a", label: "Away", odds: a }
  ]
});

// `live` overrides the values mk() derives, so the in-play strip matches the
// approved homepage design exactly.
const live = (base, { minute, marketCount }) => ({ ...base, minute, market_count: marketCount });

const events = [
  live(mk("e1", "Man City", "Liverpool", "Premier League", "soccer", "2026-08-09T20:00:00Z", { home: 2, away: 1 }, three(1.62, 3.80, 5.20)), { minute: "78'", marketCount: 3 }),
  live(mk("e2", "Real Madrid", "Barcelona", "La Liga", "soccer", "2026-08-09T21:00:00Z", { home: 1, away: 0 }, three(2.05, 3.40, 3.40)), { minute: "63'", marketCount: 3 }),
  live(mk("e3", "Boston Celtics", "Miami Heat", "NBA", "basketball", "2026-08-09T23:30:00Z", { home: 58, away: 52 }, two(1.70, 2.10)), { minute: "45+1'", marketCount: 20 }),
  live(mk("e4", "A. Volkanovski", "I. Topuria", "UFC Fight Night", "mma", "2026-08-09T22:00:00Z", { home: 0, away: 0 }, { "1x2": [] }), { minute: "Round 3", marketCount: 6 }),
  live(mk("e5", "J. Sinner", "C. Alcaraz", "ATP Rome", "tennis", "2026-08-09T18:00:00Z", { home: 1, away: 0 }, two(1.45, 2.65)), { minute: "22'", marketCount: 14 }),
  mk("e6", "Arsenal", "Chelsea", "Premier League", "soccer", "2026-08-10T22:30:00Z"),
  mk("e7", "Juventus", "Inter", "Serie A", "soccer", "2026-08-10T19:45:00Z"),
  mk("e8", "Denver Nuggets", "LA Lakers", "NBA", "basketball", "2026-08-11T01:00:00Z"),
  mk("e9", "Yankees", "Red Sox", "MLB", "baseball", "2026-08-11T00:05:00Z")
];

export const liveEvents = events.filter(e => e.is_live);
export { events };

export function getEvents(params = {}) {
  let list = events;
  if (params.sport) list = list.filter(e => e.sport === params.sport);
  if (params.live) list = list.filter(e => e.is_live);
  return list;
}

export function getEvent(id) {
  return events.find(e => e.id === id) || events[0];
}

export function getEventMarkets(id) {
  const ev = getEvent(id);
  return {
    tabs: ["ALL", "MAIN", "GOALS", "HANDICAPS", "PLAYERS", "CORNERS", "CARDS", "HALVES", "SPECIALS"],
    markets: ev.markets,
    stats: { possession: { home: 54, away: 46 }, shots: { home: 8, away: 11 }, corners: { home: 4, away: 6 } }
  };
}

export const promotions = [
  { id: "p1", title: "100% Welcome Bonus", description: "Double your first deposit up to $500 on sports.", bonus: "100% up to $500", category: "welcome", banner: "https://images.unsplash.com/photo-1522778526097-ce079d5409ec?w=2400&q=85", requirement: "5x turnover", expires: "2026-12-31" },
  { id: "p2", title: "Weekend Sports Boost", description: "Get a 10% profit boost on weekend accumulators.", bonus: "+10% profit", category: "sports", banner: "https://images.unsplash.com/photo-1577223625816-7605b1f3c1d1?w=2400&q=85", requirement: "3+ selections", expires: "2026-08-31" },
  { id: "p3", title: "Accumulator Insurance", description: "Get your stake back if one leg lets you down.", bonus: "Stake refund", category: "accumulator", banner: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=2400&q=85", requirement: "5+ legs", expires: "2026-09-15" },
  { id: "p4", title: "Casino Cashback", description: "10% weekly cashback on net casino losses.", bonus: "10% cashback", category: "casino", banner: "https://images.unsplash.com/photo-1606167668584-78701c57f13d?w=2400&q=85", requirement: "1x turnover", expires: "2026-12-31" },
  { id: "p5", title: "Champions League Special", description: "Boosted odds on all UCL knockout matches this week.", bonus: "Up to 5x odds", category: "sports", banner: "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=2400&q=85", requirement: "Min $10 stake", expires: "2026-09-30" },
  { id: "p6", title: "Live Casino Welcome", description: "Get $25 free play on Evolution live dealer tables.", bonus: "$25 free play", category: "casino", banner: "https://images.unsplash.com/photo-1518895949257-7621c3c7e3e1?w=2400&q=85", requirement: "1x turnover", expires: "2026-10-15" },
  { id: "p7", title: "NBA Playoffs Promo", description: "Free bet up to $50 on every NBA playoff game night.", bonus: "$50 free bet", category: "sports", banner: "https://images.unsplash.com/photo-1546519638-68e109496ffc?w=2400&q=85", requirement: "Min $20 stake", expires: "2026-08-31" },
  { id: "p8", title: "Crypto Deposit Bonus", description: "Extra 15% on your first crypto deposit, instant credit.", bonus: "+15% extra", category: "welcome", banner: "https://images.unsplash.com/photo-1518546305927-5aeee522c635?w=2400&q=85", requirement: "3x turnover", expires: "2026-12-31" }
];

export const wallet = {
  available_balance: 1250.00,
  bonus_balance: 75.00,
  pending_withdrawal: 200.00,
  total_deposits: 3200.00,
  total_withdrawals: 1400.00,
  total_winnings: 845.50,
  currency: "USD"
};

export const paymentMethods = [
  { id: "visa", name: "Visa / Mastercard", category: "card", min: 10, max: 5000, fee: "Free", processing: "Instant" },
  { id: "bank", name: "Bank Transfer", category: "bank", min: 50, max: 20000, fee: "Free", processing: "1-3 days" },
  { id: "momo", name: "Mobile Wallet", category: "mobile", min: 5, max: 1000, fee: "Free", processing: "Instant" },
  { id: "crypto", name: "Crypto", category: "crypto", min: 20, max: 50000, fee: "Network fee", processing: "10-30 min", admin_disabled: false }
];

const txTypes = ["deposit", "withdrawal", "bet", "winning", "bonus", "refund"];
export function getTransactions() {
  return Array.from({ length: 12 }).map((_, i) => {
    const type = txTypes[i % txTypes.length];
    const amount = [50, 200, 25, 845, 75, 25][i % 6];
    return {
      id: `T${1000 + i}`, date: new Date(Date.now() - i * 86400000).toISOString(),
      type, amount, status: type === "withdrawal" ? (i % 3 === 0 ? "pending" : "approved") : "completed",
      balance_impact: type === "withdrawal" || type === "bet" ? -amount : amount
    };
  });
}

const userBets = [
  { id: "B5001", date: "2026-08-08T18:20:00Z", bet_type: "multiple", stake: 50, total_odds: 4.62, potential_payout: 231.00, actual_payout: 231.00, status: "won", selections: [{ event: "Manchester United vs Liverpool", market: "1X2", pick: "Home", odds: 2.10 }, { event: "Arsenal vs Chelsea", market: "Over 2.5", pick: "Over", odds: 2.20 }] },
  { id: "B5002", date: "2026-08-07T15:00:00Z", bet_type: "single", stake: 25, total_odds: 1.85, potential_payout: 46.25, actual_payout: 0, status: "lost", selections: [{ event: "LA Lakers vs Boston Celtics", market: "Over 210.5", pick: "Over", odds: 1.85 }] },
  { id: "B5003", date: "2026-08-09T12:00:00Z", bet_type: "single", stake: 100, total_odds: 2.50, potential_payout: 250.00, actual_payout: null, status: "open", selections: [{ event: "Real Madrid vs Barcelona", market: "1X2", pick: "Home", odds: 2.50 }] }
];

export function getUserBets(params = {}) {
  if (params.status && params.status !== "all") return userBets.filter(b => b.status === params.status);
  return userBets;
}

export function samplePlaceBet(payload) {
  // Simulated backend validation result. Real acceptance comes from Railway only.
  const accepted = Math.random() > 0.15;
  return {
    accepted,
    bet_id: accepted ? `B${Math.floor(10000 + Math.random() * 90000)}` : null,
    status: accepted ? "accepted" : "rejected",
    reason: accepted ? null : "Odds changed or stake limit exceeded.",
    stake: payload.stake,
    potential_payout: accepted ? payload.stake * payload.selections.reduce((a, s) => a * s.displayOdds, 1) : 0
  };
}

export function sampleCashOut(betId) {
  return { accepted: true, bet_id: betId, payout: 187.50, status: "cashed_out" };
}

export function sampleLogin(email) {
  return { token: "sample-token", user: { email, role: "user", ...profile } };
}
export function sampleRegister() {
  return { token: "sample-token", user: { email: "", role: "user", ...profile } };
}
export function sampleDeposit(payload) {
  return { id: `D${Math.floor(1000 + Math.random() * 9000)}`, status: "pending", ...payload };
}
export function sampleWithdrawal(payload) {
  return { id: `W${Math.floor(1000 + Math.random() * 9000)}`, status: "pending", ...payload };
}

export const profile = {
  first_name: "Jordan", last_name: "Pierre", username: "jpierre", email: "jordan@example.com",
  phone: "+509 0000 0000", date_of_birth: "1995-03-12", country: "HT", address: "Port-au-Prince",
  currency: "USD", language: "en", account_status: "active", verification_status: "verified"
};

export const notifications = [
  { id: "n1", type: "bet_result", title: "Bet Won 🎉", body: "Your bet B5001 won $231.00.", read: false, date: "2026-08-09T10:00:00Z" },
  { id: "n2", type: "withdrawal", title: "Withdrawal Approved", body: "Your $200 withdrawal is being processed.", read: false, date: "2026-08-08T16:00:00Z" },
  { id: "n3", type: "promotion", title: "Weekend Boost Active", body: "Your 10% accumulator boost is ready.", read: true, date: "2026-08-07T09:00:00Z" },
  { id: "n4", type: "favorite", title: "Match Starting Soon", body: "Real Madrid vs Barcelona starts in 1 hour.", read: false, date: "2026-08-09T19:00:00Z" }
];

export const games = [
  { id: "g1", title: "Crash Rocket", provider: "Spribe", category: "crash", image: "https://images.unsplash.com/photo-1635776062043-2273c5c75c4b?w=400", demo: true },
  { id: "g2", title: "Live Blackjack", provider: "Evolution", category: "live_casino", image: "https://images.unsplash.com/photo-1540708660033-402c2c5c1d1d?w=400", demo: false },
  { id: "g3", title: "Mega Slots", provider: "Pragmatic", category: "slots", image: "https://images.unsplash.com/photo-1606189934846-a527add8a5b8?w=400", demo: true },
  { id: "g4", title: "Roulette Royale", provider: "Evolution", category: "table_games", image: "https://images.unsplash.com/photo-1518895949257-7621c3c7e3e1?w=400", demo: false }
];

export function getGames(params = {}) {
  if (params.category) return games.filter(g => g.category === params.category);
  return games;
}

// ---- Admin sample ----
export const adminOverview = {
  registered_users: 8421, active_users: 1284, online_users: 318,
  total_deposits: 284500, total_withdrawals: 142300, total_stakes: 968200,
  total_payouts: 891400, ggr: 76800, pending_withdrawals: 12, pending_kyc: 7,
  open_bets: 421, live_bets: 96,
  charts: {
    deposits: Array.from({ length: 7 }).map((_, i) => ({ day: `D${i+1}`, value: 38000 + Math.round(Math.random()*12000) })),
    withdrawals: Array.from({ length: 7 }).map((_, i) => ({ day: `D${i+1}`, value: 18000 + Math.round(Math.random()*8000) })),
    stakes: Array.from({ length: 7 }).map((_, i) => ({ day: `D${i+1}`, value: 120000 + Math.round(Math.random()*40000) })),
    revenue: Array.from({ length: 7 }).map((_, i) => ({ day: `D${i+1}`, value: 8000 + Math.round(Math.random()*6000) }))
  }
};

export const adminUsers = Array.from({ length: 10 }).map((_, i) => ({
  id: `U${100 + i}`, name: `User ${i + 1}`, email: `user${i+1}@example.com`,
  phone: "+509 000 0000", country: "HT", balance: Math.round(Math.random()*2000),
  status: i % 4 === 0 ? "suspended" : "active", kyc: ["verified","pending","rejected","not_started"][i % 4],
  registered: "2026-07-01", last_login: "2026-08-09", risk: ["low","medium","high"][i % 3]
}));

export const adminBets = userBets.concat([
  { id: "B6001", user: "U101", stake: 500, total_odds: 3.2, potential_payout: 1600, actual_payout: 0, type: "single", status: "open", created: "2026-08-09T12:00:00Z", settled: null, risk: "high" },
  { id: "B6002", user: "U102", stake: 20, total_odds: 5.4, potential_payout: 108, actual_payout: 108, type: "multiple", status: "won", created: "2026-08-08T10:00:00Z", settled: "2026-08-08T20:00:00Z", risk: "low" }
]);