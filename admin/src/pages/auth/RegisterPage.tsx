import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Lock, Mail, Check, Loader2, ShieldCheck } from 'lucide-react';
import api from '../../utils/api';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';

type RegisterFormData = {
    email: string;
    password: string;
    confirmPassword: string;
};

const RegisterPage: React.FC = () => {
    const [formData, setFormData] = useState<RegisterFormData>({
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<boolean>(false);

    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await api.post('/api/auth/register', {
                email: formData.email,
                password: formData.password,
                role: 'Managing Staff'
            });

            const data = response.data;
            if (data) {
                setSuccess(true);
                setTimeout(() => {
                    // Server returns isOnboarded:false + token for a fresh account
                    login(data);
                    navigate('/onboarding');
                }, 1500);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
        try {
            setLoading(true);
            const response = await api.post('/api/auth/google', {
                token: credentialResponse.credential,
                role: 'Managing Staff'
            });

            const data = response.data;
            if (data) {
                login(data);
                // Respect the server's answer: only go to onboarding if NOT yet onboarded
                if (data.isOnboarded) {
                    navigate('/dashboard');
                } else {
                    navigate('/onboarding');
                }
            }
        } catch (err) {
            setError('Google registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex font-['Plus_Jakarta_Sans'] bg-[#f7f7f5]">
            {/* Left Panel */}
            <div className="hidden lg:flex w-[420px] shrink-0 bg-white border-r border-[#ebebea] flex-col justify-between px-11 py-12 relative overflow-hidden">
                {/* subtle green glow */}
                <div className="pointer-events-none absolute -top-20 -right-20 h-[260px] w-[260px] rounded-full bg-emerald-500/10 blur-2xl" />

                <div>
                    {/* Brand */}
                    <div className="flex items-center gap-3 mb-16">
                        <div className="w-9 h-9 rounded-[10px] flex items-center justify-center text-white font-bold
                                        bg-gradient-to-br from-[#4caf6e] to-[#81c995]
                                        shadow-[0_2px_8px_rgba(76,175,110,0.28)]">
                            M
                        </div>
                        <div className="flex flex-col leading-none">
                            <span className="text-[1.2rem] font-bold text-[#1a1a1a] tracking-[-0.02em]">Malo</span>
                            <span className="text-[0.6rem] text-[#4caf6e] tracking-[0.12em] uppercase font-medium mt-1">
                                Admin Console
                            </span>
                        </div>
                    </div>

                    <h2 className="text-[2rem] font-bold text-[#111] tracking-[-0.04em] leading-[1.2] mb-4">
                        Your apartment, hostel, complex <br />your <span className="text-[#4caf6e]">control.</span>
                    </h2>

                    <p className="text-[0.855rem] text-[#aaa] leading-[1.7] max-w-[280px]">
                        Register your building and get instant access to resident management, visitor control, and reporting.
                    </p>

                    <div className="flex flex-col gap-3.5 mt-11">
                        {[
                            'Set up in minutes',
                            'Manage residents & staff',
                            'Control visitor access',
                            'Reports & analytics',
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-2.5 text-[0.82rem] text-[#888]">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#4caf6e] opacity-70" />
                                {item}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="text-[0.72rem] text-[#ccc] tracking-wide">
                    © {new Date().getFullYear()} Malo · Hostel Management
                </div>
            </div>

            {/* Right Side */}
            <div
                className="flex-1 flex items-center justify-center px-8 py-10 relative overflow-hidden
                           bg-[radial-gradient(circle_at_90%_10%,rgba(134,197,152,0.10)_0%,transparent_50%),radial-gradient(circle_at_10%_90%,rgba(134,197,152,0.07)_0%,transparent_50%)]"
            >
                <motion.div
                    className="w-full max-w-[400px] relative"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                    {/* Success overlay */}
                    <AnimatePresence>
                        {success && (
                            <motion.div
                                className="absolute inset-0 bg-white rounded-[20px] flex flex-col items-center justify-center gap-3 z-10 text-center p-10"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                            >
                                <div className="w-[72px] h-[72px] rounded-full flex items-center justify-center
                                                bg-gradient-to-br from-emerald-500/10 to-emerald-400/20
                                                border-2 border-emerald-500/20 mb-1">
                                    <Check size={32} color="#4caf6e" strokeWidth={2.5} />
                                </div>
                                <h3 className="text-[1.5rem] font-bold text-[#111] tracking-[-0.02em]">
                                    Registration Successful
                                </h3>
                                <p className="text-sm text-[#888] leading-relaxed">
                                    Setting up your manager profile…
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Mobile brand */}
                    <div className="flex items-center gap-3 mb-9 lg:hidden">
                        <div className="w-[34px] h-[34px] rounded-[9px] flex items-center justify-center text-white font-bold
                                        bg-gradient-to-br from-[#4caf6e] to-[#81c995]
                                        shadow-[0_2px_8px_rgba(76,175,110,0.28)]">
                            M
                        </div>
                        <span className="text-[1.15rem] font-bold text-[#1a1a1a] tracking-[-0.02em]">Malo</span>
                    </div>

                    {/* Badge */}
                    <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20
                                    text-[#4caf6e] text-[0.7rem] font-semibold tracking-widest uppercase
                                    px-3 py-1 rounded-full mb-2.5">
                        <ShieldCheck size={11} />
                        Manager Registration
                    </div>

                    <h2 className="text-[1.85rem] font-bold text-[#111] tracking-[-0.03em] leading-tight mb-1.5">
                        Register Building
                    </h2>
                    <p className="text-[0.875rem] text-[#888] mb-8">
                        Join Malo as a property manager
                    </p>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="flex flex-col gap-[18px]">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[0.78rem] font-medium text-[#555] tracking-widest uppercase">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#bbb] w-4 h-4 pointer-events-none" />
                                <input
                                    type="email"
                                    className="w-full py-3 px-3.5 pl-10 text-[0.9rem] text-[#111]
                                               bg-[#f9f9f8] border border-[#e8e8e6] rounded-xl outline-none
                                               transition focus:border-[#4caf6e] focus:bg-white
                                               focus:ring-4 focus:ring-emerald-500/10 placeholder:text-[#c8c8c5]"
                                    placeholder="admin@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-[0.78rem] font-medium text-[#555] tracking-widest uppercase">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#bbb] w-4 h-4 pointer-events-none" />
                                <input
                                    type="password"
                                    className="w-full py-3 px-3.5 pl-10 text-[0.9rem] text-[#111]
                                               bg-[#f9f9f8] border border-[#e8e8e6] rounded-xl outline-none
                                               transition focus:border-[#4caf6e] focus:bg-white
                                               focus:ring-4 focus:ring-emerald-500/10 placeholder:text-[#c8c8c5]"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-[0.78rem] font-medium text-[#555] tracking-widest uppercase">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#bbb] w-4 h-4 pointer-events-none" />
                                <input
                                    type="password"
                                    className="w-full py-3 px-3.5 pl-10 text-[0.9rem] text-[#111]
                                               bg-[#f9f9f8] border border-[#e8e8e6] rounded-xl outline-none
                                               transition focus:border-[#4caf6e] focus:bg-white
                                               focus:ring-4 focus:ring-emerald-500/10 placeholder:text-[#c8c8c5]"
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <motion.div
                                className="text-[0.82rem] text-[#e05c5c] text-center bg-[#fff5f5] border border-red-200 rounded-lg py-2.5 px-3.5"
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                {error}
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-1 flex items-center justify-center gap-2
                                       py-3.5 rounded-xl text-white text-[0.92rem] font-semibold tracking-wide
                                       bg-gradient-to-br from-[#4caf6e] to-[#5ec47f]
                                       shadow-[0_4px_16px_rgba(76,175,110,0.25)]
                                       transition hover:opacity-95 hover:-translate-y-[1px]
                                       hover:shadow-[0_6px_20px_rgba(76,175,110,0.30)]
                                       disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                        >
                            {loading ? <Loader2 size={17} className="animate-spin" /> : <UserPlus size={17} />}
                            {loading ? 'Creating Account…' : 'Register as Manager'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-3.5 my-6">
                        <div className="flex-1 h-px bg-[#ebebea]" />
                        <span className="text-[0.75rem] text-[#bbb] tracking-wide whitespace-nowrap">
                            or continue with
                        </span>
                        <div className="flex-1 h-px bg-[#ebebea]" />
                    </div>

                    <div className="flex justify-center">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => setError('Google Registration Failed')}
                            theme="outline"
                            shape="pill"
                            size="large"
                            use_fedcm_for_prompt={true}
                        />
                    </div>

                    <div className="text-center mt-7 text-[0.85rem] text-[#999]">
                        Already have a manager account?{' '}
                        <Link to="/login" className="text-[#4caf6e] font-medium hover:underline">
                            Sign in
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default RegisterPage;