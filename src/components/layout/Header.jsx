import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, Search, User, Wallet, ChevronDown, Globe } from "lucide-react";
import Logo from "@/components/brand/Logo";
import { formatCurrency } from "@/lib/format";

export default function Header({ wallet, user }) {
  const navigate = useNavigate();
  const [lang, setLang] = useState("EN");
  const balance = wallet?.available_balance ?? 0;

  return (
    <header className="sticky top-0 z-40 glass-strong border-b border-border">
      <div className="flex items-center justify-between gap-3 px-4 h-16">
        <Link to="/" className="shrink-0"><Logo /></Link>

        <div className="hidden md:flex items-center gap-2 flex-1 max-w-md mx-auto">
          <div className="flex items-center gap-2 w-full bg-surface-2/60 border border-border rounded-lg px-3 py-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input placeholder="Search teams, leagues, events…" className="bg-transparent outline-none text-sm w-full placeholder:text-muted-foreground" />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button className="hidden sm:flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-surface-2" onClick={() => setLang(l => l === "EN" ? "FR" : "EN")}>
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
              <Link to="/deposit" className="bg-gradient-to-r from-primary to-bright text-black font-bold text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-lg glow-green hover:brightness-110 transition shrink-0">Deposit</Link>
              <Link to="/profile" className="hidden sm:grid place-items-center p-1.5 rounded-lg bg-surface-2 border border-border shrink-0"><User className="w-5 h-5" /></Link>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-semibold px-3 py-2 rounded-lg hover:bg-surface-2">Login</Link>
              <Link to="/register" className="bg-gradient-to-r from-primary to-bright text-black font-bold text-sm px-4 py-2 rounded-lg glow-green">Register</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}