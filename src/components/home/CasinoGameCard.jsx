import React from "react";
import MediaTile from "@/components/home/MediaTile";

export default function CasinoGameCard({ to = "/casino", title, subtitle, image, icon: Icon, accent = "green", jackpot }) {
  const overlay = jackpot ? (
    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center px-3">
      <div className="rounded-md border border-gold/50 bg-black/65 backdrop-blur px-3 py-1.5 text-center glow-gold">
        <div className="text-[8.5px] font-bold uppercase tracking-[0.18em] text-gold leading-none">Jackpot</div>
        <div className="font-display font-extrabold text-gradient-gold text-[13px] leading-none mt-1 tabular-nums">
          {jackpot}
        </div>
      </div>
    </div>
  ) : null;

  return (
    <MediaTile
      to={to}
      title={title}
      subtitle={subtitle}
      image={image}
      icon={Icon}
      accent={accent}
      overlay={overlay}
    />
  );
}
