import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import {
    History,
    Search,
    Calendar,
    User,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    FileText,
    MoreHorizontal,
    Filter,
    Download,
    TrendingUp
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

interface Visit {
    id: number;
    visitorName: string;
    visitorUsername: string;
    visitDate: string;
    residentUsername: string;
    purpose: string;
    status: string;
}

const HistoryPage: React.FC = () => {
    const { user } = useAuth();
    const [visits, setVisits] = useState<Visit[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                setLoading(true);
                const endpoint = user?.myRole === 'Resident'
                    ? `/api/visits/history/${user?.id}`
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
    }, [user?.id, user?.myRole]);

    const filteredVisits = visits.filter(v =>
        v.visitorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.visitorUsername.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusStyles = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'approved': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'rejected': return 'bg-red-50 text-red-600 border-red-100';
            default: return 'bg-slate-50 text-slate-500 border-slate-100';
        }
    };

    return (
        <div className="flex bg-slate-50 min-h-screen">
            <Sidebar />
            <main className="flex-1 p-8 ml-0 lg:ml-0 overflow-y-auto">
                {/* Header Section */}
                <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-primary text-[10px] font-bold uppercase tracking-widest mb-4">
                            <History size={12} />
                            Access Logs
                        </div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Visit History</h1>
                        <p className="text-slate-500 mt-1 font-medium">Comprehensive audit log of all your guest entries and requests.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 bg-white text-slate-700 border border-slate-200 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all">
                            <Download size={16} />
                            Export Data
                        </button>
                    </div>
                </header>

                {/* Search & Statistics Row */}
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-8">
                    <div className="xl:col-span-3 bg-white rounded-[2rem] p-4 border border-slate-100 shadow-sm flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search visitor by name or handle..."
                                className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-transparent rounded-[1.5rem] text-slate-900 outline-none transition-all focus:bg-white focus:border-primary/20 placeholder:text-slate-400 font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="p-4 bg-slate-50 text-slate-400 rounded-[1.25rem] hover:text-primary transition-colors">
                            <Filter size={20} />
                        </button>
                    </div>
                    <div className="bg-primary rounded-[2rem] p-6 text-white shadow-xl shadow-primary/20 flex flex-col justify-center">
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1">Total Entries</p>
                        <div className="flex items-end gap-2">
                            <span className="text-3xl font-black">{filteredVisits.length}</span>
                            <span className="text-xs font-bold opacity-70 mb-1.5 uppercase tracking-wider">Records</span>
                        </div>
                    </div>
                </div>

                {/* Activity Feed / List */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-slate-900">Activity Journal</h2>
                        <div className="flex items-center gap-2">
                            <TrendingUp size={16} className="text-emerald-500" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Real-time Sync</span>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-8 py-5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Visitor Profile</th>
                                    <th className="px-8 py-5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Schedule Details</th>
                                    <th className="px-8 py-5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Access Purpose</th>
                                    <th className="px-8 py-5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Clearance Status</th>
                                    <th className="px-8 py-5 text-right text-[11px] font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse border-b border-slate-50 last:border-0">
                                            <td className="px-8 py-6"><div className="w-40 h-10 bg-slate-100 rounded-xl" /></td>
                                            <td className="px-8 py-6"><div className="w-32 h-6 bg-slate-50 rounded-lg" /></td>
                                            <td className="px-8 py-6"><div className="w-48 h-6 bg-slate-50 rounded-lg" /></td>
                                            <td className="px-8 py-6"><div className="w-24 h-8 bg-slate-50 rounded-full" /></td>
                                            <td className="px-8 py-6"><div className="w-10 h-10 bg-slate-100 rounded-full ml-auto" /></td>
                                        </tr>
                                    ))
                                ) : filteredVisits.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-24 text-center">
                                            <div className="flex flex-col items-center gap-4 text-slate-300">
                                                <FileText size={64} className="opacity-20" />
                                                <div>
                                                    <p className="text-lg font-bold text-slate-400">Empty Logs</p>
                                                    <p className="text-sm font-medium">No visit records match your current criteria.</p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    <AnimatePresence>
                                        {filteredVisits.map((visit, index) => (
                                            <motion.tr
                                                key={visit.id || index}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="group hover:bg-slate-50/50 transition-all border-b border-slate-50 last:border-0"
                                            >
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-[1.25rem] bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black text-lg group-hover:scale-110 transition-transform">
                                                            {(visit.visitorName || 'G')[0].toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-slate-900">{visit.visitorName}</div>
                                                            <div className="text-[10px] text-primary uppercase font-bold tracking-widest">@{visit.visitorUsername}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-slate-700">{visit.visitDate}</span>
                                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5 mt-1">
                                                            <Clock size={12} /> Established Entry
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 lg:max-w-xs xl:max-w-sm">
                                                    <p className="text-sm text-slate-500 font-medium line-clamp-2 italic leading-relaxed">
                                                        "{visit.purpose}"
                                                    </p>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyles(visit.status)}`}>
                                                        {visit.status || 'Pending'}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <button className="w-10 h-10 flex items-center justify-center bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-slate-900 hover:shadow-lg transition-all ml-auto">
                                                        <MoreHorizontal size={18} />
                                                    </button>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {!loading && filteredVisits.length > 0 && (
                        <div className="p-8 bg-slate-50/30 flex items-center justify-center">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">End of Audit Log • Malo Identity Platform</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default HistoryPage;
