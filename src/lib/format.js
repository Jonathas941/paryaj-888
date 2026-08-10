// Formatting helpers for PARYAJ 888.

export function formatOdds(value) {
  if (value == null) return "-";
  const n = Number(value);
  if (Number.isNaN(n)) return "-";
  return n.toFixed(2);
}

export function oddsToAmerican(value) {
  const n = Number(value);
  if (Number.isNaN(n)) return "-";
  if (n >= 2) return `+${Math.round((n - 1) * 100)}`;
  return `${Math.round(-100 / (n - 1))}`;
}

export function formatCurrency(value, currency) {
  const lang = (typeof localStorage !== "undefined" && localStorage.getItem("paryaj_lang")) || "en";
  const cur = currency || (lang === "ht" ? "HTG" : "USD");
  const n = Number(value || 0);
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: cur, maximumFractionDigits: 2 }).format(n);
  } catch {
    return `${cur} ${n.toFixed(2)}`;
  }
}

export function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(Number(value || 0));
}

export function timeAgo(date) {
  const d = new Date(date).getTime();
  const diff = Math.floor((Date.now() - d) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function formatEventTime(iso) {
  const d = new Date(iso);
  return d.toLocaleString("en-US", { weekday: "short", hour: "numeric", minute: "2-digit" });
}

export function statusColor(status) {
  const s = (status || "").toLowerCase();
  if (["pending", "open", "review", "processing"].includes(s)) return "gold";
  if (["won", "approved", "paid", "verified", "online", "active"].includes(s)) return "bright";
  if (["lost", "rejected", "cancelled", "offline", "suspended"].includes(s)) return "danger";
  if (["void", "cashed out", "expired"].includes(s)) return "info";
  if (["degraded", "maintenance"].includes(s)) return "gold";
  return "muted";
}