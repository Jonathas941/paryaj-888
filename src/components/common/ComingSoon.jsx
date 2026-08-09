import React from "react";
import { Construction } from "lucide-react";
import StatusBadge from "@/components/common/StatusBadge";

export default function ComingSoon({ title, description = "This module is being prepared for backend integration." }) {
  return (
    <div className="px-4 py-4 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold">{title}</h1>
        <StatusBadge status="In Development" color="gold" />
      </div>
      <div className="glass rounded-xl p-10 flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-2xl bg-gold/10 grid place-items-center mb-4"><Construction className="w-7 h-7 text-gold" /></div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-md">{description}</p>
      </div>
    </div>
  );
}