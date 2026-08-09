import React, { useRef } from "react";
import { Link } from "react-router-dom";
import {
  Radio, ChevronRight, ChevronLeft, Trophy, Gamepad2, Dices, Crown,
  MonitorPlay, Coins, Zap, Swords, CircleDot, Target
} from "lucide-react";
import api from "@/lib/api";
import { useApi } from "@/lib/useApi";
import SectionHeader from "@/components/common/SectionHeader";
import LiveEventCompact from "@/components/betting/LiveEventCompact";
import MediaTile from "@/components/home/MediaTile";
import CasinoGameCard from "@/components/home/CasinoGameCard";
import BenefitsStrip from "@/components/home/BenefitsStrip";
import PremiumHero from "@/components/home/PremiumHero";
import PromoBanner from "@/components/home/PromoBanner";
import { SkeletonList } from "@/components/common/LoadingSkeleton";
import EmptyState from "@/components/common/EmptyState";

const SPORT_CATEGORIES = [
  { title: "Football", subtitle: "1,284 Live Markets", image: "https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=800&q=80", icon: Trophy, to: "/sports" },
  { title: "Basketball", subtitle: "892 Live Markets", image: "https://images.unsplash.com/photo-1579487685737-e435a87b2518?w=800&q=80", icon: CircleDot, to: "/sports" },
  { title: "Tennis", subtitle: "512 Live Markets", image: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&q=80", icon: Target, to: "/sports" },
  { title: "Boxing", subtitle: "312 Live Markets", image: "https://images.unsplash.com/photo-1546711076-85a7923432ab?w=800&q=80", icon: Swords, to: "/sports" },
  { title: "MMA", subtitle: "286 Live Markets", image: "https://images.unsplash.com/photo-1681203888755-bd61fe3558eb?w=800&q=80", icon: Swords, to: "/sports" },
  { title: "Esports", subtitle: "568 Live Markets", image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80", icon: Gamepad2, to: "/sports" }
];

const CASINO_GAMES = [
  { title: "Slots", subtitle: "500+ Games", image: "https://images.unsplash.com/photo-1518895312237-a9e23508077d?w=800&q=80", icon: Dices, accent: "gold" },
  { title: "Live Casino", subtitle: "Real Dealers", image: "https://images.unsplash.com/photo-1511193311914-0346f16efe90?w=800&q=80", icon: MonitorPlay, accent: "green" },
  { title: "Table Games", subtitle: "Blackjack, Roulette & More", image: "https://images.unsplash.com/photo-1626775238053-4315516eedc9?w=800&q=80", icon: Coins, accent: "gold" },
  { title: "Jackpots", subtitle: "Biggest Wins", image: "https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=800&q=80", icon: Crown, accent: "gold", jackpot: "$1,234,567.89" },
  { title: "Crash Games", subtitle: "Instant Wins", image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80", icon: Zap, accent: "green" }
];

const PROMOS = [
  { id: "p1", kicker: "100%", headline: "Welcome Bonus", sub: "Up to $888", cta: "Claim Now", banner: "https://images.unsplash.com/photo-1706675780107-7c43cc487928?w=1200&q=80" },
  { id: "p2", kicker: "Weekly Reload", headline: "50% Bonus", sub: "Up to $500", cta: "Get Bonus", banner: "https://images.unsplash.com/photo-1608245449230-4ac19066d2d0?w=1200&q=80" },
  { id: "p3", kicker: "Refer & Earn", headline: "Up to $200", sub: "Per Friend", cta: "Invite Now", banner: "https://images.unsplash.com/photo-1548003693-b55d51032288?w=1200&q=80" },
  { id: "p4", kicker: "Cashback", headline: "Up to 10%", sub: "On Losses", cta: "Learn More", banner: "https://images.unsplash.com/photo-1517232115160-ff93364542dd?w=1200&q=80" }
];

const viewAll = "flex items-center gap-1 text-[11px] font-semibold text-bright hover:underline shrink-0";

export default function Home() {
  const { data: live, loading } = useApi(() => api.getLiveEvents());
  const promoRef = useRef(null);

  const scrollPromos = dir => {
    const el = promoRef.current;
    if (el) el.scrollBy({ left: dir * 360, behavior: "smooth" });
  };

  const liveList = (live || []).slice(0, 5);

  return (
    <div className="max-w-[1600px] mx-auto">
      {/* Hero */}
      <section className="px-4 pt-4">
        <PremiumHero />
      </section>

      {/* Trust badges */}
      <section className="px-4 pt-4">
        <BenefitsStrip />
      </section>

      {/* Top Sports */}
      <section className="px-4 pt-6">
        <SectionHeader
          title="Top Sports"
          icon={Trophy}
          action={<Link to="/sports" className={viewAll}>View All Sports <ChevronRight className="w-3.5 h-3.5" /></Link>}
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {SPORT_CATEGORIES.map(c => <MediaTile key={c.title} {...c} />)}
        </div>
      </section>

      {/* Live Betting Now */}
      <section className="px-4 pt-6">
        <SectionHeader
          title="Live Betting Now"
          icon={Radio}
          action={<Link to="/live" className={viewAll}>View All Live <ChevronRight className="w-3.5 h-3.5" /></Link>}
        />
        {loading ? (
          <SkeletonList count={5} />
        ) : liveList.length === 0 ? (
          <div className="glass rounded-xl">
            <EmptyState icon={Radio} title="No live events" message="Check back soon for live action." />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {liveList.map(e => <LiveEventCompact key={e.id} event={e} />)}
          </div>
        )}
      </section>

      {/* Promotions carousel — arrows sit outside the rail */}
      <section className="px-4 pt-6">
        <div className="relative">
          <button
            onClick={() => scrollPromos(-1)}
            aria-label="Previous promotions"
            className="hidden lg:grid absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 z-10 w-8 h-8 place-items-center rounded-full glass border border-border hover:border-gold/50 hover:text-gold transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scrollPromos(1)}
            aria-label="Next promotions"
            className="hidden lg:grid absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 z-10 w-8 h-8 place-items-center rounded-full glass border border-border hover:border-gold/50 hover:text-gold transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <div
            ref={promoRef}
            className="flex gap-3 overflow-x-auto no-scrollbar snap-x lg:px-11"
          >
            {PROMOS.map(p => <PromoBanner key={p.id} promo={p} />)}
          </div>
        </div>
      </section>

      {/* Top Casino Games */}
      <section className="px-4 pt-6 pb-10">
        <SectionHeader
          title="Top Casino Games"
          icon={Crown}
          action={<Link to="/casino" className={viewAll}>View All Casino <ChevronRight className="w-3.5 h-3.5" /></Link>}
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {CASINO_GAMES.map(c => <CasinoGameCard key={c.title} {...c} />)}
        </div>
      </section>

      {api.isSampleMode() && (
        <p className="text-center text-[10px] text-muted-foreground uppercase tracking-wide pb-6">
          Sample content — connect backend for real data
        </p>
      )}
    </div>
  );
}
