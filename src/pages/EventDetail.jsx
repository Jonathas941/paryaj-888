import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Star, BarChart3 } from "lucide-react";
import api from "@/lib/api";
import { useApi } from "@/lib/useApi";
import OddsButton from "@/components/betting/OddsButton";
import { useBetSlip } from "@/lib/BetSlipContext";
import StatusBadge from "@/components/common/StatusBadge";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { formatEventTime } from "@/lib/format";

export default function EventDetail() {
  const { id } = useParams();
  const { data: event, loading } = useApi(() => api.getEvent(id), [id]);
  const { data: markets } = useApi(() => api.getEventMarkets(id), [id]);
  const { selections, addSelection } = useBetSlip();
  const [tab, setTab] = useState("MAIN");

  if (loading) return <div className="p-4 max-w-4xl mx-auto space-y-3"><LoadingSkeleton className="h-32 w-full" /><LoadingSkeleton className="h-48 w-full" /></div>;
  if (!event) return null;

  const ev = event;
  const sel = (s) => selections.find(x => x.eventId === ev.id && x.selectionId === s.id);
  const add = (mid, mname, s) => addSelection({
    eventId: ev.id, selectionId: s.id, marketId: s.marketId,
    event: `${ev.home} vs ${ev.away}`, market: mname, pick: s.label, odds: s.odds
  });

  return (
    <div className="px-4 py-4 max-w-4xl mx-auto">
      <Link to="/sports" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-3"><ArrowLeft className="w-3 h-3" /> Back to sports</Link>

      {/* Match header */}
      <div className="glass rounded-xl p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-muted-foreground">{ev.league}</span>
          {ev.is_live ? <StatusBadge status="LIVE" color="danger" /> : <span className="text-xs text-muted-foreground">{formatEventTime(ev.start_time)}</span>}
        </div>
        <div className="grid grid-cols-3 items-center text-center">
          <div><div className="font-bold text-base">{ev.home}</div>{ev.score && <div className="text-3xl font-bold text-bright mt-1">{ev.score.home}</div>}</div>
          <div className="text-muted-foreground text-sm">{ev.is_live ? ev.minute : "vs"}</div>
          <div><div className="font-bold text-base">{ev.away}</div>{ev.score && <div className="text-3xl font-bold text-bright mt-1">{ev.score.away}</div>}</div>
        </div>
      </div>

      {/* Stats placeholder */}
      {ev.is_live && markets?.stats && (
        <div className="glass rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-3 text-sm font-semibold"><BarChart3 className="w-4 h-4 text-muted-foreground" /> Statistics</div>
          {Object.entries(markets.stats).map(([k, v]) => (
            <div key={k} className="mb-2">
              <div className="flex justify-between text-xs text-muted-foreground capitalize mb-1"><span>{k}</span><span>{v.home} - {v.away}</span></div>
              <div className="h-1.5 bg-surface-2 rounded-full flex"><div className="bg-bright rounded-l-full" style={{ width: `${v.home}%` }} /><div className="bg-gold rounded-r-full" style={{ width: `${v.away}%` }} /></div>
            </div>
          ))}
        </div>
      )}

      {/* Market tabs */}
      <div className="flex gap-1 overflow-x-auto no-scrollbar mb-4 -mx-4 px-4">
        {(markets?.tabs || ["ALL", "MAIN"]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${tab === t ? "bg-primary text-black" : "bg-surface-2/50 text-muted-foreground border border-border"}`}>{t}</button>
        ))}
      </div>

      {/* Markets */}
      <div className="space-y-4">
        {Object.entries(ev.markets || {}).map(([mid, opts]) => {
          const mname = { "1x2": "1X2 — Full Time", "over_under": "Over / Under", "btts": "Both Teams To Score" }[mid] || mid;
          return (
            <div key={mid} className="glass rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">{mname}</h3>
                <Star className="w-4 h-4 text-muted-foreground hover:text-gold cursor-pointer" />
              </div>
              <div className={`grid ${opts.length >= 3 ? "grid-cols-3" : "grid-cols-2"} gap-2`}>
                {opts.map(o => (
                  <OddsButton key={o.id} odds={o.odds} label={o.label} active={!!sel(o)} onClick={() => add(mid, mname, o)} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}