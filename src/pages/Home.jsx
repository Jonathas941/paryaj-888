import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { Radio, Flame, ChevronRight, ChevronLeft, Trophy, Gamepad2, Dices, Crown, MonitorPlay, Coins, Zap } from "lucide-react";
import api from "@/lib/api";
import { useApi } from "@/lib/useApi";
import SectionHeader from "@/components/common/SectionHeader";
import EventCard from "@/components/betting/EventCard";
import CategoryCard from "@/components/common/CategoryCard";
import CasinoGameCard from "@/components/home/CasinoGameCard";
import BenefitsStrip from "@/components/home/BenefitsStrip";
import PremiumHero from "@/components/home/PremiumHero";
import PromoBanner from "@/components/home/PromoBanner";
import { SkeletonList } from "@/components/common/LoadingSkeleton";
import EmptyState from "@/components/common/EmptyState";

const SPORT_CATEGORIES = [
  { title: "Football", subtitle: "1,284 live markets", count: 1284, image: "https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=800&q=80", icon: Trophy, to: "/sports" },
  { title: "Basketball", subtitle: "412 live markets", count: 412, image: "https://images.unsplash.com/photo-1579487685737-e435a87b2518?w=800&q=80", icon: Dices, to: "/sports" },
  { title: "Tennis", subtitle: "286 live markets", count: 286, image: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&q=80", icon: Trophy, to: "/sports" },
  { title: "Boxing", subtitle: "22 live markets", count: 22, image: "https://images.unsplash.com/photo-1546711076-85a7923432ab?w=800&q=80", icon: Flame, to: "/sports" },
  { title: "MMA", subtitle: "30 live markets", count: 30, image: "https://images.unsplash.com/photo-1681203888755-bd61fe3558eb?w=800&q=80", icon: Flame, to: "/sports" },
  { title: "Esports", subtitle: "340 live markets", count: 340, image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80", icon: Gamepad2, to: "/sports" }
];

const CASINO_GAMES = [
  { title: "Slots", subtitle: "2,400+ premium slots", image: "https://images.unsplash.com/photo-1518895312237-a9e23508077d?w=800&q=80", icon: Dices, accent: "gold" },
  { title: "Live Casino", subtitle: "Real dealers, HD streams", image: "https://images.unsplash.com/photo-1511193311914-0346f16efe90?w=800&q=80", icon: MonitorPlay, accent: "green" },
  { title: "Table Games", subtitle: "Roulette, blackjack & more", image: "https://images.unsplash.com/photo-1626775238053-4315516eedc9?w=800&q=80", icon: Coins, accent: "gold" },
  { title: "Jackpots", subtitle: "Mega prize pools", image: "https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=800&q=80", icon: Crown, accent: "gold" },
  { title: "Crash Games", subtitle: "Fast-paced multipliers", image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80", icon: Zap, accent: "green" }
];

const PROMOS = [
  { id: "p1", title: "100% Welcome Bonus", description: "Boost your first deposit instantly.", bonus: "up to $888", category: "Welcome", banner: "https://images.unsplash.com/photo-1706675780107-7c43cc487928?w=1200&q=80", cta: "Claim Bonus" },
  { id: "p2", title: "Weekly Reload 50%", description: "Reload every week and play more.", bonus: "up to $500", category: "Reload", banner: "https://images.unsplash.com/photo-1608245449230-4ac19066d2d0?w=1200&q=80", cta: "Claim Bonus" },
  { id: "p3", title: "Refer & Earn", description: "Invite friends, earn real cash.", bonus: "up to $200 / friend", category: "Refer", banner: "https://images.unsplash.com/photo-1548003693-b55d51032288?w=1200&q=80", cta: "Invite Now" },
  { id: "p4", title: "Cashback", description: "Get back on net losses weekly.", bonus: "up to 10%", category: "Cashback", banner: "https://images.unsplash.com/photo-1517232115160-ff93364542dd?w=1200&q=80", cta: "Activate" }
];

export default function Home() {
  const { data: events, loading } = useApi(() => api.getEvents());
  const { data: live } = useApi(() => api.getLiveEvents());
  const promoRef = useRef(null);
  const scrollPromos = (dir) => {
    const el = promoRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 400, behavior: "smooth" });
  };
  const liveList = (live || []).slice(0, 6);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero */}
      <section className="px-4 pt-4">
        <PremiumHero />
      </section>

      {/* Benefits */}
      <section className="px-4 pt-5">
        <BenefitsStrip />
      </section>

      {/* Top Sports */}
      <section className="px-4 pt-10">
        <SectionHeader title="Top Sports" subtitle="Bet on the world's biggest leagues and events" icon={Trophy}
          action={<Link to="/sports" className="flex items-center gap-1 text-xs font-semibold text-bright hover:underline">View All Sports <ChevronRight className="w-3.5 h-3.5" /></Link>} />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {SPORT_CATEGORIES.map(c => <CategoryCard key={c.title} {...c} />)}
        </div>
      </section>

      {/* Live Betting Now */}
      <section className="px-4 pt-10">
        <SectionHeader title="Live Betting Now" subtitle="Real-time odds on in-play events" icon={Radio}
          action={<Link to="/live" className="flex items-center gap-1 text-xs font-semibold text-bright hover:underline">View All Live <ChevronRight className="w-3.5 h-3.5" /></Link>} />
        {loading ? <SkeletonList count={3} /> : liveList.length === 0 ? (
          <div className="glass rounded-xl"><EmptyState icon={Radio} title="No live events" message="Check back soon for live action." /></div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {liveList.map(e => <EventCard key={e.id} event={e} />)}
          </div>
        )}
      </section>

      {/* Promotions */}
      <section className="px-4 pt-10">
        <SectionHeader title="Promotions" subtitle="Boost your bankroll with exclusive offers" icon={Flame}
          action={
            <div className="hidden sm:flex items-center gap-2">
              <button onClick={() => scrollPromos(-1)} className="w-8 h-8 grid place-items-center rounded-full glass border border-border hover:border-gold/40 hover:text-gold transition" aria-label="Scroll left"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={() => scrollPromos(1)} className="w-8 h-8 grid place-items-center rounded-full glass border border-border hover:border-gold/40 hover:text-gold transition" aria-label="Scroll right"><ChevronRight className="w-4 h-4" /></button>
            </div>
          } />
        <div ref={promoRef} className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 pb-2 snap-x">
          {PROMOS.map(p => <PromoBanner key={p.id} promo={p} />)}
        </div>
      </section>

      {/* Top Casino Games */}
      <section className="px-4 pt-10 pb-10">
        <SectionHeader title="Top Casino Games" subtitle="Live dealers, slots, jackpots and more" icon={Gamepad2}
          action={<Link to="/casino" className="flex items-center gap-1 text-xs font-semibold text-bright hover:underline">View All Casino <ChevronRight className="w-3.5 h-3.5" /></Link>} />
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