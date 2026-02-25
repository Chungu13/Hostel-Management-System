import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOnboarding from './pages/admin/AdminOnboarding';
import ResidentManagement from './pages/admin/ResidentManagement';
import StaffManagement from './pages/admin/StaffManagement';
import ReportsPage from './pages/admin/ReportsPage';
import ProfilePage from './pages/admin/ProfilePage';

/**
 * ProtectedRoute — guards routes that require authentication.
 *
 * Rules:
 *  - No user in context  → redirect to /login
 *  - Role mismatch       → redirect to /login
 *  - Not onboarded + trying to reach /dashboard etc → redirect to /onboarding
 *  - Fully onboarded + trying to reach /onboarding  → redirect to /dashboard
 */
const ProtectedRoute = ({
    children,
    requireOnboarded = true,
}: {
    children: React.ReactNode;
    requireOnboarded?: boolean;
}) => {
    const { user } = useAuth();

    // 1. No session at all → login
    if (!user || !user.token) {
        return <Navigate to="/login" replace />;
    }

    // 2. Must be a Managing Staff user to access any admin route
    if (user.myRole !== 'Managing Staff') {
        return <Navigate to="/login" replace />;
    }

    // 3. Onboarding route: only accessible when NOT yet onboarded
    if (!requireOnboarded) {
        // This is the onboarding page itself
        if (user.isOnboarded) {
            // Already onboarded → skip to dashboard
            return <Navigate to="/dashboard" replace />;
        }
        return <>{children}</>;
    }

    // 4. All other protected routes: require onboarding to be complete
    if (!user.isOnboarded) {
        return <Navigate to="/onboarding" replace />;
    }

    return <>{children}</>;
};

import { ToastProvider } from './context/ToastContext';

function App() {
    return (
        <AuthProvider>
            <ToastProvider>
                <Router>
                    <Routes>
                        {/* Public routes */}
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />

                        {/* Onboarding — only for authenticated users who haven't onboarded yet */}
                        <Route path="/onboarding" element={
                            <ProtectedRoute requireOnboarded={false}>
                                <AdminOnboarding />
                            </ProtectedRoute>
                        } />

                        {/* Dashboard and sub-pages — require full onboarding */}
                        <Route path="/dashboard" element={
                            <ProtectedRoute>
                                <AdminDashboard />
                            </ProtectedRoute>
                        } />
                        <Route path="/residents" element={
                            <ProtectedRoute>
                                <ResidentManagement />
                            </ProtectedRoute>
                        } />
                        <Route path="/staff" element={
                            <ProtectedRoute>
                                <StaffManagement />
                            </ProtectedRoute>
                        } />
                        <Route path="/reports" element={
                            <ProtectedRoute>
                                <ReportsPage />
                            </ProtectedRoute>
                        } />
                        <Route path="/profile" element={
                            <ProtectedRoute>
                                <ProfilePage />
                            </ProtectedRoute>
                        } />

                        {/* Root redirect */}
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                </Router>
            </ToastProvider>
        </AuthProvider>
    );
}

export default App;
