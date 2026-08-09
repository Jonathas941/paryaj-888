import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import api from "@/lib/api";
import { useApi } from "@/lib/useApi";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import DesktopSidebar from "@/components/layout/DesktopSidebar";
import Footer from "@/components/layout/Footer";

export default function AppLayout() {
  const { user } = useAuth();
  const location = useLocation();
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
      </div>
      {!isAdmin && <BottomNav />}
    </div>
  );
}