import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { LandingPage } from '@/pages/LandingPage';
import { AuthPage } from '@/pages/AuthPage';
import { OnboardingPage } from '@/pages/OnboardingPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { LogPage } from '@/pages/LogPage';
import { InsightsPage } from '@/pages/InsightsPage';
import { AlertsPage } from '@/pages/AlertsPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { AboutPage } from '@/pages/AboutPage';

function ProtectedRoute({ children, needsProfile = true }: { children: React.ReactNode; needsProfile?: boolean }) {
  const { session, profile, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-neutral-50 flex items-center justify-center"><div className="w-8 h-8 rounded-full border-4 border-primary-200 border-t-primary-600 animate-spin" /></div>;
  if (!session) return <Navigate to="/auth" replace />;
  if (needsProfile && !profile) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/auth" element={<AuthPage />} />
    <Route path="/about" element={<AboutPage />} />
    <Route path="/onboarding" element={<ProtectedRoute needsProfile={false}><OnboardingPage /></ProtectedRoute>} />
    <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
    <Route path="/log" element={<ProtectedRoute><LogPage /></ProtectedRoute>} />
    <Route path="/insights" element={<ProtectedRoute><InsightsPage /></ProtectedRoute>} />
    <Route path="/alerts" element={<ProtectedRoute><AlertsPage /></ProtectedRoute>} />
    <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>;
}

export default function App() {
  return (
    <AuthProvider>
      <div className="app-bg-backdrop" aria-hidden="true" />
      <div className="app-bg-overlay" aria-hidden="true" />
      <AppRoutes />
    </AuthProvider>
  );
}
