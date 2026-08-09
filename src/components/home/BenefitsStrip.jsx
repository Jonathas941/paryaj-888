import React from "react";
import { ShieldCheck, Zap, Headset, TrendingUp, Radio, Smartphone } from "lucide-react";

const BENEFITS = [
  { icon: ShieldCheck, title: "Licensed & Secure", text: "Regulated & encrypted" },
  { icon: Zap, title: "Fast Withdrawals", text: "Payouts in minutes" },
  { icon: Headset, title: "24/7 Support", text: "Always here to help" },
  { icon: TrendingUp, title: "Best Odds", text: "Top value every bet" },
  { icon: Radio, title: "Live Betting", text: "In-play on 1000+ events" },
  { icon: Smartphone, title: "Mobile Friendly", text: "Bet on any device" }
];

export default function BenefitsStrip() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
      {BENEFITS.map(({ icon: Icon, title, text }) => (
        <div key={title} className="group glass rounded-xl p-3.5 border border-border hover:border-gold/40 hover:bg-surface-2/60 transition">
          <div className="w-9 h-9 grid place-items-center rounded-lg bg-primary/15 border border-primary/30 mb-2.5 group-hover:glow-green transition">
            <Icon className="w-5 h-5 text-bright" />
          </div>
          <div className="font-bold text-[13px] leading-tight">{title}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">{text}</div>
        </div>
      ))}
    </div>
  );
}