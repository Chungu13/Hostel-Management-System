import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { motion } from 'framer-motion';
import {
    Clock,
    CheckCircle2,
    AlertCircle,
    Calendar,
    PlusCircle,
    History,
    ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const ResidentDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        pending: 0,
        approved: 0,
        upcoming: null
    });

    useEffect(() => {
        const fetchResidentStats = async () => {
            try {
                const response = await api.get(`/api/visits/history/${user.userName}`);
                const visits = response.data;
                setStats({
                    pending: visits.filter(v => v.status === 'Pending').length,
                    approved: visits.filter(v => v.status === 'Approved').length,
                    upcoming: visits.find(v => v.status === 'Approved')
                });
            } catch (err) {
                console.error("Error fetching resident stats:", err);
            }
        };
        fetchResidentStats();
    }, [user.userName]);

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

                .rd-root {
                    display: flex;
                    min-height: 100vh;
                    background-color: #f7f7f5;
                    background-image:
                        radial-gradient(circle at 5% 10%, rgba(134, 197, 152, 0.1) 0%, transparent 45%),
                        radial-gradient(circle at 95% 90%, rgba(134, 197, 152, 0.07) 0%, transparent 45%);
                    font-family: 'Plus Jakarta Sans', sans-serif;
                }

                .rd-main {
                    margin-left: 0;
                    padding: 40px 40px 40px 80px;
                    width: 100%;
                    box-sizing: border-box;
                }

                /* Header */
                .rd-header {
                    margin-bottom: 36px;
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 12px;
                }

                .rd-header-left {}

                .rd-greeting {
                    font-size: 1.9rem;
                    font-weight: 700;
                    color: #111;
                    letter-spacing: -0.03em;
                    line-height: 1.15;
                    margin: 0 0 4px;
                }

                .rd-greeting span {
                    color: #4caf6e;
                }

                .rd-subtext {
                    font-size: 0.875rem;
                    color: #999;
                    font-weight: 400;
                    margin: 0;
                }

                .rd-date-badge {
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
                .rd-stats {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 16px;
                    margin-bottom: 28px;
                }

                @media (max-width: 768px) {
                    .rd-stats { grid-template-columns: 1fr; }
                    .rd-main { margin-left: 0; padding: 24px 20px; }
                    .rd-bottom { grid-template-columns: 1fr !important; }
                }

                .rd-stat-card {
                    background: #fff;
                    border-radius: 18px;
                    padding: 24px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04);
                    border: 1px solid rgba(0,0,0,0.04);
                    position: relative;
                    overflow: hidden;
                }

                .rd-stat-card::after {
                    content: '';
                    position: absolute;
                    bottom: 0; left: 0; right: 0;
                    height: 3px;
                    border-radius: 0 0 18px 18px;
                }

                .rd-stat-warning::after { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
                .rd-stat-success::after { background: linear-gradient(90deg, #4caf6e, #81c995); }
                .rd-stat-primary::after { background: linear-gradient(90deg, #60a5fa, #93c5fd); }

                .rd-stat-icon-wrap {
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 16px;
                }

                .rd-stat-icon-warning { background: rgba(245, 158, 11, 0.1); }
                .rd-stat-icon-success { background: rgba(76, 175, 110, 0.1); }
                .rd-stat-icon-primary { background: rgba(96, 165, 250, 0.1); }

                .rd-stat-value {
                    font-size: 2rem;
                    font-weight: 700;
                    color: #111;
                    letter-spacing: -0.03em;
                    line-height: 1;
                    margin-bottom: 4px;
                }

                .rd-stat-value-sm {
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: #111;
                    letter-spacing: -0.02em;
                    line-height: 1.2;
                    margin-bottom: 4px;
                }

                .rd-stat-label {
                    font-size: 0.8rem;
                    color: #999;
                    font-weight: 400;
                }

                /* Bottom Grid */
                .rd-bottom {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                }

                .rd-section-card {
                    background: #fff;
                    border-radius: 18px;
                    padding: 28px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04);
                    border: 1px solid rgba(0,0,0,0.04);
                }

                .rd-section-title {
                    font-size: 1rem;
                    font-weight: 700;
                    color: #111;
                    letter-spacing: -0.01em;
                    margin: 0 0 20px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                /* Quick Tool Links */
                .rd-tool-link {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    padding: 16px 18px;
                    border-radius: 14px;
                    text-decoration: none;
                    transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
                    margin-bottom: 10px;
                    border: 1.5px solid transparent;
                }

                .rd-tool-link:last-child { margin-bottom: 0; }

                .rd-tool-primary {
                    background: linear-gradient(135deg, #4caf6e, #5ec47f);
                    color: #fff;
                    box-shadow: 0 4px 14px rgba(76, 175, 110, 0.25);
                }

                .rd-tool-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(76, 175, 110, 0.32);
                }

                .rd-tool-secondary {
                    background: #f9f9f8;
                    color: #333;
                    border-color: #e8e8e6;
                }

                .rd-tool-secondary:hover {
                    background: #f2f2f0;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.06);
                }

                .rd-tool-icon-wrap {
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .rd-tool-primary .rd-tool-icon-wrap {
                    background: rgba(255,255,255,0.2);
                }

                .rd-tool-secondary .rd-tool-icon-wrap {
                    background: rgba(76, 175, 110, 0.1);
                }

                .rd-tool-info { flex: 1; }

                .rd-tool-title {
                    font-size: 0.9rem;
                    font-weight: 600;
                    line-height: 1;
                    margin-bottom: 3px;
                }

                .rd-tool-desc {
                    font-size: 0.75rem;
                    opacity: 0.7;
                }

                .rd-tool-arrow {
                    flex-shrink: 0;
                    transition: transform 0.2s;
                }

                .rd-tool-link:hover .rd-tool-arrow {
                    transform: translateX(4px);
                }

                /* Notice */
                .rd-notice {
                    background: #f9f9f8;
                    border: 1px solid #e8e8e6;
                    border-radius: 14px;
                    padding: 18px;
                }

                .rd-notice-text {
                    font-size: 0.855rem;
                    color: #555;
                    line-height: 1.65;
                    margin: 0 0 12px;
                }

                .rd-notice-text strong {
                    color: #333;
                    font-weight: 600;
                }

                .rd-notice-footer {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.75rem;
                    color: #bbb;
                }
            `}</style>

            <div className="rd-root">
                <Sidebar />
                <main className="rd-main">

                    {/* Header */}
                    <motion.header
                        className="rd-header"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <div className="rd-header-left">
                            <h1 className="rd-greeting">
                                Hello, <span>{user.name || user.userName}</span>!
                            </h1>
                            <p className="rd-subtext">Manage your visitor passes and stay updated.</p>
                        </div>
                        <div className="rd-date-badge">
                            <Calendar size={14} />
                            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </div>
                    </motion.header>

                    {/* Stat Cards */}
                    <motion.div
                        className="rd-stats"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <div className="rd-stat-card rd-stat-warning">
                            <div className="rd-stat-icon-wrap rd-stat-icon-warning">
                                <Clock size={20} color="#f59e0b" />
                            </div>
                            <div className="rd-stat-value">{stats.pending}</div>
                            <div className="rd-stat-label">Pending Requests</div>
                        </div>

                        <div className="rd-stat-card rd-stat-success">
                            <div className="rd-stat-icon-wrap rd-stat-icon-success">
                                <CheckCircle2 size={20} color="#4caf6e" />
                            </div>
                            <div className="rd-stat-value">{stats.approved}</div>
                            <div className="rd-stat-label">Active Passes</div>
                        </div>

                        <div className="rd-stat-card rd-stat-primary">
                            <div className="rd-stat-icon-wrap rd-stat-icon-primary">
                                <Calendar size={20} color="#60a5fa" />
                            </div>
                            <div className="rd-stat-value-sm">
                                {stats.upcoming ? stats.upcoming.visitDate : 'No Upcoming'}
                            </div>
                            <div className="rd-stat-label">Next Guest Visit</div>
                        </div>
                    </motion.div>

                    {/* Bottom Grid */}
                    <motion.div
                        className="rd-bottom"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
                    >
                        {/* Quick Tools */}
                        <section className="rd-section-card">
                            <h2 className="rd-section-title">Quick Tools</h2>

                            <Link to="/resident/visit-request" className="rd-tool-link rd-tool-primary">
                                <div className="rd-tool-icon-wrap">
                                    <PlusCircle size={20} color="#fff" />
                                </div>
                                <div className="rd-tool-info">
                                    <div className="rd-tool-title">New Visit Pass</div>
                                    <div className="rd-tool-desc">Register a guest for entry</div>
                                </div>
                                <ArrowRight size={18} className="rd-tool-arrow" color="#fff" />
                            </Link>

                            <Link to="/resident/history" className="rd-tool-link rd-tool-secondary">
                                <div className="rd-tool-icon-wrap">
                                    <History size={20} color="#4caf6e" />
                                </div>
                                <div className="rd-tool-info">
                                    <div className="rd-tool-title">Past Records</div>
                                    <div className="rd-tool-desc">Review your visitor logs</div>
                                </div>
                                <ArrowRight size={18} className="rd-tool-arrow" color="#aaa" />
                            </Link>
                        </section>

                        {/* Notice */}
                        <section className="rd-section-card">
                            <h2 className="rd-section-title">
                                <AlertCircle size={17} color="#4caf6e" />
                                Resident Notice
                            </h2>
                            <div className="rd-notice">
                                <p className="rd-notice-text">
                                    Please ensure your guests have their <strong>Access PIN</strong> ready for the security staff upon arrival.
                                    Unverified visitors will not be permitted entry.
                                </p>
                                <div className="rd-notice-footer">
                                    <Clock size={12} /> Updated 2 hours ago
                                </div>
                            </div>
                        </section>
                    </motion.div>

                </main>
            </div>
        </>
    );
};

export default ResidentDashboard;
