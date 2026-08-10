import React from "react";
import { Info, Shield, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "@/components/brand/Logo";
import { useI18n } from "@/lib/i18n";

export default function Footer() {
  const { t } = useI18n();
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
                {t("footer.tagline")}
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
              <li><Link to="/about" className="hover:text-bright">{t("footer.aboutUs")}</Link></li>
              <li><Link to="/help" className="hover:text-bright">{t("footer.helpCenter")}</Link></li>
              <li><Link to="/contact" className="hover:text-bright">{t("footer.contact")}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-foreground">{t("footer.legal")}</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link to="/terms" className="hover:text-bright">{t("footer.terms")}</Link></li>
              <li><Link to="/privacy" className="hover:text-bright">{t("footer.privacy")}</Link></li>
              <li><Link to="/kyc" className="hover:text-bright">{t("footer.amlKyc")}</Link></li>
              <li><Link to="/sports-rules" className="hover:text-bright">{t("footer.sportsRules")}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-foreground">{t("footer.responsibleGaming")}</h4>
            <p className="text-muted-foreground text-xs leading-relaxed">
              {t("footer.responsibleMsg")}
            </p>
            <Link to="/responsible" className="inline-flex items-center gap-1 text-bright text-xs mt-2 hover:underline">
              <Shield className="w-3 h-3" /> {t("footer.setLimits")}
            </Link>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-foreground">{t("footer.support")}</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link to="/support" className="hover:text-bright flex items-center gap-1"><HelpCircle className="w-3 h-3" /> {t("footer.createTicket")}</Link></li>
              <li><Link to="/faq" className="hover:text-bright flex items-center gap-1"><Info className="w-3 h-3" /> {t("footer.faq")}</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-border text-xs text-muted-foreground text-center">
          {t("footer.copyright")}
        </div>
      </div>
    </footer>
  );
}