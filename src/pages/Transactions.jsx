import React, { useState } from "react";
import { Receipt } from "lucide-react";
import api from "@/lib/api";
import { useApi } from "@/lib/useApi";
import StatusBadge from "@/components/common/StatusBadge";
import EmptyState from "@/components/common/EmptyState";
import { SkeletonList } from "@/components/common/LoadingSkeleton";
import { statusColor } from "@/lib/format";
import { useCurrency } from "@/lib/useCurrency";

const FILTERS = ["all", "deposit", "withdrawal", "bet", "winning", "bonus", "refund"];

export default function Transactions() {
  const [filter, setFilter] = useState("all");
  const { data: txs, loading } = useApi(() => api.getTransactions({ type: filter }), [filter]);
  const { format } = useCurrency();

  return (
    <div className="px-4 py-4 max-w-3xl mx-auto">
      <h1 className="text-lg font-bold mb-4">Transactions</h1>
      <div className="flex gap-1 overflow-x-auto no-scrollbar mb-4 -mx-4 px-4">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap capitalize transition ${filter === f ? "bg-primary text-black" : "bg-surface-2/50 text-muted-foreground border border-border"}`}>{f}</button>
        ))}
      </div>

      {loading ? <SkeletonList count={4} /> : (txs || []).length === 0 ? (
        <div className="glass rounded-xl"><EmptyState icon={Receipt} title="No transactions" message="Your transaction history will appear here." /></div>
      ) : (
        <div className="space-y-2">
          {(txs || []).map(t => (
            <div key={t.id} className="glass rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm capitalize">{t.type}</span>
                  <StatusBadge status={t.status} color={statusColor(t.status)} />
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">#{t.id} · {new Date(t.date).toLocaleDateString()}</div>
              </div>
              <div className="text-right">
                <div className={`font-bold tabular-nums ${t.balance_impact >= 0 ? "text-bright" : "text-danger"}`}>{t.balance_impact >= 0 ? "+" : "-"}{format(Math.abs(t.amount))}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}