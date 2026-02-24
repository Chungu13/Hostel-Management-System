import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PendingApprovalPage: React.FC = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const [scanned, setScanned] = useState(false);

    useEffect(() => {
        // Just a little animation effect
        const timer = setTimeout(() => setScanned(true), 1500);
        return () => clearTimeout(timer);
    }, []);

    const handleBackToLogin = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-[#f7f7f5] flex items-center justify-center p-6 font-['Plus_Jakarta_Sans'] relative overflow-hidden">
            {/* Ambient Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-amber-500/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-emerald-500/5 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
                className="w-full max-w-[540px] bg-white rounded-[2.5rem] p-12 shadow-2xl shadow-slate-200/60 border border-slate-100 relative z-10 text-center"
            >
                {/* Status Icon Area */}
                <div className="mb-10 relative inline-flex">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="w-24 h-24 bg-amber-50 rounded-[2.5rem] flex items-center justify-center text-amber-500 border-4 border-amber-100 shadow-inner"
                    >
                        <Clock size={48} strokeWidth={2.5} className="animate-pulse" />
                    </motion.div>

                    {scanned && (
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="absolute -top-2 -right-2 bg-white rounded-xl p-1.5 shadow-lg border border-slate-50"
                        >
                            <ShieldAlert size={20} className="text-amber-500" />
                        </motion.div>
                    )}
                </div>

                {/* Text Content */}
                <div className="space-y-4 mb-12">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
                        Pending Security <br />
                        <span className="text-amber-500">Verification</span>
                    </h1>
                    <p className="text-slate-500 font-medium leading-relaxed max-w-[360px] mx-auto">
                        Your resident account for <span className="text-slate-900 font-bold">{user?.email}</span> has been established but requires administrative approval before dashboard access is granted.
                    </p>
                </div>

                {/* Instruction Box */}
                <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 mb-10 text-left relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-amber-500/5 to-transparent pointer-events-none" />
                    <div className="flex items-start gap-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                        <p className="text-[13px] text-slate-600 font-bold leading-relaxed lowercase tracking-tight">
                            our security policy requires all new tenants to be physically verified by the building management office. check your email for verification status updates.
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-4">
                    <button
                        onClick={handleBackToLogin}
                        className="w-full py-4 bg-slate-900 text-white font-extrabold rounded-2xl shadow-xl shadow-slate-200 hover:bg-slate-800 hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-2 group"
                    >
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        Return to Hub Access
                    </button>

                    <button
                        onClick={handleBackToLogin}
                        className="w-full py-3 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-red-500 transition-colors flex items-center justify-center gap-2"
                    >
                        <LogOut size={14} />
                        Terminate Session
                    </button>
                </div>

                {/* Support Link */}
                <div className="mt-12 pt-8 border-t border-slate-50">
                    <p className="text-[11px] text-slate-300 font-bold uppercase tracking-widest">
                        malo security infrastructure · v4.0.2
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default PendingApprovalPage;
