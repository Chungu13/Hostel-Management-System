import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { motion } from 'framer-motion';
import { Users, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip as RechartsTooltip,
    Legend,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid
} from 'recharts';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalResidents: 0,
        totalStaff: 0,
        pendingVisits: 0
    });

    const [genderData, setGenderData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            if (!user?.propertyId) return;
            try {
                const [statsRes, genderRes] = await Promise.all([
                    api.get(`/api/dashboard/stats?propertyId=${user.propertyId}`),
                    api.get(`/api/dashboard/gender-distribution?propertyId=${user.propertyId}`)
                ]);
                setStats(statsRes.data);
                setGenderData(genderRes.data);
            } catch (err) {
                console.error("Error fetching data:", err);
            }
        };
        fetchData();
    }, [user]);

    const COLORS = ['#6366f1', '#a855f7', '#ec4899'];

    const cards = [
        { label: 'Total Residents', value: stats.totalResidents, icon: Users, color: 'bg-primary' },
        { label: 'Security Staff', value: stats.totalStaff, icon: ShieldCheck, color: 'bg-indigo-500' },
        { label: 'Pending Visits', value: stats.pendingVisits, icon: Clock, color: 'bg-warning' },
        { label: 'System Status', value: 'Active', icon: CheckCircle2, color: 'bg-success' },
    ];

    return (
        <div className="flex bg-bg-darker min-h-screen">
            <Sidebar />

            <main className="ml-64 p-8 w-full">
                <header className="mb-10">
                    <h1 className="text-3xl font-bold">Admin Overview</h1>
                    <p className="text-text-muted mt-2">Welcome back! Here's what's happening today.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {cards.map((card, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="glass p-6 group hover:border-primary/50 transition-all cursor-default"
                        >
                            <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                <card.icon className="text-white w-6 h-6" />
                            </div>
                            <p className="text-text-muted text-sm font-medium">{card.label}</p>
                            <h3 className="text-2xl font-bold mt-1">{card.value}</h3>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-10">
                    <section className="glass p-8 xl:col-span-2">
                        <h2 className="text-xl font-semibold mb-6">Demographics & Growth</h2>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={genderData}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                                    <YAxis stroke="#94a3b8" fontSize={12} />
                                    <RechartsTooltip
                                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #ffffff20', borderRadius: '8px' }}
                                    />
                                    <Area type="monotone" dataKey="value" stroke="#6366f1" fillOpacity={1} fill="url(#colorValue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </section>

                    <section className="glass p-8">
                        <h2 className="text-xl font-semibold mb-6">Gender Ratio</h2>
                        <div className="h-[300px] w-full flex flex-col items-center">
                            <ResponsiveContainer width="100%" height="80%">
                                <PieChart>
                                    <Pie
                                        data={genderData}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {genderData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip
                                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #ffffff20', borderRadius: '8px' }}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </section>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <section className="glass p-8">
                        <h2 className="text-xl font-semibold mb-6">Quick Actions</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <button className="btn btn-primary py-6 flex-col h-auto">
                                <Users className="w-8 h-8 mb-2" />
                                Add Resident
                            </button>
                            <button className="btn glass border-primary/20 hover:bg-primary/10 py-6 flex-col h-auto">
                                <ShieldCheck className="w-8 h-8 mb-2" />
                                Add Staff
                            </button>
                        </div>
                    </section>

                    <section className="glass p-8">
                        <h2 className="text-xl font-semibold mb-6">Notifications</h2>
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 cursor-pointer">
                                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                        <Users className="text-primary w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">New resident registration pending</p>
                                        <p className="text-xs text-text-muted">2 hours ago</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;

