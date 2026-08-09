import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Radio, Flame, ChevronRight, Star } from "lucide-react";
import api from "@/lib/api";
import { useApi } from "@/lib/useApi";
import SectionHeader from "@/components/common/SectionHeader";
import EventCard from "@/components/betting/EventCard";
import PromotionCard from "@/components/common/PromotionCard";
import { SportStrip } from "@/components/common/SportStrip";
import { SkeletonList } from "@/components/common/LoadingSkeleton";
import EmptyState from "@/components/common/EmptyState";
import StatusBadge from "@/components/common/StatusBadge";

export default function Home() {
  const { data: events, loading } = useApi(() => api.getEvents());
  const { data: live } = useApi(() => api.getLiveEvents());
  const { data: promos } = useApi(() => api.getPromotions());
  const { data: sports } = useApi(() => api.getSports());
  const [sport, setSport] = useState(null);

  const popular = (events || []).filter(e => !e.is_live).slice(0, 6);

  return (
    <div className="px-4 py-4 max-w-6xl mx-auto">
      {/* Hero */}
      <section className="mb-6">
        <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
          {(promos || []).map(p => <PromotionCard key={p.id} promo={p} />)}
        </div>
      </section>

      {/* Popular Sports */}
      <section className="mb-6">
        <SectionHeader title="Popular Sports" subtitle="Jump to your favorite markets" />
        <SportStrip sports={sports || []} active={sport} onSelect={setSport} />
      </section>

      {/* Live Now */}
      <section className="mb-6">
        <SectionHeader title="Live Now" subtitle="In-play events with real-time odds"
          action={<Link to="/live" className="flex items-center gap-1 text-xs text-bright hover:underline">All live <ChevronRight className="w-3 h-3" /></Link>} />
        {loading ? <SkeletonList count={2} /> : (live || []).length === 0 ? (
          <div className="glass rounded-xl"><EmptyState icon={Radio} title="No live events" message="Check back soon for live action." /></div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {(live || []).map(e => <EventCard key={e.id} event={e} />)}
          </div>
        )}
      </section>

      {/* Popular Matches */}
      <section className="mb-6">
        <SectionHeader title="Popular Matches" subtitle="Trending upcoming events"
          action={<Link to="/sports" className="flex items-center gap-1 text-xs text-bright hover:underline">All sports <ChevronRight className="w-3 h-3" /></Link>} />
        {loading ? <SkeletonList count={4} /> : popular.length === 0 ? (
          <div className="glass rounded-xl"><EmptyState icon={Flame} title="No upcoming events" /></div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {popular.map(e => <EventCard key={e.id} event={e} />)}
          </div>
        )}
      </section>

      {api.isSampleMode() && (
        <p className="text-center text-[10px] text-muted-foreground uppercase tracking-wide pb-4">
          Sample content — connect backend for real data
        </p>
      )}
    </div>
  );
}