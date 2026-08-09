import React from "react";
import { Trophy } from "lucide-react";

export default function Logo({ className = "" }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative grid place-items-center w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-bright glow-green">
        <Trophy className="w-5 h-5 text-black" strokeWidth={2.5} />
      </div>
      <div className="leading-none">
        <div className="font-display font-extrabold tracking-tight text-base">
          PARYAJ <span className="text-gradient-gold">888</span>
        </div>
        <div className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground">Sportsbook</div>
      </div>
    </div>
  );
}