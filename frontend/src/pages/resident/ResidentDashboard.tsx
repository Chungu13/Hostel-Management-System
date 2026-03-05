import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../../components/Sidebar";
import { motion } from "framer-motion";
import {
    Clock,
    CheckCircle2,
    AlertCircle,
    Calendar,
    PlusCircle,
    History,
    ArrowRight,
    ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";

type VisitStatus = "Approved" | "Rejected" | string;

type Visit = {
    id?: number | string;
    status: VisitStatus;
    visitDate: string; // ISO or parseable date string
};

type Stats = {
    approved: number;
    upcoming: Visit | null;
};

type Notice = {
    title: string;
    content: string;
    importance: string;
    updatedAt: string;
};

type UserShape = {
    id?: string;
    name?: string;
    email?: string;
};

const ResidentDashboard: React.FC = () => {
    const { user } = useAuth() as { user: UserShape };

    const [stats, setStats] = useState<Stats>({
        approved: 0,
        upcoming: null,
    });
    const [notice, setNotice] = useState<Notice | null>(null);
    const [securityOnDuty, setSecurityOnDuty] = useState<any[]>([]);

    const todayLabel = useMemo(
        () =>
            new Date().toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
            }),
        []
    );

    useEffect(() => {
        const fetchResidentStats = async () => {
            if (!user?.id) return;

            try {
                const response = await api.get<Visit[]>(
                    `/api/visits/resident/${user.id}`
                );

                const visits = response.data ?? [];
                const approvedVisits = visits.filter((v) => v.status === "Approved");

                // Choose the nearest FUTURE approved visit
                const now = new Date();
                const upcoming =
                    approvedVisits
                        .map((v) => ({ ...v, _d: new Date(v.visitDate) }))
                        .filter((v) => !Number.isNaN(v._d.getTime()))
                        .filter((v) => v._d >= now)
                        .sort((a, b) => a._d.getTime() - b._d.getTime())[0] ?? null;

                setStats({
                    approved: approvedVisits.length,
                    upcoming: upcoming
                        ? { id: upcoming.id, status: upcoming.status, visitDate: upcoming.visitDate }
                        : null,
                });
            } catch (err) {
                console.error("Error fetching resident stats:", err);
            }
        };

        const fetchNotice = async () => {
            try {
                const res = await api.get<Notice>("/api/notices/latest");
                if (res.data) setNotice(res.data);
            } catch (err) {
                console.error("Error fetching notice:", err);
            }
        };

        const fetchSecurityOnDuty = async () => {
            // In a real scenario, the resident has a propertyId in their token/user object
            // Let's assume the backend handles the mapping if we hit /api/security/on-duty/{propertyId}
            // or we can add a generic endpoint for "my property security"
            // For now, let's use the propertyId from user if available.
            const propertyId = (user as any)?.propertyId;
            if (propertyId) {
                try {
                    const res = await api.get(`/api/security/on-duty/${propertyId}`);
                    setSecurityOnDuty(res.data);
                } catch (err) {
                    console.error("Error fetching security status:", err);
                }
            }
        };

        fetchResidentStats();
        fetchNotice();
        fetchSecurityOnDuty();
    }, [user?.id, (user as any)?.propertyId]);

    return (
        <div
            className="flex min-h-screen bg-[#f7f7f5] font-sans"
            style={{
                backgroundImage:
                    "radial-gradient(circle at 5% 10%, rgba(134, 197, 152, 0.10) 0%, transparent 45%), radial-gradient(circle at 95% 90%, rgba(134, 197, 152, 0.07) 0%, transparent 45%)",
            }}
        >
            <Sidebar />

            <main className="w-full box-border px-5 py-6 md:py-10 md:pl-20 md:pr-10">
                {/* Header */}
                <motion.header
                    className="mb-9 flex flex-wrap items-start justify-between gap-3"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                    <div>
                        <h1 className="m-0 text-[1.9rem] font-bold tracking-[-0.03em] text-zinc-900 leading-tight">
                            Hello,{" "}
                            <span className="text-emerald-600">
                                {user?.name || user?.email || "Resident"}
                            </span>
                            !
                        </h1>
                        <p className="m-0 text-sm font-normal text-zinc-400">
                            Manage your visitor passes and stay updated.
                        </p>
                    </div>

                    <div className="mt-1 inline-flex items-center gap-2 whitespace-nowrap rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-[0.8rem] font-medium text-zinc-500 shadow-sm">
                        <Calendar size={14} />
                        {todayLabel}
                    </div>
                </motion.header>

                {/* Stat Cards */}
                <motion.div
                    className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
                >
                    {/* Approved */}
                    <div className="relative overflow-hidden rounded-[18px] border border-black/5 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.04)]">
                        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-[10px] bg-emerald-600/10">
                            <CheckCircle2 size={20} className="text-emerald-600" />
                        </div>

                        <div className="mb-1 text-[2rem] font-bold tracking-[-0.03em] leading-none text-zinc-900">
                            {stats.approved}
                        </div>
                        <div className="text-[0.8rem] font-normal text-zinc-400">
                            Active Passes
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 h-[3px] rounded-b-[18px] bg-gradient-to-r from-emerald-600 to-emerald-300" />
                    </div>

                    {/* Upcoming */}
                    <div className="relative overflow-hidden rounded-[18px] border border-black/5 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.04)]">
                        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-[10px] bg-sky-500/10">
                            <Calendar size={20} className="text-sky-400" />
                        </div>

                        <div className="mb-1 text-[1.1rem] font-bold tracking-[-0.02em] leading-snug text-zinc-900">
                            {stats.upcoming ? stats.upcoming.visitDate : "No Upcoming"}
                        </div>
                        <div className="text-[0.8rem] font-normal text-zinc-400">
                            Next Guest Visit
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 h-[3px] rounded-b-[18px] bg-gradient-to-r from-sky-400 to-sky-200" />
                    </div>
                </motion.div>

                {/* Bottom Grid */}
                <motion.div
                    className="grid grid-cols-1 gap-5 md:grid-cols-3"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
                >
                    {/* Security on Duty */}
                    <section className="rounded-[18px] border border-black/5 bg-white p-7 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.04)]">
                        <h2 className="mb-5 flex items-center gap-2 text-base font-bold tracking-[-0.01em] text-zinc-900">
                            <ShieldCheck size={17} className="text-emerald-600" />
                            Security on Duty
                        </h2>
                        <div className="space-y-3">
                            {securityOnDuty.length > 0 ? (
                                securityOnDuty.map((staff, idx) => (
                                    <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 font-bold text-xs">
                                            {staff.name ? staff.name[0] : 'S'}
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold text-zinc-900">{staff.name}</div>
                                            <div className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">Active Patrol</div>
                                        </div>
                                        <div className="ml-auto w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    </div>
                                ))
                            ) : (
                                <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 flex flex-col items-center text-center">
                                    <AlertCircle size={20} className="text-amber-500 mb-2" />
                                    <p className="text-xs font-bold text-amber-900">Reduced Presence</p>
                                    <p className="text-[10px] text-amber-700 font-medium">Remote monitoring active</p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Quick Tools */}
                    <section className="rounded-[18px] border border-black/5 bg-white p-7 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.04)]">
                        <h2 className="mb-5 text-base font-bold tracking-[-0.01em] text-zinc-900">
                            Quick Tools
                        </h2>

                        <Link
                            to="/resident/visit-request"
                            className="group mb-2.5 flex items-center gap-3.5 rounded-[14px] border border-transparent bg-gradient-to-br from-emerald-600 to-emerald-500 px-4.5 py-4 text-white shadow-[0_4px_14px_rgba(16,185,129,0.25)] transition hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(16,185,129,0.32)]"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-white/20">
                                <PlusCircle size={20} className="text-white" />
                            </div>

                            <div className="flex-1">
                                <div className="text-[0.9rem] font-semibold leading-none">
                                    New Visit Pass
                                </div>
                                <div className="mt-1 text-xs opacity-80">
                                    Register a guest for entry
                                </div>
                            </div>

                            <ArrowRight
                                size={18}
                                className="transition group-hover:translate-x-1"
                            />
                        </Link>

                        <Link
                            to="/resident/history"
                            className="group flex items-center gap-3.5 rounded-[14px] border border-zinc-200 bg-zinc-50 px-4.5 py-4 text-zinc-800 transition hover:-translate-y-0.5 hover:bg-zinc-100 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-emerald-600/10">
                                <History size={20} className="text-emerald-600" />
                            </div>

                            <div className="flex-1">
                                <div className="text-[0.9rem] font-semibold leading-none">
                                    Past Records
                                </div>
                                <div className="mt-1 text-xs text-zinc-500">
                                    Review your visitor logs
                                </div>
                            </div>

                            <ArrowRight
                                size={18}
                                className="text-zinc-400 transition group-hover:translate-x-1"
                            />
                        </Link>
                    </section>

                    {/* Notice */}
                    <section className="rounded-[18px] border border-black/5 bg-white p-7 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.04)]">
                        <h2 className="mb-5 flex items-center gap-2 text-base font-bold tracking-[-0.01em] text-zinc-900">
                            <AlertCircle size={17} className={notice?.importance === "High" ? "text-rose-500" : "text-emerald-600"} />
                            Resident Notice
                        </h2>

                        <div className="rounded-[14px] border border-zinc-200 bg-zinc-50 p-4.5">
                            {notice && (
                                <div className="flex items-center gap-2 mb-2.5">
                                    <span className="text-[0.9rem] font-bold text-zinc-900 leading-none">
                                        {notice.title}
                                    </span>
                                    {notice.importance !== "Low" && (
                                        <span className={`px-2 py-0.5 rounded-md text-[0.6rem] font-bold uppercase tracking-tight ${notice.importance === 'High' ? 'bg-rose-50 text-rose-500' : 'bg-amber-50 text-amber-500'
                                            }`}>
                                            {notice.importance}
                                        </span>
                                    )}
                                </div>
                            )}

                            <p className="mb-3 text-[0.855rem] leading-relaxed text-zinc-600">
                                {notice ? notice.content : "Please ensure your guests have their QR Access Code ready for the security staff upon arrival."}
                            </p>

                            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                                <Clock size={12} /> {notice ? `Updated ${new Date(notice.updatedAt).toLocaleDateString()}` : "Updated 2 hours ago"}
                            </div>
                        </div>
                    </section>
                </motion.div>
            </main>
        </div>
    );
};

export default ResidentDashboard;