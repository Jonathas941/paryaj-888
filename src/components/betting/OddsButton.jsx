import React from "react";
import { formatOdds } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function OddsButton({ odds, label, active, onClick, disabled, className = "" }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "group flex flex-col items-center justify-center rounded-lg px-2 py-2 transition-all border text-center",
        "min-h-[44px] active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed",
        active
          ? "bg-primary text-black border-primary glow-green"
          : "bg-surface-2/60 text-foreground border-border hover:border-primary/50 hover:bg-surface-2",
        className
      )}
    >
      {label && <span className="text-[10px] text-muted-foreground group-hover:text-black/60 leading-none mb-1 uppercase tracking-wide">{label}</span>}
      <span className={cn("font-bold text-sm tabular-nums", active ? "text-black" : "text-bright")}>{formatOdds(odds)}</span>
    </button>
  );
}