import React from "react";
import { Link } from "react-router-dom";
import { Image } from "@/components/ui/image";
import { ChevronRight } from "lucide-react";

export default function CategoryCard({ to = "/sports", title, subtitle, image, icon: Icon }) {
  return (
    <Link to={to} className="group relative block overflow-hidden rounded-2xl border border-border aspect-[4/5] sm:aspect-[5/6]">
      <Image src={image} alt={title} className="absolute inset-0 w-full h-full" fittingType="fill" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/10" />
      <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition" />
      <div className="absolute inset-0 p-4 flex flex-col justify-end">
        {Icon && (
          <div className="mb-2 w-9 h-9 grid place-items-center rounded-lg bg-primary/30 border border-primary/40 backdrop-blur">
            <Icon className="w-5 h-5 text-bright" />
          </div>
        )}
        <h3 className="font-display font-bold text-base sm:text-lg leading-tight">{title}</h3>
        {subtitle && <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-bright opacity-0 group-hover:opacity-100 transition">Explore <ChevronRight className="w-3 h-3" /></span>
      </div>
    </Link>
  );
}