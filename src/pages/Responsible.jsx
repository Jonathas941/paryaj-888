import React from "react";
import { Shield, Clock, Pause, Ban, AlertCircle, Info } from "lucide-react";

const CONTROLS = [
  { icon: Shield, title: "Deposit Limits", desc: "Set daily, weekly or monthly deposit caps." },
  { icon: Shield, title: "Loss Limits", desc: "Cap the amount you can lose in a period." },
  { icon: Shield, title: "Betting Limits", desc: "Limit your stake per bet or per day." },
  { icon: Clock, title: "Session Limits", desc: "Get reminders or auto-logout after set time." },
  { icon: Pause, title: "Cooling-Off Period", desc: "Take a short break — 24h to 30 days." },
  { icon: Ban, title: "Self-Exclusion", desc: "Block access for 6 months or more." },
  { icon: Info, title: "Account Closure", desc: "Permanently close your account." },
  { icon: AlertCircle, title: "Reality Checks", desc: "Periodic reminders of time spent playing." }
];

export default function Responsible() {
  return (
    <div className="px-4 py-4 max-w-3xl mx-auto">
      <h1 className="text-lg font-bold mb-1">Responsible Gaming</h1>
      <p className="text-sm text-muted-foreground mb-4">Stay in control. These limits protect you and cannot be silently overridden.</p>

      <div className="glass rounded-xl p-4 mb-5 border-l-4 border-l-gold">
        <p className="text-sm leading-relaxed">Gambling should be entertaining, not a way to make money. If it stops being fun, the tools below can help. You must be of legal age in your jurisdiction to play.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {CONTROLS.map(c => (
          <div key={c.title} className="glass rounded-xl p-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-gold/10 grid place-items-center shrink-0"><c.icon className="w-5 h-5 text-gold" /></div>
            <div>
              <h3 className="font-semibold text-sm">{c.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{c.desc}</p>
              <button className="text-xs text-bright font-semibold mt-2 hover:underline">Configure</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}