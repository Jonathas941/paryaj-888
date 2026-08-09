import React from "react";
import { Link } from "react-router-dom";
import { Image } from "@/components/ui/image";
import { ArrowRight } from "lucide-react";

export default function HeroBanner({ image, badge, title, highlight, subtitle, cta = "Bet Now", to = "/sports", secondaryTo = "/promotions", secondaryLabel = "View Promotions" }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border min-h-[300px] sm:min-h-[400px] flex">
      <Image src={image} alt="" className="absolute inset-0 w-full h-full" fittingType="fill" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/20" />
      <div className="relative p-6 sm:p-10 flex flex-col justify-center max-w-lg">
        {badge && (
          <span className="inline-flex w-fit items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-gold bg-gold/10 border border-gold/30 rounded-full px-3 py-1 mb-4">{badge}</span>
        )}
        <h2 className="font-display font-extrabold text-2xl sm:text-4xl lg:text-5xl leading-[1.05]">{title} <span className="text-gradient-gold">{highlight}</span></h2>
        {subtitle && <p className="text-sm sm:text-base text-muted-foreground mt-3 max-w-md">{subtitle}</p>}
        <div className="flex flex-wrap gap-3 mt-6">
          <Link to={to} className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-bright text-white font-bold text-sm px-5 py-3 rounded-lg glow-green hover:brightness-110 transition">{cta} <ArrowRight className="w-4 h-4" /></Link>
          <Link to={secondaryTo} className="inline-flex items-center text-sm font-semibold px-5 py-3 rounded-lg border border-border hover:bg-surface-2 transition">{secondaryLabel}</Link>
        </div>
      </div>
    </div>
  );
}