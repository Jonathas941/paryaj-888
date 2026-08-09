import React, { useState } from "react";
import api from "@/lib/api";
import { useApi } from "@/lib/useApi";
import PromotionCard from "@/components/common/PromotionCard";
import { SkeletonList } from "@/components/common/LoadingSkeleton";
import EmptyState from "@/components/common/EmptyState";
import { Gift } from "lucide-react";

const CATS = ["all", "welcome", "sports", "casino", "accumulator", "vip", "reload"];

export default function Promotions() {
  const [cat, setCat] = useState("all");
  const { data: promos, loading } = useApi(() => api.getPromotions());
  const filtered = (promos || []).filter(p => cat === "all" || p.category === cat);

  return (
    <div className="px-4 py-4 max-w-5xl mx-auto">
      <h1 className="text-lg font-bold mb-1">Promotions</h1>
      <p className="text-sm text-muted-foreground mb-4">Offers and bonuses available on your account.</p>
      <div className="flex gap-1 overflow-x-auto no-scrollbar mb-5 -mx-4 px-4">
        {CATS.map(c => (
          <button key={c} onClick={() => setCat(c)} className={`px-3 py-2 rounded-lg text-xs font-semibold capitalize whitespace-nowrap ${cat === c ? "bg-primary text-black" : "bg-surface-2/50 text-muted-foreground border border-border"}`}>{c}</button>
        ))}
      </div>
      {loading ? <SkeletonList count={3} /> : filtered.length === 0 ? (
        <div className="glass rounded-xl"><EmptyState icon={Gift} title="No promotions available" /></div>
      ) : (
        <div className="flex flex-wrap gap-3">{filtered.map(p => <PromotionCard key={p.id} promo={p} />)}</div>
      )}
    </div>
  );
}