import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '../../components/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import {
    History, Search, Calendar, User, ShieldCheck,
    Filter, Download, ChevronRight, CheckCircle2,
    XCircle, Clock, FileText, ArrowUpDown
} from 'lucide-react';
import api from '../../utils/api';

type Visit = {
    id: number;
    visitorName: string;
    visitCode: string;
    visitDate: string;
    visitTime?: string;
    residentName: string;
    purpose: string;
    status: string;
    requestDate: string;
    resident?: {
        id: number;
        fullName?: string;
        name?: string;
    };
};

const VisitorHistoryPage: React.FC = () => {
    const [visits, setVisits] = useState<Visit[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
    const [selectedResident, setSelectedResident] = useState<any | null>(null);
    const [fetchingResident, setFetchingResident] = useState(false);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const response = await api.get<Visit[]>('/api/visits/admin/history');
            setVisits(response.data || []);
        } catch (err) {
            console.error("Error fetching admin history:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchResidentProfile = async (visit: Visit) => {
        const resId = visit.resident?.id;
        if (!resId) {
            alert("Resident ID not found for this record.");
            return;
        }

        setFetchingResident(true);
        try {
            const response = await api.get(`/api/profile/${resId}`);
            setSelectedResident(response.data);
        } catch (err) {
            console.error("Error fetching resident profile:", err);
            alert("Failed to load resident profile.");
        } finally {
            setFetchingResident(false);
        }
    };

    const filteredAndSorted = useMemo(() => {
        let result = [...visits];

        // Search
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            result = result.filter(v =>
                v.visitorName.toLowerCase().includes(term) ||
                v.residentName.toLowerCase().includes(term) ||
                v.visitCode.toLowerCase().includes(term)
            );
        }

        // Status Filter
        if (statusFilter !== 'All') {
            result = result.filter(v => v.status === statusFilter);
        }

        // Sort by ID (usually mimics creation order)
        result.sort((a, b) => {
            return sortOrder === 'desc' ? b.id - a.id : a.id - b.id;
        });

        return result;
    }, [visits, searchTerm, statusFilter, sortOrder]);

    const getStatusStyle = (status: string) => {
        switch (status.toLowerCase()) {
            case 'verified':
            case 'approved':
                return { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', icon: CheckCircle2 };
            case 'rejected':
            case 'cancelled':
                return { bg: 'bg-red-50', text: 'text-red-500', border: 'border-red-100', icon: XCircle };
            default:
                return { bg: 'bg-gray-50', text: 'text-gray-500', border: 'border-gray-100', icon: Clock };
        }
    };

    return (
        <div className="flex min-h-screen bg-[#f7f7f5] font-['Plus_Jakarta_Sans',sans-serif]">
            <Sidebar />

            <main className="flex-1 px-5 py-8 md:pl-20 md:pr-10 md:py-10 overflow-y-auto">
                {/* Header */}
                <motion.header
                    className="mb-8 flex flex-wrap items-end justify-between gap-4"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div>

                        <h1 className="page-title">Visit History</h1>
                        <p className="page-subtitle">Audit and track all visitor movements across the property.</p>
                    </div>

                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all shadow-sm">
                        <Download size={16} /> Export CSV
                    </button>
                </motion.header>

                {/* Filters Row */}
                <motion.div
                    className="mb-6 flex flex-wrap items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="relative flex-1 min-w-[300px]">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search visitor, resident or code..."
                            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-xl text-sm outline-none focus:bg-white focus:border-emerald-400 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <Filter size={16} className="text-gray-400" />
                        <select
                            className="bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm font-medium text-gray-600 outline-none focus:ring-2 focus:ring-emerald-400/20"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="All">All Statuses</option>
                            <option value="Approved">Approved</option>
                            <option value="Verified">Verified</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>

                    <button
                        onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-all"
                    >
                        <ArrowUpDown size={16} />
                        {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
                    </button>
                </motion.div>

                {/* Table */}
                <motion.div
                    className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-6 py-4 text-[0.7rem] font-bold text-gray-400 uppercase tracking-widest">Visitor Info</th>
                                    <th className="px-6 py-4 text-[0.7rem] font-bold text-gray-400 uppercase tracking-widest">Host Resident</th>
                                    <th className="px-6 py-4 text-[0.7rem] font-bold text-gray-400 uppercase tracking-widest">Visit Timing</th>
                                    <th className="px-6 py-4 text-[0.7rem] font-bold text-gray-400 uppercase tracking-widest">Purpose</th>
                                    <th className="px-6 py-4 text-[0.7rem] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={6} className="px-6 py-4"><div className="h-10 bg-gray-100 rounded-lg w-full"></div></td>
                                        </tr>
                                    ))
                                ) : filteredAndSorted.length > 0 ? (
                                    filteredAndSorted.map((visit) => {
                                        const StatusIcon = getStatusStyle(visit.status).icon;
                                        return (
                                            <tr key={visit.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold">
                                                            {visit.visitorName[0]}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-gray-800">{visit.visitorName}</p>
                                                            <p className="text-[0.65rem] font-mono text-gray-400">#{visit.visitCode}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => fetchResidentProfile(visit)}
                                                        className="flex items-center gap-2 text-sm text-emerald-600 font-bold hover:underline py-1 px-2 rounded-lg hover:bg-emerald-50 transition-all border border-transparent hover:border-emerald-100"
                                                    >
                                                        <User size={14} className="text-emerald-500" />
                                                        {visit.residentName}
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-700">{visit.visitDate}</p>
                                                        <p className="text-[0.7rem] text-gray-400 flex items-center gap-1 mt-0.5">
                                                            <Clock size={11} /> {visit.visitTime || "All Day"}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-[0.8rem] text-gray-500 italic max-w-[180px] truncate" title={visit.purpose}>
                                                        "{visit.purpose}"
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[0.65rem] font-bold border ${getStatusStyle(visit.status).bg} ${getStatusStyle(visit.status).text} ${getStatusStyle(visit.status).border} uppercase`}>
                                                        <StatusIcon size={12} />
                                                        {visit.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button className="p-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all">
                                                        <ChevronRight size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <FileText size={40} className="text-gray-200" />
                                                <p className="text-gray-400 font-medium">No visitor records matching your filters.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </main>

            {/* Resident Profile Modal */}
            <AnimatePresence>
                {selectedResident && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedResident(null)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-lg bg-white rounded-[32px] overflow-hidden shadow-2xl border border-gray-100"
                        >
                            {/* Profile Header */}
                            <div className="h-32 bg-emerald-600 relative">
                                <button
                                    onClick={() => setSelectedResident(null)}
                                    className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-all z-20"
                                >
                                    <XCircle size={20} />
                                </button>
                                <div className="absolute -bottom-12 left-8 p-1.5 bg-white rounded-[24px] shadow-lg">
                                    <div className="w-24 h-24 rounded-[20px] bg-emerald-50 flex items-center justify-center text-emerald-600 text-3xl font-bold">
                                        {selectedResident.fullName?.[0] || selectedResident.email?.[0]}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-16 pb-8 px-10">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">{selectedResident.fullName || "Loading..."}</h2>
                                    <p className="text-emerald-600 font-semibold text-sm">Host Resident</p>
                                </div>

                                <div className="mt-8 space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-1">
                                            <p className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest">Email Address</p>
                                            <div className="flex items-center gap-2 text-[0.9rem] font-semibold text-gray-700">
                                                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                                                    <User size={14} />
                                                </div>
                                                {selectedResident.email}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest">Phone Number</p>
                                            <div className="flex items-center gap-2 text-[0.9rem] font-semibold text-gray-700">
                                                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                                                    <Clock size={14} />
                                                </div>
                                                {selectedResident.phone || "Not provided"}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-gray-50">
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-1">
                                                <p className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest">NRC / IC</p>
                                                <p className="text-[0.9rem] font-bold text-gray-800">{selectedResident.ic || "N/A"}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest">Property</p>
                                                <p className="text-[0.9rem] font-bold text-emerald-600 underline">
                                                    {selectedResident.propertyName || "Hostel Resident"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setSelectedResident(null)}
                                    className="mt-10 w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-sm hover:bg-gray-800 transition-all active:scale-[0.98] shadow-lg shadow-gray-200"
                                >
                                    Close Profile
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Global Fetching Overlay */}
            {fetchingResident && (
                <div className="fixed inset-0 z-[200] bg-white/40 backdrop-blur-[1px] flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                </div>
            )}
        </div>
    );
};

export default VisitorHistoryPage;
