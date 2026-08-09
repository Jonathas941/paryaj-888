import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Gift, Sparkles, Crown } from "lucide-react";
import { Image } from "@/components/ui/image";

const HERO_IMG = "https://images.unsplash.com/photo-1522778526097-ce079d5409ec?w=1200&q=85";

export default function PremiumHero() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-surface">
      <div className="pointer-events-none absolute -top-24 -left-16 w-72 h-72 rounded-full bg-primary/25 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-24 right-10 w-72 h-72 rounded-full bg-gold/20 blur-[110px]" />
      <div className="grid lg:grid-cols-2">
        {/* Left: copy */}
        <div className="relative p-6 sm:p-10 lg:p-12 flex flex-col justify-center">
          <span className="inline-flex w-fit items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-gold bg-gold/10 border border-gold/30 rounded-full px-3 py-1 mb-5">
            <Sparkles className="w-3.5 h-3.5" /> Premium Sportsbook & Casino
          </span>
          <h1 className="font-display font-extrabold text-3xl sm:text-5xl lg:text-6xl leading-[1.02] tracking-tight">
            Bet Bigger. <br className="hidden sm:block" />
            <span className="text-gradient-gold">Win Smarter.</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-4 max-w-md">
            Premium betting on 1000+ sports events. Best odds. Fast payouts. Unmatched experience.
          </p>
          <div className="flex flex-wrap gap-3 mt-7">
            <Link to="/sports" className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-bright text-white font-bold text-sm px-6 py-3.5 rounded-xl glow-green hover:brightness-110 transition">
              Start Betting <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/promotions" className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3.5 rounded-xl border border-gold/40 text-gold hover:bg-gold/10 transition">
              <Gift className="w-4 h-4" /> View Promotions
            </Link>
          </div>
          <div className="mt-6 inline-flex w-fit items-center gap-2 text-xs sm:text-sm bg-surface-2/70 border border-gold/25 rounded-lg px-3.5 py-2">
            <span className="text-gold font-bold">New here?</span>
            <span className="text-muted-foreground">Get a 100% Welcome Bonus up to</span>
            <span className="text-gradient-gold font-bold">$888!</span>
          </div>
        </div>

        {/* Right: collage */}
        <div className="relative min-h-[260px] lg:min-h-full overflow-hidden">
          <Image src={HERO_IMG} alt="" className="absolute inset-0 w-full h-full" fittingType="fill" />
          <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/30 to-transparent lg:via-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />

          {/* Floating live odds card */}
          <div className="absolute right-4 top-4 sm:right-6 sm:top-6 w-44 sm:w-52 glass-strong rounded-2xl border border-gold/30 p-3 glow-gold">
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-white bg-danger px-1.5 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-white pulse-live" /> LIVE
              </span>
              <span className="text-[10px] text-muted-foreground">67'</span>
            </div>
            <div className="text-[11px] text-muted-foreground mb-2">Premier League</div>
            <div className="flex items-center justify-between text-xs font-semibold mb-1"><span>Man City</span><span className="text-bright">2</span></div>
            <div className="flex items-center justify-between text-xs font-semibold mb-2.5"><span>Liverpool</span><span className="text-bright">1</span></div>
            <div className="grid grid-cols-3 gap-1.5">
              {[["1", "1.85"], ["X", "3.40"], ["2", "4.20"]].map(([l, o]) => (
                <div key={l} className="text-center bg-primary/20 border border-primary/30 rounded-md py-1">
                  <div className="text-[9px] text-muted-foreground">{l}</div>
                  <div className="text-[11px] font-bold text-bright">{o}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Floating jackpot badge */}
          <div className="absolute left-4 bottom-4 sm:left-6 sm:bottom-6 flex items-center gap-2 glass-strong rounded-xl border border-gold/40 px-3 py-2 glow-gold">
            <Crown className="w-5 h-5 text-gold" />
            <div className="leading-none">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Jackpot</div>
              <div className="font-display font-extrabold text-gradient-gold text-sm">777 MEGA</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}