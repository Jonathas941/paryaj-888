import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";

export default function LegalPage({ title, subtitle, lastUpdated, sections }) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-bright mb-5"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
      </Link>

      <div className="flex items-center gap-2 text-gold mb-2">
        <FileText className="w-4 h-4" />
        <span className="text-[11px] font-semibold uppercase tracking-wider">Legal</span>
      </div>
      <h1 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight">{title}</h1>
      {subtitle && (
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{subtitle}</p>
      )}
      {lastUpdated && (
        <p className="text-[11px] text-muted-foreground/70 mt-3">Last updated: {lastUpdated}</p>
      )}

      <div className="mt-7 space-y-4">
        {sections.map((s, i) => (
          <section key={i} className="glass rounded-xl p-5">
            <h2 className="font-semibold text-foreground text-base mb-3 flex items-start gap-2">
              <span className="text-gold font-display text-sm shrink-0">
                {String(i + 1).padStart(2, "0")}
              </span>
              {s.heading}
            </h2>
            <div className="space-y-3">
              {(Array.isArray(s.body) ? s.body : s.body ? [s.body] : []).map((p, j) => (
                <p key={j} className="text-sm text-muted-foreground leading-relaxed">
                  {p}
                </p>
              ))}
              {s.list && (
                <ul className="space-y-2 mt-3">
                  {s.list.map((li, k) => (
                    <li key={k} className="text-sm text-muted-foreground leading-relaxed flex gap-2">
                      <span className="text-gold mt-1 shrink-0">•</span>
                      <span>{li}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-8 glass rounded-xl p-5 border-l-2 border-gold/60">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Questions about this policy? Contact our compliance team through the in-app Support
          center. PARYAJ 888 is committed to transparency, fair play, and the protection of all
          players. Gambling can be addictive — please play responsibly. 18+ only.
        </p>
      </div>
    </div>
  );
}