import React, { useState } from "react";
import { Image } from "@/components/ui/image";
import { ArrowRight } from "lucide-react";

export default function PromoBanner({ promo }) {
  const [claimed, setClaimed] = useState(false);
  return (
    <div className="relative rounded-2xl overflow-hidden border border-border group shrink-0 w-[300px] sm:w-[380px] h-44 bg-surface snap-start">
      <Image src={promo.banner} alt={promo.title} fittingType="fill" className="absolute inset-0 w-full h-full opacity-50 group-hover:opacity-60 group-hover:scale-105 transition duration-500" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      <div className="pointer-events-none absolute -right-8 -top-8 w-32 h-32 rounded-full bg-gold/20 blur-2xl" />
      <div className="relative p-5 flex flex-col h-full justify-between">
        <div>
          <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-gold bg-gold/15 border border-gold/30 px-2 py-0.5 rounded-full mb-2">{promo.category}</span>
          <h3 className="font-display font-extrabold text-lg sm:text-xl leading-tight">{promo.title}</h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-1">{promo.description}</p>
        </div>
        <div className="flex items-center justify-between">
          <div className="font-display font-extrabold text-gradient-gold text-base sm:text-lg">{promo.bonus}</div>
          <button onClick={() => setClaimed(true)} className={`inline-flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-lg transition ${claimed ? "bg-surface-2 border border-border text-muted-foreground" : "bg-gradient-to-r from-primary to-bright text-white glow-green hover:brightness-110"}`}>
            {claimed ? "Claimed ✓" : <>{promo.cta || "Claim"} <ArrowRight className="w-3.5 h-3.5" /></>}
          </button>
        </div>
      </div>
    </div>
  );
}