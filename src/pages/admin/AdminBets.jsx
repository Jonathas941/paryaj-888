import React, { useState } from "react";
import api from "@/lib/api";
import { useApi } from "@/lib/useApi";
import StatusBadge from "@/components/common/StatusBadge";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { formatCurrency, formatOdds, statusColor } from "@/lib/format";

const FILTERS = ["all", "open", "won", "lost", "void"];

export default function AdminBets() {
  const [filter, setFilter] = useState("all");
  const { data: bets, loading } = useApi(() => api.getAdminBets({ status: filter }), [filter]);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold">Bets</h1>
        <div className="flex gap-1">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-2 rounded-lg text-xs font-semibold capitalize ${filter === f ? "bg-primary text-black" : "bg-surface-2/50 text-muted-foreground border border-border"}`}>{f}</button>
          ))}
        </div>
      </div>

      <div className="glass rounded-xl overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead className="bg-surface-2/60 text-muted-foreground text-xs uppercase">
            <tr>{["Bet ID", "User", "Stake", "Odds", "Potential", "Actual", "Type", "Status", "Risk", "Created"].map(h => <th key={h} className="text-left px-4 py-3 font-semibold">{h}</th>)}</tr>
          </thead>
          <tbody>
            {loading ? Array.from({ length: 6 }).map((_, i) => <tr key={i} className="border-t border-border"><td colSpan={10}><LoadingSkeleton className="h-10 w-full rounded-none" /></td></tr>) :
              (bets || []).map(b => (
                <tr key={b.id} className="border-t border-border hover:bg-surface-2/30">
                  <td className="px-4 py-3 text-muted-foreground">{b.id}</td>
                  <td className="px-4 py-3">{b.user || "-"}</td>
                  <td className="px-4 py-3 tabular-nums">{formatCurrency(b.stake)}</td>
                  <td className="px-4 py-3 tabular-nums text-bright">{formatOdds(b.total_odds)}</td>
                  <td className="px-4 py-3 tabular-nums">{formatCurrency(b.potential_payout)}</td>
                  <td className="px-4 py-3 tabular-nums">{b.actual_payout ? formatCurrency(b.actual_payout) : "-"}</td>
                  <td className="px-4 py-3 capitalize">{b.type || b.bet_type}</td>
                  <td className="px-4 py-3"><StatusBadge status={b.status} color={statusColor(b.status)} /></td>
                  <td className="px-4 py-3">{b.risk ? <StatusBadge status={b.risk} color={b.risk === "high" ? "danger" : "muted"} /> : "-"}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(b.created || b.date).toLocaleDateString()}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}