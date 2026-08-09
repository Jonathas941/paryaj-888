import React from "react";
import { cn } from "@/lib/utils";

export default function SectionHeader({ title, subtitle, action, icon: Icon, className = "" }) {
  return (
    <div className={cn("flex items-end justify-between gap-3 mb-4", className)}>
      <div className="flex items-center gap-2.5">
        {Icon && (
          <div className="w-8 h-8 grid place-items-center rounded-lg bg-primary/15 border border-primary/30">
            <Icon className="w-4 h-4 text-bright" />
          </div>
        )}
        <div>
          <h2 className="text-xl sm:text-2xl font-display font-extrabold tracking-tight">{title}</h2>
          {subtitle && <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}