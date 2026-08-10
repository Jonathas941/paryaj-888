// Tiny cross-component refresh bus. Lets the bet slip tell the wallet header
// and the My Bets page to reload after a bet is placed, without prop-drilling
// or a shared data store.
export function refreshData(keys = {}) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("paryaj:refresh", { detail: keys }));
}

export function onRefresh(handler) {
  if (typeof window === "undefined") return () => {};
  const fn = (e) => handler(e.detail || {});
  window.addEventListener("paryaj:refresh", fn);
  return () => window.removeEventListener("paryaj:refresh", fn);
}