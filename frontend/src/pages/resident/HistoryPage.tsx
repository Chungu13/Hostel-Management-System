import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../../components/Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import {
    History,
    Search,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    FileText,
    Calendar,
    User,
    Loader2,
    X,
    Share2,
    LinkIcon,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";
import QRCodePass from "../../components/QRCodePass";

type Role = "Resident" | "Security Staff" | string;

type UserShape = {
    id?: string;
    userName?: string;
    name?: string;
    myRole?: Role;
};

type Visit = {
    id?: number | string;
    visitorName: string;
    visitCode: string;
    visitDate: string;
    visitTime?: string;
    residentName?: string;
    resident?: {
        id: number;
        name: string;
        email: string;
        phone: string;
        ic: string;
        room: string;
    };
    purpose: string;
    status?: string;
};

type StatusConfig = {
    bg: string;
    text: string;
    border: string;
    icon: React.ReactNode;
    color: string;
};

const VisitHistory: React.FC = () => {
    const { user } = useAuth() as { user: UserShape };

    const [visits, setVisits] = useState<Visit[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
    const [selectedResident, setSelectedResident] = useState<any | null>(null);
    const [fetchingResident, setFetchingResident] = useState(false);
    const [cancelling, setCancelling] = useState(false);

    const fetchHistory = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const endpoint =
                user.myRole === "Resident"
                    ? `/api/visits/resident/${user.id}`
                    : "/api/visits/history";
            const response = await api.get<Visit[]>(endpoint);
            setVisits(response.data ?? []);
        } catch (err) {
            console.error("Error fetching history:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [user?.id, user?.myRole]);

    const handleCancelVisit = async (visitId?: number | string) => {
        if (!visitId) return;
        setCancelling(true);
        try {
            await api.delete(`/api/visits/${visitId}`);
            await fetchHistory();
            setSelectedVisit(null);
        } catch (err) {
            console.error("Error deleting visit:", err);
        } finally {
            setCancelling(false);
        }
    };

    const handleClearHistory = async () => {
        if (!window.confirm("Are you sure you want to clear your visit history from view? This action cannot be undone.")) return;
        try {
            await api.post("/api/profile/clear-history");
            await fetchHistory();
        } catch (err) {
            console.error("Error clearing history:", err);
            alert("Failed to clear history.");
        }
    };

    const fetchResidentProfile = async (visit: Visit) => {
        const resId = visit.resident?.id;
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

    const handleShare = async (visit: Visit) => {
        const passUrl = `${window.location.origin}/guest-pass/${visit.visitCode}`;
        const text = `Guest Access Pass for ${user?.name || "Resident"}\n\nAccess Code: ${visit.visitCode}\n\nView Digital Pass: ${passUrl}\n\nPlease present this code/QR at the security gate.`;
        if (navigator.share) {
            try { await navigator.share({ title: "Guest Access Pass", text, url: passUrl }); }
            catch (err) { console.log("Error sharing", err); }
        } else {
            try { await navigator.clipboard.writeText(text); alert("Pass details and URL copied to clipboard!"); }
            catch (err) { console.error("Failed to copy!", err); }
        }
    };

    const handleCopyUrl = async (visit: Visit) => {
        const passUrl = `${window.location.origin}/guest-pass/${visit.visitCode}`;
        try { await navigator.clipboard.writeText(passUrl); alert("Digital pass link copied!"); }
        catch (err) { console.error("Failed to copy!", err); }
    };

    const filteredVisits = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        if (!term) return visits;
        return visits.filter((v) => {
            const name = (v.visitorName ?? "").toLowerCase();
            const code = (v.visitCode ?? "").toLowerCase();
            return name.includes(term) || code.includes(term);
        });
    }, [visits, searchTerm]);

    const getStatusConfig = (status?: string): StatusConfig => {
        switch ((status ?? "").toLowerCase()) {
            case "approved":
            case "verified":
                return { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200", icon: <CheckCircle2 size={11} />, color: "#4caf6e" };
            case "rejected":
            case "cancelled":
                return { bg: "bg-red-50", text: "text-red-400", border: "border-red-200", icon: <XCircle size={11} />, color: "#e05c5c" };
            default:
                return { bg: "bg-gray-50", text: "text-gray-400", border: "border-gray-200", icon: <AlertCircle size={11} />, color: "#bbb" };
        }
    };

    const countLabel = `${filteredVisits.length} ${filteredVisits.length === 1 ? "record" : "records"} found`;

    return (
        <div
            className="flex min-h-screen bg-[#f7f7f5] font-['Plus_Jakarta_Sans',sans-serif]"
            style={{
                backgroundImage:
                    "radial-gradient(circle at 5% 10%, rgba(134,197,152,0.10) 0%, transparent 45%), radial-gradient(circle at 95% 90%, rgba(134,197,152,0.07) 0%, transparent 45%)",
            }}
        >
            <Sidebar />

            <main className="w-full box-border px-5 py-8 md:py-10 md:pl-20 md:pr-10 text-gray-900">

                {/* ── Header ── */}
                <motion.div
                    className="mb-7 flex flex-wrap items-start justify-between gap-4"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                    <div>
                        <div className="mb-2.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.08em]"
                            style={{ background: 'rgba(76,175,110,0.08)', border: '1px solid rgba(76,175,110,0.2)', color: '#4caf6e' }}>
                            <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                            Records
                        </div>
                        <h1 className="m-0 flex items-center gap-2.5 text-[1.85rem] font-bold tracking-tight text-gray-900 leading-tight">
                            <History size={24} color="#4caf6e" />
                            Visit Records
                        </h1>
                        <p className="m-0 mt-1 text-sm text-gray-400">
                            {user.myRole === "Resident"
                                ? "Track your guest logs and QR passes"
                                : "Complete system-wide visitor logs"}
                        </p>
                    </div>

                    <div className="flex items-center gap-3 mt-1">
                        <button
                            onClick={handleClearHistory}
                            className="rounded-xl border border-red-200 bg-red-50/50 px-4 py-2 text-[0.8rem] font-bold text-red-500 transition hover:bg-red-50 active:scale-95"
                            style={{ boxShadow: '0 1px 3px rgba(220,38,38,0.04)' }}
                        >
                            Clear History
                        </button>

                        <div className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-[0.8rem] font-medium text-gray-500 whitespace-nowrap"
                            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                            <span className="font-bold" style={{ color: '#4caf6e' }}>{filteredVisits.length}</span>{" "}
                            {countLabel.replace(/^\d+\s/, "")}
                        </div>
                    </div>
                </motion.div>

                {/* ── Search ── */}
                <motion.div
                    className="mb-5 flex items-center gap-4 rounded-2xl border border-black/5 bg-white px-5 py-4"
                    style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)' }}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
                >
                    <div className="relative flex-1 max-w-[400px]">
                        <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                        <input
                            type="text"
                            placeholder="Search by guest name or access code…"
                            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3.5 text-sm text-gray-900 outline-none transition focus:border-green-400 focus:bg-white focus:ring-4"
                            style={{ '--tw-ring-color': 'rgba(76,175,110,0.1)' } as React.CSSProperties}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <span className="hidden whitespace-nowrap text-xs text-gray-400 sm:inline">Filter results</span>
                </motion.div>

                {/* ── Table ── */}
                <motion.div
                    className="overflow-hidden rounded-[18px] border border-black/5 bg-white"
                    style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)' }}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
                >
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left">
                            <thead className="border-b border-gray-100 bg-gray-50">
                                <tr>
                                    <th className="whitespace-nowrap px-5 py-3.5 text-[0.68rem] font-semibold uppercase tracking-widest text-gray-400">Guest Details</th>
                                    <th className="whitespace-nowrap px-5 py-3.5 text-[0.68rem] font-semibold uppercase tracking-widest text-gray-400">Date & Time</th>
                                    {user.myRole !== "Resident" && (
                                        <th className="whitespace-nowrap px-5 py-3.5 text-[0.68rem] font-semibold uppercase tracking-widest text-gray-400">Host</th>
                                    )}
                                    <th className="whitespace-nowrap px-5 py-3.5 text-[0.68rem] font-semibold uppercase tracking-widest text-gray-400">Purpose</th>
                                    <th className="whitespace-nowrap px-5 py-3.5 text-[0.68rem] font-semibold uppercase tracking-widest text-gray-400">Status</th>
                                </tr>
                            </thead>

                            <tbody>
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="border-b border-gray-50 last:border-b-0">
                                            {[40, 24, 20, 36, 20].map((w, j) => (
                                                <td key={j} className="px-5 py-4">
                                                    <div className={`h-3 w-${w} animate-pulse rounded-md bg-gray-100`} />
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : (
                                    filteredVisits.map((visit, index) => {
                                        const cfg = getStatusConfig(visit.status);
                                        const avatarLetter = (visit.visitorName || "G")[0]?.toUpperCase();
                                        return (
                                            <motion.tr
                                                key={visit.id ?? `${visit.visitCode}-${index}`}
                                                initial={{ opacity: 0, x: -8 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.04, duration: 0.3 }}
                                                onClick={() => setSelectedVisit(visit)}
                                                className="border-b border-gray-50 transition hover:bg-gray-50/80 last:border-b-0 cursor-pointer"
                                            >
                                                <td className="px-5 py-3.5 align-middle">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-[0.9rem] font-bold transition"
                                                            style={{ background: 'rgba(76,175,110,0.1)', color: '#4caf6e' }}>
                                                            {avatarLetter}
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-semibold text-gray-900 leading-tight">{visit.visitorName}</div>
                                                            <div className="text-xs text-gray-400">Code: {visit.visitCode}</div>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-5 py-3.5 align-middle">
                                                    <div className="text-sm font-medium text-gray-700">{visit.visitDate}</div>
                                                    <div className="mt-0.5 flex items-center gap-1 text-[0.72rem] text-gray-400">
                                                        <Clock size={11} /> {visit.visitTime || "All day"}
                                                    </div>
                                                </td>

                                                {user.myRole !== "Resident" && (
                                                    <td className="px-5 py-3.5 align-middle">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                fetchResidentProfile(visit);
                                                            }}
                                                            className="text-sm text-emerald-600 font-semibold hover:underline bg-emerald-50 px-2 py-1 rounded-lg transition-colors border border-emerald-100"
                                                        >
                                                            {visit.residentName ?? visit.resident?.name ?? "—"}
                                                        </button>
                                                    </td>
                                                )}

                                                <td className="px-5 py-3.5 align-middle">
                                                    <div className="max-w-[200px] truncate text-[0.82rem] italic text-gray-400" title={visit.purpose}>
                                                        "{visit.purpose}"
                                                    </div>
                                                </td>

                                                <td className="px-5 py-3.5 align-middle">
                                                    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-wide ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                                                        {cfg.icon}
                                                        {visit.status || "Pending"}
                                                    </span>
                                                </td>
                                            </motion.tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Empty state */}
                    {!loading && filteredVisits.length === 0 && (
                        <div className="flex flex-col items-center gap-3 px-5 py-20 text-center">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
                                <FileText size={24} className="text-gray-300" />
                            </div>
                            <p className="m-0 text-base font-semibold text-gray-700">No records found</p>
                            <p className="m-0 text-sm text-gray-400">
                                {searchTerm ? "Try adjusting your search term." : "No visit records have been logged yet."}
                            </p>
                        </div>
                    )}
                </motion.div>
            </main>

            {/* ── Visit Details Modal ── */}
            <AnimatePresence>
                {selectedVisit && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedVisit(null)}
                            className="absolute inset-0 bg-black/20 backdrop-blur-[3px]"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 16 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 16 }}
                            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                            className="relative w-full max-w-sm overflow-hidden rounded-[22px] bg-white text-gray-900"
                            style={{ boxShadow: '0 8px 48px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)' }}
                        >
                            <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[22px]"
                                style={{ background: 'linear-gradient(90deg, #4caf6e, #81c995)' }} />

                            <div className="p-5 pt-6">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-base flex-shrink-0"
                                        style={{ background: 'linear-gradient(135deg, #4caf6e, #81c995)', boxShadow: '0 2px 8px rgba(76,175,110,0.25)' }}>
                                        {(selectedVisit.visitorName || "G")[0].toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-900 leading-tight truncate">{selectedVisit.visitorName}</p>
                                        <p className="text-[0.68rem] text-gray-400 font-mono mt-0.5">#{selectedVisit.visitCode}</p>
                                    </div>
                                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wide flex-shrink-0
                                        ${getStatusConfig(selectedVisit.status).bg}
                                        ${getStatusConfig(selectedVisit.status).text}
                                        ${getStatusConfig(selectedVisit.status).border}`}>
                                        {getStatusConfig(selectedVisit.status).icon}
                                        {selectedVisit.status || "Unknown"}
                                    </span>
                                    <button
                                        onClick={() => setSelectedVisit(null)}
                                        className="w-8 h-8 rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors flex-shrink-0"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>

                                {selectedVisit.status?.toLowerCase() !== "verified" &&
                                    selectedVisit.status?.toLowerCase() !== "cancelled" &&
                                    user.myRole === "Resident" && (
                                        <div className="flex flex-col items-center rounded-xl pb-4 mb-4"
                                            style={{ borderBottom: '1px solid #f2f2f0' }}>
                                            <QRCodePass
                                                value={selectedVisit.visitCode}
                                                size={130}
                                                className="rounded-xl"
                                                style={{ boxShadow: '0 2px 12px rgba(76,175,110,0.12)' }}
                                            />
                                            <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.62rem] font-semibold uppercase tracking-widest"
                                                style={{ background: 'rgba(76,175,110,0.08)', border: '1px solid rgba(76,175,110,0.18)', color: '#4caf6e' }}>
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                                                Guest Access Pass
                                            </div>
                                        </div>
                                    )}

                                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                                    <div>
                                        <p className="mb-1 text-[0.62rem] font-semibold uppercase tracking-widest text-gray-400">Date & Time</p>
                                        <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-800">
                                            <Calendar size={12} color="#4caf6e" />
                                            {selectedVisit.visitDate} {selectedVisit.visitTime && `@ ${selectedVisit.visitTime}`}
                                        </p>
                                    </div>
                                    {user.myRole !== "Resident" && (
                                        <div>
                                            <p className="mb-1 text-[0.62rem] font-semibold uppercase tracking-widest text-gray-400">Host Resident</p>
                                            <button
                                                onClick={() => fetchResidentProfile(selectedVisit)}
                                                className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600 hover:underline"
                                            >
                                                <User size={12} />
                                                {selectedVisit.residentName ?? selectedVisit.resident?.name ?? "—"}
                                            </button>
                                        </div>
                                    )}
                                    <div className="col-span-2 pt-3" style={{ borderTop: '1px solid #f2f2f0' }}>
                                        <p className="mb-1 text-[0.62rem] font-semibold uppercase tracking-widest text-gray-400">Visit Purpose</p>
                                        <p className="text-sm italic leading-relaxed text-gray-500">
                                            "{selectedVisit.purpose || "No purpose provided"}"
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {user.myRole === "Resident" && (
                                <div className="flex gap-2.5 px-5 pb-5">
                                    <button
                                        onClick={() => handleShare(selectedVisit)}
                                        className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                                        style={{ background: '#1a1a1a', boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}
                                    >
                                        <Share2 size={15} /> Share
                                    </button>
                                    <button
                                        onClick={() => handleCopyUrl(selectedVisit)}
                                        className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                                        style={{ background: 'linear-gradient(135deg, #4caf6e, #5ec47f)', boxShadow: '0 4px 14px rgba(76,175,110,0.28)' }}
                                    >
                                        <LinkIcon size={15} /> Copy Link
                                    </button>
                                    {selectedVisit.status?.toLowerCase() === "approved" && (
                                        <button
                                            onClick={() => handleCancelVisit(selectedVisit.id)}
                                            disabled={cancelling}
                                            className="flex-1 flex items-center justify-center rounded-xl py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:opacity-50"
                                            style={{ background: '#e05c5c', boxShadow: '0 4px 12px rgba(224,92,92,0.22)' }}
                                        >
                                            {cancelling ? <Loader2 size={15} className="animate-spin" /> : "Cancel"}
                                        </button>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

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
                                    <X size={18} />
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
                                        <CheckCircle2 size={16} color="#4caf6e" />
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
                                            <Clock size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[0.62rem] font-bold text-gray-400 uppercase tracking-widest">Email Address</p>
                                            <p className="text-sm font-semibold text-gray-800">{selectedResident.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100">
                                        <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-emerald-600 shadow-sm">
                                            <User size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[0.62rem] font-bold text-gray-400 uppercase tracking-widest">Phone Number</p>
                                            <p className="text-sm font-semibold text-gray-800">{selectedResident.phone || "N/A"}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100">
                                        <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-emerald-600 shadow-sm">
                                            <FileText size={18} />
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

export default VisitHistory;