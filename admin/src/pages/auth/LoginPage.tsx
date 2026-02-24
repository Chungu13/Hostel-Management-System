import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, Lock, Loader2, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';

type AuthResponse = {
    id?: string | number;
    myRole: string;
    email?: string;
    name?: string;
    propertyId?: string | number;
    isOnboarded: boolean;
    token: string;  // JWT returned by the backend on every auth call
    [key: string]: any;
};

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await api.post<AuthResponse>('/api/auth/login', {
                email,
                password
            });

            const data = response.data;

            if (data) {
                // Block non-admins from this portal
                if (data.myRole !== 'Managing Staff') {
                    setError('Access denied. This portal is for managers only.');
                    setLoading(false);
                    return;
                }

                login(data);

                // Server drives the routing decision — never force onboarding from login
                if (data.isOnboarded) {
                    navigate('/dashboard');
                } else {
                    navigate('/onboarding');
                }
            }
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
        try {
            setLoading(true);
            const response = await api.post<AuthResponse>('/api/auth/google', {
                token: credentialResponse.credential,
                role: 'Managing Staff'
            });
            console.log('Google Auth Response:', response.data);

            const data = response.data;

            if (data) {
                if (data.myRole !== 'Managing Staff') {
                    setError('Access denied. This portal is for managers only.');
                    setLoading(false);
                    return;
                }

                login(data);

                if (data.isOnboarded) {
                    navigate('/dashboard');
                } else {
                    navigate('/onboarding');
                }
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Google sign-in failed. Please try again.');
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
                        <div
                            className="w-9 h-9 rounded-[10px] flex items-center justify-center text-white font-bold
                                        bg-gradient-to-br from-[#4caf6e] to-[#81c995]
                                        shadow-[0_2px_8px_rgba(76,175,110,0.28)]"
                        >
                            M
                        </div>
                        <div className="flex flex-col leading-none">
                            <span className="text-[1.2rem] font-bold text-[#1a1a1a] tracking-[-0.02em]">Malo</span>
                            <span className="text-[0.6rem] text-[#4caf6e] tracking-[0.12em] uppercase font-medium mt-1">
                                Admin Console
                            </span>
                        </div>
                    </div>

                    {/* Headline */}
                    <h2 className="text-[2rem] font-bold text-[#111] tracking-[-0.04em] leading-[1.2] mb-4">
                        Manage your<br />hostel <span className="text-[#4caf6e]">smarter.</span>
                    </h2>

                    <p className="text-[0.855rem] text-[#aaa] leading-[1.7] max-w-[280px]">
                        Full control over residents, visitor passes, staff, and reports — all in one place.
                    </p>

                    {/* Feature list */}
                    <div className="flex flex-col gap-3.5 mt-11">
                        {[
                            'Resident management',
                            'Visitor access control',
                            'Staff oversight',
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
                    className="w-full max-w-[380px]"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                    {/* Mobile brand */}
                    <div className="flex items-center gap-3 mb-9 lg:hidden">
                        <div
                            className="w-[34px] h-[34px] rounded-[9px] flex items-center justify-center text-white font-bold
                                        bg-gradient-to-br from-[#4caf6e] to-[#81c995]
                                        shadow-[0_2px_8px_rgba(76,175,110,0.28)]"
                        >
                            M
                        </div>
                        <span className="text-[1.15rem] font-bold text-[#1a1a1a] tracking-[-0.02em]">Malo</span>
                    </div>

                    {/* Badge */}
                    <div
                        className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20
                                    text-[#4caf6e] text-[0.7rem] font-semibold tracking-widest uppercase
                                    px-3 py-1 rounded-full mb-2.5"
                    >
                        <ShieldCheck size={11} />
                        Admin Access Only
                    </div>

                    <h2 className="text-[1.85rem] font-bold text-[#111] tracking-[-0.03em] leading-tight mb-1.5">
                        Admin Login
                    </h2>
                    <p className="text-[0.875rem] text-[#888] mb-8">
                        Access your management console
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
                                    value={email}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
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
                                    value={password}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
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
                            {loading ? <Loader2 size={17} className="animate-spin" /> : <LogIn size={17} />}
                            {loading ? 'Authenticating…' : 'Sign In'}
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
                            onError={() => setError('Google login failed')}
                            theme="outline"
                            shape="pill"
                            size="large"
                            text="signin_with"
                            auto_select={false}
                            use_fedcm_for_prompt={false}
                        />
                    </div>

                    <div className="text-center mt-7 text-[0.85rem] text-[#999]">
                        Need an admin account?{' '}
                        <Link to="/register" className="text-[#4caf6e] font-medium hover:underline">
                            Register building
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default LoginPage;