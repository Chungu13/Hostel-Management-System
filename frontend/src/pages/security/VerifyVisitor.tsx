import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldCheck, Fingerprint, CheckCircle,
    XCircle, Loader2, ScanLine, ChevronLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const VerifyVisitor: React.FC = () => {
    const [visitCode, setVisitCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string; data?: any } | null>(null);
    const [selectedResident, setSelectedResident] = useState<any | null>(null);
    const [fetchingResident, setFetchingResident] = useState(false);

    const fetchResidentProfile = async (resId: number) => {
        if (!resId) return;
        setFetchingResident(true);
        try {
            const response = await api.get(`/api/profile/${resId}`);
            setSelectedResident(response.data);
        } catch (err) {
            console.error("Error fetching resident profile:", err);
        } finally {
            setFetchingResident(false);
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);
        try {
            const response = await api.post('/api/security/verify', { visitCode });
            setResult({ success: true, message: response.data.message, data: response.data });
        } catch (err: any) {
            setResult({ success: false, message: err.response?.data?.message || 'Verification failed.' });
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setResult(null);
        setVisitCode('');
    };

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

            <main className="flex-1 px-5 py-8 md:pl-20 md:pr-10 md:py-10 overflow-y-auto">

                {/* ── Header ── */}
                <motion.header
                    className="mb-8"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >

                    <h1 className="text-[1.85rem] font-bold text-gray-900 tracking-tight leading-tight mb-1">
                        Visitor Check-In
                    </h1>
                    <p className="text-sm text-gray-400">
                        Enter the visitor's code or scan their QR code for entry.
                    </p>
                </motion.header>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 max-w-4xl">

                    {/* ── Input Card ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
                        className="bg-white rounded-[20px] p-7 border"
                        style={{
                            border: '1px solid rgba(0,0,0,0.04)',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)'
                        }}
                    >
                        {/* Card header */}
                        <div className="flex items-center gap-3 mb-6">

                            <div>
                                <h2 className="text-[0.9rem] font-bold text-gray-900 leading-tight">Enter Access Code</h2>
                                <p className="text-xs text-gray-400 mt-0.5">Found on the visitor's QR pass</p>
                            </div>
                        </div>

                        <form onSubmit={handleVerify} className="flex flex-col gap-5">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[0.72rem] font-medium text-gray-500 uppercase tracking-wider">
                                    Visit Code
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-mono font-bold text-xl tracking-[0.2em] outline-none transition-all placeholder:text-gray-300 placeholder:font-normal placeholder:text-base placeholder:tracking-normal focus:bg-white focus:border-green-400 focus:ring-4 focus:ring-green-400/10 uppercase"
                                    placeholder="e.g. ABC12345"
                                    maxLength={8}
                                    value={visitCode}
                                    onChange={(e) => setVisitCode(e.target.value.toUpperCase())}
                                    required
                                    autoFocus
                                />
                                <p className="text-[0.68rem] text-gray-400 px-0.5">
                                    The 8-character code shown on the visitor's pass.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !visitCode.trim()}
                                className="w-full py-3.5 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2.5 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0 disabled:cursor-not-allowed"
                                style={{
                                    background: loading || !visitCode.trim()
                                        ? '#d1d5db'
                                        : 'linear-gradient(135deg, #4caf6e, #5ec47f)',
                                    boxShadow: loading || !visitCode.trim()
                                        ? 'none'
                                        : '0 4px 14px rgba(76,175,110,0.28)'
                                }}
                            >
                                {loading
                                    ? <Loader2 size={17} className="animate-spin" />
                                    : <ShieldCheck size={17} />
                                }
                                {loading ? 'Checking…' : 'Verify Access Pass'}
                            </button>
                        </form>
                    </motion.div>

                    {/* ── Result Card ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <AnimatePresence mode="wait">

                            {/* Idle state */}
                            {!result && !loading && (
                                <motion.div
                                    key="idle"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="bg-white rounded-[20px] p-7 border flex flex-col items-center justify-center text-center h-full min-h-[220px]"
                                    style={{
                                        border: '1px solid rgba(0,0,0,0.04)',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)'
                                    }}
                                >
                                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                                        style={{ background: 'rgba(76,175,110,0.06)', border: '1px solid rgba(76,175,110,0.12)' }}>
                                        <ScanLine size={26} color="#c8e6c9" />
                                    </div>
                                    <p className="text-sm font-semibold text-gray-400">Waiting for a code</p>
                                    <p className="text-xs text-gray-300 mt-1">Results will appear here once verified.</p>
                                </motion.div>
                            )}

                            {/* Success */}
                            {result?.success && (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.97 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.97 }}
                                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                    className="bg-white rounded-[20px] p-7 border flex flex-col items-center text-center"
                                    style={{
                                        border: '1px solid rgba(76,175,110,0.2)',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 20px rgba(76,175,110,0.1)'
                                    }}
                                >
                                    {/* Green top bar */}
                                    <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[20px]"
                                        style={{ background: 'linear-gradient(90deg, #4caf6e, #81c995)' }} />

                                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                                        style={{ background: 'rgba(76,175,110,0.1)', border: '1.5px solid rgba(76,175,110,0.25)' }}>
                                        <CheckCircle size={32} color="#4caf6e" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900 mb-1.5">Visitor Approved</h2>
                                    <p className="text-sm text-gray-400 mb-6 leading-relaxed max-w-[240px]">
                                        {result.message}
                                    </p>

                                    {result.data && (
                                        <div className="w-full rounded-xl p-4 mb-5 text-left flex flex-col gap-2.5"
                                            style={{ background: '#f9f9f8', border: '1px solid #ebebea' }}>
                                            {result.data.visitorName && (
                                                <div>
                                                    <p className="text-[0.62rem] text-gray-400 uppercase tracking-widest font-medium">Visitor</p>
                                                    <p className="text-sm font-semibold text-gray-800">{result.data.visitorName}</p>
                                                </div>
                                            )}
                                            {result.data.residentName && (
                                                <div>
                                                    <p className="text-[0.62rem] text-gray-400 uppercase tracking-widest font-medium">Visiting</p>
                                                    <button
                                                        onClick={() => fetchResidentProfile(result.data.residentId)}
                                                        className="text-sm font-semibold text-emerald-600 hover:underline text-left block"
                                                    >
                                                        {result.data.residentName}
                                                    </button>
                                                </div>
                                            )}
                                            {result.data.visitDate && (
                                                <div className="flex gap-4">
                                                    <div className="flex-1">
                                                        <p className="text-[0.62rem] text-gray-400 uppercase tracking-widest font-medium">Date</p>
                                                        <p className="text-sm font-semibold text-gray-800">{result.data.visitDate}</p>
                                                    </div>
                                                    {result.data.visitTime && (
                                                        <div className="flex-1">
                                                            <p className="text-[0.62rem] text-gray-400 uppercase tracking-widest font-medium">Time</p>
                                                            <p className="text-sm font-semibold text-gray-800">{result.data.visitTime}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <button
                                        onClick={handleReset}
                                        className="w-full py-3 text-sm font-semibold rounded-xl transition-all hover:-translate-y-0.5"
                                        style={{
                                            background: 'linear-gradient(135deg, #4caf6e, #5ec47f)',
                                            color: '#fff',
                                            boxShadow: '0 4px 14px rgba(76,175,110,0.25)'
                                        }}
                                    >
                                        Verify Another
                                    </button>
                                </motion.div>
                            )}

                            {/* Failure */}
                            {result && !result.success && (
                                <motion.div
                                    key="fail"
                                    initial={{ opacity: 0, scale: 0.97 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.97 }}
                                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                    className="bg-white rounded-[20px] p-7 border flex flex-col items-center text-center"
                                    style={{
                                        border: '1px solid rgba(224,92,92,0.2)',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 20px rgba(224,92,92,0.08)'
                                    }}
                                >
                                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                                        style={{ background: 'rgba(224,92,92,0.08)', border: '1.5px solid rgba(224,92,92,0.2)' }}>
                                        <XCircle size={32} color="#e05c5c" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900 mb-1.5">Access Denied</h2>
                                    <p className="text-sm text-gray-400 mb-4 leading-relaxed max-w-[240px]">
                                        {result.message}
                                    </p>
                                    <div className="w-full rounded-xl p-3.5 mb-5 text-sm text-red-400 font-medium"
                                        style={{ background: 'rgba(224,92,92,0.06)', border: '1px solid rgba(224,92,92,0.15)' }}>
                                        Don't let this person in. Ask them to contact their host.
                                    </div>
                                    <button
                                        onClick={handleReset}
                                        className="w-full py-3 text-sm font-semibold rounded-xl border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
                                    >
                                        Try Again
                                    </button>
                                </motion.div>
                            )}

                        </AnimatePresence>
                    </motion.div>
                </div>
            </main>

            {/* ── Resident Profile Modal ── */}
            <AnimatePresence>
                {selectedResident && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedResident(null)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-[4px]"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-sm rounded-[24px] bg-white overflow-hidden text-gray-900"
                            style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
                        >
                            <div className="relative h-24 bg-gradient-to-br from-emerald-600 to-emerald-400">
                                <button
                                    onClick={() => setSelectedResident(null)}
                                    className="absolute top-4 right-4 z-10 p-1.5 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
                                >
                                    <CheckCircle size={18} />
                                </button>
                            </div>

                            <div className="px-6 pb-8 text-center -mt-12">
                                <div className="inline-block relative">
                                    <div className="w-24 h-24 rounded-[30px] bg-white p-1.5 shadow-xl">
                                        <div className="w-full h-full rounded-[24px] bg-emerald-50 flex items-center justify-center overflow-hidden border border-emerald-100">
                                            {selectedResident.profileImage ? (
                                                <img src={selectedResident.profileImage} alt="Avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-3xl font-bold text-emerald-600">
                                                    {(selectedResident.fullName || "R")[0]}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md">
                                        <CheckCircle size={16} color="#4caf6e" />
                                    </div>
                                </div>

                                <h2 className="text-xl font-bold text-gray-900 mt-4 mb-1">
                                    {selectedResident.fullName}
                                </h2>
                                <p className="text-xs font-semibold text-emerald-600 bg-emerald-50 inline-block px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-100">
                                    Verified Resident
                                </p>

                                <div className="mt-8 space-y-4 text-left">
                                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100">
                                        <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-emerald-600 shadow-sm">
                                            <Fingerprint size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[0.62rem] font-bold text-gray-400 uppercase tracking-widest">Email Address</p>
                                            <p className="text-sm font-semibold text-gray-800">{selectedResident.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100">
                                        <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-emerald-600 shadow-sm">
                                            <ShieldCheck size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[0.62rem] font-bold text-gray-400 uppercase tracking-widest">Phone Number</p>
                                            <p className="text-sm font-semibold text-gray-800">{selectedResident.phone || "N/A"}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100">
                                        <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-emerald-600 shadow-sm">
                                            <Fingerprint size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[0.62rem] font-bold text-gray-400 uppercase tracking-widest">NRC Number</p>
                                            <p className="text-sm font-semibold text-gray-800">{selectedResident.ic || "N/A"}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 flex gap-3">
                                    <button
                                        onClick={() => setSelectedResident(null)}
                                        className="flex-1 py-3.5 rounded-2xl bg-gray-900 text-white text-sm font-bold shadow-lg shadow-gray-200 hover:bg-black transition-all hover:-translate-y-0.5"
                                    >
                                        Close Profile
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Loading overlay for resident profile */}
            {fetchingResident && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center bg-white/20 backdrop-blur-[2px]">
                    <div className="bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3 border border-gray-100">
                        <Loader2 size={18} className="animate-spin text-emerald-600" />
                        <span className="text-sm font-semibold text-gray-600">Loading profile...</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VerifyVisitor;