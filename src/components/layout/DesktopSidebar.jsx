import React from "react";
import { NavLink } from "react-router-dom";
import { Home, Radio, Trophy, Ticket, Wallet, User, Gift, Shield, Search, Gamepad2 } from "lucide-react";

const NAV = [
  { to: "/", icon: Home, label: "Home", end: true },
  { to: "/live", icon: Radio, label: "Live Betting" },
  { to: "/sports", icon: Trophy, label: "Sportsbook" },
  { to: "/casino", icon: Gamepad2, label: "Casino" },
  { to: "/my-bets", icon: Ticket, label: "My Bets" },
  { to: "/wallet", icon: Wallet, label: "Wallet" },
  { to: "/promotions", icon: Gift, label: "Promotions" },
  { to: "/profile", icon: User, label: "Account" },
  { to: "/responsible", icon: Shield, label: "Responsible Gaming" }
];

export default function DesktopSidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 border-r border-border glass sticky top-16 self-start h-[calc(100vh-4rem)] p-3 overflow-y-auto scrollbar-thin">
      <div className="flex items-center gap-2 px-2 py-3 mb-2">
        <Search className="w-4 h-4 text-muted-foreground" />
        <input placeholder="Search" className="bg-transparent outline-none text-sm w-full placeholder:text-muted-foreground" />
      </div>
      <nav className="space-y-1">
        {NAV.map(({ to, icon: Icon, label, end }) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${isActive ? "bg-primary/15 text-bright border border-primary/30" : "text-muted-foreground hover:text-foreground hover:bg-surface-2"}`}>
            <Icon className="w-4 h-4" /> {label}
          </NavLink>
        ))}
        <NavLink to="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gold hover:bg-gold/10 transition mt-2 border-t border-border pt-3">
          <Shield className="w-4 h-4" /> Admin Panel
        </NavLink>
      </nav>
    </aside>
  );
}