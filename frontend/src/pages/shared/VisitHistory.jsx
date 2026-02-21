import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { motion } from 'framer-motion';
import { History, Search, Calendar, User, Clock, CheckCircle2, XCircle, AlertCircle, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const VisitHistory = () => {
    const { user } = useAuth();
    const [visits, setVisits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const endpoint = user.myRole === 'Resident'
                    ? `/api/visits/history/${user.userName}`
                    : '/api/visits/history';

                const response = await api.get(endpoint);
                setVisits(response.data);
            } catch (err) {
                console.error("Error fetching history:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [user.userName, user.myRole]);

    const filteredVisits = visits.filter(v =>
        v.visitorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.visitorUsername.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusConfig = (status) => {
        switch (status?.toLowerCase()) {
            case 'approved': return { bg: 'rgba(76,175,110,0.1)', color: '#4caf6e', border: 'rgba(76,175,110,0.25)', icon: <CheckCircle2 size={11} /> };
            case 'pending': return { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: 'rgba(245,158,11,0.25)', icon: <Clock size={11} /> };
            case 'rejected': return { bg: 'rgba(224,92,92,0.1)', color: '#e05c5c', border: 'rgba(224,92,92,0.25)', icon: <XCircle size={11} /> };
            default: return { bg: 'rgba(0,0,0,0.04)', color: '#999', border: '#e8e8e6', icon: <AlertCircle size={11} /> };
        }
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

                .vh-root {
                    display: flex;
                    min-height: 100vh;
                    background-color: #f7f7f5;
                    background-image:
                        radial-gradient(circle at 5% 10%, rgba(134, 197, 152, 0.1) 0%, transparent 45%),
                        radial-gradient(circle at 95% 90%, rgba(134, 197, 152, 0.07) 0%, transparent 45%);
                    font-family: 'Plus Jakarta Sans', sans-serif;
                }

                .vh-main {
                    margin-left: 0;
                    padding: 40px 40px 40px 80px;
                    width: 100%;
                    box-sizing: border-box;
                }

                @media (max-width: 640px) {
                    .vh-main { padding: 24px 20px 24px 70px; }
                }

                /* Header */
                .vh-header {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 16px;
                    margin-bottom: 28px;
                }

                .vh-step-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    background: rgba(76, 175, 110, 0.08);
                    border: 1px solid rgba(76, 175, 110, 0.2);
                    color: #4caf6e;
                    font-size: 0.72rem;
                    font-weight: 600;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    padding: 4px 10px;
                    border-radius: 20px;
                    margin-bottom: 10px;
                }

                .vh-step-dot {
                    width: 6px;
                    height: 6px;
                    background: #4caf6e;
                    border-radius: 50%;
                }

                .vh-heading {
                    font-size: 1.85rem;
                    font-weight: 700;
                    color: #111;
                    letter-spacing: -0.03em;
                    line-height: 1.2;
                    margin: 0 0 6px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .vh-subtext {
                    font-size: 0.875rem;
                    color: #999;
                    font-weight: 400;
                    margin: 0;
                }

                /* Count badge */
                .vh-count-badge {
                    background: #fff;
                    border: 1px solid #e8e8e6;
                    border-radius: 10px;
                    padding: 8px 16px;
                    font-size: 0.8rem;
                    font-weight: 500;
                    color: #777;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
                    align-self: flex-start;
                    margin-top: 4px;
                    white-space: nowrap;
                }

                .vh-count-badge span {
                    font-weight: 700;
                    color: #4caf6e;
                }

                /* Search bar */
                .vh-search-wrap {
                    background: #fff;
                    border-radius: 16px;
                    padding: 16px 20px;
                    margin-bottom: 20px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04);
                    border: 1px solid rgba(0,0,0,0.04);
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .vh-search-inner {
                    position: relative;
                    flex: 1;
                    max-width: 400px;
                }

                .vh-search-icon {
                    position: absolute;
                    left: 14px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #bbb;
                    pointer-events: none;
                }

                .vh-search-input {
                    width: 100%;
                    padding: 10px 14px 10px 40px;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    font-size: 0.875rem;
                    color: #111;
                    background: #f9f9f8;
                    border: 1.5px solid #e8e8e6;
                    border-radius: 10px;
                    outline: none;
                    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
                    box-sizing: border-box;
                }

                .vh-search-input::placeholder { color: #c8c8c5; }

                .vh-search-input:focus {
                    border-color: #4caf6e;
                    background: #fff;
                    box-shadow: 0 0 0 3px rgba(76,175,110,0.1);
                }

                .vh-search-label {
                    font-size: 0.75rem;
                    color: #bbb;
                    font-weight: 400;
                    white-space: nowrap;
                }

                /* Table Card */
                .vh-table-card {
                    background: #fff;
                    border-radius: 18px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04);
                    border: 1px solid rgba(0,0,0,0.04);
                    overflow: hidden;
                }

                .vh-table {
                    width: 100%;
                    border-collapse: collapse;
                    text-align: left;
                }

                .vh-thead tr {
                    background: #f9f9f8;
                    border-bottom: 1px solid #ebebea;
                }

                .vh-thead th {
                    padding: 14px 18px;
                    font-size: 0.68rem;
                    font-weight: 600;
                    color: #aaa;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                    white-space: nowrap;
                }

                .vh-tbody tr {
                    border-bottom: 1px solid #f2f2f0;
                    transition: background 0.15s;
                }

                .vh-tbody tr:last-child {
                    border-bottom: none;
                }

                .vh-tbody tr:hover {
                    background: #fafafa;
                }

                .vh-tbody td {
                    padding: 14px 18px;
                    vertical-align: middle;
                }

                /* Guest cell */
                .vh-guest-cell {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .vh-guest-avatar {
                    width: 36px;
                    height: 36px;
                    border-radius: 10px;
                    background: rgba(76,175,110,0.1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    font-size: 0.9rem;
                    font-weight: 700;
                    color: #4caf6e;
                    transition: transform 0.15s;
                }

                .vh-tbody tr:hover .vh-guest-avatar {
                    transform: scale(1.08);
                }

                .vh-guest-name {
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: #222;
                    line-height: 1.2;
                }

                .vh-guest-user {
                    font-size: 0.75rem;
                    color: #aaa;
                    font-weight: 400;
                }

                /* Date cell */
                .vh-date {
                    font-size: 0.875rem;
                    font-weight: 500;
                    color: #333;
                    line-height: 1.2;
                }

                .vh-date-sub {
                    font-size: 0.72rem;
                    color: #bbb;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    margin-top: 2px;
                }

                /* Host cell */
                .vh-host {
                    font-size: 0.875rem;
                    color: #555;
                    font-weight: 400;
                }

                /* Purpose cell */
                .vh-purpose {
                    max-width: 200px;
                    font-size: 0.82rem;
                    color: #888;
                    font-style: italic;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                /* Status badge */
                .vh-status {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    padding: 4px 10px;
                    border-radius: 20px;
                    font-size: 0.68rem;
                    font-weight: 700;
                    letter-spacing: 0.06em;
                    text-transform: uppercase;
                    border: 1px solid;
                    white-space: nowrap;
                }

                /* Empty state */
                .vh-empty {
                    padding: 80px 20px;
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 12px;
                }

                .vh-empty-icon {
                    width: 64px;
                    height: 64px;
                    background: #f5f5f3;
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 4px;
                }

                .vh-empty-title {
                    font-size: 1rem;
                    font-weight: 600;
                    color: #333;
                    margin: 0;
                }

                .vh-empty-sub {
                    font-size: 0.82rem;
                    color: #bbb;
                    margin: 0;
                }

                /* Loading skeleton */
                .vh-skeleton-row td {
                    padding: 16px 18px;
                }

                .vh-skeleton-bar {
                    height: 12px;
                    background: linear-gradient(90deg, #f0f0ee 25%, #e8e8e6 50%, #f0f0ee 75%);
                    background-size: 200% 100%;
                    animation: shimmer 1.4s infinite;
                    border-radius: 6px;
                }

                @keyframes shimmer {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
            `}</style>

            <div className="vh-root">
                <Sidebar />
                <main className="vh-main">

                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <div className="vh-header">
                            <div>
                                <div className="vh-step-badge">
                                    <div className="vh-step-dot" />
                                    Records
                                </div>
                                <h1 className="vh-heading">
                                    <History size={26} color="#4caf6e" strokeWidth={2.5} />
                                    Visit Records
                                </h1>
                                <p className="vh-subtext">
                                    {user.myRole === 'Resident' ? 'Track your guest logs and requests' : 'Complete system-wide visitor logs'}
                                </p>
                            </div>
                            <div className="vh-count-badge">
                                <span>{filteredVisits.length}</span> {filteredVisits.length === 1 ? 'record' : 'records'} found
                            </div>
                        </div>
                    </motion.div>

                    {/* Search */}
                    <motion.div
                        className="vh-search-wrap"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <div className="vh-search-inner">
                            <Search size={16} className="vh-search-icon" />
                            <input
                                type="text"
                                placeholder="Search by guest name or username…"
                                className="vh-search-input"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <span className="vh-search-label">Filter results</span>
                    </motion.div>

                    {/* Table */}
                    <motion.div
                        className="vh-table-card"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <div style={{ overflowX: 'auto' }}>
                            <table className="vh-table">
                                <thead className="vh-thead">
                                    <tr>
                                        <th>Guest Details</th>
                                        <th>Date</th>
                                        {user.myRole !== 'Resident' && <th>Host</th>}
                                        <th>Purpose</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody className="vh-tbody">
                                    {loading ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <tr key={i} className="vh-skeleton-row">
                                                <td><div className="vh-skeleton-bar" style={{ width: '160px' }} /></td>
                                                <td><div className="vh-skeleton-bar" style={{ width: '90px' }} /></td>
                                                {user.myRole !== 'Resident' && <td><div className="vh-skeleton-bar" style={{ width: '80px' }} /></td>}
                                                <td><div className="vh-skeleton-bar" style={{ width: '140px' }} /></td>
                                                <td><div className="vh-skeleton-bar" style={{ width: '70px' }} /></td>
                                            </tr>
                                        ))
                                    ) : (
                                        filteredVisits.map((visit, index) => {
                                            const statusCfg = getStatusConfig(visit.status);
                                            return (
                                                <motion.tr
                                                    key={visit.id || index}
                                                    initial={{ opacity: 0, x: -8 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.04, duration: 0.3 }}
                                                >
                                                    <td>
                                                        <div className="vh-guest-cell">
                                                            <div className="vh-guest-avatar">
                                                                {(visit.visitorName || 'G')[0].toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <div className="vh-guest-name">{visit.visitorName}</div>
                                                                <div className="vh-guest-user">@{visit.visitorUsername}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="vh-date">{visit.visitDate}</div>
                                                        <div className="vh-date-sub">
                                                            <Clock size={11} /> Scheduled
                                                        </div>
                                                    </td>
                                                    {user.myRole !== 'Resident' && (
                                                        <td>
                                                            <span className="vh-host">{visit.residentUsername}</span>
                                                        </td>
                                                    )}
                                                    <td>
                                                        <div className="vh-purpose" title={visit.purpose}>
                                                            "{visit.purpose}"
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span
                                                            className="vh-status"
                                                            style={{
                                                                background: statusCfg.bg,
                                                                color: statusCfg.color,
                                                                borderColor: statusCfg.border
                                                            }}
                                                        >
                                                            {statusCfg.icon}
                                                            {visit.status || 'Pending'}
                                                        </span>
                                                    </td>
                                                </motion.tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {filteredVisits.length === 0 && !loading && (
                            <div className="vh-empty">
                                <div className="vh-empty-icon">
                                    <FileText size={28} color="#ccc" />
                                </div>
                                <p className="vh-empty-title">No records found</p>
                                <p className="vh-empty-sub">
                                    {searchTerm ? 'Try adjusting your search term.' : 'No visit records have been logged yet.'}
                                </p>
                            </div>
                        )}
                    </motion.div>

                </main>
            </div>
        </>
    );
};

export default VisitHistory;
