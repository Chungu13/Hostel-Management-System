import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldCheck,
    User,
    Fingerprint,
    Search,
    CheckCircle,
    XCircle,
    Loader2,
    ClipboardCheck,
    ScanLine,
    ShieldAlert,
    ChevronLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const VerifyVisitor: React.FC = () => {
    const [credentials, setCredentials] = useState({
        residentName: '',
        visitorUsername: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string; data?: any } | null>(null);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);
        try {
            const response = await api.post('/api/security/verify', credentials);
            setResult({ success: true, message: response.data.message, data: response.data });
        } catch (err: any) {
            setResult({ success: false, message: err.response?.data?.message || 'Verification Failed' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex bg-slate-900 min-h-screen text-slate-100">
            <Sidebar />
            <main className="flex-1 p-8 ml-0 lg:ml-0 overflow-y-auto">
                <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
                    <div>
                        <Link to="/security" className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-widest mb-6 hover:translate-x-[-4px] transition-transform">
                            <ChevronLeft size={14} /> Back to Hub
                        </Link>
                        <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.3em] mb-3 leading-none">
                            <ScanLine size={14} className="animate-pulse" />
                            Identity Protocol S-4
                        </div>
                        <h1 className="text-4xl font-black tracking-tight text-white mb-1">
                            Visitor <span className="text-primary">Verification</span>
                        </h1>
                        <p className="text-slate-400 font-medium text-sm flex items-center gap-2">
                            Authorize guest access through secure multi-point verification.
                        </p>
                    </div>
                </header>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white/5 border border-white/10 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />

                        <form onSubmit={handleVerify} className="relative z-10 space-y-8">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-1.5 h-4 bg-primary rounded-full" />
                                    <h3 className="text-sm font-black text-slate-300 uppercase tracking-widest leading-none">Input Credentials</h3>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">Resident Host Identity</label>
                                    <div className="relative">
                                        <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                        <input
                                            type="text"
                                            className="w-full pl-14 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none transition-all focus:bg-white/10 focus:border-primary placeholder:text-slate-600 font-bold"
                                            placeholder="Host legal name"
                                            value={credentials.residentName}
                                            onChange={(e) => setCredentials({ ...credentials, residentName: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">Visitor Digital Alias</label>
                                    <div className="relative">
                                        <Fingerprint className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                        <input
                                            type="text"
                                            className="w-full pl-14 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none transition-all focus:bg-white/10 focus:border-primary font-mono font-bold"
                                            placeholder="@guest_username"
                                            value={credentials.visitorUsername}
                                            onChange={(e) => setCredentials({ ...credentials, visitorUsername: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">Access PIN / Secure Password</label>
                                    <div className="relative">
                                        <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                        <input
                                            type="password"
                                            className="w-full pl-14 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none transition-all focus:bg-white/10 focus:border-primary font-bold tracking-[0.3em]"
                                            placeholder="••••••••"
                                            value={credentials.password}
                                            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-5 bg-primary text-emerald-950 font-black rounded-2xl shadow-xl shadow-primary/10 hover:bg-primary-hover hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
                                {loading ? 'Analyzing Profile...' : 'Execute Verification'}
                            </button>
                        </form>
                    </motion.div>

                    <div className="space-y-8">
                        <AnimatePresence mode="wait">
                            {result ? (
                                <motion.div
                                    key={result.success ? 'success' : 'fail'}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className={`p-10 rounded-[3rem] border-2 shadow-2xl relative overflow-hidden flex flex-col items-center text-center ${result.success
                                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                                            : 'bg-red-500/10 border-red-500/30 text-red-500'
                                        }`}
                                >
                                    {result.success ? (
                                        <>
                                            <div className="w-20 h-20 bg-emerald-500/20 rounded-[2rem] flex items-center justify-center mb-6">
                                                <CheckCircle size={40} className="animate-pulse" />
                                            </div>
                                            <h2 className="text-3xl font-black tracking-tight mb-3">Clearance Granted</h2>
                                            <p className="text-emerald-400/80 font-bold mb-8 italic">"{result.message}"</p>
                                            <button className="w-full py-4 bg-emerald-500 text-emerald-950 font-black rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-lg shadow-emerald-500/20">
                                                <ClipboardCheck size={20} /> Establish Terminal Entry
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-20 h-20 bg-red-500/20 rounded-[2rem] flex items-center justify-center mb-6">
                                                <ShieldAlert size={40} className="animate-pulse" />
                                            </div>
                                            <h2 className="text-3xl font-black tracking-tight mb-3">Verification Failed</h2>
                                            <p className="text-red-400/80 font-bold italic mb-6">Reason: {result.message}</p>
                                            <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl w-full text-[10px] font-bold uppercase tracking-widest text-red-400/60 leading-relaxed italic">
                                                Alert: Manual ID review required. Do not authorize perimeter entry.
                                            </div>
                                        </>
                                    )}
                                </motion.div>
                            ) : (
                                <div className="p-10 rounded-[3rem] border border-white/10 bg-white/5 flex flex-col items-center justify-center text-center py-20 opacity-50">
                                    <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mb-6 border border-white/10">
                                        <ScanLine size={40} className="text-slate-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-400">Awaiting Profile Input</h3>
                                    <p className="text-xs text-slate-600 font-bold uppercase tracking-widest mt-2">Station Readiness: Optimal</p>
                                </div>
                            )}
                        </AnimatePresence>

                        <section className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8">
                            <h3 className="font-black text-xs text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <ShieldCheck size={16} className="text-primary" />
                                Security Instructions
                            </h3>
                            <ul className="space-y-6">
                                {[
                                    '1. Verify physical ID matches digital entry',
                                    '2. Capture host visual confirmation if via intercom',
                                    '3. Inspect all carry-on items and containers',
                                    '4. Log temperature and health status'
                                ].map((step, idx) => (
                                    <li key={idx} className="flex gap-4">
                                        <p className="text-xs font-bold text-slate-500 leading-relaxed">{step}</p>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default VerifyVisitor;
