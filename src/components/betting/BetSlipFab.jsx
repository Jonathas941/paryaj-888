import React from "react";
import { Ticket } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useBetSlip } from "@/lib/BetSlipContext";
import BetSlipPanel from "./BetSlipPanel";

// Floating bet-slip launcher + side sheet. Replaces the always-visible slip
// panel: the button only appears once the user has added selections, keeping
// the interface clean while restoring full bet placement.
export default function BetSlipFab() {
  const { count, open, setOpen } = useBetSlip();
  if (count === 0 && !open) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-bright text-black font-bold pl-4 pr-5 py-3 shadow-lg glow-green hover:brightness-110 transition lg:bottom-6 lg:right-6"
        aria-label="Open bet slip"
      >
        <Ticket className="w-5 h-5" />
        <span className="text-sm hidden sm:inline">Bet Slip</span>
        {count > 0 && (
          <span className="grid place-items-center min-w-5 h-5 px-1.5 rounded-full bg-black/30 text-xs font-bold tabular-nums">{count}</span>
        )}
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col [&>button]:hidden">
          <BetSlipPanel onClose={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}