import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Lock, Mail, Check, Loader2, ArrowLeft } from 'lucide-react';
import api from '../../utils/api';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';

const RegisterPage: React.FC = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        role: 'Resident'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError("Security PINs do not match.");
            return;
        }
        setLoading(true);
        setError('');
        try {
            const response = await api.post('/api/auth/register', {
                email: formData.email,
                password: formData.password,
                role: formData.role
            });
            if (response.data) {
                login(response.data);
                setSuccess(true);
                setTimeout(() => {
                    navigate('/onboarding');
                }, 2500);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Enrollment failed. This email may already be registered.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse: any) => {
        try {
            setLoading(true);
            const response = await api.post('/api/auth/google', {
                token: credentialResponse.credential,
                role: formData.role // Pass the selected role for new signups
            });
            if (response.data) {
                login(response.data);
                if (response.data.needsOnboarding && response.data.myRole === 'Resident') {
                    navigate('/onboarding');
                } else {
                    const role = response.data.myRole;
                    if (role === 'Resident') {
                        navigate('/resident');
                    } else if (role === 'Security Staff' || role === 'Security') {
                        navigate('/security');
                    } else {
                        setError('Access denied. Please use the appropriate portal for your role.');
                        setLoading(false);
                    }
                }
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Google authentication failed. Please try traditional enrollment.');
        } finally {
            setLoading(false);
        }
    };

    const inputClass = `
        w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl
        text-gray-900 text-sm font-medium outline-none transition-all
        placeholder:text-gray-300
        focus:bg-white focus:border-green-400 focus:ring-4 focus:ring-green-400/10
    `;

    return (
        <div
            className="min-h-screen flex items-center justify-center p-6 font-sans bg-[#f7f7f5] [background-image:radial-gradient(circle_at_10%_20%,rgba(134,197,152,0.12)_0%,transparent_50%),radial-gradient(circle_at_90%_80%,rgba(134,197,152,0.08)_0%,transparent_50%)]"
        >
            <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-[460px] bg-white rounded-[1.5rem] relative overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_32px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.04)]"
            >
                {/* Green top bar */}
                <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[1.5rem] bg-gradient-to-r from-[#4caf6e] to-[#81c995]" />




                <div className="p-10 pt-11">

                    {/* Brand */}
                    <div className="flex items-center gap-2.5 mb-8">
                        <div className="w-9 h-9 rounded-[10px] flex items-center justify-center text-white font-bold text-base flex-shrink-0 bg-gradient-to-br from-[#4caf6e] to-[#81c995] shadow-[0_2px_8px_rgba(76,175,110,0.28)]">
                            M
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <span className="font-bold text-gray-900 text-[1.15rem] leading-none tracking-tight">Malo</span>

                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {!success ? (
                            <motion.div
                                key="form"
                                initial={{ opacity: 0, x: -12 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 12 }}
                                transition={{ duration: 0.3 }}
                            >


                                <h1 className="text-[1.85rem] font-bold text-gray-900 tracking-tight leading-snug mb-1.5">
                                    Create Account
                                </h1>


                                <form onSubmit={handleSubmit} className="flex flex-col gap-5">


                                    {/* Email */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[0.72rem] font-medium text-gray-500 uppercase tracking-wider">
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
                                            <input
                                                type="email"
                                                className={inputClass}
                                                placeholder="you@email.com"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Passwords */}
                                    <div className="flex flex-col gap-5">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[0.72rem] font-medium text-gray-500 uppercase tracking-wider">
                                                Password
                                            </label>
                                            <div className="relative">
                                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
                                                <input
                                                    type="password"
                                                    className={inputClass}
                                                    placeholder="••••••••"
                                                    value={formData.password}
                                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[0.72rem] font-medium text-gray-500 uppercase tracking-wider">
                                                Confirm Password
                                            </label>
                                            <div className="relative">
                                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
                                                <input
                                                    type="password"
                                                    className={inputClass}
                                                    placeholder="••••••••"
                                                    value={formData.confirmPassword}
                                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Error */}
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-3.5 bg-red-50 border border-red-100 rounded-xl text-red-500 text-sm font-medium flex items-center gap-2"
                                        >
                                            <span>✕</span> {error}
                                        </motion.div>
                                    )}

                                    {/* Submit */}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-3.5 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0 mt-1 bg-gradient-to-br from-[#4caf6e] to-[#5ec47f] shadow-[0_4px_16px_rgba(76,175,110,0.28)]"
                                    >
                                        {loading
                                            ? <Loader2 size={17} className="animate-spin" />
                                            : <UserPlus size={17} />
                                        }
                                        {loading ? 'Creating Account...' : 'Create Account'}
                                    </button>
                                </form>

                                {/* Divider */}
                                <div className="flex items-center gap-3 my-6">
                                    <div className="flex-1 h-px bg-gray-100" />
                                    <span className="text-[0.68rem] text-gray-300 font-medium uppercase tracking-widest">or continue with</span>
                                    <div className="flex-1 h-px bg-gray-100" />
                                </div>

                                <div className="flex justify-center">
                                    <GoogleLogin
                                        onSuccess={handleGoogleSuccess}
                                        onError={() => setError('Google enrollment failed.')}
                                        use_fedcm_for_prompt={false}
                                        theme="outline"
                                        shape="pill"
                                        size="large"
                                        text="signup_with"
                                    />
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                                className="flex flex-col items-center text-center py-10"
                            >
                                <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 bg-[#4caf6e]/[0.08] border-2 border-[#4caf6e]/20">
                                    <Check size={34} color="#4caf6e" strokeWidth={2.5} />
                                </div>
                                <h2 className="text-[1.5rem] font-bold text-gray-900 tracking-tight mb-2">
                                    Registration Successful
                                </h2>
                                <p className="text-sm text-gray-400 max-w-[260px] leading-relaxed">
                                    Your account has been established. Redirecting to onboarding…
                                </p>
                                <div className="mt-8 flex gap-1.5 justify-center">
                                    {[0, 150, 300].map((delay) => (
                                        <div
                                            key={delay}
                                            className="w-1.5 h-1.5 rounded-full bg-green-400 animate-bounce"
                                            style={{ animationDelay: `${delay}ms` }}
                                        />
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Footer */}
                    <p className="text-center text-sm text-gray-400 mt-8">
                        Returning resident?{' '}
                        <Link to="/login" className="text-green-500 font-semibold hover:text-green-600 hover:underline transition-colors">
                            Sign in to your account
                        </Link>
                    </p>

                </div>
            </motion.div>
        </div>
    );
};

export default RegisterPage;