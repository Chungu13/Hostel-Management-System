import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { motion } from 'framer-motion';
import {
    ShieldCheck,
    UserCheck,
    LogOut,
    History,
    Search,
    ChevronRight,
    MapPin,
    AlertCircle,
    Activity,
    Radar,
    Lock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const SecurityDashboard: React.FC = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        todayVerified: 0,
        currentInBuilding: 0,
        activeSensors: 8,
        threatLevel: 'Low'
    });

    useEffect(() => {
        // Mocking behavior for dashboard stats
        setStats(prev => ({
            ...prev,
            todayVerified: 12,
            currentInBuilding: 5
        }));
    }, []);

    return (
        <div className="flex bg-slate-900 min-h-screen text-slate-100 font-sans">
            <Sidebar />
            <main className="flex-1 p-8 ml-0 lg:ml-0 overflow-y-auto">
                {/* Tactical Header */}
                <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8">
                    <div>
                        <div className="flex items-center gap-2 text-emerald-500 font-black text-[10px] uppercase tracking-[0.3em] mb-3">
                            <Radar size={14} className="animate-pulse" />
                            Live Surveillance Active
                        </div>
                        <h1 className="text-4xl font-black tracking-tight text-white mb-1">
                            Security <span className="text-emerald-500">Control Hub</span>
                        </h1>
                        <p className="text-slate-400 font-medium text-sm flex items-center gap-2">
                            <Activity size={14} className="text-slate-500" />
                            Operator: {user?.name || `ID #${user?.id}`} • District 7 Sector 4
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="px-5 py-3 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center">
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 text-center">Threat Level</span>
                            <span className="text-xs font-black text-emerald-500 uppercase flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                                Nominal
                            </span>
                        </div>
                        <div className="px-5 py-3 bg-red-500/10 border border-red-500/20 rounded-2xl flex flex-col items-center">
                            <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest mb-1 text-center">Alert Protocol</span>
                            <span className="text-xs font-black text-red-400 uppercase italic">Standby</span>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] relative overflow-hidden group shadow-2xl"
                    >
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                            <UserCheck size={60} />
                        </div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Verified Today</p>
                        <h3 className="text-5xl font-black text-white group-hover:text-emerald-400 transition-colors">{stats.todayVerified}</h3>
                    </motion.div>

                    <motion.div
                        whileHover={{ y: -5 }}
                        className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] relative overflow-hidden group shadow-2xl"
                    >
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                            <MapPin size={60} />
                        </div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Inside Perimeter</p>
                        <h3 className="text-5xl font-black text-white group-hover:text-primary transition-colors">{stats.currentInBuilding}</h3>
                    </motion.div>

                    <motion.div
                        whileHover={{ y: -5 }}
                        className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] relative overflow-hidden group shadow-2xl"
                    >
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Radar size={60} />
                        </div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Online Sensors</p>
                        <h3 className="text-5xl font-black text-white group-hover:text-amber-400 transition-colors">{stats.activeSensors}</h3>
                    </motion.div>

                    <motion.div
                        whileHover={{ y: -5 }}
                        className="bg-emerald-500 p-8 rounded-[2.5rem] relative overflow-hidden group shadow-2xl shadow-emerald-500/20"
                    >
                        <div className="absolute top-0 right-0 p-6 opacity-20">
                            <Activity size={60} className="text-white" />
                        </div>
                        <p className="text-[10px] font-black text-emerald-900 uppercase tracking-[0.2em] mb-4">System Status</p>
                        <h3 className="text-3xl font-black text-emerald-950 italic">OPERATIONAL</h3>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                    <div className="xl:col-span-2 space-y-10">
                        {/* Action Grid */}
                        <section>
                            <div className="flex items-center gap-4 mb-8 px-4">
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                <h2 className="text-lg font-black uppercase tracking-widest text-slate-300">Tactical Actions</h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <Link to="/security/verify" className="bg-emerald-500 hover:bg-emerald-400 h-[220px] rounded-[3rem] p-10 flex flex-col justify-between group transition-all shadow-xl shadow-emerald-500/10 active:scale-[0.98]">
                                    <ShieldCheck size={48} className="text-emerald-950 group-hover:scale-110 transition-transform" />
                                    <div>
                                        <h3 className="text-2xl font-black text-emerald-950 tracking-tight">Verify Identity</h3>
                                        <p className="text-emerald-900/60 font-bold text-sm">Scan QR or Manual Entry</p>
                                    </div>
                                </Link>
                                <Link to="/security/history" className="bg-white/5 border border-white/10 hover:border-white/20 h-[220px] rounded-[3rem] p-10 flex flex-col justify-between group transition-all active:scale-[0.98]">
                                    <History size={48} className="text-white group-hover:scale-110 transition-transform" />
                                    <div>
                                        <h3 className="text-2xl font-black text-white tracking-tight">Access History</h3>
                                        <p className="text-slate-500 font-bold text-sm">Review full entrance logs</p>
                                    </div>
                                </Link>
                            </div>
                        </section>

                        {/* Event Feed */}
                        <section className="bg-white/5 border border-white/10 rounded-[3rem] p-10">
                            <div className="flex items-center justify-between mb-10">
                                <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">Live Intelligence Feed</h3>
                                <div className="flex items-center gap-2 group cursor-pointer text-[10px] font-black text-emerald-500">
                                    REFRESH COMM-LINK
                                    <Activity size={12} className="group-hover:rotate-180 transition-transform duration-500" />
                                </div>
                            </div>
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5 hover:border-white/10 transition-all">
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                                <UserCheck size={24} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-white leading-none mb-1 text-sm">Visitor Clear: #V-00{i * 32}</p>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Entry Point Alpha • Clearance Level 1</p>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-black text-emerald-500/50">{i * 8}m ago</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Lateral Intel Column */}
                    <aside className="space-y-8">
                        <section className="bg-red-500/10 border border-red-500/20 rounded-[2.5rem] p-8 text-red-500 relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-1 bg-red-500 animate-pulse" />
                            <h3 className="font-black text-sm flex items-center gap-3 mb-4 uppercase tracking-widest">
                                <AlertCircle size={20} className="animate-bounce" />
                                Critical Alert
                            </h3>
                            <p className="text-xs font-bold text-red-400/80 leading-relaxed mb-6">
                                Unauthorized perimeter breach detected at Sector 9. Initiate manual override if visual contact fails.
                            </p>
                            <button className="w-full py-4 bg-red-500 text-white font-black rounded-2xl shadow-xl shadow-red-500/20 hover:scale-[1.02] active:scale-95 transition-all text-xs flex items-center justify-center gap-2">
                                <Lock size={14} />
                                ACTIVATE LOCKDOWN
                            </button>
                        </section>

                        <section className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8">
                            <h3 className="font-black text-xs text-slate-400 uppercase tracking-widest mb-6">Standard Protocols</h3>
                            <ul className="space-y-6">
                                {[
                                    { label: 'ID Verification', desc: 'Scan all physical credentials' },
                                    { label: 'CCTV Monitoring', desc: 'Active sweep every 15 mins' },
                                    { label: 'Incident Logging', desc: 'Report any verbal disputes' }
                                ].map((step, idx) => (
                                    <li key={idx} className="flex gap-4">
                                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-black text-emerald-500 shrink-0 border border-emerald-500/20">
                                            0{idx + 1}
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-white uppercase tracking-wider">{step.label}</p>
                                            <p className="text-[10px] text-slate-500 font-bold">{step.desc}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </section>

                        <div className="text-center">
                            <p className="text-[9px] text-slate-600 font-black uppercase tracking-[0.4em]">Malo OS Security v14.2</p>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
};

export default SecurityDashboard;
