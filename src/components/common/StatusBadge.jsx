import React from "react";
import { cn } from "@/lib/utils";

const COLORS = {
  bright: "bg-bright/15 text-bright border-bright/30",
  gold: "bg-gold/15 text-gold border-gold/30",
  danger: "bg-danger/15 text-danger border-danger/30",
  info: "bg-info/15 text-info border-info/30",
  muted: "bg-muted/15 text-muted-foreground border-border"
};

export default function StatusBadge({ status, color, className = "" }) {
  const c = color || "muted";
  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border uppercase tracking-wide",
      COLORS[c] || COLORS.muted, className
    )}>
      <span className={cn("w-1.5 h-1.5 rounded-full", c === "bright" ? "bg-bright pulse-live" : c === "danger" ? "bg-danger" : c === "gold" ? "bg-gold" : c === "info" ? "bg-info" : "bg-muted-foreground")} />
      {status}
    </span>
  );
}