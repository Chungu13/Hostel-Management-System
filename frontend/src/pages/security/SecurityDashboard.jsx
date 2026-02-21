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
    AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const SecurityDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        todayVerified: 0,
        currentInBuilding: 0
    });

    useEffect(() => {
        // Mocking behavior for dashboard stats
        setStats({
            todayVerified: 12,
            currentInBuilding: 5
        });
    }, []);

    return (
        <div className="flex bg-bg-darker min-h-screen">
            <Sidebar />
            <main className="ml-64 p-8 w-full">
                <header className="mb-10">
                    <h1 className="text-3xl font-bold italic">Security Control Unit</h1>
                    <p className="text-text-muted mt-2">Logged in as: {user.name || user.userName}</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                    <div className="glass p-8 flex items-center justify-between group hover:border-primary/30 transition-all">
                        <div>
                            <p className="text-text-muted text-sm font-medium">Verified Today</p>
                            <h3 className="text-4xl font-bold mt-1 text-primary">{stats.todayVerified}</h3>
                        </div>
                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                            <UserCheck className="w-8 h-8" />
                        </div>
                    </div>
                    <div className="glass p-8 flex items-center justify-between group hover:border-success/30 transition-all">
                        <div>
                            <p className="text-text-muted text-sm font-medium">Current Visitors</p>
                            <h3 className="text-4xl font-bold mt-1 text-success">{stats.currentInBuilding}</h3>
                        </div>
                        <div className="w-16 h-16 bg-success/10 rounded-2xl flex items-center justify-center text-success group-hover:scale-110 transition-transform">
                            <MapPin className="w-8 h-8" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <section className="glass p-8">
                            <h2 className="text-xl font-semibold mb-6 flex items-center gap-3">
                                <ShieldCheck className="text-primary" /> Active Duty Tasks
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Link to="/security/verify" className="btn btn-primary py-8 flex-col h-auto">
                                    <ShieldCheck className="w-10 h-10 mb-2" />
                                    <span>Verify Entry</span>
                                </Link>
                                <Link to="/security/history" className="btn glass border-white/5 hover:bg-white/5 py-8 flex-col h-auto">
                                    <History className="w-10 h-10 mb-2 text-primary" />
                                    <span>Vist History</span>
                                </Link>
                            </div>
                        </section>

                        <section className="glass p-6">
                            <h3 className="text-sm font-bold text-text-muted uppercase tracking-widest mb-4">Live Activity Log</h3>
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                                            <span className="text-sm font-medium">Visitor V00{i} Verified</span>
                                        </div>
                                        <span className="text-xs text-text-muted">{i * 10} mins ago</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    <aside className="space-y-6">
                        <div className="glass p-6 bg-error/5 border-error/10">
                            <h3 className="font-bold flex items-center gap-2 mb-2 text-error">
                                <AlertCircle className="w-4 h-4" /> Emergency Protocol
                            </h3>
                            <p className="text-sm text-text-muted leading-relaxed">
                                In case of unauthorized access, immediately lock down the main gate and alert the hostel supervisor.
                            </p>
                            <button className="btn bg-error text-white w-full mt-4 text-xs">
                                ALERT SUPERVISOR
                            </button>
                        </div>

                        <div className="glass p-6">
                            <h3 className="font-bold text-sm mb-4">Post Instructions</h3>
                            <ul className="space-y-3 text-xs text-text-muted">
                                <li className="flex gap-2"><ChevronRight className="w-3 h-3 text-primary shrink-0" /> Always check Physical ID</li>
                                <li className="flex gap-2"><ChevronRight className="w-3 h-3 text-primary shrink-0" /> Monitor Gate CCTV</li>
                                <li className="flex gap-2"><ChevronRight className="w-3 h-3 text-primary shrink-0" /> Record Entry/Exit times</li>
                            </ul>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
};

export default SecurityDashboard;
