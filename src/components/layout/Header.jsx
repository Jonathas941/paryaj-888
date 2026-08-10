import React, { useState, useRef, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { Bell, Search, User, Wallet, ChevronDown, Globe, Menu, X, Home, Radio, Trophy, Gamepad2, Gift, Ticket, Shield, Check } from "lucide-react";
import Logo from "@/components/brand/Logo";
import { formatCurrency } from "@/lib/format";
import { useI18n } from "@/lib/i18n";

const NAV = [
  { to: "/", icon: Home, key: "nav.home", end: true },
  { to: "/live", icon: Radio, key: "nav.live" },
  { to: "/sports", icon: Trophy, key: "nav.sports" },
  { to: "/casino", icon: Gamepad2, key: "nav.casino" },
  { to: "/promotions", icon: Gift, key: "nav.promotions" },
  { to: "/my-bets", icon: Ticket, key: "nav.myBets" },
  { to: "/wallet", icon: Wallet, key: "nav.wallet" },
];

function LanguageSwitcher() {
  const { lang, setLang, languages, t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = languages.find((l) => l.code === lang) || languages[0];

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground px-2.5 py-2 rounded-full border border-border bg-surface-2/60 transition"
        onClick={() => setOpen((o) => !o)}
        aria-label={t("header.language")}
        aria-expanded={open}
      >
        <Globe className="w-4 h-4" /> {current.short} <ChevronDown className={`w-3 h-3 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-40 glass-strong border border-border rounded-lg shadow-xl py-1 z-50">
          {languages.map((l) => (
            <button
              key={l.code}
              onClick={() => { setLang(l.code); setOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm transition ${l.code === lang ? "text-bright bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-surface-2"}`}
            >
              {l.label}
              {l.code === lang && <Check className="w-3.5 h-3.5" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Header({ wallet, user }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const balance = wallet?.available_balance ?? 0;

  return (
    <header className="sticky top-0 z-40 glass-strong border-b border-border">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-3 px-4 h-16">
        {/* Left: hamburger + logo */}
        <div className="flex items-center gap-1">
          <button className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-surface-2" onClick={() => setOpen(true)} aria-label={t("header.openMenu")}>
            <Menu className="w-6 h-6" />
          </button>
          <Link to="/" className="shrink-0"><Logo /></Link>
        </div>

        {/* Center: desktop nav */}
        <nav className="hidden lg:flex items-center gap-0.5">
          {NAV.map(({ to, icon: Icon, key, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) => `flex items-center gap-1.5 px-2 py-2 rounded-lg text-[13px] font-semibold transition ${isActive ? "text-bright shadow-[0_2px_0_0_hsl(var(--bright))]" : "text-muted-foreground hover:text-foreground hover:bg-surface-2"}`}>
              <Icon className="w-4 h-4" /> {t(key)}
            </NavLink>
          ))}
        </nav>

        {/* Right: search + actions */}
        <div className="flex items-center gap-2">
          <button className="hidden sm:grid place-items-center w-9 h-9 rounded-full bg-surface-2/60 border border-border hover:border-gold/40 hover:text-gold transition" aria-label={t("header.search")}>
            <Search className="w-[18px] h-[18px]" />
          </button>
          <div className="hidden xl:block"><LanguageSwitcher /></div>
          <button className="relative hidden sm:grid place-items-center w-9 h-9 rounded-full bg-surface-2/60 border border-border hover:border-gold/40 transition" aria-label={t("header.notifications")}>
            <Bell className="w-[18px] h-[18px] text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-bright pulse-live" />
          </button>

          {user ? (
            <>
              <Link to="/wallet" className="hidden sm:flex items-center gap-2 bg-surface-2/60 border border-border rounded-lg pl-3 pr-1 py-1 shrink-0">
                <Wallet className="w-4 h-4 text-gold" />
                <span className="font-semibold text-sm tabular-nums">{formatCurrency(balance)}</span>
                <span className="grid place-items-center w-7 h-7 rounded-md text-muted-foreground"><ChevronDown className="w-4 h-4" /></span>
              </Link>
              <Link to="/deposit" className="bg-gradient-to-r from-soft-gold to-gold text-black font-bold text-xs sm:text-sm px-4 sm:px-5 py-2 rounded-lg glow-gold hover:brightness-110 transition shrink-0">{t("header.deposit")}</Link>
              <Link to="/profile" className="relative hidden sm:grid place-items-center w-9 h-9 rounded-full bg-surface-2 border border-border hover:border-gold/40 transition shrink-0">
                <User className="w-[18px] h-[18px]" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-bright border-2 border-background" />
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-semibold px-3 py-2 rounded-lg hover:bg-surface-2">{t("header.login")}</Link>
              <Link to="/register" className="bg-gradient-to-r from-primary to-bright text-white font-bold text-sm px-4 py-2 rounded-lg glow-green">{t("header.register")}</Link>
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
              <button className="p-2 rounded-lg hover:bg-surface-2" onClick={() => setOpen(false)} aria-label={t("header.closeMenu")}><X className="w-5 h-5" /></button>
            </div>
            <div className="mb-4"><LanguageSwitcher /></div>
            <div className="flex items-center gap-2 w-full bg-surface-2/60 border border-border rounded-lg px-3 py-2 mb-4">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input placeholder={t("header.searchPlaceholder")} className="bg-transparent outline-none text-sm w-full placeholder:text-muted-foreground" />
            </div>
            <nav className="space-y-1">
              {NAV.map(({ to, icon: Icon, key, end }) => (
                <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)}
                  className={({ isActive }) => `flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold transition ${isActive ? "bg-primary/15 text-bright border border-primary/30" : "text-muted-foreground hover:text-foreground hover:bg-surface-2"}`}>
                  <Icon className="w-5 h-5" /> {t(key)}
                </NavLink>
              ))}
              <NavLink to="/responsible" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-surface-2">
                <Shield className="w-5 h-5" /> {t("nav.responsible")}
              </NavLink>
              <NavLink to="/admin" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold text-gold hover:bg-gold/10 border-t border-border mt-2 pt-3">
                <Shield className="w-5 h-5" /> {t("nav.admin")}
              </NavLink>
            </nav>
            {!user && (
              <div className="mt-6 grid grid-cols-2 gap-2">
                <Link to="/login" onClick={() => setOpen(false)} className="text-center text-sm font-semibold px-3 py-2.5 rounded-lg border border-border hover:bg-surface-2">{t("header.login")}</Link>
                <Link to="/register" onClick={() => setOpen(false)} className="text-center bg-gradient-to-r from-primary to-bright text-white font-bold text-sm px-3 py-2.5 rounded-lg">{t("header.register")}</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}