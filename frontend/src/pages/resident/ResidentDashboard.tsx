import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { motion } from 'framer-motion';
import {
    Clock,
    CheckCircle2,
    AlertCircle,
    Calendar,
    PlusCircle,
    History as HistoryIcon,
    ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

interface Visit {
    status: string;
    visitDate: string;
}

const ResidentDashboard: React.FC = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        pending: 0,
        approved: 0,
        upcoming: null as Visit | null
    });

    useEffect(() => {
        const fetchResidentStats = async () => {
            if (!user?.id) return;
            try {
                const response = await api.get(`/api/visits/history/${user.id}`);
                const visits: Visit[] = response.data;
                setStats({
                    pending: visits.filter(v => v.status === 'Pending').length,
                    approved: visits.filter(v => v.status === 'Approved').length,
                    upcoming: visits.find(v => v.status === 'Approved') || null
                });
            } catch (err) {
                console.error("Error fetching resident stats:", err);
            }
        };
        fetchResidentStats();
    }, [user?.id]);

    return (
        <div className="flex bg-bg-light min-h-screen">
            <Sidebar />
            <main className="flex-1 p-10 ml-0 lg:ml-0">
                {/* Header */}
                <motion.header
                    className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div>
                        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                            Hello, <span className="text-primary">{user?.name}</span>!
                        </h1>
                        <p className="text-slate-400 font-medium mt-1">Ready to manage your visitor access today?</p>
                    </div>
                    <div className="bg-white border border-slate-100 rounded-2xl px-5 py-2.5 flex items-center gap-3 shadow-sm self-start">
                        <Calendar size={18} className="text-primary" />
                        <span className="text-sm font-bold text-slate-600">
                            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                    </div>
                </motion.header>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm relative overflow-hidden group"
                    >
                        <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Clock size={24} className="text-amber-500" />
                        </div>
                        <div className="text-4xl font-extrabold text-slate-900 mb-1">{stats.pending}</div>
                        <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Pending Requests</div>
                        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-amber-500 rounded-b-3xl opacity-20" />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm relative overflow-hidden group"
                    >
                        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <CheckCircle2 size={24} className="text-emerald-500" />
                        </div>
                        <div className="text-4xl font-extrabold text-slate-900 mb-1">{stats.approved}</div>
                        <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Active Passes</div>
                        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-emerald-500 rounded-b-3xl opacity-20" />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm relative overflow-hidden group"
                    >
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Calendar size={24} className="text-blue-500" />
                        </div>
                        <div className="text-xl font-extrabold text-slate-900 mb-1 h-10 flex items-center">
                            {stats.upcoming ? stats.upcoming.visitDate : 'No Upcoming'}
                        </div>
                        <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Next Guest Visit</div>
                        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-blue-500 rounded-b-3xl opacity-20" />
                    </motion.div>
                </div>

                {/* Bottom Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Quick Tools */}
                    <section className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                        <h2 className="text-xl font-extrabold text-slate-900 mb-8 flex items-center gap-2">
                            Quick Operations
                        </h2>

                        <div className="space-y-4">
                            <Link to="/resident/visit-request" className="flex items-center gap-5 p-5 bg-primary rounded-2xl text-white shadow-lg shadow-primary/20 hover:-translate-y-1 transition-all group">
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                    <PlusCircle size={24} />
                                </div>
                                <div className="flex-1">
                                    <div className="font-extrabold text-lg">New Visit Pass</div>
                                    <div className="text-sm text-white/80">Register a guest for entry</div>
                                </div>
                                <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                            </Link>

                            <Link to="/resident/history" className="flex items-center gap-5 p-5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 hover:bg-slate-100 transition-all group">
                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                    <HistoryIcon size={24} />
                                </div>
                                <div className="flex-1">
                                    <div className="font-extrabold text-lg">Past Records</div>
                                    <div className="text-sm text-slate-400 font-medium">Review your visitor logs</div>
                                </div>
                                <ArrowRight size={20} className="text-slate-300 group-hover:translate-x-2 transition-transform" />
                            </Link>
                        </div>
                    </section>

                    {/* Notice */}
                    <section className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col">
                        <h2 className="text-xl font-extrabold text-slate-900 mb-8 flex items-center gap-3">
                            <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                                <AlertCircle size={18} className="text-amber-500" />
                            </div>
                            Resident Notice
                        </h2>

                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 flex-1">
                            <p className="text-slate-600 leading-relaxed font-medium">
                                Please ensure your guests have their <strong className="text-slate-900">Access PIN</strong> ready for the security staff upon arrival.
                                Unverified visitors will not be permitted entry into the residential area.
                            </p>
                            <div className="mt-8 pt-6 border-t border-slate-200 flex items-center gap-3 text-sm font-bold text-slate-300 uppercase tracking-widest">
                                <Clock size={16} /> Updated today at 9:00 AM
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default ResidentDashboard;
