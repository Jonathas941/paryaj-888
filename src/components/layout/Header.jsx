import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Bell, Search, User, Wallet, ChevronDown, Globe, Menu, X, Home, Radio, Trophy, Gamepad2, Gift, Ticket, Shield } from "lucide-react";
import Logo from "@/components/brand/Logo";
import { formatCurrency } from "@/lib/format";

const NAV = [
  { to: "/", icon: Home, label: "Home", end: true },
  { to: "/live", icon: Radio, label: "Live Betting" },
  { to: "/sports", icon: Trophy, label: "Sports" },
  { to: "/casino", icon: Gamepad2, label: "Casino" },
  { to: "/promotions", icon: Gift, label: "Promotions" },
  { to: "/my-bets", icon: Ticket, label: "My Bets" },
  { to: "/wallet", icon: Wallet, label: "Wallet" }
];

export default function Header({ wallet, user }) {
  const [lang, setLang] = useState("EN");
  const [open, setOpen] = useState(false);
  const balance = wallet?.available_balance ?? 0;

  return (
    <header className="sticky top-0 z-40 glass-strong border-b border-border">
      <div className="flex items-center justify-between gap-3 px-4 h-16">
        {/* Left: hamburger + logo */}
        <div className="flex items-center gap-1">
          <button className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-surface-2" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu className="w-6 h-6" />
          </button>
          <Link to="/" className="shrink-0"><Logo /></Link>
        </div>

        {/* Center: desktop nav */}
        <nav className="hidden lg:flex items-center gap-0.5">
          {NAV.map(({ to, icon: Icon, label, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) => `flex items-center gap-1.5 px-2 py-2 rounded-lg text-[13px] font-semibold transition ${isActive ? "text-bright bg-primary/15" : "text-muted-foreground hover:text-foreground hover:bg-surface-2"}`}>
              <Icon className="w-4 h-4" /> {label}
            </NavLink>
          ))}
        </nav>

        {/* Right: search + actions */}
        <div className="flex items-center gap-2">
          <div className="hidden 2xl:flex items-center gap-2 w-48 bg-surface-2/60 border border-border rounded-lg px-3 py-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input placeholder="Search teams, events…" className="bg-transparent outline-none text-sm w-full placeholder:text-muted-foreground" />
          </div>
          <button className="hidden xl:flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-surface-2" onClick={() => setLang(l => l === "EN" ? "FR" : "EN")}>
            <Globe className="w-4 h-4" /> {lang}
          </button>
          <button className="relative p-2 rounded-lg hover:bg-surface-2" aria-label="Notifications">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger pulse-live" />
          </button>

          {user ? (
            <>
              <Link to="/wallet" className="hidden sm:flex items-center gap-2 bg-surface-2/60 border border-border rounded-lg pl-3 pr-1 py-1 shrink-0">
                <Wallet className="w-4 h-4 text-bright" />
                <span className="font-semibold text-sm tabular-nums">{formatCurrency(balance)}</span>
                <span className="grid place-items-center w-7 h-7 rounded-md bg-muted/10 text-muted-foreground"><ChevronDown className="w-4 h-4" /></span>
              </Link>
              <Link to="/deposit" className="bg-gradient-to-r from-primary to-bright text-white font-bold text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-lg glow-green hover:brightness-110 transition shrink-0">Deposit</Link>
              <Link to="/profile" className="hidden xl:grid place-items-center p-1.5 rounded-lg bg-surface-2 border border-border shrink-0"><User className="w-5 h-5" /></Link>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-semibold px-3 py-2 rounded-lg hover:bg-surface-2">Login</Link>
              <Link to="/register" className="bg-gradient-to-r from-primary to-bright text-white font-bold text-sm px-4 py-2 rounded-lg glow-green">Register</Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 glass-strong border-r border-border p-4 overflow-y-auto scrollbar-thin">
            <div className="flex items-center justify-between mb-6">
              <Logo />
              <button className="p-2 rounded-lg hover:bg-surface-2" onClick={() => setOpen(false)} aria-label="Close menu"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex items-center gap-2 w-full bg-surface-2/60 border border-border rounded-lg px-3 py-2 mb-4">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input placeholder="Search teams, events…" className="bg-transparent outline-none text-sm w-full placeholder:text-muted-foreground" />
            </div>
            <nav className="space-y-1">
              {NAV.map(({ to, icon: Icon, label, end }) => (
                <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)}
                  className={({ isActive }) => `flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold transition ${isActive ? "bg-primary/15 text-bright border border-primary/30" : "text-muted-foreground hover:text-foreground hover:bg-surface-2"}`}>
                  <Icon className="w-5 h-5" /> {label}
                </NavLink>
              ))}
              <NavLink to="/responsible" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-surface-2">
                <Shield className="w-5 h-5" /> Responsible Gaming
              </NavLink>
              <NavLink to="/admin" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold text-gold hover:bg-gold/10 border-t border-border mt-2 pt-3">
                <Shield className="w-5 h-5" /> Admin Panel
              </NavLink>
            </nav>
            {!user && (
              <div className="mt-6 grid grid-cols-2 gap-2">
                <Link to="/login" onClick={() => setOpen(false)} className="text-center text-sm font-semibold px-3 py-2.5 rounded-lg border border-border hover:bg-surface-2">Login</Link>
                <Link to="/register" onClick={() => setOpen(false)} className="text-center bg-gradient-to-r from-primary to-bright text-white font-bold text-sm px-3 py-2.5 rounded-lg">Register</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}