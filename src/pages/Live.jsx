import React from "react";
import { Radio } from "lucide-react";
import api from "@/lib/api";
import { useApi } from "@/lib/useApi";
import EventCard from "@/components/betting/EventCard";
import { SkeletonList } from "@/components/common/LoadingSkeleton";
import EmptyState from "@/components/common/EmptyState";
import SectionHeader from "@/components/common/SectionHeader";

export default function Live() {
  const { data: events, loading } = useApi(() => api.getLiveEvents());
  return (
    <div className="px-4 py-4 max-w-6xl mx-auto">
      <SectionHeader title="Live Betting" subtitle="Real-time odds — changes shown in green/red"
        action={<span className="flex items-center gap-1.5 text-xs text-danger font-semibold"><Radio className="w-4 h-4 pulse-live" /> LIVE</span>} />
      {loading ? <SkeletonList count={3} /> : (events || []).length === 0 ? (
        <div className="glass rounded-xl"><EmptyState icon={Radio} title="No live events right now" message="Check back soon for in-play action." /></div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {events.map(e => <EventCard key={e.id} event={e} />)}
        </div>
      )}
    </div>
  );
}