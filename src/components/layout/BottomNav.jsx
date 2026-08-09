import React from "react";
import { NavLink } from "react-router-dom";
import { Home, Radio, Trophy, Ticket, Wallet } from "lucide-react";
import { useBetSlip } from "@/lib/BetSlipContext";

const ITEMS = [
  { to: "/", icon: Home, label: "Home", end: true },
  { to: "/live", icon: Radio, label: "Live" },
  { to: "/sports", icon: Trophy, label: "Sports" },
  { to: "/my-bets", icon: Ticket, label: "My Bets" },
  { to: "/wallet", icon: Wallet, label: "Wallet" }
];

export default function BottomNav() {
  const { count, setOpen } = useBetSlip();
  return (
    <>
      {count > 0 && (
        <button onClick={() => setOpen(true)}
          className="lg:hidden fixed right-4 bottom-20 z-40 flex items-center gap-2 bg-gradient-to-r from-primary to-bright text-black font-bold text-sm px-4 py-3 rounded-full glow-green shadow-lg">
          <span className="grid place-items-center w-5 h-5 rounded-full bg-black/20 text-xs">{count}</span>
          Bet Slip
        </button>
      )}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 glass-strong border-t border-border">
        <div className="grid grid-cols-5">
          {ITEMS.map(({ to, icon: Icon, label, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) => `flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-semibold ${isActive ? "text-bright" : "text-muted-foreground"}`}>
              {({ isActive }) => (
                <>
                  <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
}