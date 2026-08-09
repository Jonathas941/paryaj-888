import React from "react";
import { Link } from "react-router-dom";
import { ArrowDownToLine, ArrowUpFromLine, Receipt, Gift, CreditCard, TrendingUp, TrendingDown, Wallet as WalletIcon } from "lucide-react";
import api from "@/lib/api";
import { useApi } from "@/lib/useApi";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { formatCurrency } from "@/lib/format";

const ACTIONS = [
  { to: "/deposit", icon: ArrowDownToLine, label: "Deposit", color: "from-primary to-bright" },
  { to: "/withdraw", icon: ArrowUpFromLine, label: "Withdraw", color: "from-surface-2 to-surface" },
  { to: "/transactions", icon: Receipt, label: "Transactions", color: "from-surface-2 to-surface" },
  { to: "/bonuses", icon: Gift, label: "Bonuses", color: "from-gold to-soft-gold" }
];

export default function Wallet() {
  const { data: w, loading } = useApi(() => api.getWallet());

  const stats = [
    { label: "Pending Withdrawal", value: w?.pending_withdrawal, icon: TrendingUp, tone: "gold" },
    { label: "Total Deposits", value: w?.total_deposits, icon: ArrowDownToLine, tone: "bright" },
    { label: "Total Withdrawals", value: w?.total_withdrawals, icon: ArrowUpFromLine, tone: "muted" },
    { label: "Total Winnings", value: w?.total_winnings, icon: Gift, tone: "bright" }
  ];

  return (
    <div className="px-4 py-4 max-w-4xl mx-auto">
      <h1 className="text-lg font-bold mb-4">Wallet</h1>

      {/* Balance card */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-surface to-surface-2 p-5 mb-4 glow-green">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm"><WalletIcon className="w-4 h-4" /> Available Balance</div>
          <span className="text-xs text-muted-foreground">{w?.currency || "USD"}</span>
        </div>
        {loading ? <LoadingSkeleton className="h-10 w-40" /> : (
          <div className="text-4xl font-extrabold tracking-tight tabular-nums">{formatCurrency(w?.available_balance, w?.currency)}</div>
        )}
        <div className="mt-3 text-sm text-muted-foreground">Bonus balance: <span className="text-gold font-semibold">{formatCurrency(w?.bonus_balance, w?.currency)}</span></div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-4 gap-2 mb-5">
        {ACTIONS.map(a => (
          <Link key={a.to} to={a.to} className="glass rounded-xl p-3 flex flex-col items-center gap-1.5 hover:border-primary/40 transition border border-transparent">
            <div className={`w-10 h-10 grid place-items-center rounded-lg bg-gradient-to-br ${a.color} ${a.color.includes("primary") ? "text-black" : "text-foreground"}`}><a.icon className="w-5 h-5" /></div>
            <span className="text-[11px] font-semibold">{a.label}</span>
          </Link>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map(s => (
          <div key={s.label} className="glass rounded-xl p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2"><s.icon className="w-4 h-4" /> {s.label}</div>
            {loading ? <LoadingSkeleton className="h-6 w-24" /> : <div className="font-bold text-lg tabular-nums">{formatCurrency(s.value, w?.currency)}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}