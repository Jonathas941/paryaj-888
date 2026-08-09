import React from "react";
import { ShieldCheck, Zap, Headset, TrendingUp, Radio, Smartphone } from "lucide-react";

const BENEFITS = [
  { icon: ShieldCheck, title: "Licensed & Secure", text: "Trusted & Certified" },
  { icon: Zap, title: "Fast Withdrawals", text: "Quick & Hassle-Free" },
  { icon: Headset, title: "24/7 Support", text: "Always Here for You" },
  { icon: TrendingUp, title: "Best Odds", text: "We Beat the Rest" },
  { icon: Radio, title: "Live Betting", text: "Bet in Real-Time" },
  { icon: Smartphone, title: "Mobile Friendly", text: "Play Anywhere" }
];

export default function BenefitsStrip() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {BENEFITS.map(({ icon: Icon, title, text }) => (
        <div
          key={title}
          className="group flex items-center gap-3 rounded-xl border border-border bg-surface/70 px-3.5 py-3 hover:border-gold/40 transition"
        >
          <div className="w-9 h-9 shrink-0 grid place-items-center rounded-lg bg-gold/10 border border-gold/25 group-hover:border-gold/50 transition">
            <Icon className="w-[18px] h-[18px] text-gold" />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-[12.5px] leading-tight truncate">{title}</div>
            <div className="text-[10.5px] text-muted-foreground leading-tight mt-0.5 truncate">{text}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
