import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { motion } from 'framer-motion';
import { Users, ShieldCheck, Clock, CheckCircle2, Calendar } from 'lucide-react';
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

    const COLORS = ['#4caf6e', '#81c995', '#b8e0c4'];

    const cards = [
        { label: 'Total Residents', value: stats.totalResidents, icon: Users, accent: '#4caf6e', accentBg: 'rgba(76,175,110,0.1)' },
        { label: 'Security Staff', value: stats.totalStaff, icon: ShieldCheck, accent: '#60a5fa', accentBg: 'rgba(96,165,250,0.1)' },
        { label: 'Pending Visits', value: stats.pendingVisits, icon: Clock, accent: '#f59e0b', accentBg: 'rgba(245,158,11,0.1)' },
        { label: 'System Status', value: 'Active', icon: CheckCircle2, accent: '#4caf6e', accentBg: 'rgba(76,175,110,0.1)' },
    ];

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

                .ad-root {
                    display: flex;
                    min-height: 100vh;
                    background-color: #f7f7f5;
                    background-image:
                        radial-gradient(circle at 5% 10%, rgba(134,197,152,0.1) 0%, transparent 45%),
                        radial-gradient(circle at 95% 90%, rgba(134,197,152,0.07) 0%, transparent 45%);
                    font-family: 'Plus Jakarta Sans', sans-serif;
                }

                .ad-main {
                    flex: 1;
                    padding: 40px 40px 40px 80px;
                    width: 100%;
                    box-sizing: border-box;
                }

                @media (max-width: 768px) {
                    .ad-main { padding: 24px 20px 24px 70px; }
                    .ad-stats { grid-template-columns: 1fr 1fr !important; }
                    .ad-charts { grid-template-columns: 1fr !important; }
                    .ad-bottom { grid-template-columns: 1fr !important; }
                }

                /* Header */
                .ad-header {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 12px;
                    margin-bottom: 32px;
                }

                .ad-badge {
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

                .ad-badge-dot {
                    width: 6px; height: 6px;
                    background: #4caf6e;
                    border-radius: 50%;
                }

                .ad-heading {
                    font-size: 1.85rem;
                    font-weight: 700;
                    color: #111;
                    letter-spacing: -0.03em;
                    line-height: 1.2;
                    margin: 0 0 6px;
                }

                .ad-subtext {
                    font-size: 0.875rem;
                    color: #999;
                    font-weight: 400;
                    margin: 0;
                }

                .ad-date-badge {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    background: #fff;
                    border: 1px solid #e8e8e6;
                    border-radius: 10px;
                    padding: 8px 14px;
                    font-size: 0.8rem;
                    font-weight: 500;
                    color: #777;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
                    white-space: nowrap;
                    align-self: flex-start;
                    margin-top: 4px;
                }

                /* Stat Cards */
                .ad-stats {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 16px;
                    margin-bottom: 24px;
                }

                .ad-stat-card {
                    background: #fff;
                    border-radius: 18px;
                    padding: 22px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04);
                    border: 1px solid rgba(0,0,0,0.04);
                    cursor: default;
                    transition: box-shadow 0.2s, transform 0.15s;
                }

                .ad-stat-card:hover {
                    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
                    transform: translateY(-2px);
                }

                .ad-stat-icon-wrap {
                    width: 40px; height: 40px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 14px;
                    transition: transform 0.2s;
                }

                .ad-stat-card:hover .ad-stat-icon-wrap {
                    transform: scale(1.1);
                }

                .ad-stat-label {
                    font-size: 0.75rem;
                    color: #999;
                    font-weight: 500;
                    margin-bottom: 4px;
                    letter-spacing: 0.02em;
                }

                .ad-stat-value {
                    font-size: 1.9rem;
                    font-weight: 700;
                    color: #111;
                    letter-spacing: -0.03em;
                    line-height: 1;
                }

                .ad-stat-value-sm {
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: #4caf6e;
                    letter-spacing: -0.01em;
                    line-height: 1;
                }

                /* Charts Grid */
                .ad-charts {
                    display: grid;
                    grid-template-columns: 1fr 340px;
                    gap: 20px;
                    margin-bottom: 24px;
                }

                .ad-section-card {
                    background: #fff;
                    border-radius: 18px;
                    padding: 28px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04);
                    border: 1px solid rgba(0,0,0,0.04);
                }

                .ad-section-title {
                    font-size: 0.95rem;
                    font-weight: 700;
                    color: #111;
                    letter-spacing: -0.01em;
                    margin: 0 0 20px;
                }

                /* Bottom grid */
                .ad-bottom {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                }

                /* Quick Action buttons */
                .ad-action-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                }

                .ad-action-btn {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    padding: 24px 16px;
                    border-radius: 14px;
                    border: none;
                    cursor: pointer;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    font-size: 0.85rem;
                    font-weight: 600;
                    transition: transform 0.15s, box-shadow 0.2s, opacity 0.15s;
                }

                .ad-action-btn:hover {
                    transform: translateY(-2px);
                }

                .ad-action-primary {
                    background: linear-gradient(135deg, #4caf6e, #5ec47f);
                    color: #fff;
                    box-shadow: 0 4px 14px rgba(76,175,110,0.25);
                }

                .ad-action-primary:hover {
                    box-shadow: 0 6px 20px rgba(76,175,110,0.32);
                }

                .ad-action-secondary {
                    background: #f9f9f8;
                    color: #333;
                    border: 1.5px solid #e8e8e6;
                }

                .ad-action-secondary:hover {
                    background: #f2f2f0;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.06);
                }

                /* Alerts */
                .ad-alert-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: background 0.15s;
                    margin-bottom: 8px;
                }

                .ad-alert-item:last-child { margin-bottom: 0; }

                .ad-alert-item:hover { background: #f9f9f8; }

                .ad-alert-avatar {
                    width: 36px; height: 36px;
                    border-radius: 10px;
                    background: rgba(76,175,110,0.1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .ad-alert-title {
                    font-size: 0.855rem;
                    font-weight: 500;
                    color: #333;
                    line-height: 1.3;
                }

                .ad-alert-time {
                    font-size: 0.72rem;
                    color: #bbb;
                    margin-top: 2px;
                }
            `}</style>

            <div className="ad-root">
                <Sidebar />

                <main className="ad-main">

                    {/* Header */}
                    <motion.div
                        className="ad-header"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <div>
                            <div className="ad-badge">
                                <div className="ad-badge-dot" />
                                Overview
                            </div>
                            <h1 className="ad-heading">Admin Overview</h1>
                            <p className="ad-subtext">Welcome back! Here's what's happening at your property.</p>
                        </div>
                        <div className="ad-date-badge">
                            <Calendar size={14} />
                            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </div>
                    </motion.div>

                    {/* Stat Cards */}
                    <div className="ad-stats">
                        {cards.map((card, index) => (
                            <motion.div
                                key={index}
                                className="ad-stat-card"
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                            >
                                <div
                                    className="ad-stat-icon-wrap"
                                    style={{ background: card.accentBg }}
                                >
                                    <card.icon size={20} color={card.accent} />
                                </div>
                                <div className="ad-stat-label">{card.label}</div>
                                {typeof card.value === 'string'
                                    ? <div className="ad-stat-value-sm">{card.value}</div>
                                    : <div className="ad-stat-value">{card.value}</div>
                                }
                            </motion.div>
                        ))}
                    </div>

                    {/* Charts */}
                    <motion.div
                        className="ad-charts"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <section className="ad-section-card">
                            <h2 className="ad-section-title">Demographics & Growth</h2>
                            <div style={{ height: 280 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={genderData}>
                                        <defs>
                                            <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#4caf6e" stopOpacity={0.18} />
                                                <stop offset="95%" stopColor="#4caf6e" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0ee" />
                                        <XAxis dataKey="name" stroke="#ccc" fontSize={11} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#ccc" fontSize={11} tickLine={false} axisLine={false} />
                                        <RechartsTooltip
                                            contentStyle={{
                                                backgroundColor: '#fff',
                                                border: '1px solid #e8e8e6',
                                                borderRadius: '10px',
                                                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                                                fontFamily: "'Plus Jakarta Sans', sans-serif",
                                                fontSize: '12px'
                                            }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="value"
                                            stroke="#4caf6e"
                                            strokeWidth={2}
                                            fillOpacity={1}
                                            fill="url(#colorGreen)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </section>

                        <section className="ad-section-card">
                            <h2 className="ad-section-title">Gender Ratio</h2>
                            <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={genderData}
                                            innerRadius={65}
                                            outerRadius={90}
                                            paddingAngle={4}
                                            dataKey="value"
                                        >
                                            {genderData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip
                                            contentStyle={{
                                                backgroundColor: '#fff',
                                                border: '1px solid #e8e8e6',
                                                borderRadius: '10px',
                                                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                                                fontFamily: "'Plus Jakarta Sans', sans-serif",
                                                fontSize: '12px'
                                            }}
                                        />
                                        <Legend
                                            iconType="circle"
                                            iconSize={8}
                                            wrapperStyle={{ fontSize: '12px', fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#888' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </section>
                    </motion.div>

                    {/* Bottom */}
                    <motion.div
                        className="ad-bottom"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <section className="ad-section-card">
                            <h2 className="ad-section-title">Quick Actions</h2>
                            <div className="ad-action-grid">
                                <button className="ad-action-btn ad-action-primary">
                                    <Users size={22} />
                                    Add Resident
                                </button>
                                <button className="ad-action-btn ad-action-secondary">
                                    <ShieldCheck size={22} color="#4caf6e" />
                                    Add Staff
                                </button>
                            </div>
                        </section>

                        <section className="ad-section-card">
                            <h2 className="ad-section-title">Recent Alerts</h2>
                            {[1, 2, 3].map(i => (
                                <div key={i} className="ad-alert-item">
                                    <div className="ad-alert-avatar">
                                        <Users size={16} color="#4caf6e" />
                                    </div>
                                    <div>
                                        <div className="ad-alert-title">New resident registration pending</div>
                                        <div className="ad-alert-time">2 hours ago</div>
                                    </div>
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
