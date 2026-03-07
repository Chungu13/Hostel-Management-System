import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import {
    Send,
    User,
    Calendar,
    MessageSquare,
    Key,
    ShieldCheck,
    Loader2,
    CheckCircle2,
    Share2,
    Copy,
    Link as LinkIcon,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";

import QRCodePass from "../../components/QRCodePass";

type UserShape = {
    id?: string;
    email?: string;
    name?: string;
};

type VisitRequestForm = {
    visitorName: string;
    visitDate: string; // yyyy-mm-dd
    visitTime: string; // hh:mm
    purpose: string;
};

const INITIAL_FORM: VisitRequestForm = {
    visitorName: "",
    visitDate: "",
    visitTime: "",
    purpose: "",
};

const RequestVisit: React.FC = () => {
    const { user } = useAuth() as { user: UserShape };

    const [loading, setLoading] = useState<boolean>(false);
    const [success, setSuccess] = useState<string | null>(null); // Stores visitCode
    const [formData, setFormData] = useState<VisitRequestForm>(INITIAL_FORM);

    const handleShare = async () => {
        if (!success) return;
        const passUrl = `${window.location.origin}/guest-pass/${success}`;
        const text = `Guest Access Pass for ${user.name || "Resident"}\n\nAccess Code: ${success}\n\nView Digital Pass: ${passUrl}\n\nPlease present this code/QR at the security gate.`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: "Guest Access Pass",
                    text: text,
                    url: passUrl
                });
            } catch (err) {
                console.log("Error sharing", err);
            }
        } else {
            try {
                await navigator.clipboard.writeText(text);
                alert("Pass details and URL copied to clipboard!");
            } catch (err) {
                console.error("Failed to copy!", err);
            }
        }
    };

    const handleCopyUrl = async () => {
        if (!success) return;
        const passUrl = `${window.location.origin}/guest-pass/${success}`;
        try {
            await navigator.clipboard.writeText(passUrl);
            alert("Digital pass link copied!");
        } catch (err) {
            console.error("Failed to copy!", err);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!user?.id) return;

        setLoading(true);
        try {
            const response = await api.post("/api/visits/request", {
                ...formData,
                residentId: user.id,
                residentName: user.name || user.email,
            });

            // The backend now returns the full created object
            if (response.data && response.data.visitCode) {
                setSuccess(response.data.visitCode);
                setFormData(INITIAL_FORM);
            } else {
                throw new Error("Missing visit code in response");
            }
        } catch (err) {
            console.error("Error submitting visit request:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="flex min-h-screen bg-[#f7f7f5] font-sans"
            style={{
                backgroundImage:
                    "radial-gradient(circle at 5% 10%, rgba(134, 197, 152, 0.10) 0%, transparent 45%), radial-gradient(circle at 95% 90%, rgba(134, 197, 152, 0.07) 0%, transparent 45%)",
            }}
        >
            <Sidebar />

            <main className="w-full box-border px-5 py-6 md:py-10 md:pl-20 md:pr-10 sm:pl-[70px]">
                {/* Header */}
                <motion.header
                    className="mb-8"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >


                    <h1 className="page-title">
                        Request a Visit
                    </h1>
                    <p className="page-subtitle">
                        Generate a secure QR Access Pass for your guest
                    </p>
                </motion.header>

                {/* Card */}
                <motion.div
                    className="relative w-full max-w-[640px] overflow-hidden rounded-[20px] bg-white p-7 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_32px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.04)] md:p-9"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
                >
                    <div className="absolute left-0 right-0 top-0 h-[3px] bg-gradient-to-r from-emerald-600 to-emerald-300" />

                    <AnimatePresence mode="wait">
                        {!success ? (
                            <motion.div
                                key="form"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0, x: 16 }}
                            >
                                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                                    {/* Visitor Info */}
                                    <div className="flex items-center gap-3">
                                        <span className="section-label whitespace-nowrap">
                                            Visitor Info
                                        </span>
                                        <div className="h-px flex-1 bg-zinc-200" />
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        {/* Visitor Full Name */}
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[0.78rem] font-medium uppercase tracking-[0.06em] text-zinc-600">
                                                Visitor Full Name
                                            </label>
                                            <div className="relative">
                                                <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                                                <input
                                                    type="text"
                                                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-3 pl-10 pr-3.5 text-[0.9rem] text-zinc-900 outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10"
                                                    placeholder="e.g. Jane Doe"
                                                    value={formData.visitorName}
                                                    onChange={(e) =>
                                                        setFormData((p) => ({
                                                            ...p,
                                                            visitorName: e.target.value,
                                                        }))
                                                    }
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {/* Visit Date */}
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[0.78rem] font-medium uppercase tracking-[0.06em] text-zinc-600">
                                                Visit Date
                                            </label>
                                            <div className="relative">
                                                <Calendar className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                                                <input
                                                    type="date"
                                                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-3 pl-10 pr-3.5 text-[0.9rem] text-zinc-900 outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10"
                                                    value={formData.visitDate}
                                                    onChange={(e) =>
                                                        setFormData((p) => ({
                                                            ...p,
                                                            visitDate: e.target.value,
                                                        }))
                                                    }
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {/* Visit Time */}
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[0.78rem] font-medium uppercase tracking-[0.06em] text-zinc-600">
                                                Arrival Time
                                            </label>
                                            <div className="relative">
                                                <Key className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                                                <input
                                                    type="time"
                                                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-3 pl-10 pr-3.5 text-[0.9rem] text-zinc-900 outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10"
                                                    value={formData.visitTime}
                                                    onChange={(e) =>
                                                        setFormData((p) => ({
                                                            ...p,
                                                            visitTime: e.target.value,
                                                        }))
                                                    }
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Purpose */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[0.78rem] font-medium uppercase tracking-[0.06em] text-zinc-600">
                                            Purpose of Visit
                                        </label>
                                        <div className="relative">
                                            <MessageSquare className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400" />
                                            <textarea
                                                className="min-h-[100px] w-full resize-y rounded-xl border border-zinc-200 bg-zinc-50 py-3 pl-10 pr-3.5 text-[0.9rem] leading-relaxed text-zinc-900 outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10"
                                                placeholder="Briefly describe the reason for the visit..."
                                                value={formData.purpose}
                                                onChange={(e) =>
                                                    setFormData((p) => ({ ...p, purpose: e.target.value }))
                                                }
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="rounded-2xl border border-emerald-600/10 bg-emerald-600/5 p-4 text-[0.8rem] leading-relaxed text-emerald-800">

                                        <p className="mt-1 opacity-80">
                                            A secure QR code will be generated immediately for your guest to use at the security gate.
                                        </p>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-500 px-4 py-3.5 text-[0.92rem] font-semibold text-white shadow-[0_4px_16px_rgba(16,185,129,0.25)] transition hover:-translate-y-[1px] hover:opacity-95 hover:shadow-[0_6px_20px_rgba(16,185,129,0.30)] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
                                    >
                                        {loading ? (
                                            <Loader2 size={17} className="animate-spin" />
                                        ) : (
                                            <Send size={17} />
                                        )}
                                        {loading ? "Generating Pass…" : "Generate QR Access Pass"}
                                    </button>
                                </form>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.92 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                className="flex flex-col items-center gap-4 py-4 text-center"
                            >
                                <div className="flex h-[64px] w-[64px] items-center justify-center rounded-full border-2 border-emerald-600/20 bg-gradient-to-br from-emerald-600/10 to-emerald-300/20">
                                    <CheckCircle2 size={32} className="text-emerald-600" />
                                </div>

                                <div className="space-y-1">
                                    <h2 className="m-0 text-[1.5rem] font-bold tracking-[-0.02em] text-zinc-900">
                                        Access Pass Ready!
                                    </h2>
                                    <p className="m-0 text-sm text-zinc-400">
                                        Share this QR code with your visitor.
                                    </p>
                                </div>

                                <div className="mt-4 flex flex-col items-center gap-4 rounded-[24px] border border-zinc-200 bg-white p-6 shadow-xl shadow-zinc-200/50">
                                    <QRCodePass
                                        value={success}
                                        size={200}
                                    />
                                    <div className="space-y-1.5">
                                        <p className="text-[0.65rem] font-bold uppercase tracking-widest text-zinc-400">Access Code</p>
                                        <div className="rounded-lg bg-zinc-100 px-4 py-1.5 font-mono text-lg font-bold tracking-widest text-zinc-800">
                                            {success}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex w-full flex-col gap-3 px-4 sm:flex-row">
                                    <button
                                        type="button"
                                        onClick={handleShare}
                                        className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-zinc-900 py-3 text-sm font-bold text-white transition hover:bg-zinc-800"
                                    >
                                        <Share2 size={18} /> Share
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCopyUrl}
                                        className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
                                    >
                                        <LinkIcon size={18} /> Copy Link
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSuccess(null)}
                                        className="flex-1 rounded-xl border border-zinc-200 bg-white py-3 text-sm font-bold text-zinc-600 transition hover:bg-zinc-50"
                                    >
                                        New Request
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </main>
        </div>
    );
};

export default RequestVisit;