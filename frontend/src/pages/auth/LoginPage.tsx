import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, Lock, Loader2, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';

type LoginResponse = {
    needsOnboarding?: boolean;
    myRole: string;
    // include any other fields your backend returns (token, user, propertyId, etc.)
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
            const response = await api.post<LoginResponse>('/api/auth/login', {
                email,
                password
            });

            if (response.data) {
                login(response.data);

                if (response.data.needsOnboarding) {
                    navigate('/onboarding');
                    return;
                }

                const role = response.data.myRole;
                if (role === 'Resident') {
                    navigate('/resident');
                } else if (role === 'Security Staff') {
                    navigate('/security');
                } else {
                    setError('Access denied. Please use the appropriate portal for your role.');
                    setLoading(false);
                }
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
        try {
            setLoading(true);

            const token = credentialResponse.credential;
            if (!token) {
                setError('Google sign-in failed. Please try again.');
                return;
            }

            const response = await api.post<LoginResponse>('/api/auth/google', {
                token
            });
            console.log('Google login response:', response.data);

            if (response.data) {
                login(response.data);

                if (response.data.needsOnboarding) {
                    navigate('/onboarding');
                } else {
                    const role = response.data.myRole;
                    if (role === 'Resident') {
                        navigate('/resident');
                    } else if (role === 'Security Staff') {
                        navigate('/security');
                    } else {
                        setError('Access denied. Please use the appropriate portal for your role.');
                        setLoading(false);
                    }
                }
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Google sign-in failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="
        min-h-screen flex items-center justify-center p-6
        bg-[#f7f7f5]
        [background-image:radial-gradient(circle_at_10%_20%,rgba(134,197,152,0.12)_0%,transparent_50%),radial-gradient(circle_at_90%_80%,rgba(134,197,152,0.08)_0%,transparent_50%)]
        font-sans
      "
        >
            <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="
          relative overflow-hidden w-full max-w-[420px]
          bg-white rounded-[24px] px-[44px] py-[48px]
          shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_32px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.04)]
        "
            >
                {/* Top gradient bar */}
                <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[24px] bg-gradient-to-r from-[#4caf6e] to-[#81c995]" />

                <div className="flex items-center gap-[10px] mb-9">
                    <div className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 bg-gradient-to-br from-[#4caf6e] to-[#81c995] shadow-[0_2px_8px_rgba(76,175,110,0.3)]">
                        <span className="text-white text-[1.05rem] leading-none tracking-[-0.02em]">M</span>
                    </div>

                    <div className="flex flex-col gap-[1px]">
                        <span className="text-[1.35rem] font-bold text-[#1a1a1a] tracking-[-0.02em] leading-none">
                            Malo
                        </span>
                        <span className="text-[0.62rem] text-[#4caf6e] tracking-[0.12em] uppercase font-medium">
                            Hostel Management
                        </span>
                    </div>
                </div>

                <h1 className="text-[1.85rem] font-bold text-[#111] leading-[1.2] tracking-[-0.02em] m-0 mb-[6px]">
                    Sign in
                </h1>
                <p className="text-[0.875rem] text-[#888] font-normal tracking-[0.01em] m-0 mb-8">
                    Manage your hostel profile
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-[18px]">
                    <div className="flex flex-col gap-[6px]">
                        <label className="text-[0.78rem] font-medium text-[#555] tracking-[0.06em] uppercase">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-[14px] top-1/2 -translate-y-1/2 text-[#bbb] w-4 h-4 pointer-events-none" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="
                  w-full box-border
                  pl-10 pr-[14px] py-3
                  text-[0.9rem] text-[#111]
                  bg-[#f9f9f8]
                  border-[1.5px] border-[#e8e8e6]
                  rounded-xl outline-none
                  transition-[border-color,background,box-shadow] duration-200
                  placeholder:text-[#c8c8c5]
                  focus:border-[#4caf6e] focus:bg-white focus:shadow-[0_0_0_3px_rgba(76,175,110,0.1)]
                "
                                placeholder="you@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-[6px]">
                        <label className="text-[0.78rem] font-medium text-[#555] tracking-[0.06em] uppercase">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-[14px] top-1/2 -translate-y-1/2 text-[#bbb] w-4 h-4 pointer-events-none" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="
                  w-full box-border
                  pl-10 pr-[14px] py-3
                  text-[0.9rem] text-[#111]
                  bg-[#f9f9f8]
                  border-[1.5px] border-[#e8e8e6]
                  rounded-xl outline-none
                  transition-[border-color,background,box-shadow] duration-200
                  placeholder:text-[#c8c8c5]
                  focus:border-[#4caf6e] focus:bg-white focus:shadow-[0_0_0_3px_rgba(76,175,110,0.1)]
                "
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <motion.p
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="
                text-[0.82rem] text-[#e05c5c] text-center
                bg-[#fff5f5] border border-[#ffdddd]
                rounded-lg px-[14px] py-[10px]
              "
                        >
                            {error}
                        </motion.p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="
              mt-1 w-full
              flex items-center justify-center gap-2
              px-4 py-[14px]
              text-[0.92rem] font-semibold text-white tracking-[0.02em]
              rounded-xl border-0 cursor-pointer
              bg-gradient-to-br from-[#4caf6e] to-[#5ec47f]
              shadow-[0_4px_16px_rgba(76,175,110,0.25)]
              transition-[opacity,transform,box-shadow] duration-200
              disabled:opacity-65 disabled:cursor-not-allowed
              hover:opacity-95 hover:-translate-y-[1px] hover:shadow-[0_6px_20px_rgba(76,175,110,0.3)]
              active:translate-y-0
            "
                    >
                        {loading ? <Loader2 size={17} className="animate-spin" /> : <LogIn size={17} />}
                        {loading ? 'Signing in…' : 'Sign In'}
                    </button>
                </form>

                <div className="flex items-center gap-[14px] my-6">
                    <div className="flex-1 h-px bg-[#ebebea]" />
                    <span className="text-[0.75rem] text-[#bbb] whitespace-nowrap font-normal tracking-[0.04em]">
                        or continue with
                    </span>
                    <div className="flex-1 h-px bg-[#ebebea]" />
                </div>

                <div className="flex justify-center">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => setError('Google sign-in failed')}
                        use_fedcm_for_prompt={false}
                        theme="outline"
                        shape="pill"
                        size="large"
                    />
                </div>

                <p className="text-center mt-7 text-[0.85rem] text-[#999]">
                    Don't have an account? <Link className="text-[#4caf6e] font-medium hover:text-[#3a9a5a] hover:underline" to="/register">Create one</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default LoginPage;