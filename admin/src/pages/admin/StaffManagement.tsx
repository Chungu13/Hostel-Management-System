import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../../components/Sidebar";
import { AnimatePresence, motion } from "framer-motion";
import {
    CreditCard,
    Edit2,
    Mail,
    MapPin,
    Phone,
    Plus,
    Search,
    ShieldAlert,
    ShieldCheck,
    Trash2,
    X,
} from "lucide-react";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import ConfirmModal from "../../components/ConfirmModal";

type Staff = {
    id: number;
    name: string;
    email: string;
    phone: string;
    ic: string;
    gender: "Male" | "Female" | string;
    address: string;
    approved?: boolean;
};

type FormData = {
    name: string;
    email: string;
    phone: string;
    ic: string;
    gender: "Male" | "Female";
    address: string;
    approved: boolean;
    password?: string;
};

const emptyForm: FormData = {
    name: "",
    email: "",
    phone: "",
    ic: "",
    gender: "Male",
    address: "",
    approved: true,
    password: "",
};

const StaffManagement: React.FC = () => {
    const { user } = useAuth() as { user: { propertyId?: string | number } | null };

    const [staff, setStaff] = useState<Staff[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
    const [formData, setFormData] = useState<FormData>(emptyForm);
    const { showToast } = useToast();

    // Confirmation Modal State
    const [confirmConfig, setConfirmConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        variant: "danger" | "primary";
    }>({
        isOpen: false,
        title: "",
        message: "",
        onConfirm: () => { },
        variant: "primary",
    });

    const closeConfirm = () => setConfirmConfig((p) => ({ ...p, isOpen: false }));

    useEffect(() => {
        if (user?.propertyId) void fetchStaff();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.propertyId]);

    const fetchStaff = async (): Promise<void> => {
        setLoading(true);
        try {
            const response = await api.get<Staff[]>(
                `/api/admin/staff`
            );
            setStaff(response.data ?? []);
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error("Error fetching staff:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number): Promise<void> => {
        if (!user?.propertyId) return;

        setConfirmConfig({
            isOpen: true,
            title: "Remove Staff Member?",
            message: "Are you sure you want to remove this security personnel? They will lose access to the system immediately.",
            variant: "danger",
            onConfirm: async () => {
                try {
                    await api.delete(`/api/admin/staff/${id}`);
                    showToast("Staff record removed", "success");
                    void fetchStaff();
                } catch (err: any) {
                    const msg = err?.response?.data?.message || "Check backend logs.";
                    showToast("Failed to remove staff: " + msg, "error");
                }
            },
        });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        if (!user?.propertyId) return;

        try {
            if (editingStaff) {
                await api.put(
                    `/api/admin/staff/${editingStaff.id}`,
                    formData
                );
                showToast("Staff information updated", "success");
            } else {
                await api.post("/api/admin/staff", { ...formData });
                showToast("New staff member added", "success");
            }
            setIsModalOpen(false);
            setEditingStaff(null);
            void fetchStaff();
        } catch (err: any) {
            alert(err?.response?.data?.message || "Operation failed");
        }
    };

    const openEditModal = (s: Staff) => {
        setEditingStaff(s);
        setFormData({
            name: s.name,
            email: s.email,
            phone: s.phone,
            ic: s.ic,
            gender: (s.gender === "Female" ? "Female" : "Male") as "Male" | "Female",
            address: s.address,
            approved: !!s.approved,
        });
        setIsModalOpen(true);
    };

    const openAddModal = () => {
        setEditingStaff(null);
        setFormData(emptyForm);
        setIsModalOpen(true);
    };

    const filteredStaff = useMemo(() => {
        const q = searchTerm.trim().toLowerCase();
        if (!q) return staff;

        return staff.filter((s) => {
            const name = (s.name ?? "").toLowerCase();
            const email = (s.email ?? "").toLowerCase();
            return name.includes(q) || email.includes(q);
        });
    }, [searchTerm, staff]);

    return (
        <div className="min-h-screen bg-[#f7f7f5]">
            <div className="flex min-h-screen bg-[radial-gradient(circle_at_5%_10%,rgba(134,197,152,0.10)_0%,transparent_45%),radial-gradient(circle_at_95%_90%,rgba(134,197,152,0.07)_0%,transparent_45%)] font-sans">
                <Sidebar />

                <main className="flex-1 w-full px-6 py-8 md:px-10 md:py-10 md:pl-20">
                    {/* Header */}
                    <motion.div
                        className="flex flex-wrap items-start justify-between gap-4 mb-7"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <div>


                            <h1 className="page-title">
                                Staff Management
                            </h1>
                            <p className="page-subtitle">
                                Manage security personnel and system access
                            </p>
                        </div>

                        <button
                            onClick={openAddModal}
                            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-400 px-5 py-3 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(16,185,129,0.25)] transition hover:opacity-95 hover:-translate-y-[1px]"
                        >
                            <Plus size={16} />
                            Register New Officer
                        </button>
                    </motion.div>

                    {/* Toolbar */}
                    <motion.div
                        className="mb-5 flex flex-wrap items-center gap-4 rounded-2xl border border-black/5 bg-white px-5 py-4 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.04)]"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <div className="relative flex-1 min-w-[200px] max-w-[360px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-300" size={16} />
                            <input
                                type="text"
                                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-10 pr-3 py-2.5 text-sm text-zinc-900 outline-none transition focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                                placeholder="Search by name or email…"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="ml-auto whitespace-nowrap text-xs text-zinc-300">
                            <span className="font-bold text-emerald-600">{filteredStaff.length}</span>{" "}
                            officer{filteredStaff.length !== 1 ? "s" : ""} on duty
                        </div>
                    </motion.div>

                    {/* Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <AnimatePresence>
                            {filteredStaff.length === 0 && !loading ? (
                                <div className="md:col-span-2 flex flex-col items-center justify-center text-center py-20 px-5 gap-2">
                                    <div className="h-14 w-14 rounded-2xl bg-zinc-100 flex items-center justify-center">
                                        <ShieldCheck className="text-zinc-300" size={24} />
                                    </div>
                                    <p className="text-sm font-semibold text-zinc-700">No staff found</p>
                                    <p className="text-sm text-zinc-300">
                                        {searchTerm ? "Try adjusting your search." : "Register an officer to get started."}
                                    </p>
                                </div>
                            ) : (
                                filteredStaff.map((person, index) => (
                                    <motion.div
                                        key={person.email}
                                        className="rounded-2xl border border-black/5 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.04)] transition hover:shadow-[0_4px_24px_rgba(0,0,0,0.08)] hover:-translate-y-[2px]"
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: index * 0.04, duration: 0.3 }}
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-11 w-11 rounded-xl bg-sky-500/10 text-sky-400 font-bold flex items-center justify-center transition group-hover:bg-sky-500">
                                                    {(person.name || "S")[0]?.toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-zinc-900 leading-tight">
                                                        {person.name}
                                                    </div>
                                                    <div className="text-xs text-zinc-400 mt-0.5">
                                                        Officer Profile
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => openEditModal(person)}
                                                    className="h-8 w-8 rounded-lg border border-zinc-200 bg-zinc-50 flex items-center justify-center transition hover:scale-105 hover:bg-sky-500/10 hover:border-sky-500/30"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={14} className="text-sky-500" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(person.id)}
                                                    className="h-8 w-8 rounded-lg border border-zinc-200 bg-zinc-50 flex items-center justify-center transition hover:scale-105 hover:bg-rose-500/10 hover:border-rose-500/30"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={14} className="text-rose-500" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4">
                                            <div className="flex items-center gap-2 text-xs text-zinc-600 overflow-hidden">
                                                <Mail size={13} className="text-sky-500 shrink-0" />
                                                <span className="truncate">{person.email}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-zinc-600 overflow-hidden">
                                                <Phone size={13} className="text-sky-500 shrink-0" />
                                                <span className="truncate">{person.phone}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-zinc-600 overflow-hidden">
                                                <CreditCard size={13} className="text-sky-500 shrink-0" />
                                                <span className="truncate">{person.ic}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-zinc-600 overflow-hidden">
                                                <ShieldCheck size={13} className="text-sky-500 shrink-0" />
                                                <span className="truncate">Security Officer</span>
                                            </div>
                                            <div className="col-span-2 flex items-center gap-2 text-xs text-zinc-600 overflow-hidden">
                                                <MapPin size={13} className="text-sky-500 shrink-0" />
                                                <span className="truncate">{person.address}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between border-t border-zinc-100 pt-3">
                                            <div className="inline-flex items-center gap-2 text-[0.72rem] font-semibold text-emerald-600 tracking-wide">
                                                <span className="h-2 w-2 rounded-full bg-emerald-600 shadow-[0_0_0_2px_rgba(16,185,129,0.2)]" />
                                                Active
                                            </div>
                                            <span className="text-xs text-zinc-300">{person.gender}</span>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                </main>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-sm p-5"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={(e) => {
                            if (e.target === e.currentTarget) setIsModalOpen(false);
                        }}
                    >
                        <motion.div
                            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-8 shadow-[0_8px_48px_rgba(0,0,0,0.12)] border border-black/5"
                            initial={{ opacity: 0, scale: 0.95, y: 16 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 16 }}
                            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <div className="absolute left-0 right-0 top-0 h-[3px] rounded-t-3xl bg-gradient-to-r from-sky-400 to-sky-200" />

                            <div className="flex items-center justify-between mb-7">
                                <h2 className="text-lg font-bold tracking-tight text-zinc-900">
                                    {editingStaff ? "Edit Officer" : "Register Officer"}
                                </h2>
                                <button
                                    className="h-8 w-8 rounded-lg border border-zinc-200 bg-zinc-50 flex items-center justify-center text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800"
                                    onClick={() => setIsModalOpen(false)}
                                    type="button"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Identity */}
                                <div>
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="text-[0.68rem] font-semibold tracking-[0.1em] uppercase text-zinc-300">
                                            Identity
                                        </span>
                                        <div className="h-px flex-1 bg-zinc-200" />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                        <div className="space-y-2">
                                            <label className="text-[0.75rem] font-medium tracking-[0.06em] uppercase text-zinc-600">
                                                Full Name (As shown on ID)
                                            </label>
                                            <input
                                                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:bg-white focus:border-sky-400 focus:ring-4 focus:ring-sky-400/10"
                                                placeholder="Full name"
                                                value={formData.name}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    const formatted = val.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
                                                    setFormData((p) => ({ ...p, name: formatted }));
                                                }}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Contact */}
                                <div>
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="text-[0.68rem] font-semibold tracking-[0.1em] uppercase text-zinc-300">
                                            Contact
                                        </span>
                                        <div className="h-px flex-1 bg-zinc-200" />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[0.75rem] font-medium tracking-[0.06em] uppercase text-zinc-600">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:bg-white focus:border-sky-400 focus:ring-4 focus:ring-sky-400/10"
                                                placeholder="email@example.com"
                                                value={formData.email}
                                                onChange={(e) =>
                                                    setFormData((p) => ({ ...p, email: e.target.value }))
                                                }
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[0.75rem] font-medium tracking-[0.06em] uppercase text-zinc-600">
                                                Phone
                                            </label>
                                            <input
                                                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:bg-white focus:border-sky-400 focus:ring-4 focus:ring-sky-400/10"
                                                value={formData.phone}
                                                onChange={(e) => {
                                                    let val = e.target.value;
                                                    if (!val.startsWith('+260')) val = '+260';
                                                    const rest = val.slice(4).replace(/\D/g, '');
                                                    setFormData((p) => ({ ...p, phone: '+260' + rest.slice(0, 9) }));
                                                }}
                                                placeholder="+260 9xx xxx xxx"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Security Credentials */}
                                {!editingStaff && (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-[0.68rem] font-semibold tracking-[0.1em] uppercase text-zinc-300">
                                                Security Credentials
                                            </span>
                                            <div className="h-px flex-1 bg-zinc-200" />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[0.75rem] font-medium tracking-[0.06em] uppercase text-zinc-600">
                                                Login Password
                                            </label>
                                            <input
                                                type="password"
                                                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:bg-white focus:border-sky-400 focus:ring-4 focus:ring-sky-400/10"
                                                placeholder="Set account password"
                                                value={formData.password}
                                                onChange={(e) =>
                                                    setFormData((p) => ({ ...p, password: e.target.value }))
                                                }
                                                required={!editingStaff}
                                            />
                                            <p className="text-[10px] text-zinc-400 italic">This password will be required for the guard to log in.</p>
                                        </div>
                                    </div>
                                )}

                                {/* Personnel Details */}
                                <div>
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="text-[0.68rem] font-semibold tracking-[0.1em] uppercase text-zinc-300">
                                            Personnel Details
                                        </span>
                                        <div className="h-px flex-1 bg-zinc-200" />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[0.75rem] font-medium tracking-[0.06em] uppercase text-zinc-600">
                                                Zambian NRC
                                            </label>
                                            <input
                                                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:bg-white focus:border-sky-400 focus:ring-4 focus:ring-sky-400/10"
                                                value={formData.ic}
                                                onChange={(e) => {
                                                    let val = e.target.value.replace(/\D/g, ''); // Digits only
                                                    if (val.length > 9) val = val.slice(0, 9);

                                                    // Format: ######/##/#
                                                    let formatted = val;
                                                    if (val.length > 6) {
                                                        formatted = val.slice(0, 6) + '/' + val.slice(6);
                                                    }
                                                    if (val.length > 8) {
                                                        formatted = formatted.slice(0, 9) + '/' + formatted.slice(9);
                                                    }
                                                    setFormData((p) => ({ ...p, ic: formatted }));
                                                }}
                                                placeholder="123456/11/1"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[0.75rem] font-medium tracking-[0.06em] uppercase text-zinc-600">
                                                Gender
                                            </label>
                                            <select
                                                className="w-full appearance-none rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:bg-white focus:border-sky-400 focus:ring-4 focus:ring-sky-400/10 cursor-pointer"
                                                value={formData.gender}
                                                onChange={(e) =>
                                                    setFormData((p) => ({ ...p, gender: e.target.value as "Male" | "Female" }))
                                                }
                                            >
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                            </select>
                                        </div>

                                        <div className="space-y-2 sm:col-span-2">
                                            <label className="text-[0.75rem] font-medium tracking-[0.06em] uppercase text-zinc-600">
                                                Home Address
                                            </label>
                                            <textarea
                                                className="w-full min-h-[96px] resize-y rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:bg-white focus:border-sky-400 focus:ring-4 focus:ring-sky-400/10"
                                                placeholder="Full permanent address"
                                                value={formData.address}
                                                onChange={(e) =>
                                                    setFormData((p) => ({ ...p, address: e.target.value }))
                                                }
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="flex justify-end gap-2 pt-1">
                                    <button
                                        type="button"
                                        className="rounded-xl border border-zinc-200 bg-zinc-50 px-5 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100"
                                        onClick={() => setIsModalOpen(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="rounded-xl bg-gradient-to-br from-sky-400 to-sky-200 px-7 py-3 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(56,189,248,0.30)] transition hover:opacity-95 hover:-translate-y-[1px]"
                                    >
                                        {editingStaff ? "Save Changes" : "Register Officer"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <ConfirmModal
                isOpen={confirmConfig.isOpen}
                onClose={closeConfirm}
                onConfirm={confirmConfig.onConfirm}
                title={confirmConfig.title}
                message={confirmConfig.message}
                variant={confirmConfig.variant}
                confirmText="Remove Personnel"
            />
        </div>
    );
};

export default StaffManagement;