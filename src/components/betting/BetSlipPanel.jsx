import React, { useState } from "react";
import { X, Trash2, Loader2, CheckCircle2, XCircle, AlertTriangle, Ticket, RefreshCw, LogIn } from "lucide-react";
import { useBetSlip } from "@/lib/BetSlipContext";
import { formatOdds } from "@/lib/format";
import { useCurrency } from "@/lib/useCurrency";
import api from "@/lib/api";
import { refreshData } from "@/lib/refresh";
import EmptyState from "@/components/common/EmptyState";

// Re-fetch every event in the slip and reconcile each selection against live
// data. Returns odds updates and selections that are no longer available.
async function reconcileSlip(selections) {
  const byEvent = {};
  for (const s of selections) (byEvent[s.eventId] ||= []).push(s);
  const oddsUpdates = [];
  const removed = [];
  for (const eventId of Object.keys(byEvent)) {
    let ev;
    try { ev = await api.getEvent(eventId); } catch { ev = null; }
    const slipSels = byEvent[eventId];
    if (!ev || !ev.markets) {
      for (const s of slipSels) removed.push({ eventId: s.eventId, selectionId: s.selectionId });
      continue;
    }
    const allOpts = Object.values(ev.markets).flat();
    for (const s of slipSels) {
      const found = allOpts.find(o => o.id === s.selectionId);
      if (!found || found.status !== "OPEN") {
        removed.push({ eventId: s.eventId, selectionId: s.selectionId });
      } else if (Number(found.odds) !== Number(s.odds)) {
        oddsUpdates.push({ eventId: s.eventId, selectionId: s.selectionId, odds: Number(found.odds) });
      }
    }
  }
  return { oddsUpdates, removed };
}

