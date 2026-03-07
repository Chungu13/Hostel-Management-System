import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Mail, Phone, MapPin, Shield, Save, Loader2,
    BadgeCheck, Camera, ChevronRight, Lock, X, Building
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

interface AdminProfile {
    fullName: string;
    email: string;
    phone: string;
    ic: string;
    address: string;
    profileImage: string;
    myRole: string;
    propertyName?: string;
    propertyAddress?: string;
    propertyType?: string;
}

const ProfilePage: React.FC = () => {
    const { user, login } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [profile, setProfile] = useState<AdminProfile>({
        fullName: '',
        email: '',
        phone: '',
        ic: '',
        address: '',
        profileImage: '',
        myRole: 'Managing Staff'
    });

    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [pwData, setPwData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [pwError, setPwError] = useState('');
    const [pwSaving, setPwSaving] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const response = await api.get<AdminProfile>('/api/profile/me');
                setProfile(response.data);
            } catch (err) {
                console.error("Error fetching admin profile:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put(`/api/profile/me`, {
                fullName: profile.fullName,
                phone: profile.phone,
                ic: profile.ic,
                address: profile.address,
                profileImage: profile.profileImage
            });
            if (user) login({ ...user, name: profile.fullName });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            console.error("Error saving profile:", err);
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setPwError('');
        if (pwData.newPassword !== pwData.confirmPassword) {
            setPwError("Passwords do not match.");
            return;
        }
        setPwSaving(true);
        try {
            await api.post('/api/auth/change-password', {
                oldPassword: pwData.oldPassword,
                newPassword: pwData.newPassword
            });
            setIsPasswordModalOpen(false);
            setPwData({ oldPassword: '', newPassword: '', confirmPassword: '' });
            alert("Password changed successfully!");
        } catch (err: any) {
            setPwError(err.response?.data?.message || "Failed to change password.");
        } finally {
            setPwSaving(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfile({ ...profile, profileImage: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#f7f7f5] font-['Plus_Jakarta_Sans',sans-serif]">
            <div className="flex flex-col items-center gap-3">
                <Loader2 size={32} className="animate-spin text-[#4caf6e]" />
                <p className="text-sm text-gray-400">Loading admin profile…</p>
            </div>
        </div>
    );

    const initials = (profile.fullName || 'A')
        .split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

    const inputClass = "w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm font-medium outline-none transition-all placeholder:text-gray-300 focus:bg-white focus:border-green-400 focus:ring-4 focus:ring-green-400/10";
    const readonlyClass = "w-full pl-11 pr-4 py-3 bg-gray-100 border border-gray-100 rounded-xl text-gray-400 text-sm font-medium outline-none cursor-not-allowed";

    return (
        <div className="flex min-h-screen font-['Plus_Jakarta_Sans',sans-serif] bg-[#f7f7f5] bg-[radial-gradient(circle_at_5%_10%,rgba(134,197,152,0.10)_0%,transparent_45%),radial-gradient(circle_at_95%_90%,rgba(134,197,152,0.07)_0%,transparent_45%)]">
            <Sidebar />

            <main className="flex-1 px-5 py-8 md:pl-20 md:pr-10 md:py-10 overflow-y-auto">
                {/* Header */}
                <motion.header
                    className="mb-8 flex flex-wrap items-start justify-between gap-4"
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                >
                    <div>

                        <h1 className="page-title">Admin Profile</h1>
                        <p className="page-subtitle">Manage your administrative credentials and property association.</p>
                    </div>

                </motion.header>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Main Form */}
                    <motion.div className="xl:col-span-2" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                        <form onSubmit={handleSave} className="bg-white rounded-[20px] p-8 border border-black/[0.04] shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
                            <div className="flex items-center gap-3 mb-5">
                                <span className="section-label whitespace-nowrap">Identity Details</span>
                                <div className="flex-1 h-px bg-gray-100" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[0.72rem] font-medium text-gray-500 uppercase tracking-wider">Full Admin Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
                                        <input
                                            className={inputClass} value={profile.fullName}
                                            onChange={e => setProfile({ ...profile, fullName: e.target.value })}
                                            placeholder="Property Administrator" required
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[0.72rem] font-medium text-gray-500 uppercase tracking-wider">NRC (National Identity)</label>
                                    <div className="relative">
                                        <BadgeCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
                                        <input
                                            className={inputClass} value={profile.ic}
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
                                                setProfile({ ...profile, ic: formatted });
                                            }}
                                            placeholder="123456/11/1" required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[0.72rem] font-medium text-gray-500 uppercase tracking-wider">System Role</label>
                                    <div className="relative">
                                        <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
                                        <input className={readonlyClass} value={profile.myRole} readOnly />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[0.72rem] font-medium text-gray-500 uppercase tracking-wider">Contact Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
                                        <input className={readonlyClass} value={profile.email} readOnly />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[0.72rem] font-medium text-gray-500 uppercase tracking-wider">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
                                        <input
                                            className={inputClass} value={profile.phone}
                                            onChange={(e) => {
                                                let val = e.target.value;
                                                if (!val.startsWith('+260')) val = '+260';
                                                const rest = val.slice(4).replace(/\D/g, '');
                                                setProfile({ ...profile, phone: '+260' + rest.slice(0, 9) });
                                            }}
                                            placeholder="+260 9xx xxx xxx" required
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[0.72rem] font-medium text-gray-500 uppercase tracking-wider">Admin Address</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
                                        <input
                                            className={inputClass} value={profile.address}
                                            onChange={e => setProfile({ ...profile, address: e.target.value })}
                                            placeholder="Building Office Suite..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                                <AnimatePresence>
                                    {saved && (
                                        <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="text-sm font-medium text-[#4caf6e] flex items-center gap-2">
                                            <BadgeCheck size={16} /> Admin profile sync complete!
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                <button
                                    type="submit" disabled={saving}
                                    className="flex items-center gap-2 px-8 py-3.5 text-sm font-bold text-white rounded-xl bg-gradient-to-br from-[#4caf6e] to-[#5ec47f] shadow-[0_4px_14px_rgba(76,175,110,0.28)] hover:-translate-y-0.5 transition-all disabled:opacity-60"
                                >
                                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                    {saving ? 'Syncing...' : 'Update Admin Profile'}
                                </button>
                            </div>
                        </form>
                    </motion.div>

                    {/* Side Column */}
                    <motion.div className="flex flex-col gap-5" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                        <div className="bg-white rounded-[20px] p-8 border border-black/[0.04] shadow-[0_4px_16px_rgba(0,0,0,0.04)] text-center relative overflow-hidden group">
                            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#4caf6e] to-[#81c995]" />
                            <div className="relative inline-block mb-4 mt-2">
                                <div className="w-24 h-24 rounded-3xl bg-emerald-500/10 flex items-center justify-center text-[#4caf6e] text-3xl font-bold border-2 border-emerald-500/20 transition-transform group-hover:scale-105 overflow-hidden">
                                    {profile.profileImage ? (
                                        <img src={profile.profileImage} alt="Admin" className="w-full h-full object-cover" />
                                    ) : initials}
                                </div>
                                <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-xl border border-gray-100 shadow-md flex items-center justify-center text-gray-400 cursor-pointer hover:text-[#4caf6e] transition-all">
                                    <Camera size={16} />
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                </label>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 truncate">{profile.fullName || 'Admin Manager'}</h3>
                            <p className="text-[0.65rem] font-bold text-[#4caf6e] uppercase tracking-[0.15em] mt-1 mb-5">Primary Administrator</p>

                            <div className="pt-5 border-t border-gray-100">
                                <p className="text-[0.62rem] text-gray-400 font-medium uppercase tracking-widest mb-1.5">Authenticated via</p>
                                <div className="text-xs font-mono text-gray-600 bg-gray-50 border border-gray-100 px-3 py-2 rounded-lg truncate">
                                    {profile.email}
                                </div>
                            </div>
                        </div>

                        {/* Property Card */}
                        {profile.propertyName && (
                            <div className="bg-white rounded-[20px] p-6 border border-black/[0.04] shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
                                <div className="flex items-center gap-2 mb-4">
                                    <Building size={14} className="text-[#4caf6e]" />
                                    <h4 className="text-[0.72rem] font-bold uppercase tracking-widest text-gray-400">MANAGED PROPERTY</h4>
                                </div>
                                <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 mb-4">
                                    <p className="text-sm font-bold text-gray-900">{profile.propertyName}</p>
                                    <p className="text-[0.68rem] text-emerald-600 font-medium mt-0.5">{profile.propertyType} Asset</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <MapPin size={14} className="text-gray-300 mt-1 shrink-0" />
                                    <p className="text-xs text-gray-500 leading-relaxed">{profile.propertyAddress}</p>
                                </div>
                            </div>
                        )}

                        {/* Security Actions */}
                        <div className="bg-[#1a1a1a] rounded-[20px] p-7 text-white shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#4caf6e]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                            <div className="flex items-center gap-2 mb-6">
                                <Lock size={13} className="text-[#4caf6e]" />
                                <span className="text-[0.72rem] font-bold uppercase tracking-widest text-gray-500">Security Center</span>
                            </div>
                            <button
                                onClick={() => setIsPasswordModalOpen(true)}
                                className="w-full group flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-[#4caf6e]/50 transition-all"
                            >
                                <div className="text-left">
                                    <p className="text-sm font-bold">Update Passkey</p>
                                    <p className="text-[0.65rem] text-white/30 mt-0.5">Secure your admin credentials</p>
                                </div>
                                <ChevronRight size={16} className="text-[#4caf6e] group-hover:translate-x-1 transition-transform" />
                            </button>
                            <p className="mt-6 text-[0.62rem] text-white/20 uppercase tracking-widest flex items-center gap-2">
                                <BadgeCheck size={10} className="text-[#4caf6e]" /> End-to-end encrypted
                            </p>
                        </div>
                    </motion.div>
                </div>
            </main>

            {/* Password Modal */}
            <AnimatePresence>
                {isPasswordModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsPasswordModalOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-sm bg-white rounded-[24px] p-8 shadow-2xl">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Security Update</h3>
                            <form onSubmit={handlePasswordChange} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest">Current Admin Password</label>
                                    <input
                                        type="password" required className={inputClass.replace('pl-11', 'pl-4')}
                                        value={pwData.oldPassword} onChange={e => setPwData({ ...pwData, oldPassword: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest">New Secure Password</label>
                                    <input
                                        type="password" required className={inputClass.replace('pl-11', 'pl-4')}
                                        value={pwData.newPassword} onChange={e => setPwData({ ...pwData, newPassword: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest">Confirm New Passkey</label>
                                    <input
                                        type="password" required className={inputClass.replace('pl-11', 'pl-4')}
                                        value={pwData.confirmPassword} onChange={e => setPwData({ ...pwData, confirmPassword: e.target.value })}
                                    />
                                </div>
                                {pwError && <p className="text-xs text-red-500 font-bold bg-red-50 p-3 rounded-lg">{pwError}</p>}
                                <div className="flex gap-4 pt-4">
                                    <button type="button" onClick={() => setIsPasswordModalOpen(false)} className="flex-1 py-3 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-xl transition-all">Cancel</button>
                                    <button
                                        type="submit" disabled={pwSaving}
                                        className="flex-1 py-3 text-sm font-bold text-white bg-[#1a1a1a] rounded-xl shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50"
                                    >
                                        {pwSaving ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Confirm Change'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProfilePage;
