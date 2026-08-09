import React from "react";
import { Info, Shield, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "@/components/brand/Logo";

export default function Footer() {
  return (
    <footer className="hidden lg:block mt-10 border-t border-border glass">
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        {/* Brand lockup */}
        <div className="flex items-center justify-between gap-6 pb-7 mb-7 border-b border-border">
          <div className="flex items-center gap-4">
            <Logo showTagline={false} size={56} />
            <div>
              <div className="font-display font-extrabold tracking-tight text-lg leading-none">
                PARYAJ <span className="text-gradient-gold">888</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5 max-w-sm leading-relaxed">
                Premium sportsbook &amp; casino. Best odds, fast payouts, live betting on
                1000+ events every day.
              </p>
            </div>
          </div>
          <span className="shrink-0 grid place-items-center w-12 h-12 rounded-full border-2 border-gold/50 text-gold font-display font-extrabold text-sm">
            18+
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
          <div>
            <h4 className="font-semibold mb-3 text-foreground">PARYAJ 888</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link to="/about" className="hover:text-bright">About Us</Link></li>
              <li><Link to="/help" className="hover:text-bright">Help Center</Link></li>
              <li><Link to="/contact" className="hover:text-bright">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-foreground">Legal</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link to="/terms" className="hover:text-bright">Terms & Conditions</Link></li>
              <li><Link to="/privacy" className="hover:text-bright">Privacy Policy</Link></li>
              <li><Link to="/kyc" className="hover:text-bright">AML / KYC</Link></li>
              <li><Link to="/sports-rules" className="hover:text-bright">Sports Rules</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-foreground">Responsible Gaming</h4>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Gambling can be addictive. Please play responsibly. 18+ only.
              Bet only what you can afford to lose.
            </p>
            <Link to="/responsible" className="inline-flex items-center gap-1 text-bright text-xs mt-2 hover:underline">
              <Shield className="w-3 h-3" /> Set your limits
            </Link>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-foreground">Support</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link to="/support" className="hover:text-bright flex items-center gap-1"><HelpCircle className="w-3 h-3" /> Create Ticket</Link></li>
              <li><Link to="/faq" className="hover:text-bright flex items-center gap-1"><Info className="w-3 h-3" /> FAQ</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-border text-xs text-muted-foreground text-center">
          © 2026 PARYAJ 888. All rights reserved. Licensed & regulated. Legal age notice: you must be of legal gambling age in your jurisdiction to play.
        </div>
      </div>
    </footer>
  );
}