import React, { useEffect, useState, useMemo } from "react";
import Sidebar from "../../components/Sidebar";
import { motion } from "framer-motion";
import {
    Download,
    TrendingUp,
    Calendar,
    BarChart3,
    CheckCircle2,
    Clock,
    Flame,
    Users,
    User,
    PieChart as PieIcon,
    LineChart as LineIcon,
    Activity
} from "lucide-react";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    AreaChart,
    Area
} from "recharts";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

const ReportsPage: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);

    const [metrics, setMetrics] = useState({
        totalVisitsMonth: 0,
        approvalRate: 0,
        avgVisitsPerDay: 0,
        busiestDay: "N/A"
    });

    const [charts, setCharts] = useState({
        visitsPerDay: [] as any[],
        statusBreakdown: [] as any[],
        busiestDaysOfWeek: [] as any[],
        topResidents: [] as any[]
    });

    useEffect(() => {
        const fetchAnalytics = async () => {
            if (!user?.propertyId) return;
            try {
                setLoading(true);
                const res = await api.get('/api/reports/analytics');
                setMetrics(res.data.metrics);

                // Format charts for recharts
                const processedCharts = {
                    visitsPerDay: res.data.charts.visitsPerDay.map((row: any) => ({
                        day: row[0].split('-').pop(), // Just the day number
                        visits: row[1]
                    })),
                    statusBreakdown: res.data.charts.statusBreakdown.map((row: any) => ({
                        name: row[0],
                        value: row[1]
                    })),
                    busiestDaysOfWeek: res.data.charts.busiestDaysOfWeek,
                    topResidents: res.data.charts.topResidents.map((row: any) => ({
                        name: row[0],
                        count: row[1]
                    }))
                };
                setCharts(processedCharts);
            } catch (err) {
                console.error("Error fetching analytics:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, [user?.propertyId]);

    const STATUS_COLORS = {
        'Approved': '#4caf6e',
        'Rejected': '#ef4444',
        'Pending': '#f59e0b',
        'Cancelled': '#9ca3af'
    };

    const metricCards = [
        { label: 'Total Visits (Month)', value: metrics.totalVisitsMonth, sub: 'Overall activity', icon: Activity, color: '#4caf6e' },
        { label: 'Approval Rate', value: `${metrics.approvalRate}%`, sub: 'Management efficiency', icon: CheckCircle2, color: '#60a5fa' },
        { label: 'Avg Visits/Day', value: metrics.avgVisitsPerDay, sub: 'Normal baseline', icon: Clock, color: '#f59e0b' },
        { label: 'Busiest Day', value: metrics.busiestDay, sub: 'Planning baseline', icon: Flame, color: '#ef4444' },
    ];

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
                .ap-root {
                    display: flex;
                    min-height: 100vh;
                    background-color: #f7f7f5;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                }
                .ap-main {
                    flex: 1;
                    padding: 40px 40px 40px 80px;
                    max-width: 1400px;
                    margin: 0 auto;
                }
                @media (max-width: 768px) {
                    .ap-main { padding: 24px 20px 24px 70px; }
                }
                .ap-header { margin-bottom: 32px; display: flex; justify-content: space-between; align-items: flex-start; }
                
                .ap-btn-export {
                    display: flex; align-items: center; gap: 8px; padding: 10px 18px; border-radius: 12px;
                    background: #fff; border: 1.5px solid #e8e8e6; color: #555; font-size: 0.85rem; font-weight: 600;
                    cursor: pointer; transition: all 0.2s;
                }
                .ap-btn-export:hover { background: #f9f9f8; border-color: #4caf6e; color: #4caf6e; }

                .ap-metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
                @media (max-width: 1100px) { .ap-metrics-grid { grid-template-columns: repeat(2, 1fr); } }
                
                .ap-metric-card {
                    background: #fff; border-radius: 20px; padding: 24px; border: 1px solid rgba(0,0,0,0.04);
                    box-shadow: 0 4px 16px rgba(0,0,0,0.04);
                }
                .ap-metric-label { font-size: 0.72rem; font-weight: 700; color: #bbb; text-transform: uppercase; letter-spacing: 0.05em; }
                .ap-metric-value { font-size: 1.75rem; font-weight: 700; color: #111; margin: 8px 0 2px; }
                .ap-metric-sub { font-size: 0.75rem; color: #999; }

                .ap-chart-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-bottom: 20px; }
                @media (max-width: 1000px) { .ap-chart-grid { grid-template-columns: 1fr; } }

                .ap-card { background: #fff; border-radius: 24px; padding: 28px; border: 1px solid rgba(0,0,0,0.04); box-shadow: 0 4px 16px rgba(0,0,0,0.04); }
                .ap-card-title { font-size: 1rem; font-weight: 700; color: #111; margin-bottom: 24px; display: flex; align-items: center; gap: 10px; }
                .ap-card-title span { background: #f0fdf4; color: #4caf6e; padding: 4px 10px; border-radius: 8px; font-size: 0.7rem; }

                .ap-resident-item { 
                    display: flex; align-items: center; justify-content: space-between; 
                    padding: 12px 16px; border-radius: 12px; background: #f9f9f8; margin-bottom: 8px; 
                }
                .ap-res-name { font-size: 0.85rem; font-weight: 600; color: #333; }
                .ap-res-count { font-size: 0.8rem; font-weight: 700; color: #4caf6e; background: #fff; padding: 4px 8px; border-radius: 6px; }
            `}</style>

            <div className="ap-root">
                <Sidebar />
                <main className="ap-main">
                    <motion.div className="ap-header" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                        <div>
                            <h1 className="page-title">Management Analytics</h1>
                            <p className="page-subtitle">Monthly trends and visitor behavior tracking</p>
                        </div>
                        <button className="ap-btn-export" onClick={() => window.print()}>
                            <Download size={16} />
                            Generate Report
                        </button>
                    </motion.div>

                    <div className="ap-metrics-grid">
                        {metricCards.map((m, i) => (
                            <motion.div
                                key={i} className="ap-metric-card"
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="ap-metric-label">{m.label}</div>
                                    <m.icon size={18} style={{ color: m.color }} />
                                </div>
                                <div className="ap-metric-value">{loading ? '...' : m.value}</div>
                                <div className="ap-metric-sub">{m.sub}</div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="ap-chart-grid">
                        {/* Monthly Volume */}
                        <motion.div className="ap-card" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
                            <div className="ap-card-title">
                                <LineIcon size={18} color="#4caf6e" />
                                Visits Per Day (Current Month)
                                <span>Monthly Trend</span>
                            </div>
                            <div className="h-[320px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={charts.visitsPerDay}>
                                        <defs>
                                            <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#4caf6e" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#4caf6e" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#bbb' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#bbb' }} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                            labelStyle={{ fontWeight: 'bold' }}
                                        />
                                        <Area type="monotone" dataKey="visits" stroke="#4caf6e" strokeWidth={3} fillOpacity={1} fill="url(#colorVisits)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>

                        {/* Status Breakdown */}
                        <motion.div className="ap-card" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
                            <div className="ap-card-title">
                                <PieIcon size={18} color="#60a5fa" />
                                Management Split
                                <span>Status</span>
                            </div>
                            <div className="h-[320px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={charts.statusBreakdown}
                                            innerRadius={70}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {charts.statusBreakdown.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={(STATUS_COLORS as any)[entry.name] || '#ddd'} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>
                    </div>

                    <div className="ap-chart-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                        {/* Day of Week */}
                        <motion.div className="ap-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                            <div className="ap-card-title">
                                <BarChart3 size={18} color="#f59e0b" />
                                Busiest Days of Week
                                <span>Traffic Flow</span>
                            </div>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={charts.busiestDaysOfWeek}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#bbb' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#bbb' }} />
                                        <Tooltip cursor={{ fill: '#f9f9f8' }} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                                        <Bar dataKey="count" fill="#4caf6e" radius={[6, 6, 0, 0]} barSize={32} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>

                        {/* Top Residents */}
                        <motion.div className="ap-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                            <div className="ap-card-title">
                                <Users size={18} color="#6366f1" />
                                Top Residents
                                <span>Visitor Count</span>
                            </div>
                            <div className="flex flex-col gap-2">
                                {charts.topResidents.length > 0 ? (
                                    charts.topResidents.map((res, i) => (
                                        <div key={i} className="ap-resident-item">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs font-bold">
                                                    {i + 1}
                                                </div>
                                                <div className="ap-res-name">{res.name}</div>
                                            </div>
                                            <div className="ap-res-count">{res.count} Visitors</div>
                                        </div>
                                    ))
                                ) : <div className="text-center py-20 text-gray-400 text-sm">No visitor data recorded yet.</div>}
                            </div>
                        </motion.div>
                    </div>
                </main>
            </div>
        </>
    );
};

export default ReportsPage;