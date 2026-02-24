import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Shield,
    Save,
    Loader2,
    CreditCard,
    BadgeCheck,
    Camera,
    ChevronRight,
    Lock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

interface UserProfile {
    name: string;
    email: string;
    phone: string;
    address: string;
    ic: string;
    gender: string;
}

const ProfilePage: React.FC = () => {
    const { user, login } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [profile, setProfile] = useState<UserProfile>({
        name: '',
        email: '',
        phone: '',
        address: '',
        ic: '',
        gender: ''
    });
    const [manager, setManager] = useState<{
        name: string;
        email: string;
        phone: string;
        address: string;
        propertyName: string;
        profileImage: string;
    } | null>(null);




    useEffect(() => {
        const fetchProfile = async () => {
            if (!user?.id) return;
            setLoading(true);
            try {
                const response = await api.get(`/api/profile/${user.id}`);
                setProfile(response.data);

                // Fetch manager info
                try {
                    const managerRes = await api.get('/api/profile/manager');
                    setManager(managerRes.data);
                } catch (mErr) {
                    console.error("Error fetching manager info:", mErr);
                }
            } catch (err) {
                console.error("Error fetching profile:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [user?.id]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put(`/api/profile/${user?.id}`, profile);
            if (user) {
                login({ ...user, name: profile.name });
            }
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            console.error("Error saving profile:", err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Loader2 size={40} className="animate-spin text-primary" />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Syncing Identity...</p>
            </div>
        </div>
    );

    const initials = (profile.name || 'U')
        .split(' ')
        .map(w => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="flex bg-slate-50 min-h-screen">
            <Sidebar />
            <main className="flex-1 p-8 ml-0 lg:ml-0 overflow-y-auto">
                {/* Header */}
                <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-primary text-[10px] font-bold uppercase tracking-widest mb-4">
                            <Shield size={12} />
                            Identity Protocol
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Account Settings</h1>
                        <p className="text-slate-500 mt-1 font-medium">Manage your digital residency profile and security preferences.</p>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
                        <BadgeCheck size={14} className="text-emerald-500" />
                        Status: Verified Resident
                    </div>
                </header>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                    {/* Main Form Column */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="xl:col-span-2 space-y-8"
                    >
                        <form onSubmit={handleSave} className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm relative overflow-hidden">
                            {/* Decorative Background */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />

                            <div className="relative z-10 space-y-10">
                                {/* Personal Section */}
                                <section>
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-1.5 h-6 bg-primary rounded-full" />
                                        <h2 className="text-xl font-extrabold text-slate-900">Personal Identification</h2>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">Legal Full Name</label>
                                            <div className="relative">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                                <input
                                                    className="w-full pl-11 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 outline-none transition-all focus:bg-white focus:border-primary font-bold"
                                                    value={profile.name}
                                                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">Identity card / Passport</label>
                                            <div className="relative">
                                                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                                <input
                                                    className="w-full pl-11 pr-5 py-4 bg-slate-100 border border-slate-100 rounded-2xl text-slate-400 outline-none font-bold cursor-not-allowed"
                                                    value={profile.ic}
                                                    readOnly
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">Primary Email</label>
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                                <input
                                                    type="email"
                                                    className="w-full pl-11 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 outline-none transition-all focus:bg-white focus:border-primary font-medium"
                                                    value={profile.email}
                                                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">Contact Number</label>
                                            <div className="relative">
                                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                                <input
                                                    className="w-full pl-11 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 outline-none transition-all focus:bg-white focus:border-primary font-bold"
                                                    value={profile.phone}
                                                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* Address Section */}
                                <section>
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-1.5 h-6 bg-primary rounded-full" />
                                        <h2 className="text-xl font-extrabold text-slate-900">Residential Localization</h2>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">Physical Permanent Address</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-4 top-4 text-slate-400 w-4 h-4" />
                                            <textarea
                                                className="w-full pl-11 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 outline-none transition-all focus:bg-white focus:border-primary font-medium min-h-[120px] resize-none"
                                                value={profile.address}
                                                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                </section>

                                {/* Footer Action */}
                                <div className="pt-8 border-t border-slate-50 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <AnimatePresence>
                                            {saved && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="flex items-center gap-2 text-emerald-500 font-bold text-sm"
                                                >
                                                    <BadgeCheck size={18} />
                                                    Identity Updated
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="py-4 px-10 bg-slate-900 text-white font-black rounded-2xl shadow-xl shadow-slate-200 lg:w-auto w-full flex items-center justify-center gap-3 hover:bg-primary-hover hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-70"
                                    >
                                        {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                        Commit Changes
                                    </button>
                                </div>
                            </div>
                        </form>
                    </motion.div>

                    {/* Side Column - Visual Profile */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-8"
                    >
                        {/* Profile Meta Card */}
                        <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm text-center relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-primary to-emerald-500 opacity-10" />

                            <div className="relative z-10 pt-4">
                                <div className="relative inline-block mb-6">
                                    <div className="w-24 h-24 rounded-[2rem] bg-indigo-600 flex items-center justify-center text-white font-black text-3xl shadow-2xl shadow-indigo-200 group-hover:scale-105 transition-transform">
                                        {initials}
                                    </div>
                                    <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-xl shadow-lg border border-slate-50 flex items-center justify-center text-slate-400 hover:text-primary transition-colors">
                                        <Camera size={18} />
                                    </button>
                                </div>

                                <h3 className="text-2xl font-black text-slate-900 leading-tight mb-1">{profile.name}</h3>
                                <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em] mb-6">Resident Identity System</p>

                                <div className="flex items-center justify-center gap-2 mb-8">
                                    <div className="px-3 py-1 bg-slate-50 rounded-full text-[10px] font-bold text-slate-500 flex items-center gap-1">
                                        <User size={12} /> {user?.myRole}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 pt-6 border-t border-slate-50">
                                <div className="flex flex-col items-center gap-1">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Digital ID</span>
                                    <span className="text-xs font-mono font-bold text-slate-800 bg-slate-50 px-3 py-1 rounded-lg">{user?.email}</span>
                                </div>
                            </div>
                        </div>

                        {/* Manager Information Card */}
                        {manager && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden group"
                            >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl -mr-12 -mt-12" />
                                <h4 className="text-[10px] font-black uppercase tracking-widest mb-6 flex items-center gap-2 text-slate-400">
                                    <Shield size={14} className="text-emerald-500" />
                                    Property Manager
                                </h4>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 font-bold border border-emerald-500/20 shadow-sm overflow-hidden flex-shrink-0">
                                            {manager.profileImage ? (
                                                <img src={manager.profileImage} alt="Manager" className="w-full h-full object-cover" />
                                            ) : (
                                                manager.name[0].toUpperCase()
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Building Contact</p>
                                            <p className="text-sm font-black text-slate-900">{manager.name}</p>
                                            <p className="text-[11px] font-medium text-slate-400">{manager.propertyName}</p>
                                        </div>
                                    </div>


                                    <div className="flex flex-col gap-2 pt-2">
                                        <div className="flex items-center gap-3 text-xs text-slate-600">
                                            <Mail size={14} className="text-slate-300" />
                                            <span className="truncate">{manager.email}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-slate-600">
                                            <Phone size={14} className="text-slate-300" />
                                            <span>{manager.phone}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Security Quick Link Card */}

                        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-slate-200 relative overflow-hidden group">
                            <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mb-16 -mr-16" />

                            <h4 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                                <Lock size={16} className="text-primary" />
                                Security Access
                            </h4>

                            <button className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl group-hover:bg-white/10 transition-all">
                                <div className="text-left">
                                    <p className="text-xs font-bold text-white">Reset Credentials</p>
                                    <p className="text-[10px] text-white/40">Rotate security PIN / Password</p>
                                </div>
                                <ChevronRight size={16} className="text-primary" />
                            </button>

                            <p className="mt-8 text-[10px] text-white/30 font-medium leading-relaxed">
                                Managed by Malo Security Protocol. Last audit: Today at 09:41 AM
                            </p>
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default ProfilePage;
