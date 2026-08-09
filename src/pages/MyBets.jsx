import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Ticket } from "lucide-react";
import api from "@/lib/api";
import { useApi } from "@/lib/useApi";
import StatusBadge from "@/components/common/StatusBadge";
import EmptyState from "@/components/common/EmptyState";
import { SkeletonList } from "@/components/common/LoadingSkeleton";
import { formatCurrency, formatOdds, statusColor } from "@/lib/format";

const TABS = ["open", "won", "lost", "cashed_out", "void", "all"];

export default function MyBets() {
  const [tab, setTab] = useState("open");
  const { data: bets, loading } = useApi(() => api.getUserBets({ status: tab }), [tab]);

  return (
    <div className="px-4 py-4 max-w-3xl mx-auto">
      <h1 className="text-lg font-bold mb-3">My Bets</h1>
      <div className="flex gap-1 overflow-x-auto no-scrollbar mb-4 -mx-4 px-4">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap capitalize transition ${tab === t ? "bg-primary text-black" : "bg-surface-2/50 text-muted-foreground border border-border"}`}>{t.replace("_", " ")}</button>
        ))}
      </div>

      {loading ? <SkeletonList count={2} /> : (bets || []).length === 0 ? (
        <div className="glass rounded-xl"><EmptyState icon={Ticket} title="No bets here" message="Your bets in this category will appear here." action={<Link to="/sports" className="text-bright text-sm font-semibold hover:underline">Browse sports →</Link>} /></div>
      ) : (
        <div className="space-y-3">
          {(bets || []).map(b => (
            <div key={b.id} className="glass rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-xs text-muted-foreground">#{b.id}</span>
                  <span className="text-xs text-muted-foreground ml-2">{new Date(b.date).toLocaleDateString()}</span>
                </div>
                <StatusBadge status={b.status} color={statusColor(b.status)} />
              </div>
              <div className="space-y-1.5 mb-3">
                {b.selections.map((s, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="min-w-0">
                      <div className="text-muted-foreground text-xs truncate">{s.event}</div>
                      <div className="font-medium">{s.pick} <span className="text-xs text-muted-foreground">· {s.market}</span></div>
                    </div>
                    <span className="text-bright font-semibold tabular-nums shrink-0">{formatOdds(s.odds)}</span>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border text-center">
                <div><div className="text-[10px] text-muted-foreground uppercase">Stake</div><div className="font-semibold text-sm">{formatCurrency(b.stake)}</div></div>
                <div><div className="text-[10px] text-muted-foreground uppercase">Total Odds</div><div className="font-semibold text-sm text-bright">{formatOdds(b.total_odds)}</div></div>
                <div><div className="text-[10px] text-muted-foreground uppercase">{b.status === "won" ? "Payout" : "Potential"}</div><div className="font-semibold text-sm text-gradient-gold">{formatCurrency(b.actual_payout || b.potential_payout)}</div></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}