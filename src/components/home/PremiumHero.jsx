import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Gift } from "lucide-react";
import { Image } from "@/components/ui/image";

/**
 * Swap HERO_IMG for the final hero artwork (the composite of the player,
 * phone mockup and jackpot reels). The layout below is built to let a single
 * wide image bleed from the centre to the right edge behind the copy.
 */
const HERO_IMG = "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1600&q=85";

export default function PremiumHero() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-gold/25 bg-surface min-h-[290px] lg:min-h-[300px]">
      {/* Artwork: bleeds in from the right, faded out under the copy */}
      <div className="absolute inset-y-0 right-0 w-full lg:w-[68%]">
        <Image src={HERO_IMG} alt="" fittingType="fill" className="absolute inset-0 w-full h-full" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-background/20" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 lg:via-background/45 to-transparent" />

      <div className="pointer-events-none absolute -top-24 -left-16 w-72 h-72 rounded-full bg-primary/25 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-24 right-24 w-72 h-72 rounded-full bg-gold/15 blur-[110px]" />

      {/* Copy */}
      <div className="relative p-6 sm:p-9 lg:p-11 max-w-xl flex flex-col justify-center min-h-[290px] lg:min-h-[300px]">
        <h1 className="font-display font-extrabold text-[34px] sm:text-5xl lg:text-[54px] leading-[0.98] tracking-tight">
          Bet Bigger.
          <br />
          <span className="text-gradient-gold">Win Smarter.</span>
        </h1>

        <p className="text-[13px] sm:text-[15px] text-muted-foreground mt-4 leading-relaxed">
          Premium betting on 1000+ sports events.
          <br className="hidden sm:block" />
          Best odds. Fast payouts. Unmatched experience.
        </p>

        <div className="flex flex-wrap gap-3 mt-6">
          <Link
            to="/sports"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-soft-gold to-gold text-black font-bold text-sm px-6 py-3 rounded-lg glow-gold hover:brightness-110 transition"
          >
            Start Betting <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/promotions"
            className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-lg border border-border bg-surface/60 hover:border-gold/40 hover:text-gold transition"
          >
            <Gift className="w-4 h-4" /> View Promotions
          </Link>
        </div>

        <div className="flex items-center gap-2 mt-5 text-[12px]">
          <Gift className="w-3.5 h-3.5 text-gold shrink-0" />
          <span className="text-muted-foreground">New here? Get a</span>
          <span className="font-bold text-gold">100% Welcome Bonus</span>
          <span className="text-muted-foreground">up to</span>
          <span className="font-bold text-gradient-gold">$888!</span>
        </div>
      </div>
    </div>
  );
}
