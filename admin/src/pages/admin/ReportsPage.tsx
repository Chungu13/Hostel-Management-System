import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../../components/Sidebar";
import { motion } from "framer-motion";
import { Download, TrendingUp, Users, ShieldAlert } from "lucide-react";
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
} from "recharts";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

type StatPoint = {
    name: string;
    value: number;
};

const ReportsPage: React.FC = () => {
    const { user } = useAuth() as { user: { propertyId?: string | number } | null };

    const [residentStats, setResidentStats] = useState<StatPoint[]>([]);
    const [securityStats, setSecurityStats] = useState<StatPoint[]>([]);

    useEffect(() => {
        const fetchReportData = async (): Promise<void> => {
            if (!user?.propertyId) return;

            try {
                const response = await api.get<StatPoint[]>(
                    `/api/stats/gender-distribution?propertyId=${user.propertyId}`
                );
                setResidentStats(response.data ?? []);

                // TODO: Replace with real endpoint when available
                setSecurityStats([
                    { name: "Male", value: 3 },
                    { name: "Female", value: 2 },
                ]);
            } catch (err) {
                // eslint-disable-next-line no-console
                console.error("Error fetching report data:", err);
            }
        };

        void fetchReportData();
    }, [user?.propertyId]);

    const COLORS = useMemo(() => ["#4caf6e", "#81c995", "#b8e0c4"], []);

    return (
        <div className="min-h-screen bg-[#f7f7f5]">
            <div className="flex min-h-screen bg-[radial-gradient(circle_at_5%_10%,rgba(134,197,152,0.10)_0%,transparent_45%),radial-gradient(circle_at_95%_90%,rgba(134,197,152,0.07)_0%,transparent_45%)] font-sans">
                <Sidebar />

                <main className="flex-1 w-full px-6 py-8 md:px-10 md:py-10 md:pl-20">
                    {/* Header */}
                    <motion.div
                        className="flex flex-wrap items-start justify-between gap-4 mb-8"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[0.72rem] font-semibold tracking-[0.08em] uppercase text-emerald-600 mb-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                                Analytics
                            </div>

                            <h1 className="text-2xl md:text-[1.85rem] font-bold tracking-tight text-zinc-900 leading-tight">
                                Analytical Reports
                            </h1>
                            <p className="text-sm text-zinc-400 mt-1">
                                Comprehensive demographic and system analytics
                            </p>
                        </div>

                        <button
                            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-400 px-5 py-3 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(16,185,129,0.25)] transition hover:opacity-95 hover:-translate-y-[1px]"
                            type="button"
                            onClick={() => {
                                // placeholder: implement export
                                alert("Export coming soon");
                            }}
                        >
                            <Download size={16} />
                            Export PDF
                        </button>
                    </motion.div>

                    {/* Charts */}
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
                    >
                        {/* Bar Chart */}
                        <section className="rounded-2xl border border-black/5 bg-white p-7 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.04)]">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                    <Users size={20} className="text-emerald-600" />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-zinc-900">Resident Demographics</div>
                                    <div className="text-xs text-zinc-400">Breakdown by gender</div>
                                </div>
                            </div>

                            <div className="h-[280px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={residentStats} barSize={36}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0ee" vertical={false} />
                                        <XAxis
                                            dataKey="name"
                                            stroke="#ccc"
                                            fontSize={11}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            stroke="#ccc"
                                            fontSize={11}
                                            tickLine={false}
                                            axisLine={false}
                                            allowDecimals={false}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "#fff",
                                                border: "1px solid #e8e8e6",
                                                borderRadius: "10px",
                                                boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                                                fontSize: "12px",
                                                color: "#333",
                                            }}
                                            cursor={{ fill: "rgba(76,175,110,0.04)" }}
                                        />
                                        <Bar dataKey="value" fill="#4caf6e" radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </section>

                        {/* Pie Chart */}
                        <section className="rounded-2xl border border-black/5 bg-white p-7 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.04)]">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="h-10 w-10 rounded-xl bg-sky-500/10 flex items-center justify-center">
                                    <ShieldAlert size={20} className="text-sky-500" />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-zinc-900">Security Distribution</div>
                                    <div className="text-xs text-zinc-400">Staffing demographics</div>
                                </div>
                            </div>

                            <div className="h-[280px] flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={securityStats}
                                            innerRadius={65}
                                            outerRadius={90}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {securityStats.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>

                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "#fff",
                                                border: "1px solid #e8e8e6",
                                                borderRadius: "10px",
                                                boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                                                fontSize: "12px",
                                                color: "#333",
                                            }}
                                        />

                                        <Legend
                                            iconType="circle"
                                            iconSize={8}
                                            wrapperStyle={{
                                                fontSize: "12px",
                                                color: "#888",
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </section>
                    </motion.div>

                    {/* Quick Insights */}
                    <motion.div
                        className="rounded-2xl border border-black/5 bg-white p-7 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.04)]"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <div className="flex items-center gap-2 mb-5">
                            <TrendingUp size={18} className="text-emerald-600" />
                            <h2 className="text-sm font-bold text-zinc-900">Quick Insights</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 transition hover:bg-zinc-100/60">
                                <div className="text-[0.65rem] font-semibold tracking-[0.1em] uppercase text-zinc-400 mb-2">
                                    Growth Rate
                                </div>
                                <div className="text-3xl font-bold tracking-tight text-emerald-600 leading-none mb-2">
                                    +12.5%
                                </div>
                                <div className="text-xs text-zinc-400">Increasing residents</div>
                            </div>

                            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 transition hover:bg-zinc-100/60">
                                <div className="text-[0.65rem] font-semibold tracking-[0.1em] uppercase text-zinc-400 mb-2">
                                    Pass Issuance
                                </div>
                                <div className="text-3xl font-bold tracking-tight text-sky-500 leading-none mb-2">
                                    High
                                </div>
                                <div className="text-xs text-zinc-400">Weekend peak detected</div>
                            </div>

                            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 transition hover:bg-zinc-100/60">
                                <div className="text-[0.65rem] font-semibold tracking-[0.1em] uppercase text-zinc-400 mb-2">
                                    Staff Density
                                </div>
                                <div className="text-3xl font-bold tracking-tight text-zinc-900 leading-none mb-2">
                                    1:20
                                </div>
                                <div className="text-xs text-zinc-400">Staff to Resident ratio</div>
                            </div>
                        </div>
                    </motion.div>
                </main>
            </div>
        </div>
    );
};

export default ReportsPage;