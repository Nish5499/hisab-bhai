import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './features/auth/AuthContext';
import { DataProvider } from './features/data/DataContext';
import { Navbar } from './components/layout/Navbar';
import { BottomNav } from './components/layout/BottomNav';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { GroupsPage } from './pages/GroupsPage';
import { GroupDetailPage } from './pages/GroupDetailPage';
import { CreateGroupPage } from './pages/CreateGroupPage';
import { AddExpensePage } from './pages/AddExpensePage';
import { ExpenseDetailPage } from './pages/ExpenseDetailPage';
import { BalancesPage } from './pages/BalancesPage';
import { ActivityPage } from './pages/ActivityPage';
import { ProfilePage } from './pages/ProfilePage';
import { JoinGroupPage } from './pages/JoinGroupPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Protected App Layout
const AppLayout: React.FC = () => {
  const { user, isDemoMode, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FFFDF5] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#FFE600] border-3 border-black flex items-center justify-center text-3xl shadow-neo animate-bounce">
            🪙
          </div>
          <p className="font-black text-sm text-black">Hisaab Load Ho Raha Hai...</p>
        </div>
      </div>
    );
  }

  // If not logged in and not in demo mode, redirect to login
  if (!user && !isDemoMode) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#FFFDF5] text-black flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <Routes>
            {/* Public Marketing & Auth routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Authenticated / Demo App routes */}
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/groups" element={<GroupsPage />} />
              <Route path="/groups/new" element={<CreateGroupPage />} />
              <Route path="/groups/:id" element={<GroupDetailPage />} />
              <Route path="/expenses/new" element={<AddExpensePage />} />
              <Route path="/expenses/:id" element={<ExpenseDetailPage />} />
              <Route path="/balances" element={<BalancesPage />} />
              <Route path="/activity" element={<ActivityPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/join/:groupId" element={<JoinGroupPage />} />
            </Route>

            {/* 404 Fallback */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
