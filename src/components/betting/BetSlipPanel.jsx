import React, { useState } from "react";
import { X, Trash2, Loader2, CheckCircle2, XCircle, AlertTriangle, Ticket } from "lucide-react";
import { useBetSlip } from "@/lib/BetSlipContext";
import { formatOdds, formatCurrency } from "@/lib/format";
import api from "@/lib/api";
import EmptyState from "@/components/common/EmptyState";

export default function BetSlipPanel({ onClose, compact = false }) {
  const { selections, removeSelection, clear, stake, setStake, betType, setBetType, totalOdds, potentialPayout, count } = useBetSlip();
  const [state, setState] = useState("ready");
  const [result, setResult] = useState(null);
  const sample = api.isSampleMode();

  const place = async () => {
    if (!stake || !selections.length) return;
    setState("validating");
    try {
      const payload = {
        userId: "current",
        stake: Number(stake),
        betType: selections.length === 1 ? "single" : betType,
        selections: selections.map(s => ({
          eventId: s.eventId, marketId: s.market, selectionId: s.selectionId, displayOdds: s.odds
        }))
      };
      const res = await api.placeBet(payload);
      setResult(res);
      setState(res.accepted ? "accepted" : "rejected");
    } catch (e) {
      setState("network_error");
    }
  };

  const reset = () => { setState("ready"); setResult(null); };
  const done = () => { clear(); reset(); };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <h3 className="font-bold">Bet Slip</h3>
          {count > 0 && <span className="text-xs bg-primary/20 text-bright px-2 py-0.5 rounded-full">{count}</span>}
        </div>
        <div className="flex items-center gap-1">
          {count > 0 && <button onClick={clear} className="p-1.5 rounded-md hover:bg-surface-2 text-muted-foreground hover:text-danger" title="Clear"><Trash2 className="w-4 h-4" /></button>}
          {onClose && <button onClick={onClose} className="p-1.5 rounded-md hover:bg-surface-2"><X className="w-5 h-5" /></button>}
        </div>
      </div>

      {sample && (
        <div className="px-4 py-2 text-[10px] text-gold bg-gold/10 border-b border-gold/20 text-center uppercase tracking-wide">
          Preview mode — bets are simulated, not real
        </div>
      )}

      {state === "accepted" ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
          <div className="w-14 h-14 rounded-2xl bg-bright/15 grid place-items-center mb-4"><CheckCircle2 className="w-7 h-7 text-bright" /></div>
          <h3 className="font-bold text-lg">Bet Accepted</h3>
          <p className="text-sm text-muted-foreground mt-1">Bet ID <span className="text-bright font-semibold">{result?.bet_id}</span></p>
          <div className="mt-4 w-full bg-surface-2/60 border border-border rounded-lg p-3 text-left text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Stake</span><span className="font-semibold tabular-nums">{formatCurrency(Number(stake))}</span></div>
            <div className="flex justify-between mt-1"><span className="text-muted-foreground">Potential payout</span><span className="font-bold text-gradient-gold tabular-nums">{formatCurrency(result?.potential_payout)}</span></div>
          </div>
          <button onClick={done} className="w-full bg-surface-2 border border-border font-semibold py-3 rounded-lg mt-4">Done</button>
        </div>
      ) : selections.length === 0 ? (
        <div className="flex-1"><EmptyState icon={Ticket} title="Your bet slip is empty" message="Tap any odds to add a selection." /></div>
      ) : (
        <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-2">
          {selections.map((s) => (
            <div key={s.selectionId} className="bg-surface-2/60 border border-border rounded-lg p-3">
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
              <span className="text-muted-foreground text-sm">$</span>
              <input type="number" min="0" step="1" value={stake} onChange={e => setStake(e.target.value)} placeholder="0.00" className="bg-transparent outline-none w-full font-semibold tabular-nums" />
            </div>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-muted-foreground"><span>Total odds</span><span className="text-bright font-bold tabular-nums">{formatOdds(totalOdds)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Potential winnings</span><span className="font-bold text-gradient-gold tabular-nums">{formatCurrency(potentialPayout)}</span></div>
          </div>

          {state === "accepted" && (
            <div className="flex items-center gap-2 text-sm text-bright bg-bright/10 border border-bright/30 rounded-lg p-2.5"><CheckCircle2 className="w-4 h-4" /> Bet accepted — ID {result?.bet_id}</div>
          )}
          {state === "rejected" && (
            <div className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-lg p-2.5"><div className="flex items-center gap-2"><XCircle className="w-4 h-4" /> Bet rejected</div><p className="text-xs mt-1">{result?.reason}</p></div>
          )}
          {state === "network_error" && (
            <div className="flex items-center gap-2 text-sm text-gold bg-gold/10 border border-gold/30 rounded-lg p-2.5"><AlertTriangle className="w-4 h-4" /> Network error. Try again.</div>
          )}

          {state === "validating" ? (
            <button disabled className="w-full bg-primary/60 text-black font-bold py-3 rounded-lg flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Validating bet…</button>
          ) : state === "rejected" || state === "network_error" ? (
            <button onClick={reset} className="w-full bg-surface-2 border border-border font-semibold py-3 rounded-lg">Done</button>
          ) : (
            <button onClick={place} className="w-full bg-gradient-to-r from-primary to-bright text-black font-bold py-3 rounded-lg glow-green hover:brightness-110 transition">Place Bet</button>
          )}
        </div>
      )}
    </div>
  );
}