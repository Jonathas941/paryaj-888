import React from "react";
import { useBetSlip } from "@/lib/BetSlipContext";
import SportIcon from "@/components/common/SportIcon";
import StatusBadge from "@/components/common/StatusBadge";
import { formatEventTime, statusColor } from "@/lib/format";
import OddsButton from "@/components/betting/OddsButton";

export default function EventCard({ event }) {
  const { selections, addSelection } = useBetSlip();
  const odds1x2 = event.markets?.["1x2"] || [];
  const sel = (id) => selections.find(s => s.eventId === event.id && s.selectionId === id);

  const add = (s) => addSelection({
    eventId: event.id, selectionId: `${event.id}-${s.id}`,
    event: `${event.home} vs ${event.away}`, market: "1X2",
    pick: s.label, odds: s.odds
  });

  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <SportIcon sport={event.sport} className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="text-xs text-muted-foreground truncate">{event.league}</span>
        </div>
        {event.is_live ? (
          <StatusBadge status="LIVE" color="danger" />
        ) : (
          <span className="text-xs text-muted-foreground">{formatEventTime(event.start_time)}</span>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold truncate">{event.home}</span>
            {event.score && <span className="text-bright font-bold tabular-nums">{event.score.home}</span>}
          </div>
          <div className="flex items-center justify-between gap-2 mt-1">
            <span className="font-semibold truncate">{event.away}</span>
            {event.score && <span className="text-bright font-bold tabular-nums">{event.score.away}</span>}
          </div>
        </div>
        {event.is_live && event.minute && (
          <span className="text-[11px] text-danger font-semibold shrink-0">{event.minute}</span>
        )}
      </div>

      {odds1x2.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {odds1x2.map((o, i) => (
            <OddsButton key={o.id} odds={o.odds} label={["1", "X", "2"][i]}
              active={!!sel(`${event.id}-${o.id}`)} onClick={() => add(o)} />
          ))}
        </div>
      )}
    </div>
  );
}