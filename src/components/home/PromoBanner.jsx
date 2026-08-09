import React from "react";
import { Link } from "react-router-dom";
import { Image } from "@/components/ui/image";

/**
 * Landscape promo card: stacked kicker / headline / sub on the left,
 * artwork bleeding in from the right behind a horizontal scrim.
 */
export default function PromoBanner({ promo }) {
  const accent = promo.accent === "green" ? "text-bright" : "text-gold";

  return (
    <div className="relative shrink-0 snap-start w-[300px] sm:w-[340px] h-[104px] rounded-xl overflow-hidden border border-border bg-surface group">
      {promo.banner && (
        <Image
          src={promo.banner}
          alt=""
          fittingType="fill"
          className="absolute inset-0 w-full h-full opacity-60 group-hover:opacity-75 group-hover:scale-105 transition duration-500"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-transparent" />
      <div className="pointer-events-none absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gold/15 blur-2xl" />

      <div className="relative h-full px-3.5 py-3 flex flex-col justify-between">
        <div className="min-w-0">
          {promo.kicker && (
            <div className={`text-[10px] font-bold uppercase tracking-wide leading-none ${accent}`}>
              {promo.kicker}
            </div>
          )}
          <div className="font-display font-extrabold text-[17px] leading-[1.1] mt-1 truncate">
            {promo.headline}
          </div>
          {promo.sub && (
            <div className={`text-[11px] font-bold uppercase leading-none mt-1 ${accent}`}>{promo.sub}</div>
          )}
        </div>

        <Link
          to={promo.to || "/promotions"}
          className="w-fit text-[10.5px] font-bold px-2.5 py-1 rounded-md border border-bright/40 bg-primary/20 text-bright hover:bg-primary/35 hover:border-bright/70 transition"
        >
          {promo.cta}
        </Link>
      </div>
    </div>
  );
}
