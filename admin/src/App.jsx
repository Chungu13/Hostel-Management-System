import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import AdminOnboarding from './pages/admin/AdminOnboarding';
import AdminDashboard from './pages/admin/AdminDashboard';
import ResidentManagement from './pages/admin/ResidentManagement';
import StaffManagement from './pages/admin/StaffManagement';
import ReportsPage from './pages/admin/ReportsPage';
import ProfilePage from './pages/admin/ProfilePage';
import { useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children, allowedRole = 'Managing Staff' }) => {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" />;
    if (user.myRole !== allowedRole) return <Navigate to="/login" />;
    return children;
};

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                <Route path="/admin-onboarding" element={
                    <ProtectedRoute>
                        <AdminOnboarding />
                    </ProtectedRoute>
                } />

                <Route path="/admin" element={
                    <ProtectedRoute>
                        <AdminDashboard />
                    </ProtectedRoute>
                } />
                <Route path="/admin/residents" element={
                    <ProtectedRoute>
                        <ResidentManagement />
                    </ProtectedRoute>
                } />
                <Route path="/admin/staff" element={
                    <ProtectedRoute>
                        <StaffManagement />
                    </ProtectedRoute>
                } />
                <Route path="/admin/reports" element={
                    <ProtectedRoute>
                        <ReportsPage />
                    </ProtectedRoute>
                } />
                <Route path="/profile" element={
                    <ProtectedRoute>
                        <ProfilePage />
                    </ProtectedRoute>
                } />

                <Route path="/" element={<Navigate to="/admin" />} />
            </Routes>
        </Router>
    );
}

export default App;
