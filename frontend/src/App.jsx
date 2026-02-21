import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import RequestVisit from './pages/resident/RequestVisit';
import VerifyVisitor from './pages/security/VerifyVisitor';
import ProfilePage from './pages/shared/ProfilePage';
import VisitHistory from './pages/shared/VisitHistory';
import ResidentDashboard from './pages/resident/ResidentDashboard';
import SecurityDashboard from './pages/security/SecurityDashboard';
import OnboardingPage from './pages/resident/OnboardingPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />

          {/* Dashboards */}
          <Route path="/resident" element={<ResidentDashboard />} />
          <Route path="/security" element={<SecurityDashboard />} />

          {/* Visits */}
          <Route path="/resident/visit-request" element={<RequestVisit />} />
          <Route path="/resident/history" element={<VisitHistory />} />
          <Route path="/security/verify" element={<VerifyVisitor />} />
          <Route path="/security/history" element={<VisitHistory />} />

          {/* Profile */}
          <Route path="/profile" element={<ProfilePage />} />

          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
