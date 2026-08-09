import React from "react";
import { Link } from "react-router-dom";
import { Image } from "@/components/ui/image";

/**
 * Landscape media tile used by the homepage "Top Sports" and
 * "Top Casino Games" rows: full-bleed art, dark scrim, and a small
 * circular icon badge sitting inline with the label at bottom-left.
 */
export default function MediaTile({
  to = "/sports",
  title,
  subtitle,
  image,
  icon: Icon,
  accent = "green",
  overlay = null
}) {
  const badge =
    accent === "gold"
      ? "bg-gold/20 border-gold/40 text-gold"
      : "bg-primary/25 border-bright/40 text-bright";

  return (
    <Link
      to={to}
      className="group relative block overflow-hidden rounded-xl border border-border aspect-[16/10] hover:border-gold/40 transition"
    >
      <Image
        src={image}
        alt={title}
        fittingType="fill"
        className="absolute inset-0 w-full h-full transition duration-500 group-hover:scale-[1.06]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/5" />
      <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition" />

      {overlay}

      <div className="absolute inset-x-0 bottom-0 p-3 flex items-center gap-2.5">
        {Icon && (
          <span className={`w-7 h-7 shrink-0 grid place-items-center rounded-full border backdrop-blur ${badge}`}>
            <Icon className="w-3.5 h-3.5" />
          </span>
        )}
        <div className="min-w-0">
          <h3 className="font-display font-bold text-[13.5px] leading-tight truncate">{title}</h3>
          {subtitle && (
            <p className="text-[10.5px] text-muted-foreground leading-tight mt-0.5 truncate">{subtitle}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
