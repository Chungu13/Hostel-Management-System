import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { motion } from 'framer-motion';
import { FileText, Download, TrendingUp, Users, ShieldAlert, PieChart as PieIcon } from 'lucide-react';
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
    Cell
} from 'recharts';
import api from '../../utils/api';

const ReportsPage = () => {
    const [residentStats, setResidentStats] = useState([]);
    const [securityStats, setSecurityStats] = useState([]);

    useEffect(() => {
        const fetchReportData = async () => {
            try {
                // Fetching real data from backend
                const response = await api.get('/api/stats/gender-distribution');
                setResidentStats(response.data);

                // Mocking security stats for now
                setSecurityStats([
                    { name: 'Male', value: 3 },
                    { name: 'Female', value: 2 }
                ]);
            } catch (err) {
                console.error("Error fetching report data:", err);
            }
        };
        fetchReportData();
    }, []);

    const COLORS = ['#6366f1', '#a855f7', '#ec4899'];

    return (
        <div className="flex bg-bg-darker min-h-screen">
            <Sidebar />
            <main className="ml-64 p-8 w-full">
                <header className="mb-10 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">Analytical Reports</h1>
                        <p className="text-text-muted mt-2">Comprehensive demographic and system analytics</p>
                    </div>
                    <button className="btn btn-primary">
                        <Download className="w-5 h-5" /> Export PDF
                    </button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                    <section className="glass p-8">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-3 bg-primary/10 rounded-xl">
                                <Users className="text-primary w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Resident Demographics</h2>
                                <p className="text-xs text-text-muted">Breakdown by gender</p>
                            </div>
                        </div>

                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={residentStats}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                                    <YAxis stroke="#94a3b8" fontSize={12} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #ffffff20', borderRadius: '8px' }}
                                    />
                                    <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </section>

                    <section className="glass p-8">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-3 bg-secondary/10 rounded-xl">
                                <ShieldAlert className="text-secondary w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Security Distribution</h2>
                                <p className="text-xs text-text-muted">Staffing demographics</p>
                            </div>
                        </div>

                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={securityStats}
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={10}
                                        dataKey="value"
                                    >
                                        {securityStats.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #ffffff20', borderRadius: '8px' }}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </section>
                </div>

                <div className="glass p-8">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <TrendingUp className="text-success w-5 h-5" /> Quick Insights
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-4 bg-white/5 rounded-2xl">
                            <p className="text-xs text-text-muted uppercase font-bold tracking-widest mb-1">Growth Rate</p>
                            <p className="text-2xl font-bold text-success">+12.5%</p>
                            <p className="text-xs text-text-muted mt-1">Increasing residents</p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl">
                            <p className="text-xs text-text-muted uppercase font-bold tracking-widest mb-1">Pass Issuance</p>
                            <p className="text-2xl font-bold text-primary">High</p>
                            <p className="text-xs text-text-muted mt-1">Weekend peak detected</p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl">
                            <p className="text-xs text-text-muted uppercase font-bold tracking-widest mb-1">Staff Density</p>
                            <p className="text-2xl font-bold">1:20</p>
                            <p className="text-xs text-text-muted mt-1">Staff to Resident ratio</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ReportsPage;

