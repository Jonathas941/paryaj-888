import React, { useState } from "react";
import { Search, MoreVertical } from "lucide-react";
import api from "@/lib/api";
import { useApi } from "@/lib/useApi";
import StatusBadge from "@/components/common/StatusBadge";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { formatCurrency, statusColor } from "@/lib/format";

export default function AdminUsers() {
  const { data: users, loading } = useApi(() => api.getAdminUsers());
  const [q, setQ] = useState("");

  const rows = (users || []).filter(u => !q || `${u.name} ${u.email}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold">Users</h1>
        <div className="flex items-center gap-2 bg-surface-2/60 border border-border rounded-lg px-3 py-2 w-64">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search users…" className="bg-transparent outline-none text-sm w-full" />
        </div>
      </div>

      <div className="glass rounded-xl overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead className="bg-surface-2/60 text-muted-foreground text-xs uppercase">
            <tr>
              {["User ID", "Name", "Email", "Country", "Balance", "Status", "KYC", "Risk", "Registered", ""].map(h => <th key={h} className="text-left px-4 py-3 font-semibold">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {loading ? Array.from({ length: 6 }).map((_, i) => (
              <tr key={i} className="border-t border-border"><td colSpan={9}><LoadingSkeleton className="h-10 w-full rounded-none" /></td></tr>
            )) : rows.map(u => (
              <tr key={u.id} className="border-t border-border hover:bg-surface-2/30">
                <td className="px-4 py-3 text-muted-foreground">{u.id}</td>
                <td className="px-4 py-3 font-semibold">{u.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                <td className="px-4 py-3">{u.country}</td>
                <td className="px-4 py-3 tabular-nums">{formatCurrency(u.balance)}</td>
                <td className="px-4 py-3"><StatusBadge status={u.status} color={statusColor(u.status)} /></td>
                <td className="px-4 py-3"><StatusBadge status={u.kyc} color={u.kyc === "verified" ? "bright" : u.kyc === "rejected" ? "danger" : "gold"} /></td>
                <td className="px-4 py-3"><StatusBadge status={u.risk} color={u.risk === "high" ? "danger" : u.risk === "medium" ? "gold" : "muted"} /></td>
                <td className="px-4 py-3 text-muted-foreground">{u.registered}</td>
                <td className="px-4 py-3"><MoreVertical className="w-4 h-4 text-muted-foreground cursor-pointer" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}