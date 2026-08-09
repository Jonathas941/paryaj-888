import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import api from "@/lib/api";
import { useApi } from "@/lib/useApi";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import DesktopSidebar from "@/components/layout/DesktopSidebar";
import Footer from "@/components/layout/Footer";
import BetSlipPanel from "@/components/betting/BetSlipPanel";
import { useBetSlip } from "@/lib/BetSlipContext";

export default function AppLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const { open, setOpen } = useBetSlip();
  const { data: wallet } = useApi(() => api.getWallet(), []);
  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <div className="min-h-screen flex flex-col">
      <Header wallet={typeof wallet?.then === "function" ? null : wallet} user={user} />
      <div className="flex flex-1">
        {!isAdmin && <DesktopSidebar />}
        <main className="flex-1 min-w-0 pb-20 lg:pb-0">
          <Outlet />
          <Footer />
        </main>
        {!isAdmin && (
          <div className="hidden xl:block w-80 shrink-0 sticky top-16 self-start h-[calc(100vh-4rem)] glass border-l border-border">
            <BetSlipPanel />
          </div>
        )}
      </div>
      {!isAdmin && <BottomNav />}

      {/* Mobile bet slip drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="relative mt-auto glass-strong rounded-t-2xl border-t border-border max-h-[85vh] flex flex-col">
            <BetSlipPanel onClose={() => setOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}