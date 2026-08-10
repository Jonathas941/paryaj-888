import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import { BetSlipProvider } from '@/lib/BetSlipContext';
import { I18nProvider } from '@/lib/i18n';

import AppLayout from '@/components/layout/AppLayout';
import Logo from '@/components/brand/Logo';
import Home from '@/pages/Home';
import Sports from '@/pages/Sports';
import Live from '@/pages/Live';
import EventDetail from '@/pages/EventDetail';
import MyBets from '@/pages/MyBets';
import Wallet from '@/pages/Wallet';
import Deposit from '@/pages/Deposit';
import Withdraw from '@/pages/Withdraw';
import Transactions from '@/pages/Transactions';
import Profile from '@/pages/Profile';
import Promotions from '@/pages/Promotions';
import Responsible from '@/pages/Responsible';
import Casino from '@/pages/Casino';
import ComingSoon from '@/components/common/ComingSoon';
import Terms from '@/pages/Terms';
import Privacy from '@/pages/Privacy';
import AmlKyc from '@/pages/AmlKyc';
import SportsRules from '@/pages/SportsRules';

import AdminLayout from '@/pages/admin/AdminLayout';
import AdminOverview from '@/pages/admin/AdminOverview';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminBets from '@/pages/admin/AdminBets';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-6 bg-background">
        <Logo showTagline={false} size={92} className="animate-pulse" />
        <div className="w-7 h-7 border-[3px] border-surface-2 border-t-gold rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <BetSlipProvider>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/live" element={<Live />} />
          <Route path="/sports" element={<Sports />} />
          <Route path="/event/:id" element={<EventDetail />} />
          <Route path="/my-bets" element={<MyBets />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/deposit" element={<Deposit />} />
          <Route path="/withdraw" element={<Withdraw />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/promotions" element={<Promotions />} />
          <Route path="/responsible" element={<Responsible />} />
          <Route path="/casino" element={<Casino />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/kyc" element={<AmlKyc />} />
          <Route path="/sports-rules" element={<SportsRules />} />
          <Route path="/bonuses" element={<ComingSoon title="Bonuses" />} />
          <Route path="/security" element={<ComingSoon title="Security" />} />
          <Route path="/kyc" element={<ComingSoon title="Verification / KYC" />} />
          <Route path="/limits" element={<ComingSoon title="Betting Limits" />} />
          <Route path="/notifications" element={<ComingSoon title="Notifications" />} />
          <Route path="/payment-methods" element={<ComingSoon title="Payment Methods" />} />
          <Route path="/login-history" element={<ComingSoon title="Login History" />} />
        </Route>

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminOverview />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="bets" element={<AdminBets />} />
          <Route path="sportsbook" element={<ComingSoon title="Sportsbook Management" />} />
          <Route path="payments" element={<ComingSoon title="Payments" />} />
          <Route path="withdrawals" element={<ComingSoon title="Withdrawals" />} />
          <Route path="casino" element={<ComingSoon title="Casino Management" />} />
          <Route path="promotions" element={<ComingSoon title="Promotions" />} />
          <Route path="risk" element={<ComingSoon title="Risk Management" />} />
          <Route path="reports" element={<ComingSoon title="Reports" />} />
          <Route path="kyc" element={<ComingSoon title="KYC Review" />} />
          <Route path="notifications" element={<ComingSoon title="Notifications" />} />
          <Route path="content" element={<ComingSoon title="Content" />} />
          <Route path="support" element={<ComingSoon title="Support" />} />
          <Route path="audit" element={<ComingSoon title="Audit Logs" />} />
          <Route path="settings" element={<ComingSoon title="Settings" />} />
          <Route path="health" element={<ComingSoon title="System Health" />} />
        </Route>

        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </BetSlipProvider>
  );
};


function App() {
  return (
    <I18nProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <ScrollToTop />
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </I18nProvider>
  )
}

export default App