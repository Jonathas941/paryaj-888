import React from "react";
import { Link } from "react-router-dom";
import SportIcon from "@/components/common/SportIcon";

export default function SportPill({ sport, active, onClick, to }) {
  const content = (
    <button onClick={onClick} className={active ? "active" : ""}>
      <SportIcon sport={sport.id} className="w-5 h-5 mb-1" />
      <span className="text-[11px] font-semibold leading-none">{sport.name}</span>
      <span className="text-[9px] text-muted-foreground leading-none mt-0.5">{sport.count}</span>
    </button>
  );
  return null;
}

export function SportStrip({ sports, active, onSelect }) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
      {sports.map(s => (
        <button key={s.id} onClick={() => onSelect?.(s.id)}
          className={`flex flex-col items-center justify-center min-w-[68px] px-2 py-2.5 rounded-xl border transition shrink-0 ${active === s.id ? "bg-primary/15 border-primary/40 text-bright" : "bg-surface-2/50 border-border text-muted-foreground hover:text-foreground"}`}>
          <SportIcon sport={s.id} className="w-5 h-5 mb-1" />
          <span className="text-[11px] font-semibold leading-none">{s.name}</span>
          <span className="text-[9px] text-muted-foreground leading-none mt-0.5">{s.count}</span>
        </button>
      ))}
    </div>
  );
}