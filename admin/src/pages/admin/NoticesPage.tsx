import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Megaphone, Send, Loader2, AlertCircle, CheckCircle2,
    Trash2, Clock, Plus, History as HistoryIcon
} from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

interface Notice {
    id: number;
    title: string;
    content: string;
    importance: string;
    updatedAt: string;
}

const NoticesPage: React.FC = () => {
    const { user } = useAuth();
    const [notices, setNotices] = useState<Notice[]>([]);
    const [noticeContent, setNoticeContent] = useState('');
    const [noticeTitle, setNoticeTitle] = useState('');
    const [noticeImportance, setNoticeImportance] = useState('Low');
    const [publishing, setPublishing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [publishStatus, setPublishStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

    const fetchNotices = async () => {
        try {
            setLoading(true);
            const res = await api.get<Notice[]>('/api/admin/notices/all');
            setNotices(res.data);
        } catch (err) {
            console.error("Error fetching notices:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchNotices(); }, []);

    const handlePublishNotice = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!noticeContent.trim()) return;
        setPublishing(true);
        setPublishStatus(null);
        try {
            await api.post('/api/admin/notices/publish', {
                title: noticeTitle || "General Notice",
                content: noticeContent,
                importance: noticeImportance
            });
            setPublishStatus({ type: 'success', msg: 'Notice sent to all residents!' });
            setNoticeContent('');
            setNoticeTitle('');
            setNoticeImportance('Low');
            fetchNotices();
            setTimeout(() => setPublishStatus(null), 3000);
        } catch (err) {
            console.error("Error publishing notice:", err);
            setPublishStatus({ type: 'error', msg: 'Something went wrong. Please try again.' });
        } finally {
            setPublishing(false);
        }
    };

    const handleDeleteNotice = async (id: number) => {
        if (!confirm('Remove this notice? It will disappear from all resident dashboards.')) return;
        try {
            await api.delete(`/api/admin/notices/${id}`);
            setNotices(prev => prev.filter(n => n.id !== id));
        } catch (err) {
            console.error("Error deleting notice:", err);
            alert('Failed to delete notice');
        }
    };

    const importanceBadge = (importance: string) => {
        switch (importance) {
            case 'High': return { bg: 'rgba(224,92,92,0.08)', border: 'rgba(224,92,92,0.2)', color: '#e05c5c', label: 'Urgent' };
            case 'Medium': return { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', color: '#f59e0b', label: 'Medium' };
            default: return { bg: 'rgba(76,175,110,0.08)', border: 'rgba(76,175,110,0.2)', color: '#4caf6e', label: 'Standard' };
        }
    };

    const inputClass = `
        w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl
        text-gray-900 text-sm font-medium outline-none transition-all
        placeholder:text-gray-300
        focus:bg-white focus:border-green-400 focus:ring-4 focus:ring-green-400/10
    `;

    return (
        <div
            className="flex min-h-screen font-['Plus_Jakarta_Sans',sans-serif]"
            style={{
                backgroundColor: '#f7f7f5',
                backgroundImage: `
                    radial-gradient(circle at 5% 10%, rgba(134,197,152,0.10) 0%, transparent 45%),
                    radial-gradient(circle at 95% 90%, rgba(134,197,152,0.07) 0%, transparent 45%)
                `
            }}
        >
            <Sidebar />

            <main className="flex-1 px-5 py-8 md:pl-20 md:pr-10 md:py-10">

                {/* ── Header ── */}
                <motion.header
                    className="mb-8 flex flex-wrap items-start justify-between gap-4"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                    <div>

                        <h1 className="text-[1.85rem] font-bold text-gray-900 tracking-tight leading-tight mb-1">
                            Resident Notices
                        </h1>
                        <p className="text-sm text-gray-400">Post updates and announcements for your residents.</p>
                    </div>
                </motion.header>

                <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">

                    {/* ── Compose Form ── */}
                    <motion.section
                        className="bg-white rounded-[20px] p-7 border border-black/[0.04]"
                        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)' }}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
                    >
                        {/* Card header */}
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                                style={{ background: 'linear-gradient(135deg, #4caf6e, #5ec47f)', boxShadow: '0 2px 8px rgba(76,175,110,0.25)' }}>
                                <Plus size={20} />
                            </div>
                            <div>
                                <h2 className="text-[0.95rem] font-bold text-gray-900 leading-tight">New Announcement</h2>
                                <p className="text-xs text-gray-400 mt-0.5">This will appear on all resident dashboards.</p>
                            </div>
                        </div>

                        <form onSubmit={handlePublishNotice} className="flex flex-col gap-5">

                            {/* Title + Priority row */}
                            <div className="grid grid-cols-1 md:grid-cols-[1fr_180px] gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[0.72rem] font-medium text-gray-500 uppercase tracking-wider">Title</label>
                                    <input
                                        type="text"
                                        className={inputClass}
                                        placeholder="e.g. Water maintenance on Friday"
                                        value={noticeTitle}
                                        onChange={(e) => setNoticeTitle(e.target.value)}
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[0.72rem] font-medium text-gray-500 uppercase tracking-wider">Priority</label>
                                    <select
                                        className={`${inputClass} appearance-none cursor-pointer`}
                                        value={noticeImportance}
                                        onChange={(e) => setNoticeImportance(e.target.value)}
                                    >
                                        <option value="Low">Standard</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">Urgent</option>
                                    </select>
                                </div>
                            </div>

                            {/* Message */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[0.72rem] font-medium text-gray-500 uppercase tracking-wider">Message</label>
                                <textarea
                                    className={`${inputClass} min-h-[160px] resize-none`}
                                    placeholder="Write the message residents will see on their dashboard…"
                                    value={noticeContent}
                                    onChange={(e) => setNoticeContent(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={publishing || !noticeContent.trim()}
                                className="w-full py-3.5 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2.5 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0 disabled:cursor-not-allowed"
                                style={{
                                    background: 'linear-gradient(135deg, #4caf6e, #5ec47f)',
                                    boxShadow: '0 4px 14px rgba(76,175,110,0.28)'
                                }}
                            >
                                {publishing ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                {publishing ? 'Sending to residents…' : 'Send Notice'}
                            </button>

                            {/* Status feedback */}
                            <AnimatePresence>
                                {publishStatus && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className={`flex items-center gap-2.5 p-3.5 rounded-xl text-sm font-medium border ${publishStatus.type === 'success'
                                            ? 'bg-green-50 text-green-600 border-green-100'
                                            : 'bg-red-50 text-red-500 border-red-100'
                                            }`}
                                    >
                                        {publishStatus.type === 'success'
                                            ? <CheckCircle2 size={16} />
                                            : <AlertCircle size={16} />
                                        }
                                        {publishStatus.msg}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </form>
                    </motion.section>

                    {/* ── Recent Notices ── */}
                    <motion.div
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <div className="flex items-center gap-2 mb-4 px-1">
                            <HistoryIcon size={14} color="#4caf6e" />
                            <h2 className="text-[0.72rem] font-semibold text-gray-400 uppercase tracking-widest">Recent Notices</h2>
                        </div>

                        <div className="flex flex-col gap-3">
                            {loading ? (
                                [1, 2, 3].map(i => (
                                    <div key={i} className="h-28 bg-white rounded-[16px] animate-pulse border border-black/[0.04]"
                                        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }} />
                                ))
                            ) : notices.length === 0 ? (
                                <div className="p-10 text-center rounded-[16px] border-2 border-dashed border-gray-200 bg-white/60">
                                    <Megaphone size={24} className="mx-auto mb-3 text-gray-200" />
                                    <p className="text-sm text-gray-400">No notices sent yet.</p>
                                    <p className="text-xs text-gray-300 mt-1">Your announcements will appear here.</p>
                                </div>
                            ) : (
                                notices.map((notice, index) => {
                                    const badge = importanceBadge(notice.importance);
                                    return (
                                        <motion.div
                                            key={notice.id}
                                            layout
                                            initial={{ opacity: 0, x: 12 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.04 }}
                                            className="bg-white rounded-[16px] p-5 border border-black/[0.04] group transition-all hover:border-green-100"
                                            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)' }}
                                        >
                                            <div className="flex items-start justify-between mb-2.5">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[0.62rem] font-semibold uppercase tracking-widest"
                                                    style={{ background: badge.bg, border: `1px solid ${badge.border}`, color: badge.color }}>
                                                    {badge.label}
                                                </span>
                                                <button
                                                    onClick={() => handleDeleteNotice(notice.id)}
                                                    className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-200 hover:text-red-400 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                            <h3 className="text-sm font-bold text-gray-900 leading-tight mb-1.5 pr-2">{notice.title}</h3>
                                            <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed mb-3">{notice.content}</p>
                                            <div className="flex items-center gap-1.5 text-[0.65rem] text-gray-300 font-medium">
                                                <Clock size={10} />
                                                {new Date(notice.updatedAt).toLocaleDateString('en-US', {
                                                    month: 'short', day: 'numeric',
                                                    hour: '2-digit', minute: '2-digit'
                                                })}
                                            </div>
                                        </motion.div>
                                    );
                                })
                            )}
                        </div>
                    </motion.div>

                </div>
            </main>
        </div>
    );
};

export default NoticesPage;