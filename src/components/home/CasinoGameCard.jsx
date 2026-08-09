import React from "react";
import { Link } from "react-router-dom";
import { Image } from "@/components/ui/image";
import { ChevronRight } from "lucide-react";

export default function CasinoGameCard({ to = "/casino", title, subtitle, image, icon: Icon, accent = "green" }) {
  const badgeAccent = accent === "gold" ? "border-gold/40 text-gold" : "border-primary/40 text-bright";
  return (
    <Link to={to} className="group relative block overflow-hidden rounded-2xl border border-border aspect-[4/5] sm:aspect-[5/6]">
      <Image src={image} alt={title} className="absolute inset-0 w-full h-full" fittingType="fill" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/10" />
      <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition" />
      {Icon && (
        <div className={`absolute top-3 left-3 w-10 h-10 grid place-items-center rounded-xl bg-surface/70 border ${badgeAccent} backdrop-blur`}>
          <Icon className="w-5 h-5" />
        </div>
      )}
      <div className="absolute inset-0 p-4 flex flex-col justify-end">
        <h3 className="font-display font-bold text-base sm:text-lg leading-tight">{title}</h3>
        {subtitle && <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-bright opacity-0 group-hover:opacity-100 transition">Play now <ChevronRight className="w-3 h-3" /></span>
      </div>
    </Link>
  );
}