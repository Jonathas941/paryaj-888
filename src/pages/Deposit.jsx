import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowDownToLine, CheckCircle2 } from "lucide-react";
import api from "@/lib/api";
import { useApi } from "@/lib/useApi";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";

export default function Deposit() {
  const navigate = useNavigate();
  const { data: methods, loading } = useApi(() => api.getPaymentMethods());
  const [selected, setSelected] = useState(null);
  const [amount, setAmount] = useState("");
  const [done, setDone] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const m = methods?.find(x => x.id === selected);
  const submit = async () => {
    if (!m || !amount) return;
    setSubmitting(true);
    try { const res = await api.createDeposit({ amount: Number(amount), method: m.id }); setDone(res); }
    catch { setDone({ status: "error" }); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="px-4 py-4 max-w-md mx-auto">
      <h1 className="text-lg font-bold mb-1">Deposit</h1>
      <p className="text-sm text-muted-foreground mb-4">Choose a payment method to add funds.</p>

      {done ? (
        <div className="glass rounded-xl p-6 text-center">
          <CheckCircle2 className="w-10 h-10 text-bright mx-auto mb-3" />
          <h3 className="font-bold">Deposit submitted</h3>
          <p className="text-sm text-muted-foreground mt-1">Reference #{done.id} — status: {done.status}</p>
          <button onClick={() => navigate("/wallet")} className="mt-4 w-full bg-surface-2 border border-border py-3 rounded-lg font-semibold">Back to Wallet</button>
        </div>
      ) : (
        <>
          <div className="space-y-2 mb-4">
            {loading ? Array.from({ length: 4 }).map((_, i) => <LoadingSkeleton key={i} className="h-16 w-full" />) :
              (methods || []).map(mth => (
                <button key={mth.id} onClick={() => setSelected(mth.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition ${selected === mth.id ? "border-primary bg-primary/10" : "border-border bg-surface-2/50 hover:border-primary/40"}`}>
                  <ArrowDownToLine className="w-5 h-5 text-bright" />
                  <div className="flex-1"><div className="font-semibold text-sm">{mth.name}</div><div className="text-xs text-muted-foreground">{mth.processing} · {mth.fee}</div></div>
                  {selected === mth.id && <CheckCircle2 className="w-5 h-5 text-bright" />}
                </button>
              ))}
          </div>

          {m && (
            <div className="glass rounded-xl p-4 mb-4 text-xs text-muted-foreground flex justify-between">
              <span>Min {m.min} · Max {m.max}</span><span>{m.processing}</span>
            </div>
          )}

          <div className="mb-4">
            <label className="text-xs text-muted-foreground">Amount</label>
            <div className="flex items-center gap-2 mt-1 bg-surface-2/60 border border-border rounded-lg px-3 py-3">
              <span className="text-muted-foreground">$</span>
              <input type="number" min={m?.min || 0} value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="bg-transparent outline-none w-full font-semibold tabular-nums" />
            </div>
            <div className="flex gap-2 mt-2">
              {[20, 50, 100, 200].map(v => <button key={v} onClick={() => setAmount(String(v))} className="flex-1 py-1.5 rounded-md bg-surface-2/60 border border-border text-xs font-semibold hover:border-primary/40">${v}</button>)}
            </div>
          </div>

          <button onClick={submit} disabled={!m || !amount || submitting} className="w-full bg-gradient-to-r from-primary to-bright text-black font-bold py-3 rounded-lg glow-green disabled:opacity-40">
            {submitting ? "Processing…" : "Continue"}
          </button>
          <p className="text-[10px] text-muted-foreground text-center mt-3">Deposits are processed by the secure backend. PARYAJ 888 never stores card details.</p>
        </>
      )}
    </div>
  );
}