import React from "react";
import { Image } from "@/components/ui/image";

const LOGO_URL = "https://media.base44.com/images/public/6a78f0bed598e159cf9bcaec/35e32e0af_ChatGPTImageAug9202605_21_46PM.png";

export default function Logo({ className = "", showTagline = true }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <Image
        src={LOGO_URL}
        alt="PARYAJ 888"
        className="h-11 w-11 shrink-0"
        fittingType="fit"
      />
      {showTagline && (
        <div className="leading-none border-l border-border pl-2.5">
          <div className="font-display font-extrabold tracking-tight text-sm">
            PARYAJ <span className="text-gradient-gold">888</span>
          </div>
          <div className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground">Sportsbook</div>
        </div>
      )}
    </div>
  );
}