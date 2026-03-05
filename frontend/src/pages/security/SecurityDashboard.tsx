import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { motion } from 'framer-motion';
import { ShieldCheck, UserCheck, History, MapPin, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const SecurityDashboard: React.FC = () => {
    const { user } = useAuth();
    const [onDuty, setOnDuty] = useState(false);
    const [stats, setStats] = useState({ todayVerified: 0, currentInBuilding: 0 });
    const [recentActivity, setRecentActivity] = useState<any[]>([]);

    useEffect(() => {
        const fetchDutyStatus = async () => {
            try {
                const res = await api.get('/api/security/duty/status');
                setOnDuty(res.data.onDuty);
            } catch (err) {
                console.error("Error fetching duty status:", err);
            }
        };

        const fetchStats = async () => {
            try {
                const res = await api.get('/api/security/stats');
                setStats({
                    todayVerified: res.data.todayVerified,
                    currentInBuilding: res.data.currentInBuilding
                });
                setRecentActivity(res.data.recentActivity);
            } catch (err) {
                console.error("Error fetching stats:", err);
            }
        };

        fetchDutyStatus();
        fetchStats();
    }, []);

    const toggleDuty = async () => {
        try {
            const res = await api.post('/api/security/duty/toggle');
            setOnDuty(res.data.onDuty);
        } catch (err) {
            console.error("Error toggling duty status:", err);
        }
    };

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    const greeting = now.getHours() < 12 ? 'morning' : now.getHours() < 17 ? 'afternoon' : 'evening';
    const firstName = user?.name?.split(' ')[0] || 'Officer';

    return (
        <div
            className="flex min-h-screen font-['Plus_Jakarta_Sans',sans-serif]"
            style={{
                backgroundColor: '#f7f7f5',
                backgroundImage: `
                    radial-gradient(circle at 5% 10%, rgba(134,197,152,0.10) 0%, transparent 45%),
                    radial-gradient(circle at 95% 90%, rgba(134,197,152,0.07) 0%, transparent 45%)
                `
            }}
        >
            <Sidebar />

            <main className="flex-1 px-5 py-8 md:pl-20 md:pr-10 md:py-10 overflow-y-auto">

                {/* ── Header ── */}
                <motion.header
                    className="mb-8 flex flex-wrap items-start justify-between gap-4"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                    <div>
                        <p className="text-[0.72rem] font-medium text-gray-400 mb-1">{dateStr}</p>
                        <h1 className="text-[1.85rem] font-bold text-gray-900 tracking-tight leading-tight mb-1">
                            Good {greeting}, {firstName}.
                        </h1>
                        <p className="text-sm text-gray-400">Here's your shift overview for today.</p>
                    </div>

                    {/* Duty toggle */}
                    <button
                        onClick={toggleDuty}
                        className="flex items-center gap-3 px-5 py-3 rounded-2xl transition-all hover:-translate-y-0.5 active:translate-y-0"
                        style={onDuty ? {
                            background: 'rgba(76,175,110,0.08)',
                            border: '1px solid rgba(76,175,110,0.25)',
                        } : {
                            background: 'rgba(224,92,92,0.06)',
                            border: '1px solid rgba(224,92,92,0.2)',
                        }}
                    >
                        <span className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{
                                background: onDuty ? '#4caf6e' : '#e05c5c',
                                boxShadow: onDuty ? '0 0 6px #4caf6e' : '0 0 6px #e05c5c'
                            }} />
                        <div className="flex flex-col items-start">
                            <span className="text-[0.6rem] font-medium uppercase tracking-widest text-gray-400 leading-none mb-0.5">
                                Duty Status
                            </span>
                            <span className="text-sm font-bold leading-none"
                                style={{ color: onDuty ? '#4caf6e' : '#e05c5c' }}>
                                {onDuty ? 'On Duty' : 'Off Duty'}
                            </span>
                        </div>
                    </button>
                </motion.header>

                {/* ── Stat Cards ── */}
                <div className="grid grid-cols-1 gap-4 mb-5">
                    {[
                        { icon: UserCheck, label: 'Verified Today', value: stats.todayVerified, color: '#4caf6e', bg: 'rgba(76,175,110,0.08)', border: 'rgba(76,175,110,0.15)' },
                    ].map((card, i) => (
                        <motion.div
                            key={card.label}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.06 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                            className="bg-white rounded-[18px] p-6"
                            style={{ border: `1px solid ${card.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)' }}
                        >
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                                style={{ background: card.bg }}>
                                <card.icon size={18} style={{ color: card.color }} />
                            </div>
                            <p className="text-[0.68rem] font-semibold uppercase tracking-widest text-gray-400 mb-1">{card.label}</p>
                            <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                        </motion.div>
                    ))}
                </div>

                {/* ── Action Cards ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <Link
                            to="/security/verify"
                            className="flex flex-col justify-between h-[155px] rounded-[18px] p-6 group transition-all hover:-translate-y-1"
                            style={{
                                background: 'linear-gradient(135deg, #4caf6e, #5ec47f)',
                                boxShadow: '0 4px 20px rgba(76,175,110,0.28)'
                            }}
                        >
                            <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <ShieldCheck size={22} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white leading-tight">Verify Visitor</h3>
                                <p className="text-white/70 text-sm mt-0.5">Scan QR or enter code</p>
                            </div>
                        </Link>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <Link
                            to="/security/history"
                            className="flex flex-col justify-between h-[155px] rounded-[18px] p-6 bg-white group transition-all hover:-translate-y-1"
                            style={{
                                border: '1px solid rgba(0,0,0,0.04)',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)'
                            }}
                        >
                            <div className="w-11 h-11 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
                                style={{ background: 'rgba(76,175,110,0.08)' }}>
                                <History size={22} color="#4caf6e" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 leading-tight">Entry History</h3>
                                <p className="text-gray-400 text-sm mt-0.5">Browse past visitor logs</p>
                            </div>
                        </Link>
                    </motion.div>
                </div>

                {/* ── Recent Activity ── */}
                <motion.section
                    className="bg-white rounded-[18px] p-6"
                    style={{
                        border: '1px solid rgba(0,0,0,0.04)',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)'
                    }}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
                >
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-[0.65rem] font-semibold text-gray-400 uppercase tracking-widest">Recent Activity</p>
                        <button
                            onClick={() => {
                                // Re-trigger the stats fetch
                                const fetchStats = async () => {
                                    try {
                                        const res = await api.get('/api/security/stats');
                                        setStats({
                                            todayVerified: res.data.todayVerified,
                                            currentInBuilding: res.data.currentInBuilding
                                        });
                                        setRecentActivity(res.data.recentActivity);
                                    } catch (err) {
                                        console.error("Error fetching stats:", err);
                                    }
                                };
                                fetchStats();
                            }}
                            className="flex items-center gap-1.5 text-[0.72rem] font-semibold hover:opacity-70 transition-opacity"
                            style={{ color: '#4caf6e' }}>
                            <Activity size={12} /> Refresh
                        </button>
                    </div>
                    <div className="flex flex-col gap-2.5">
                        {recentActivity.length > 0 ? (
                            recentActivity.map((activity, i) => (
                                <div key={activity.id || i}
                                    className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100/60 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                                            style={{ background: 'rgba(76,175,110,0.1)' }}>
                                            <UserCheck size={15} color="#4caf6e" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800 leading-tight">
                                                {activity.visitCode} - {activity.residentName}
                                            </p>
                                            <p className="text-[0.68rem] text-gray-400 mt-0.5">
                                                Main entrance · {activity.verifiedAt ? new Date(activity.verifiedAt).toLocaleTimeString() : 'Just now'}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-[0.65rem] font-semibold px-2.5 py-1 rounded-full"
                                        style={{ background: 'rgba(76,175,110,0.08)', color: '#4caf6e' }}>
                                        Verified
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10">
                                <p className="text-sm text-gray-400">No activity logged yet today.</p>
                            </div>
                        )}
                    </div>
                </motion.section>

            </main>
        </div>
    );
};

export default SecurityDashboard;