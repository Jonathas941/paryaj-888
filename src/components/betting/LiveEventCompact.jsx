import React from "react";
import { Link } from "react-router-dom";
import { Lock } from "lucide-react";
import { useBetSlip } from "@/lib/BetSlipContext";
import { formatOdds } from "@/lib/format";

/**
 * Neutral team mark. Deliberately an initials disc rather than a club crest —
 * real club badges are trademarked artwork we can't ship.
 */
function TeamMark({ name = "" }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0])
    .join("")
    .toUpperCase();

  // Deterministic hue so a given team keeps the same colour between renders.
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) % 360;

  return (
    <span
      className="w-[18px] h-[18px] shrink-0 grid place-items-center rounded-full text-[8px] font-bold text-white/90 border border-white/15"
      style={{ background: `hsl(${hash} 45% 28%)` }}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}

function OddsCell({ label, odds, active, locked, onClick }) {
  if (locked) {
    return (
      <div className="flex items-center justify-center rounded-md bg-surface-2/50 border border-border py-1.5 text-muted-foreground">
        <Lock className="w-3 h-3" />
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-between gap-1 rounded-md border px-2 py-1.5 transition active:scale-[0.97] ${
        active
          ? "bg-primary border-primary text-black"
          : "bg-surface-2/60 border-border hover:border-primary/50 hover:bg-surface-2"
      }`}
    >
      <span className={`text-[9.5px] uppercase ${active ? "text-black/60" : "text-muted-foreground"}`}>{label}</span>
      <span className={`text-[11.5px] font-bold tabular-nums ${active ? "text-black" : "text-foreground"}`}>
        {formatOdds(odds)}
      </span>
    </button>
  );
}

export default function LiveEventCompact({ event }) {
  const { selections, addSelection } = useBetSlip();
  const odds1x2 = (event.markets?.["1x2"] || []).slice(0, 3);
  const locked = odds1x2.length === 0;
  const more = event.market_count ? Math.max(0, event.market_count - odds1x2.length) : 0;

  const isActive = id => selections.some(s => s.eventId === event.id && s.selectionId === `${event.id}-${id}`);

  const add = (s, label) =>
    addSelection({
      eventId: event.id,
      selectionId: `${event.id}-${s.id}`,
      event: `${event.home} vs ${event.away}`,
      market: "1X2",
      pick: label,
      odds: s.odds
    });

  return (
    <div className="rounded-xl border border-border bg-surface/70 p-3 hover:border-gold/30 transition">
      {/* Status row */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="inline-flex items-center gap-1 text-[8.5px] font-bold text-white bg-danger px-1.5 py-[3px] rounded">
            <span className="w-1 h-1 rounded-full bg-white pulse-live" />
            LIVE
          </span>
          {event.minute && <span className="text-[10px] font-semibold text-bright">{event.minute}</span>}
        </div>
        <span className="text-[10px] text-muted-foreground truncate">{event.league}</span>
      </div>

      {/* Teams */}
      <Link to={`/event/${event.id}`} className="block group/teams">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <TeamMark name={event.home} />
            <span className="text-[12px] font-semibold truncate group-hover/teams:text-bright transition">{event.home}</span>
          </div>
          {event.score && <span className="text-[12.5px] font-bold tabular-nums shrink-0">{event.score.home}</span>}
        </div>
        <div className="flex items-center justify-between gap-2 mt-1.5">
          <div className="flex items-center gap-2 min-w-0">
            <TeamMark name={event.away} />
            <span className="text-[12px] font-semibold truncate group-hover/teams:text-bright transition">{event.away}</span>
          </div>
          {event.score && <span className="text-[12.5px] font-bold tabular-nums shrink-0">{event.score.away}</span>}
        </div>
      </Link>

      {/* Odds */}
      <div className={`grid gap-1.5 mt-3 ${more > 0 ? "grid-cols-[1fr_1fr_1fr_auto]" : "grid-cols-3"}`}>
        {locked
          ? ["1", "2"].map(l => <OddsCell key={l} locked />)
          : odds1x2.map((o, i) => {
              const label = ["1", "X", "2"][i];
              return (
                <OddsCell
                  key={o.id}
                  label={label}
                  odds={o.odds}
                  active={isActive(o.id)}
                  onClick={() => add(o, label)}
                />
              );
            })}
        {more > 0 && (
          <Link
            to={`/event/${event.id}`}
            className="grid place-items-center rounded-md bg-surface-2/60 border border-border px-2 text-[10.5px] font-bold text-muted-foreground hover:text-bright hover:border-primary/50 transition"
          >
            +{more}
          </Link>
        )}
      </div>
    </div>
  );
}
