import React from "react";
import { BarChart3, Users, DollarSign, Ticket, Activity, TrendingUp } from "lucide-react";
import api from "@/lib/api";
import { useApi } from "@/lib/useApi";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { formatCurrency, formatNumber } from "@/lib/format";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid } from "recharts";

export default function AdminOverview() {
  const { data: o, loading } = useApi(() => api.getAdminOverview());

  const cards = [
    { label: "Registered Users", value: o?.registered_users, icon: Users, fmt: formatNumber },
    { label: "Online Now", value: o?.online_users, icon: Activity, fmt: formatNumber },
    { label: "Total Deposits", value: o?.total_deposits, icon: DollarSign, fmt: formatCurrency },
    { label: "Total Withdrawals", value: o?.total_withdrawals, icon: DollarSign, fmt: formatCurrency },
    { label: "Total Stakes", value: o?.total_stakes, icon: Ticket, fmt: formatCurrency },
    { label: "Gross Gaming Revenue", value: o?.ggr, icon: TrendingUp, fmt: formatCurrency, tone: "bright" },
    { label: "Pending Withdrawals", value: o?.pending_withdrawals, icon: DollarSign, fmt: formatNumber, tone: "gold" },
    { label: "Pending KYC", value: o?.pending_kyc, icon: Users, fmt: formatNumber, tone: "gold" },
    { label: "Open Bets", value: o?.open_bets, icon: Ticket, fmt: formatNumber },
    { label: "Live Bets", value: o?.live_bets, icon: Activity, fmt: formatNumber, tone: "bright" }
  ];

  return (
    <div>
      <h1 className="text-xl font-bold mb-5">Overview</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {loading ? Array.from({ length: 10 }).map((_, i) => <LoadingSkeleton key={i} className="h-24" />) : cards.map(c => (
          <div key={c.label} className="glass rounded-xl p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2"><c.icon className="w-4 h-4" /> {c.label}</div>
            <div className={`text-xl font-bold tabular-nums ${c.tone === "bright" ? "text-bright" : c.tone === "gold" ? "text-gold" : ""}`}>{c.fmt(c.value)}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <ChartCard title="Daily Deposits">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={o?.charts?.deposits || []}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} /><YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} /><Tooltip contentStyle={{ background: "hsl(var(--surface))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "#fff" }} /><Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} /></BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Daily Withdrawals">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={o?.charts?.withdrawals || []}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} /><YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} /><Tooltip contentStyle={{ background: "hsl(var(--surface))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "#fff" }} /><Bar dataKey="value" fill="hsl(var(--gold))" radius={[4, 4, 0, 0]} /></BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Daily Stakes">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={o?.charts?.stakes || []}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} /><YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} /><Tooltip contentStyle={{ background: "hsl(var(--surface))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "#fff" }} /><Line type="monotone" dataKey="value" stroke="hsl(var(--bright))" strokeWidth={2} dot={false} /></LineChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Net Revenue">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={o?.charts?.revenue || []}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} /><YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} /><Tooltip contentStyle={{ background: "hsl(var(--surface))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "#fff" }} /><Line type="monotone" dataKey="value" stroke="hsl(var(--gold))" strokeWidth={2} dot={false} /></LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3 text-sm font-semibold"><BarChart3 className="w-4 h-4 text-muted-foreground" /> {title}</div>
      <div className="h-48">{children}</div>
    </div>
  );
}