import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { motion } from 'framer-motion';
import {
    Users, ShieldCheck, Clock, CheckCircle2,
    Calendar, ShieldAlert, UserPlus
} from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface DashboardStats {
    totalResidents: number;
    totalStaff: number;
    pendingVisits: number;
    todayVisitors: number;
    recentActivity?: any[];
}

const AdminDashboard: React.FC = () => {
    const { user, login } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState<DashboardStats>({
        totalResidents: 0,
        totalStaff: 0,
        pendingVisits: 0,
        todayVisitors: 0
    });
    const [securityOnDuty, setSecurityOnDuty] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!user?.propertyId) return;
            try {
                setLoading(true);
                const [statsRes, securityRes, profileRes] = await Promise.all([
                    api.get(`/api/dashboard/stats?propertyId=${user.propertyId}`),
                    api.get(`/api/security/on-duty/${user.propertyId}`),
                    api.get(`/api/profile/me`)
                ]);
                setStats(statsRes.data);
                setSecurityOnDuty(securityRes.data);
                if (profileRes.data.fullName && profileRes.data.fullName !== user.name) {
                    login({ ...user, name: profileRes.data.fullName });
                }
            } catch (err) {
                console.error("Error fetching data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const cards = [
        { label: 'Total Residents', value: stats.totalResidents, icon: Users, path: '/residents' },
        { label: 'Security Staff', value: stats.totalStaff, icon: ShieldCheck, path: '/staff' },
        { label: 'Pending Visit Requests', value: stats.pendingVisits, icon: ShieldAlert, path: '/history' },
        { label: 'Visits Today', value: stats.todayVisitors, icon: Clock, path: '/history' },
    ];

    const firstName = user?.name?.split(' ')[0] || 'Admin';
    const now = new Date();
    const greeting = now.getHours() < 12 ? 'morning' : now.getHours() < 17 ? 'afternoon' : 'evening';

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
                <motion.div
                    className="flex flex-wrap items-start justify-between gap-4 mb-8"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                    <div>

                        <h1 className="page-title">
                            Good {greeting}, {firstName}.
                        </h1>
                        <p className="page-subtitle">Here's what's happening at your property today.</p>
                    </div>
                    <div className="mt-1 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-[0.8rem] font-medium text-gray-500"
                        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                        <Calendar size={14} color="#4caf6e" />
                        {now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                </motion.div>

                {/* ── Stat Cards ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
                    {cards.map((card, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                            whileHover={{ y: -3 }}
                            onClick={() => navigate(card.path)}
                            className="bg-white rounded-[18px] p-5 cursor-pointer transition-all"
                            style={{
                                border: '1px solid rgba(0,0,0,0.04)',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)'
                            }}
                        >
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                                style={{ background: 'rgba(76,175,110,0.08)' }}>
                                <card.icon size={18} color="#4caf6e" />
                            </div>
                            <p className="text-[0.68rem] font-semibold uppercase tracking-widest text-gray-400 mb-1">
                                {card.label}
                            </p>
                            {loading
                                ? <div className="h-8 w-12 bg-gray-100 rounded-lg animate-pulse" />
                                : <p className="text-3xl font-bold text-gray-900 tracking-tight">{card.value}</p>
                            }
                        </motion.div>
                    ))}
                </div>

                {/* ── Quick Actions + Recent Activity ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">

                    {/* Quick Actions */}
                    <motion.section
                        className="bg-white rounded-[20px] p-6"
                        style={{ border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)' }}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <p className="section-label mb-4">Quick Actions</p>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { icon: UserPlus, label: 'Add Resident', path: '/residents' },
                                { icon: ShieldCheck, label: 'Register Staff', path: '/staff' },
                            ].map((btn) => (
                                <button
                                    key={btn.label}
                                    onClick={() => navigate(btn.path)}
                                    className="flex flex-col items-center justify-center gap-3 py-6 rounded-2xl border border-gray-100 bg-gray-50 hover:border-green-200 hover:bg-green-50/40 transition-all group"
                                >
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                                        style={{ background: 'rgba(76,175,110,0.08)' }}>
                                        <btn.icon size={18} color="#4caf6e" />
                                    </div>
                                    <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
                                        {btn.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </motion.section>

                    {/* Recent Activity */}
                    <motion.section
                        className="bg-white rounded-[20px] p-6"
                        style={{ border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)' }}
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.32, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <p className="section-label mb-4">Recent Activity</p>
                        {stats.recentActivity && stats.recentActivity.length > 0 ? (
                            <div className="flex flex-col gap-2">
                                {stats.recentActivity.map((activity: any, i: number) => (
                                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-gray-50 bg-gray-50/60 hover:bg-gray-50 transition-colors">
                                        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                                            style={{ background: 'rgba(76,175,110,0.08)' }}>
                                            <CheckCircle2 size={15} color="#4caf6e" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-800 leading-tight truncate">
                                                {activity.visitorName || 'Guest'} visited {activity.residentName}
                                            </p>
                                            <p className="text-[0.68rem] text-gray-400 mt-0.5">
                                                {new Date(activity.verifiedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {activity.visitCode}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                                    style={{ background: 'rgba(76,175,110,0.06)' }}>
                                    <CheckCircle2 size={18} color="#c8e6c9" />
                                </div>
                                <p className="text-sm text-gray-400">No recent activity yet.</p>
                            </div>
                        )}
                    </motion.section>
                </div>

                {/* ── On-Duty Security ── */}
                <motion.section
                    className="bg-white rounded-[20px] p-6"
                    style={{ border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)' }}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.36, ease: [0.22, 1, 0.36, 1] }}
                >
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-[0.65rem] font-semibold text-gray-400 uppercase tracking-widest">On-Duty Security</p>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.62rem] font-semibold uppercase tracking-widest"
                            style={{ background: 'rgba(76,175,110,0.08)', border: '1px solid rgba(76,175,110,0.18)', color: '#4caf6e' }}>
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                            Live
                        </span>
                    </div>

                    {securityOnDuty.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {securityOnDuty.map((staff, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                                        style={{ background: 'linear-gradient(135deg, #4caf6e, #81c995)' }}>
                                        {staff.name ? staff.name[0].toUpperCase() : 'S'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-800 leading-tight truncate">{staff.name}</p>
                                        <p className="text-[0.68rem] text-gray-400 mt-0.5">Security Staff</p>
                                    </div>
                                    <span className="w-2 h-2 rounded-full flex-shrink-0"
                                        style={{ background: '#4caf6e', boxShadow: '0 0 6px rgba(76,175,110,0.6)' }} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-5 rounded-xl text-center"
                            style={{ background: 'rgba(224,92,92,0.06)', border: '1px solid rgba(224,92,92,0.15)' }}>
                            <p className="text-sm font-semibold text-red-400">No security staff currently on duty.</p>
                        </div>
                    )}
                </motion.section>

            </main>
        </div>
    );
};

export default AdminDashboard;