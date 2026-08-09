import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Star, ChevronDown } from "lucide-react";
import api from "@/lib/api";
import { useApi } from "@/lib/useApi";
import EventCard from "@/components/betting/EventCard";
import SportIcon from "@/components/common/SportIcon";
import { SkeletonList } from "@/components/common/LoadingSkeleton";
import EmptyState from "@/components/common/EmptyState";
import { leagues } from "@/lib/sampleData";

export default function Sports() {
  const [sport, setSport] = useState("soccer");
  const [q, setQ] = useState("");
  const { data: events, loading } = useApi(() => api.getEvents({ sport }), [sport]);

  const grouped = (events || []).reduce((acc, e) => {
    (acc[e.league] = acc[e.league] || []).push(e);
    return acc;
  }, {});

  return (
    <div className="px-4 py-4 max-w-6xl mx-auto">
      {/* Filter bar */}
      <div className="flex items-center gap-2 bg-surface-2/60 border border-border rounded-lg px-3 py-2.5 mb-4">
        <Search className="w-4 h-4 text-muted-foreground" />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search leagues, teams…" className="bg-transparent outline-none text-sm w-full placeholder:text-muted-foreground" />
      </div>

      <div className="grid lg:grid-cols-[220px_1fr] gap-4">
        {/* Sidebar filters */}
        <aside className="space-y-1 lg:sticky lg:top-20 self-start">
          <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground px-2 mb-1">Sports</div>
          {["soccer", "basketball", "tennis", "baseball", "american_football", "esports"].map(s => (
            <button key={s} onClick={() => setSport(s)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition ${sport === s ? "bg-primary/15 text-bright border border-primary/30" : "text-muted-foreground hover:bg-surface-2 border border-transparent"}`}>
              <SportIcon sport={s} className="w-4 h-4" /> <span className="capitalize">{s.replace("_", " ")}</span>
            </button>
          ))}
          <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground px-2 mt-4 mb-1">Countries</div>
          {["England", "Spain", "Italy", "USA", "International"].map(c => (
            <div key={c} className="flex items-center justify-between px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground cursor-pointer">
              <span>{c}</span><Star className="w-3 h-3" />
            </div>
          ))}
        </aside>

        {/* Events */}
        <div>
          {loading ? <SkeletonList count={4} /> : Object.keys(grouped).length === 0 ? (
            <div className="glass rounded-xl"><EmptyState icon={Search} title="No events found" message="Try a different sport or search." /></div>
          ) : (
            Object.entries(grouped).map(([league, evs]) => (
              <div key={league} className="mb-5">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-gold" />
                  <h3 className="font-bold text-sm">{league}</h3>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {evs.filter(e => !q || `${e.home} ${e.away} ${e.league}`.toLowerCase().includes(q.toLowerCase())).map(e => <EventCard key={e.id} event={e} />)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}