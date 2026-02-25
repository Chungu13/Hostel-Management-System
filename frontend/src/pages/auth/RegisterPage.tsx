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
        confirmPassword: ''
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
                role: 'Resident'
            });

            if (response.data) {
                login(response.data);
                setSuccess(true);
                setTimeout(() => navigate('/onboarding'), 2500);
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
                token: credentialResponse.credential
            });

            if (response.data) {
                login(response.data);
                if (response.data.needsOnboarding) {
                    navigate('/onboarding');
                } else {
                    const role = response.data.myRole;
                    if (role === 'Resident') {
                        navigate('/');
                    } else if (role === 'Security Staff') {
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

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-emerald-500/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
                className="w-full max-w-[500px] bg-white rounded-[2.5rem] p-12 shadow-2xl shadow-slate-200/60 border border-slate-100 relative z-10"
            >
                {/* Back Link */}
                <Link to="/login" className="absolute top-12 right-12 text-slate-400 hover:text-primary transition-colors">
                    <ArrowLeft size={24} />
                </Link>

                {/* Brand */}
                <div className="flex items-center gap-3 mb-10">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/30">
                        M
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-900 text-xl leading-none tracking-tight">Malo</span>
                        <span className="text-[10px] text-primary uppercase tracking-widest font-extrabold">Resident Enrollment</span>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {!success ? (
                        <motion.div
                            key="registration-form"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
                            <div className="mb-10">
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Create Account</h1>
                                <p className="text-slate-400 font-medium">Join our secure residency community today.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 outline-none transition-all focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 placeholder:text-slate-300 font-medium"
                                            placeholder="you@residence.com"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">Security PIN</label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                            <input
                                                type="password"
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 outline-none transition-all focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 placeholder:text-slate-300 font-bold tracking-widest"
                                                placeholder="••••"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">Confirm PIN</label>
                                        <input
                                            type="password"
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 outline-none transition-all focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 placeholder:text-slate-300 font-bold tracking-widest"
                                            placeholder="••••"
                                            required
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-[13px] font-medium flex items-center gap-2"
                                    >
                                        <span className="text-lg">✕</span>
                                        {error}
                                    </motion.div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-slate-900 text-white font-extrabold rounded-2xl shadow-xl shadow-slate-200 hover:bg-slate-800 hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={18} /> : <UserPlus size={18} />}
                                    {loading ? 'Processing Enrollment...' : 'Register as Resident'}
                                </button>
                            </form>

                            <div className="my-10 flex items-center gap-4">
                                <div className="h-px bg-slate-100 flex-1" />
                                <span className="text-[10px] text-slate-300 font-bold uppercase tracking-[0.2em]">Fast Track</span>
                                <div className="h-px bg-slate-100 flex-1" />
                            </div>

                            <div className="flex justify-center">
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={() => setError('Google enrollment failed.')}
                                    theme="outline"
                                    shape="circle"
                                    size="large"
                                    width="100%"
                                    text="signup_with"
                                />
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="success-message"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center text-center py-10"
                        >
                            <div className="w-24 h-24 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center text-emerald-500 mb-8 border-4 border-emerald-100 shadow-inner">
                                <Check size={48} strokeWidth={3} />
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 mb-4">Registration Successful</h2>
                            <p className="text-slate-400 font-medium max-w-[280px]">
                                Your account has been established. Redirecting you to onboarding...
                            </p>
                            <div className="mt-8 flex gap-1 justify-center">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" />
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.15s]" />
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.3s]" />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="mt-12 text-center">
                    <p className="text-slate-400 text-sm font-medium">
                        Returning resident?{' '}
                        <Link to="/login" className="text-primary font-bold hover:underline">
                            Sign in to your account
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default RegisterPage;
