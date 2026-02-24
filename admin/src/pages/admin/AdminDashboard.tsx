import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { motion } from 'framer-motion';
import { Users, ShieldCheck, Clock, CheckCircle2, TrendingUp, Calendar, ChevronRight } from 'lucide-react';
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

interface DashboardStats {
    totalResidents: number;
    totalStaff: number;
    pendingVisits: number;
}

interface GenderDistribution {
    name: string;
    value: number;
}

const AdminDashboard: React.FC = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<DashboardStats>({
        totalResidents: 0,
        totalStaff: 0,
        pendingVisits: 0
    });

    const [genderData, setGenderData] = useState<GenderDistribution[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!user?.propertyId) return;
            try {
                setLoading(true);
                const [statsRes, genderRes] = await Promise.all([
                    api.get(`/api/dashboard/stats?propertyId=${user.propertyId}`),
                    api.get(`/api/dashboard/gender-distribution?propertyId=${user.propertyId}`)
                ]);
                setStats(statsRes.data);
                setGenderData(genderRes.data);
            } catch (err) {
                console.error("Error fetching data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const COLORS = ['#4caf6e', '#81c995', '#b8e0c4'];

    const cards = [
        { label: 'Total Residents', value: stats.totalResidents, icon: Users, accent: '#4caf6e', accentBg: 'rgba(76,175,110,0.1)' },
        { label: 'Security Staff', value: stats.totalStaff, icon: ShieldCheck, accent: '#60a5fa', accentBg: 'rgba(96,165,250,0.1)' },
        { label: 'Pending Visits', value: stats.pendingVisits, icon: Clock, accent: '#f59e0b', accentBg: 'rgba(245,158,11,0.1)' },
        { label: 'System Status', value: 'Active', icon: CheckCircle2, accent: '#4caf6e', accentBg: 'rgba(76,175,110,0.1)' },
    ];

    const tooltipStyle = {
        backgroundColor: '#fff',
        border: '1px solid #e8e8e6',
        borderRadius: '10px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: '12px',
        color: '#333'
    };

    const activities = [
        { title: 'New resident registration', time: '2 hours ago', icon: Users, accent: '#4caf6e', accentBg: 'rgba(76,175,110,0.1)' },
        { title: 'Staff shift started', time: '5 hours ago', icon: ShieldCheck, accent: '#60a5fa', accentBg: 'rgba(96,165,250,0.1)' },
        { title: 'Facility report generated', time: 'Yesterday', icon: CheckCircle2, accent: '#4caf6e', accentBg: 'rgba(76,175,110,0.08)' },
    ];

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

                * { box-sizing: border-box; }

                .ad2-root {
                    display: flex;
                    min-height: 100vh;
                    background-color: #f7f7f5;
                    background-image:
                        radial-gradient(circle at 5% 10%, rgba(134,197,152,0.1) 0%, transparent 45%),
                        radial-gradient(circle at 95% 90%, rgba(134,197,152,0.07) 0%, transparent 45%);
                    font-family: 'Plus Jakarta Sans', sans-serif;
                }

                .ad2-main {
                    flex: 1;
                    padding: 40px 40px 40px 80px;
                    width: 100%;
                    overflow-y: auto;
                }

                @media (max-width: 768px) {
                    .ad2-main { padding: 24px 20px 24px 70px; }
                    .ad2-stats   { grid-template-columns: 1fr 1fr !important; }
                    .ad2-charts  { grid-template-columns: 1fr !important; }
                    .ad2-bottom  { grid-template-columns: 1fr !important; }
                }

                /* Header */
                .ad2-header {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 16px;
                    margin-bottom: 32px;
                }

                .ad2-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    background: rgba(76,175,110,0.08);
                    border: 1px solid rgba(76,175,110,0.2);
                    color: #4caf6e;
                    font-size: 0.72rem;
                    font-weight: 600;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    padding: 4px 10px;
                    border-radius: 20px;
                    margin-bottom: 10px;
                }

                .ad2-badge-dot { width: 6px; height: 6px; background: #4caf6e; border-radius: 50%; }

                .ad2-heading {
                    font-size: 1.85rem;
                    font-weight: 700;
                    color: #111;
                    letter-spacing: -0.03em;
                    line-height: 1.2;
                    margin: 0 0 6px;
                }

                .ad2-subtext {
                    font-size: 0.875rem;
                    color: #999;
                    font-weight: 400;
                    margin: 0;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    flex-wrap: wrap;
                }

                .ad2-property-chip {
                    display: inline-flex;
                    align-items: center;
                    background: rgba(76,175,110,0.07);
                    border: 1px solid rgba(76,175,110,0.18);
                    color: #4caf6e;
                    font-size: 0.72rem;
                    font-weight: 600;
                    font-family: monospace;
                    padding: 2px 8px;
                    border-radius: 6px;
                }

                .ad2-date-badge {
                    display: flex;
                    align-items: center;
                    gap: 7px;
                    background: #fff;
                    border: 1px solid #e8e8e6;
                    border-radius: 12px;
                    padding: 10px 16px;
                    font-size: 0.82rem;
                    font-weight: 600;
                    color: #555;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
                    white-space: nowrap;
                    align-self: flex-start;
                    margin-top: 4px;
                }

                /* Stats */
                .ad2-stats {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 16px;
                    margin-bottom: 24px;
                }

                .ad2-stat-card {
                    background: #fff;
                    border-radius: 18px;
                    padding: 22px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04);
                    border: 1px solid rgba(0,0,0,0.04);
                    cursor: default;
                    transition: box-shadow 0.2s, border-color 0.2s, transform 0.15s;
                }

                .ad2-stat-card:hover {
                    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
                    border-color: rgba(76,175,110,0.15);
                    transform: translateY(-2px);
                }

                .ad2-stat-icon {
                    width: 40px; height: 40px;
                    border-radius: 10px;
                    display: flex; align-items: center; justify-content: center;
                    margin-bottom: 14px;
                    transition: transform 0.2s;
                }

                .ad2-stat-card:hover .ad2-stat-icon { transform: scale(1.1); }

                .ad2-stat-label {
                    font-size: 0.7rem;
                    font-weight: 600;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    color: #bbb;
                    margin-bottom: 5px;
                }

                .ad2-stat-value {
                    font-size: 2rem;
                    font-weight: 700;
                    color: #111;
                    letter-spacing: -0.04em;
                    line-height: 1;
                }

                .ad2-stat-value-sm {
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: #4caf6e;
                    letter-spacing: -0.01em;
                    line-height: 1;
                }

                .ad2-stat-loading {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #ddd;
                    line-height: 1;
                }

                /* Charts */
                .ad2-charts {
                    display: grid;
                    grid-template-columns: 1fr 320px;
                    gap: 20px;
                    margin-bottom: 24px;
                }

                .ad2-card {
                    background: #fff;
                    border-radius: 20px;
                    padding: 28px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04);
                    border: 1px solid rgba(0,0,0,0.04);
                }

                .ad2-card-header {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    margin-bottom: 20px;
                    flex-wrap: wrap;
                    gap: 10px;
                }

                .ad2-card-title {
                    font-size: 0.95rem;
                    font-weight: 700;
                    color: #111;
                    letter-spacing: -0.01em;
                    margin: 0 0 3px;
                }

                .ad2-card-subtitle {
                    font-size: 0.75rem;
                    color: #bbb;
                    font-weight: 400;
                    margin: 0;
                }

                .ad2-trend-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    background: rgba(76,175,110,0.08);
                    border: 1px solid rgba(76,175,110,0.2);
                    color: #4caf6e;
                    font-size: 0.72rem;
                    font-weight: 700;
                    padding: 4px 10px;
                    border-radius: 20px;
                    white-space: nowrap;
                }

                /* Bottom grid */
                .ad2-bottom {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                }

                .ad2-ops-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                }

                .ad2-ops-btn {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 22px 16px;
                    border-radius: 16px;
                    border: none;
                    cursor: pointer;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    transition: transform 0.15s, box-shadow 0.2s, opacity 0.15s;
                }

                .ad2-ops-btn:hover { transform: translateY(-2px); }

                .ad2-ops-title {
                    font-size: 0.85rem;
                    font-weight: 700;
                    line-height: 1.2;
                }

                .ad2-ops-sub {
                    font-size: 0.7rem;
                    opacity: 0.6;
                    font-weight: 400;
                }

                .ad2-ops-primary {
                    background: linear-gradient(135deg, #4caf6e, #5ec47f);
                    color: #fff;
                    box-shadow: 0 4px 14px rgba(76,175,110,0.25);
                }

                .ad2-ops-primary:hover { box-shadow: 0 6px 20px rgba(76,175,110,0.32); }

                .ad2-ops-secondary {
                    background: #f9f9f8;
                    color: #333;
                    border: 1.5px solid #e8e8e6 !important;
                }

                .ad2-ops-secondary:hover {
                    background: #f2f2f0;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.06);
                }

                .ad2-ops-admin-label {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 18px;
                }

                .ad2-ops-admin-chip {
                    font-size: 0.62rem;
                    font-weight: 600;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                    color: #bbb;
                    background: #f5f5f3;
                    border: 1px solid #ebebea;
                    padding: 3px 8px;
                    border-radius: 6px;
                }

                /* Activity logs */
                .ad2-activity-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 16px;
                }

                .ad2-view-all {
                    font-size: 0.78rem;
                    font-weight: 600;
                    color: #4caf6e;
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    transition: color 0.15s;
                }

                .ad2-view-all:hover { color: #3a9a5a; text-decoration: underline; }

                .ad2-activity-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: background 0.15s, border-color 0.15s;
                    border: 1px solid transparent;
                    margin-bottom: 6px;
                }

                .ad2-activity-item:last-child { margin-bottom: 0; }

                .ad2-activity-item:hover {
                    background: #fafafa;
                    border-color: #f0f0ee;
                }

                .ad2-activity-icon {
                    width: 36px; height: 36px;
                    border-radius: 10px;
                    display: flex; align-items: center; justify-content: center;
                    flex-shrink: 0;
                }

                .ad2-activity-title {
                    font-size: 0.855rem;
                    font-weight: 500;
                    color: #333;
                    line-height: 1.3;
                    flex: 1;
                }

                .ad2-activity-time {
                    font-size: 0.72rem;
                    color: #bbb;
                    margin-top: 2px;
                }
            `}</style>

            <div className="ad2-root">
                <Sidebar />

                <main className="ad2-main">

                    {/* Header */}
                    <motion.div
                        className="ad2-header"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <div>
                            <div className="ad2-badge"><div className="ad2-badge-dot" />Overview</div>
                            <h1 className="ad2-heading">Executive Overview</h1>
                            <p className="ad2-subtext">
                                Welcome back, {user?.name || user?.email}. Property&nbsp;
                                <span className="ad2-property-chip">{user?.propertyId || 'Unknown'}</span>
                            </p>
                        </div>
                        <div className="ad2-date-badge">
                            <Calendar size={15} color="#4caf6e" />
                            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </div>
                    </motion.div>

                    {/* Stat Cards */}
                    <div className="ad2-stats">
                        {cards.map((card, index) => (
                            <motion.div
                                key={index}
                                className="ad2-stat-card"
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                            >
                                <div className="ad2-stat-icon" style={{ background: card.accentBg }}>
                                    <card.icon size={20} color={card.accent} />
                                </div>
                                <div className="ad2-stat-label">{card.label}</div>
                                {loading ? (
                                    <div className="ad2-stat-loading">…</div>
                                ) : typeof card.value === 'string' ? (
                                    <div className="ad2-stat-value-sm">{card.value}</div>
                                ) : (
                                    <div className="ad2-stat-value">{card.value}</div>
                                )}
                            </motion.div>
                        ))}
                    </div>

                    {/* Charts */}
                    <motion.div
                        className="ad2-charts"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <section className="ad2-card">
                            <div className="ad2-card-header">
                                <div>
                                    <div className="ad2-card-title">Occupancy Distribution</div>
                                    <p className="ad2-card-subtitle">Trends and demographic split across the property</p>
                                </div>
                                <div className="ad2-trend-pill">
                                    <TrendingUp size={11} /> 12% increase
                                </div>
                            </div>
                            <div style={{ height: 300 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={genderData}>
                                        <defs>
                                            <linearGradient id="colorGreen2" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#4caf6e" stopOpacity={0.16} />
                                                <stop offset="95%" stopColor="#4caf6e" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0ee" vertical={false} />
                                        <XAxis dataKey="name" stroke="#ccc" fontSize={11} tickLine={false} axisLine={false} dy={8} />
                                        <YAxis stroke="#ccc" fontSize={11} tickLine={false} axisLine={false} dx={-8} />
                                        <RechartsTooltip contentStyle={tooltipStyle} />
                                        <Area type="monotone" dataKey="value" stroke="#4caf6e" strokeWidth={2.5} fillOpacity={1} fill="url(#colorGreen2)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </section>

                        <section className="ad2-card">
                            <div className="ad2-card-header">
                                <div>
                                    <div className="ad2-card-title">Gender Ratio</div>
                                    <p className="ad2-card-subtitle">Breakdown of resident demographics</p>
                                </div>
                            </div>
                            <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={genderData}
                                            innerRadius={65}
                                            outerRadius={90}
                                            paddingAngle={6}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {genderData.map((_entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip contentStyle={tooltipStyle} />
                                        <Legend
                                            iconType="circle"
                                            iconSize={8}
                                            wrapperStyle={{ paddingTop: '16px', fontSize: '12px', fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#888' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </section>
                    </motion.div>

                    {/* Bottom */}
                    <motion.div
                        className="ad2-bottom"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    >
                        {/* Quick Operations */}
                        <section className="ad2-card">
                            <div className="ad2-ops-admin-label">
                                <div className="ad2-card-title" style={{ margin: 0 }}>Quick Operations</div>
                                <span className="ad2-ops-admin-chip">Admin Only</span>
                            </div>
                            <div className="ad2-ops-grid">
                                <button className="ad2-ops-btn ad2-ops-primary">
                                    <Users size={22} />
                                    <div>
                                        <div className="ad2-ops-title">Add Resident</div>
                                        <div className="ad2-ops-sub">Direct insertion</div>
                                    </div>
                                </button>
                                <button className="ad2-ops-btn ad2-ops-secondary">
                                    <ShieldCheck size={22} color="#4caf6e" />
                                    <div>
                                        <div className="ad2-ops-title">Register Staff</div>
                                        <div className="ad2-ops-sub">Access control</div>
                                    </div>
                                </button>
                            </div>
                        </section>

                        {/* Activity Logs */}
                        <section className="ad2-card">
                            <div className="ad2-activity-header">
                                <div className="ad2-card-title" style={{ margin: 0 }}>Activity Logs</div>
                                <button className="ad2-view-all">View All</button>
                            </div>
                            {activities.map((activity, i) => (
                                <div key={i} className="ad2-activity-item">
                                    <div className="ad2-activity-icon" style={{ background: activity.accentBg }}>
                                        <activity.icon size={16} color={activity.accent} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div className="ad2-activity-title">{activity.title}</div>
                                        <div className="ad2-activity-time">{activity.time}</div>
                                    </div>
                                    <ChevronRight size={14} color="#ddd" />
                                </div>
                            ))}
                        </section>
                    </motion.div>

                </main>
            </div>
        </>
    );
};

export default AdminDashboard;