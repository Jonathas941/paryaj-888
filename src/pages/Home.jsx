import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Radio, Flame, ChevronRight, Trophy, Gamepad2, Dices, Crown, MonitorPlay, Volleyball, CircleDollarSign, Lock, Headset } from "lucide-react";
import api from "@/lib/api";
import { useApi } from "@/lib/useApi";
import SectionHeader from "@/components/common/SectionHeader";
import EventCard from "@/components/betting/EventCard";
import PromotionCard from "@/components/common/PromotionCard";
import CategoryCard from "@/components/common/CategoryCard";
import HeroBanner from "@/components/common/HeroBanner";
import { SkeletonList } from "@/components/common/LoadingSkeleton";
import EmptyState from "@/components/common/EmptyState";

const SPORT_CATEGORIES = [
  { title: "Football", subtitle: "1,284 live markets", image: "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&q=80", icon: Trophy, to: "/sports" },
  { title: "Basketball", subtitle: "412 live markets", image: "https://images.unsplash.com/photo-1546519638-68e109496ffc?w=800&q=80", icon: Dices, to: "/sports" },
  { title: "Tennis", subtitle: "286 live markets", image: "https://images.unsplash.com/photo-1622163642998-1ea32b0bbc67?w=800&q=80", icon: Trophy, to: "/sports" },
  { title: "Boxing", subtitle: "22 live markets", image: "https://images.unsplash.com/photo-1570170609489-43197f518df0?w=800&q=80", icon: Flame, to: "/sports" },
  { title: "MMA", subtitle: "30 live markets", image: "https://images.unsplash.com/photo-1680022702604-292f21514497?w=800&q=80", icon: Flame, to: "/sports" }
];

const CASINO_CATEGORIES = [
  { title: "Live Casino", subtitle: "Real dealers, HD streams", image: "https://images.unsplash.com/photo-1518895949257-7621c3c7e3e1?w=800&q=80", icon: MonitorPlay, to: "/casino" },
  { title: "Slots", subtitle: "2,400+ premium slots", image: "https://images.unsplash.com/photo-1606189934846-a527add8a5b8?w=800&q=80", icon: Dices, to: "/casino" },
  { title: "Jackpots", subtitle: "Mega prize pools", image: "https://images.unsplash.com/photo-1635776062043-2273c5c75c4b?w=800&q=80", icon: Crown, to: "/casino" },
  { title: "Esports", subtitle: "340 live markets", image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80", icon: Gamepad2, to: "/casino" }
];

const TRUST = [
  { icon: Lock, label: "Licensed & Secure" },
  { icon: CircleDollarSign, label: "Instant Payouts" },
  { icon: Headset, label: "24/7 Support" },
  { icon: Trophy, label: "Best Odds Guaranteed" }
];

export default function Home() {
  const { data: events, loading } = useApi(() => api.getEvents());
  const { data: live } = useApi(() => api.getLiveEvents());
  const { data: promos } = useApi(() => api.getPromotions());
  const popular = (events || []).filter(e => !e.is_live).slice(0, 6);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero */}
      <section className="px-4 pt-4">
        <HeroBanner
          image="https://images.unsplash.com/photo-1522778526097-ce079d5409ec?w=1600&q=85"
          badge="Premium Sportsbook"
          title="Bet on the"
          highlight="World's Best Odds"
          subtitle="Live in-play action across football, basketball, tennis and more. Get a 100% welcome bonus on your first deposit."
          cta="Start Betting"
          to="/sports"
        />
      </section>

      {/* Trust strip */}
      <section className="px-4 pt-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {TRUST.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 glass rounded-xl px-3 py-2.5">
              <Icon className="w-4 h-4 text-bright shrink-0" />
              <span className="text-xs font-semibold truncate">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Sports categories */}
      <section className="px-4 pt-8">
        <SectionHeader title="Sports Markets" subtitle="Top leagues and events across every sport" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {SPORT_CATEGORIES.map(c => <CategoryCard key={c.title} {...c} />)}
        </div>
      </section>

      {/* Live Now */}
      <section className="px-4 pt-8">
        <SectionHeader title="Live Now" subtitle="In-play events with real-time odds"
          action={<Link to="/live" className="flex items-center gap-1 text-xs text-bright hover:underline">All live <ChevronRight className="w-3 h-3" /></Link>} />
        {loading ? <SkeletonList count={2} /> : (live || []).length === 0 ? (
          <div className="glass rounded-xl"><EmptyState icon={Radio} title="No live events" message="Check back soon for live action." /></div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {(live || []).map(e => <EventCard key={e.id} event={e} />)}
          </div>
        )}
      </section>

      {/* Casino hero */}
      <section className="px-4 pt-8">
        <HeroBanner
          image="https://images.unsplash.com/photo-1577223625816-7605b1f3c1d1?w=1600&q=85"
          badge="Premium Gaming"
          title="Experience the"
          highlight="Ultimate Casino"
          subtitle="Live dealer tables, 2,400+ slots and life-changing jackpots — all in one place."
          cta="Play Casino"
          to="/casino"
          secondaryLabel="View Promotions"
        />
      </section>

      {/* Casino categories */}
      <section className="px-4 pt-8">
        <SectionHeader title="Casino & Games" subtitle="Live dealers, slots, jackpots and esports" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {CASINO_CATEGORIES.map(c => <CategoryCard key={c.title} {...c} />)}
        </div>
      </section>

      {/* Popular Matches */}
      <section className="px-4 pt-8">
        <SectionHeader title="Popular Matches" subtitle="Trending upcoming events"
          action={<Link to="/sports" className="flex items-center gap-1 text-xs text-bright hover:underline">All sports <ChevronRight className="w-3 h-3" /></Link>} />
        {loading ? <SkeletonList count={4} /> : popular.length === 0 ? (
          <div className="glass rounded-xl"><EmptyState icon={Flame} title="No upcoming events" /></div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {popular.map(e => <EventCard key={e.id} event={e} />)}
          </div>
        )}
      </section>

      {/* Promotions */}
      <section className="px-4 pt-8 pb-8">
        <SectionHeader title="Promotions" subtitle="Boost your bankroll with exclusive offers"
          action={<Link to="/promotions" className="flex items-center gap-1 text-xs text-bright hover:underline">All promos <ChevronRight className="w-3 h-3" /></Link>} />
        <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 pb-2">
          {(promos || []).slice(0, 6).map(p => <PromotionCard key={p.id} promo={p} />)}
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