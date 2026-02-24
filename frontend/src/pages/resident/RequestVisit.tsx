import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Calendar, MessageSquare, Key, ShieldCheck, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const RequestVisit: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        visitorName: '',
        visitorUsername: '',
        visitorPassword: '',
        visitDate: '',
        purpose: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/api/visits/request', {
                ...formData,
                residentId: user?.id
            });
            setSuccess(true);
            setFormData({ visitorName: '', visitorUsername: '', visitorPassword: '', visitDate: '', purpose: '' });
        } catch (err) {
            console.error("Error submitting visit request:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex bg-slate-50 min-h-screen">
            <Sidebar />
            <main className="flex-1 p-10 ml-0 lg:ml-0 overflow-y-auto">
                {/* Header */}
                <motion.header
                    className="mb-10"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-primary text-[10px] font-bold uppercase tracking-widest mb-4">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                        Visit Management
                    </div>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Request a Visit</h1>
                    <p className="text-slate-400 font-medium mt-1">Generate credentials for your guest to access the hostel</p>
                </motion.header>

                {/* Form Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="max-w-3xl bg-white rounded-3xl p-10 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary to-emerald-400" />

                    <AnimatePresence mode="wait">
                        {!success ? (
                            <motion.form
                                key="form"
                                onSubmit={handleSubmit}
                                className="space-y-10"
                                exit={{ opacity: 0, x: 20 }}
                            >
                                {/* Section 1: Visitor Identity */}
                                <div>
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="h-px bg-slate-100 flex-1" />
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Visitor Identity</span>
                                        <div className="h-px bg-slate-100 flex-1" />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">Full Name</label>
                                            <div className="relative">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                                <input
                                                    type="text"
                                                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 outline-none transition-all focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 placeholder:text-slate-300 font-medium"
                                                    placeholder="e.g. Jane Smith"
                                                    value={formData.visitorName}
                                                    onChange={(e) => setFormData({ ...formData, visitorName: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">Planned Date</label>
                                            <div className="relative">
                                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                                <input
                                                    type="date"
                                                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 outline-none transition-all focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 font-medium"
                                                    value={formData.visitDate}
                                                    onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 2: Guest Credentials */}
                                <div>
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="h-px bg-slate-100 flex-1" />
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Security Credentials</span>
                                        <div className="h-px bg-slate-100 flex-1" />
                                    </div>

                                    <div className="bg-slate-50 border border-slate-100 rounded-3xl p-8 space-y-6">
                                        <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm mb-2">
                                            <ShieldCheck size={18} />
                                            Guest Self-Verification Profile
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">Guest Username</label>
                                                <input
                                                    type="text"
                                                    className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-900 outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/5 font-bold"
                                                    placeholder="Create a guest ID"
                                                    value={formData.visitorUsername}
                                                    onChange={(e) => setFormData({ ...formData, visitorUsername: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">Access PIN</label>
                                                <div className="relative">
                                                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                                    <input
                                                        type="password"
                                                        className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-900 outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/5 font-bold tracking-widest"
                                                        placeholder="••••"
                                                        value={formData.visitorPassword}
                                                        onChange={(e) => setFormData({ ...formData, visitorPassword: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 3: Visit Details */}
                                <div>
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="h-px bg-slate-100 flex-1" />
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Additional Details</span>
                                        <div className="h-px bg-slate-100 flex-1" />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">Purpose of Visit</label>
                                        <div className="relative">
                                            <MessageSquare className="absolute left-4 top-4 text-slate-400 w-4 h-4" />
                                            <textarea
                                                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 outline-none transition-all focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 placeholder:text-slate-300 font-medium min-h-[120px]"
                                                placeholder="Please briefly describe the reason for the visit..."
                                                value={formData.purpose}
                                                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4.5 bg-primary text-white font-extrabold rounded-2xl shadow-xl shadow-primary/25 hover:bg-primary-hover hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                                    {loading ? 'Submitting Request...' : 'Issue Access Pass'}
                                </button>
                            </motion.form>
                        ) : (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center text-center py-12"
                            >
                                <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center border-4 border-emerald-100 mb-8">
                                    <CheckCircle2 size={48} className="text-emerald-500" />
                                </div>
                                <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Request Successful!</h2>
                                <p className="text-slate-400 font-medium max-w-sm mx-auto mb-10 leading-relaxed">
                                    Your visit request has been logged. Please share the <span className="text-slate-900 font-bold">username and PIN</span> with your guest for entry.
                                </p>
                                <button
                                    className="px-8 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                                    onClick={() => setSuccess(false)}
                                >
                                    Submit Another Request
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </main>
        </div>
    );
};

export default RequestVisit;
