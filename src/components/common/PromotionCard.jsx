import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export default function PromotionCard({ promo }) {
  const [claimed, setClaimed] = useState(false);
  const navigate = useNavigate();
  return (
    <div className="relative rounded-2xl overflow-hidden border border-border group shrink-0 w-[280px] sm:w-[340px]">
      <img src={promo.banner} alt={promo.title} className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-50 transition" loading="lazy" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
      <div className="relative p-5 flex flex-col h-44 justify-between">
        <div>
          <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-gold bg-gold/15 px-2 py-0.5 rounded-full mb-2">{promo.category}</span>
          <h3 className="font-bold text-lg leading-tight">{promo.title}</h3>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{promo.description}</p>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-bright font-bold">{promo.bonus}</div>
          <button onClick={() => setClaimed(true)}
            className={`text-sm font-bold px-4 py-2 rounded-lg transition ${claimed ? "bg-surface-2 border border-border text-muted-foreground" : "bg-gradient-to-r from-primary to-bright text-black glow-green hover:brightness-110"}`}>
            {claimed ? "Claimed ✓" : "Claim"}
          </button>
        </div>
      </div>
    </div>
  );
}