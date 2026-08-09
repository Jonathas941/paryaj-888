import React, { useState } from "react";
import { Link } from "react-router-dom";
import { User, Shield, CreditCard, Bell, Clock, LogOut, Settings, BadgeCheck, ChevronRight } from "lucide-react";
import api from "@/lib/api";
import { useApi } from "@/lib/useApi";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import StatusBadge from "@/components/common/StatusBadge";

const MENU = [
  { to: "/profile", icon: User, label: "Personal Information" },
  { to: "/security", icon: Shield, label: "Security" },
  { to: "/kyc", icon: BadgeCheck, label: "Verification / KYC" },
  { to: "/responsible", icon: Settings, label: "Responsible Gaming" },
  { to: "/limits", icon: Settings, label: "Betting Limits" },
  { to: "/notifications", icon: Bell, label: "Notifications" },
  { to: "/payment-methods", icon: CreditCard, label: "Payment Methods" },
  { to: "/login-history", icon: Clock, label: "Login History" }
];

export default function Profile() {
  const { data: p, loading } = useApi(() => api.getProfile());
  const [tab, setTab] = useState("info");

  return (
    <div className="px-4 py-4 max-w-3xl mx-auto">
      <div className="glass rounded-2xl p-5 mb-4 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-bright grid place-items-center text-black font-extrabold text-xl">
          {loading ? "··" : `${(p?.first_name || "?")[0]}${(p?.last_name || "")[0]}`}
        </div>
        <div className="flex-1">
          {loading ? <LoadingSkeleton className="h-5 w-32 mb-2" /> : <h2 className="font-bold text-lg">{p?.first_name} {p?.last_name}</h2>}
          <div className="flex items-center gap-2 mt-1">
            <StatusBadge status={p?.account_status || "active"} color="bright" />
            <StatusBadge status={p?.verification_status || "unverified"} color={p?.verification_status === "verified" ? "bright" : "gold"} />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[220px_1fr] gap-4">
        <aside className="space-y-1">
          {MENU.map(m => (
            <Link key={m.to} to={m.to} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-surface-2 transition">
              <m.icon className="w-4 h-4" /> <span className="flex-1">{m.label}</span><ChevronRight className="w-4 h-4" />
            </Link>
          ))}
          <button onClick={() => api && null} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-danger hover:bg-danger/10 transition mt-2 border-t border-border pt-3">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </aside>

        <div className="glass rounded-xl p-5">
          <h3 className="font-bold mb-4">Personal Information</h3>
          {loading ? <div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => <LoadingSkeleton key={i} className="h-10 w-full" />)}</div> : (
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                ["First name", p.first_name], ["Last name", p.last_name], ["Username", p.username],
                ["Email", p.email], ["Phone", p.phone], ["Date of birth", p.date_of_birth],
                ["Country", p.country], ["Address", p.address], ["Currency", p.currency],
                ["Language", p.language]
              ].map(([k, v]) => (
                <div key={k}>
                  <label className="text-xs text-muted-foreground">{k}</label>
                  <div className="bg-surface-2/60 border border-border rounded-lg px-3 py-2.5 mt-1 text-sm">{v}</div>
                </div>
              ))}
            </div>
          )}
          <button className="mt-4 w-full bg-gradient-to-r from-primary to-bright text-black font-bold py-2.5 rounded-lg">Edit Profile</button>
        </div>
      </div>
    </div>
  );
}