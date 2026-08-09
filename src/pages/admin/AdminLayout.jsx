import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, Users, Ticket, CreditCard, ArrowUpFromLine, Gamepad2, Gift, Shield, BarChart3, FileText, BadgeCheck, Bell, Settings, Activity, ScrollText } from "lucide-react";

const NAV = [
  { to: "/admin", icon: LayoutDashboard, label: "Overview", end: true },
  { to: "/admin/users", icon: Users, label: "Users" },
  { to: "/admin/sportsbook", icon: Activity, label: "Sportsbook" },
  { to: "/admin/bets", icon: Ticket, label: "Bets" },
  { to: "/admin/payments", icon: CreditCard, label: "Payments" },
  { to: "/admin/withdrawals", icon: ArrowUpFromLine, label: "Withdrawals" },
  { to: "/admin/casino", icon: Gamepad2, label: "Casino" },
  { to: "/admin/promotions", icon: Gift, label: "Promotions" },
  { to: "/admin/risk", icon: Shield, label: "Risk" },
  { to: "/admin/reports", icon: BarChart3, label: "Reports" },
  { to: "/admin/kyc", icon: BadgeCheck, label: "KYC" },
  { to: "/admin/notifications", icon: Bell, label: "Notifications" },
  { to: "/admin/content", icon: FileText, label: "Content" },
  { to: "/admin/support", icon: Users, label: "Support" },
  { to: "/admin/audit", icon: ScrollText, label: "Audit Logs" },
  { to: "/admin/settings", icon: Settings, label: "Settings" },
  { to: "/admin/health", icon: Activity, label: "System Health" }
];

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen">
      <aside className="w-16 lg:w-60 shrink-0 border-r border-border glass-strong sticky top-0 h-screen overflow-y-auto scrollbar-thin py-3">
        <div className="px-3 mb-4 hidden lg:block">
          <div className="text-xs font-bold text-gold uppercase tracking-wider">PARYAJ 888</div>
          <div className="text-[10px] text-muted-foreground">Admin Console</div>
        </div>
        <nav className="space-y-0.5 px-2">
          {NAV.map(({ to, icon: Icon, label, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${isActive ? "bg-gold/15 text-gold border border-gold/30" : "text-muted-foreground hover:text-foreground hover:bg-surface-2"}`}>
              <Icon className="w-4 h-4 shrink-0" /> <span className="hidden lg:inline whitespace-nowrap">{label}</span>
            </NavLink>
          ))}
        </nav>
        <NavLink to="/" className="flex items-center gap-3 px-3 py-2.5 mt-4 mx-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-surface-2 border-t border-border">
          <Shield className="w-4 h-4" /> <span className="hidden lg:inline">Back to app</span>
        </NavLink>
      </aside>
      <main className="flex-1 min-w-0 p-4 lg:p-6 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}