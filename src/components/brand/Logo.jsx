import React from "react";

// Transparent-background PNG served from /public/brand.
// Regenerate with: python3 scripts/make_transparent_logo.py
export const LOGO_SRC = "/brand/paryaj888-logo.png";

/**
 * Brand lockup. `size` controls the emblem; the wordmark can be hidden with
 * showTagline={false} for tight spaces (mobile bar, avatars, favicons).
 */
export default function Logo({ className = "", showTagline = true, size = 44 }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <img
        src={LOGO_SRC}
        alt="PARYAJ 888"
        width={size}
        height={size}
        style={{ width: size, height: size }}
        className="shrink-0 object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.55)]"
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