export default function BetSlipPanel({ onClose, compact = false }) {
  const { selections, removeSelection, updateSelectionOdds, clear, stake, setStake, betType, setBetType, totalOdds, potentialPayout, count } = useBetSlip();
  const { symbol, format } = useCurrency();
  const [state, setState] = useState("ready");
  const [result, setResult] = useState(null);
  const [idemKey, setIdemKey] = useState(null);

  const place = async (reuseKey = false) => {
    if (!stake || !selections.length) return;
    setState("validating");
    const key = reuseKey && idemKey ? idemKey : `b44-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    setIdemKey(key);
    const payload = {
      stake: Number(stake),
      betType: selections.length === 1 ? "single" : betType,
      idempotencyKey: key,
      selections: selections.map(s => ({
        eventId: s.eventId, marketId: s.marketId || s.market, selectionId: s.selectionId, displayOdds: s.odds
      }))
    };
    try {
      const res = await api.placeBet(payload);
      setResult(res);
      setState("accepted");
      clear();
      refreshData({ wallet: true, bets: true });
    } catch (e) {
      const code = e.code;
      const status = e.status;
      if (code === "ODDS_CHANGED") {
        const { oddsUpdates } = await reconcileSlip(selections);
        oddsUpdates.forEach(u => updateSelectionOdds(u.eventId, u.selectionId, u.odds));
        setResult({ reason: e.message || "Odds changed — please review and confirm." });
        setState("odds_changed");
      } else if (["MARKET_SUSPENDED", "MARKET_CLOSED", "SELECTION_UNAVAILABLE", "EVENT_CLOSED"].includes(code)) {
        const { removed } = await reconcileSlip(selections);
        removed.forEach(r => removeSelection(r.eventId, r.selectionId));
        setResult({ reason: e.message || "Some selections are no longer available and were removed." });
        setState(removed.length ? "unavailable" : "rejected");
      } else if (code === "INSUFFICIENT_FUNDS" || code === "INSUFFICIENT_BALANCE") {
        setResult({ reason: e.message || "Insufficient balance to place this bet." });
        setState("insufficient");
      } else if (status === 401 || code === "UNAUTHORIZED" || code === "TOKEN_EXPIRED") {
        setResult({ reason: e.message || "Your session has expired. Please log in again." });
        setState("auth");
      } else if (status === 500 || status === 503 || status === 0) {
        setResult({ reason: status === 0 ? "Can't reach the betting service. Please retry." : (e.message || "Can't reach the betting service. Please retry.") });
        setState("retry");
      } else {
        setResult({ reason: e.message || "Bet could not be placed." });
        setState("rejected");
      }
    }
  };

  const reset = () => { setState("ready"); setResult(null); };
  const done = () => { reset(); onClose?.(); };
  const goLogin = () => { api.logout(); window.location.href = "/login"; };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <h3 className="font-bold">Bet Slip</h3>
          {count > 0 && <span className="text-xs bg-primary/20 text-bright px-2 py-0.5 rounded-full">{count}</span>}
        </div>
        <div className="flex items-center gap-1">
          {count > 0 && state !== "accepted" && <button onClick={clear} className="p-1.5 rounded-md hover:bg-surface-2 text-muted-foreground hover:text-danger" title="Clear"><Trash2 className="w-4 h-4" /></button>}
          {onClose && <button onClick={onClose} className="p-1.5 rounded-md hover:bg-surface-2"><X className="w-5 h-5" /></button>}
        </div>
      </div>

      {state === "accepted" ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
          <div className="w-14 h-14 rounded-2xl bg-bright/15 grid place-items-center mb-4"><CheckCircle2 className="w-7 h-7 text-bright" /></div>
          <h3 className="font-bold text-lg">{result?.duplicate ? "Bet Already Placed" : "Bet Accepted"}</h3>
          <p className="text-sm text-muted-foreground mt-1">Bet ID <span className="text-bright font-semibold">{result?.bet_id}</span></p>
          <div className="mt-4 w-full bg-surface-2/60 border border-border rounded-lg p-3 text-left text-sm space-y-1.5">
            <div className="flex justify-between"><span className="text-muted-foreground">Accepted odds</span><span className="text-bright font-bold tabular-nums">{formatOdds(result?.totalOdds)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Stake</span><span className="font-semibold tabular-nums">{format(result?.stake)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Potential payout</span><span className="font-bold text-gradient-gold tabular-nums">{format(result?.potentialPayout)}</span></div>
          </div>
          <button onClick={done} className="w-full bg-surface-2 border border-border font-semibold py-3 rounded-lg mt-4">Done</button>
        </div>
      ) : selections.length === 0 ? (
        <div className="flex-1"><EmptyState icon={Ticket} title="Your bet slip is empty" message="Tap any odds to add a selection." /></div>
      ) : (
        <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-2">
          {selections.map((s) => (
            <div key={`${s.eventId}-${s.selectionId}`} className="bg-surface-2/60 border border-border rounded-lg p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-xs text-muted-foreground truncate">{s.event}</div>
                  <div className="font-semibold text-sm mt-0.5">{s.pick}</div>
                  <div className="text-[11px] text-muted-foreground">{s.market}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-bright font-bold text-sm tabular-nums">{formatOdds(s.odds)}</span>
                  <button onClick={() => removeSelection(s.eventId, s.selectionId)} className="text-muted-foreground hover:text-danger"><X className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {state !== "accepted" && selections.length > 0 && (
        <div className="p-4 border-t border-border space-y-3 bg-surface/40">
          {selections.length > 1 && (
            <div className="grid grid-cols-3 gap-1 bg-surface-2/60 rounded-lg p-1">
              {["single", "multiple", "system"].map(t => (
                <button key={t} onClick={() => setBetType(t)} disabled={t === "system"}
                  className={`text-xs font-semibold py-1.5 rounded-md capitalize ${betType === t ? "bg-primary text-black" : "text-muted-foreground disabled:opacity-40"}`}>{t}</button>
              ))}
            </div>
          )}
          <div>
            <label className="text-xs text-muted-foreground">Stake ({selections.length > 1 ? "per bet" : "stake"})</label>
            <div className="flex items-center gap-2 mt-1 bg-surface-2/60 border border-border rounded-lg px-3 py-2.5">
              <span className="text-muted-foreground text-sm">{symbol}</span>
              <input type="number" min="0" step="1" value={stake} onChange={e => setStake(e.target.value)} placeholder="0.00" className="bg-transparent outline-none w-full font-semibold tabular-nums" />
            </div>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-muted-foreground"><span>Total odds</span><span className="text-bright font-bold tabular-nums">{formatOdds(totalOdds)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Potential winnings</span><span className="font-bold text-gradient-gold tabular-nums">{format(potentialPayout)}</span></div>
          </div>

          {state === "odds_changed" && (
            <div className="text-sm text-gold bg-gold/10 border border-gold/30 rounded-lg p-2.5"><div className="flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Odds updated</div><p className="text-xs mt-1">{result?.reason}</p></div>
          )}
          {state === "unavailable" && (
            <div className="text-sm text-gold bg-gold/10 border border-gold/30 rounded-lg p-2.5"><div className="flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Selections removed</div><p className="text-xs mt-1">{result?.reason}</p></div>
          )}
          {state === "insufficient" && (
            <div className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-lg p-2.5"><div className="flex items-center gap-2"><XCircle className="w-4 h-4" /> Insufficient balance</div><p className="text-xs mt-1">{result?.reason}</p></div>
          )}
          {state === "rejected" && (
            <div className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-lg p-2.5"><div className="flex items-center gap-2"><XCircle className="w-4 h-4" /> Bet rejected</div><p className="text-xs mt-1">{result?.reason}</p></div>
          )}
          {state === "retry" && (
            <div className="text-sm text-gold bg-gold/10 border border-gold/30 rounded-lg p-2.5"><div className="flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Service unavailable</div><p className="text-xs mt-1">{result?.reason}</p></div>
          )}
          {state === "auth" && (
            <div className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-lg p-2.5"><div className="flex items-center gap-2"><XCircle className="w-4 h-4" /> Login required</div><p className="text-xs mt-1">{result?.reason}</p></div>
          )}

          {state === "validating" ? (
            <button disabled className="w-full bg-primary/60 text-black font-bold py-3 rounded-lg flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Placing bet…</button>
          ) : state === "odds_changed" ? (
            <button onClick={() => place(false)} className="w-full bg-gradient-to-r from-primary to-bright text-black font-bold py-3 rounded-lg glow-green hover:brightness-110 transition">Place with updated odds</button>
          ) : state === "retry" ? (
            <button onClick={() => place(true)} className="w-full bg-gradient-to-r from-primary to-bright text-black font-bold py-3 rounded-lg glow-green hover:brightness-110 transition flex items-center justify-center gap-2"><RefreshCw className="w-4 h-4" /> Retry</button>
          ) : state === "auth" ? (
            <button onClick={goLogin} className="w-full bg-gradient-to-r from-primary to-bright text-black font-bold py-3 rounded-lg glow-green flex items-center justify-center gap-2"><LogIn className="w-4 h-4" /> Log in</button>
          ) : state === "rejected" || state === "unavailable" || state === "insufficient" ? (
            <button onClick={reset} className="w-full bg-surface-2 border border-border font-semibold py-3 rounded-lg">Done</button>
          ) : (
            <button onClick={() => place(false)} className="w-full bg-gradient-to-r from-primary to-bright text-black font-bold py-3 rounded-lg glow-green hover:brightness-110 transition">Place Bet</button>
          )}
        </div>
      )}
    </div>
  );
}