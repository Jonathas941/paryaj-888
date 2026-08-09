import React from "react";
import { cn } from "@/lib/utils";

export default function SectionHeader({ title, subtitle, action, icon: Icon, className = "" }) {
  return (
    <div className={cn("flex items-center justify-between gap-3 mb-3", className)}>
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-gold shrink-0" />}
        <div>
          <h2 className="text-base sm:text-lg font-display font-extrabold tracking-tight leading-none">{title}</h2>
          {subtitle && <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}
