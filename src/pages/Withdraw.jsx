import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpFromLine, CheckCircle2 } from "lucide-react";
import api from "@/lib/api";
import { useApi } from "@/lib/useApi";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { formatCurrency } from "@/lib/format";

export default function Withdraw() {
  const navigate = useNavigate();
  const { data: w, loading } = useApi(() => api.getWallet());
  const { data: methods } = useApi(() => api.getPaymentMethods());
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");
  const [done, setDone] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!amount || !method) return;
    setSubmitting(true);
    try { const res = await api.createWithdrawal({ amount: Number(amount), method }); setDone(res); }
    catch { setDone({ status: "error" }); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="px-4 py-4 max-w-md mx-auto">
      <h1 className="text-lg font-bold mb-1">Withdraw</h1>
      <p className="text-sm text-muted-foreground mb-4">Available: {loading ? "…" : <span className="text-bright font-semibold">{formatCurrency(w?.available_balance, w?.currency)}</span>}</p>

      {done ? (
        <div className="glass rounded-xl p-6 text-center">
          <CheckCircle2 className="w-10 h-10 text-bright mx-auto mb-3" />
          <h3 className="font-bold">Withdrawal requested</h3>
          <p className="text-sm text-muted-foreground mt-1">Reference #{done.id} — status: {done.status}</p>
          <p className="text-xs text-muted-foreground mt-2">Estimated processing: 1-3 business days.</p>
          <button onClick={() => navigate("/wallet")} className="mt-4 w-full bg-surface-2 border border-border py-3 rounded-lg font-semibold">Back to Wallet</button>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <label className="text-xs text-muted-foreground">Withdrawal amount</label>
            <div className="flex items-center gap-2 mt-1 bg-surface-2/60 border border-border rounded-lg px-3 py-3">
              <span className="text-muted-foreground">$</span>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="bg-transparent outline-none w-full font-semibold tabular-nums" />
            </div>
          </div>

          <div className="mb-4">
            <label className="text-xs text-muted-foreground mb-1 block">Payment method</label>
            <div className="space-y-2">
              {(methods || []).map(m => (
                <button key={m.id} onClick={() => setMethod(m.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition ${method === m.id ? "border-primary bg-primary/10" : "border-border bg-surface-2/50 hover:border-primary/40"}`}>
                  <ArrowUpFromLine className="w-5 h-5 text-bright" />
                  <div className="flex-1"><div className="font-semibold text-sm">{m.name}</div><div className="text-xs text-muted-foreground">Min {m.min} · Max {m.max}</div></div>
                </button>
              ))}
            </div>
          </div>

          <button onClick={submit} disabled={!amount || !method || submitting} className="w-full bg-gradient-to-r from-primary to-bright text-black font-bold py-3 rounded-lg glow-green disabled:opacity-40">
            {submitting ? "Processing…" : "Submit Withdrawal"}
          </button>
          <p className="text-[10px] text-muted-foreground text-center mt-3">All withdrawals are reviewed and approved by our finance team.</p>
        </>
      )}
    </div>
  );
}