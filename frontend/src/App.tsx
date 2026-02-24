import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useLocation } from 'react-router-dom';

// Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ResidentDashboard from './pages/resident/ResidentDashboard';
import OnboardingPage from './pages/resident/OnboardingPage';
import RequestVisit from './pages/resident/RequestVisit';
import HistoryPage from './pages/resident/HistoryPage';
import ProfilePage from './pages/resident/ProfilePage';
import SecurityDashboard from './pages/security/SecurityDashboard';
import VerifyVisitor from './pages/security/VerifyVisitor';
import PendingApprovalPage from './pages/auth/PendingApprovalPage';

const ProtectedRoute = ({ children, allowedRole = 'Resident' }: { children: React.ReactNode, allowedRole?: string }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return <Navigate to="/login" />;

  // 1. Check Onboarding First
  if (user.myRole === 'Resident' && (user.needsOnboarding || user.isOnboarded === false)) {
    if (location.pathname === '/onboarding') {
      return <>{children}</>;
    }
    return <Navigate to="/onboarding" />;
  }

  // 2. Check if resident is approved
  if (user.myRole === 'Resident' && user.isApproved === false) {
    if (location.pathname === '/pending-approval') {
      return <>{children}</>;
    }
    return <Navigate to="/pending-approval" />;
  }

  // 2. Role based protection
  if (user.myRole !== allowedRole && !user.needsOnboarding) {
    return <Navigate to="/login" />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/pending-approval" element={
          <ProtectedRoute allowedRole="Resident">
            <PendingApprovalPage />
          </ProtectedRoute>
        } />

        {/* Resident Protected Routes */}
        <Route path="/" element={
          <ProtectedRoute allowedRole="Resident">
            <ResidentDashboard />
          </ProtectedRoute>
        } />
        <Route path="/onboarding" element={
          <ProtectedRoute allowedRole="Resident">
            <OnboardingPage />
          </ProtectedRoute>
        } />
        <Route path="/resident" element={<Navigate to="/" />} />
        <Route path="/resident/visit-request" element={
          <ProtectedRoute allowedRole="Resident">
            <RequestVisit />
          </ProtectedRoute>
        } />
        <Route path="/resident/history" element={
          <ProtectedRoute allowedRole="Resident">
            <HistoryPage />
          </ProtectedRoute>
        } />
        <Route path="/resident/profile" element={
          <ProtectedRoute allowedRole="Resident">
            <ProfilePage />
          </ProtectedRoute>
        } />

        {/* Security Protected Routes */}
        <Route path="/security" element={
          <ProtectedRoute allowedRole="Security Staff">
            <SecurityDashboard />
          </ProtectedRoute>
        } />
        <Route path="/security/verify" element={
          <ProtectedRoute allowedRole="Security Staff">
            <VerifyVisitor />
          </ProtectedRoute>
        } />
        <Route path="/security/history" element={
          <ProtectedRoute allowedRole="Security Staff">
            <HistoryPage />
          </ProtectedRoute>
        } />

        {/* Redirect others to login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
