import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import QRCodePass from "../../components/QRCodePass";
import { ShieldCheck, Calendar, User, FileText, AlertCircle, Loader2 } from "lucide-react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

type PassData = {
    residentName: string;
    visitorName: string;
    visitDate: string;
    purpose: string;
    status: string;
    visitCode: string;
};

const GuestPass: React.FC = () => {
    const { code } = useParams<{ code: string }>();
    const [data, setData] = useState<PassData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPass = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/visits/public/pass/${code}`);
                setData(res.data);
            } catch (err) {
                setError("Access pass not found or expired.");
            } finally {
                setLoading(false);
            }
        };
        if (code) fetchPass();
    }, [code]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 p-6 text-center">
                <div className="mb-4 rounded-full bg-rose-100 p-4 text-rose-600">
                    <AlertCircle size={48} />
                </div>
                <h1 className="text-2xl font-bold text-zinc-900">Invalid Pass</h1>
                <p className="mt-2 text-zinc-500">{error || "This access pass is no longer valid."}</p>
                <a href="/" className="mt-6 font-semibold text-emerald-600">Return to Portal</a>
            </div>
        );
    }

    const isVerified = data.status.toLowerCase() === "verified";

    return (
        <div className="min-h-screen bg-zinc-50 px-4 py-8 font-sans sm:py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-auto max-w-[440px]"
            >
                {/* Branding */}
                <div className="mb-8 flex flex-col items-center text-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 shadow-lg shadow-emerald-200">
                        <ShieldCheck className="text-white" size={28} />
                    </div>
                    <h1 className="text-xl font-black uppercase tracking-widest text-zinc-900">Hostel Pass</h1>
                    <p className="text-[0.7rem] font-bold uppercase tracking-[0.2em] text-zinc-400 mt-1">Digital Entry Authorization</p>
                </div>

                {/* Main Pass Card */}
                <div className="relative overflow-hidden rounded-[2.5rem] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.08)]">
                    {/* Status Header */}
                    <div className={`p-6 text-center ${isVerified ? 'bg-zinc-100' : 'bg-gradient-to-br from-emerald-600 to-emerald-500'}`}>
                        <p className={`text-[0.65rem] font-bold uppercase tracking-widest ${isVerified ? 'text-zinc-400' : 'text-emerald-100'}`}>
                            Access Status
                        </p>
                        <h2 className={`mt-1 text-2xl font-black ${isVerified ? 'text-zinc-400 line-through' : 'text-white'}`}>
                            {data.status}
                        </h2>
                    </div>

                    <div className="p-8">
                        {/* QR Section */}
                        <div className="mb-8 flex flex-col items-center">
                            <div className={`rounded-3xl border-2 p-4 transition ${isVerified ? 'border-zinc-100 opacity-30' : 'border-zinc-100 shadow-sm'}`}>
                                <QRCodePass
                                    value={data.visitCode}
                                    size={200}
                                    className=""
                                />
                            </div>
                            <div className="mt-6 text-center">
                                <p className="text-[0.65rem] font-bold uppercase tracking-widest text-zinc-400">Secure Code</p>
                                <p className="mt-1 font-mono text-xl font-black tracking-[0.3em] text-zinc-800">{data.visitCode}</p>
                            </div>
                        </div>

                        {/* Details Divider */}
                        <div className="mb-8 flex items-center gap-3">
                            <div className="h-px flex-1 bg-zinc-100" />
                            <span className="text-[0.6rem] font-black uppercase tracking-widest text-zinc-300">Information</span>
                            <div className="h-px flex-1 bg-zinc-100" />
                        </div>

                        {/* Grid Details */}
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-50 text-emerald-600">
                                    <User size={20} />
                                </div>
                                <div>
                                    <p className="text-[0.6rem] font-bold uppercase tracking-widest text-zinc-400">Visitor Name</p>
                                    <p className="font-bold text-zinc-800">{data.visitorName}</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-50 text-emerald-600">
                                    <Calendar size={20} />
                                </div>
                                <div>
                                    <p className="text-[0.6rem] font-bold uppercase tracking-widest text-zinc-400">Valid On</p>
                                    <p className="font-bold text-zinc-800">{data.visitDate}</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-50 text-emerald-600">
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <p className="text-[0.6rem] font-bold uppercase tracking-widest text-zinc-400">Authorized By</p>
                                    <p className="font-bold text-zinc-800">{data.residentName}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Indicator */}
                    <div className="bg-zinc-50 p-6 text-center">
                        <p className="text-[0.7rem] leading-relaxed text-zinc-400 px-4">
                            Please present this screen to the security officer at the entrance.
                        </p>
                    </div>
                </div>

                <p className="mt-12 text-center text-[0.6rem] font-bold uppercase tracking-widest text-zinc-300">
                    &copy; 2026 APU Hostel Management System
                </p>
            </motion.div>
        </div>
    );
};

export default GuestPass;
