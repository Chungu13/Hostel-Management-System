import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Mail, Phone, MapPin, Shield, Save, Loader2,
    BadgeCheck, Camera, ChevronRight, Lock, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

interface UserProfile {
    fullName: string;
    email: string;
    phone: string;
    ic: string;
    profileImage: string;
}

const ProfilePage: React.FC = () => {
    const { user, login } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [profile, setProfile] = useState<UserProfile>({
        fullName: '',
        email: '',
        phone: '',
        ic: '',
        profileImage: ''
    });
    const [manager, setManager] = useState<{
        name: string; email: string; phone: string;
        address: string; propertyName: string; profileImage: string;
    } | null>(null);
    const [isManagerModalOpen, setIsManagerModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [pwData, setPwData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [pwError, setPwError] = useState('');
    const [pwSaving, setPwSaving] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user?.id) return;
            setLoading(true);
            try {
                const response = await api.get(`/api/profile/${user.id}`);
                setProfile(response.data);
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
            alert("Password changed successfully!");
            setIsPasswordModalOpen(false);
            setPwData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err: any) {
            setPwError(err.response?.data?.message || "Failed to change password.");
        } finally {
            setPwSaving(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center font-['Plus_Jakarta_Sans',sans-serif]"
            style={{ backgroundColor: '#f7f7f5' }}>
            <div className="flex flex-col items-center gap-3">
                <Loader2 size={32} className="animate-spin" style={{ color: '#4caf6e' }} />
                <p className="text-sm text-gray-400">Loading your profile…</p>
            </div>
        </div>
    );

    const initials = (profile.fullName || 'U')
        .split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

    const inputClass = `
        w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl
        text-gray-900 text-sm font-medium outline-none transition-all
        placeholder:text-gray-300
        focus:bg-white focus:border-green-400 focus:ring-4 focus:ring-green-400/10
    `;

    const readonlyClass = `
        w-full pl-11 pr-4 py-3 bg-gray-100 border border-gray-100 rounded-xl
        text-gray-400 text-sm font-medium outline-none cursor-not-allowed
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

            <main className="flex-1 px-5 py-8 md:pl-20 md:pr-10 md:py-10 overflow-y-auto">

                {/* ── Header ── */}
                <motion.header
                    className="mb-8 flex flex-wrap items-start justify-between gap-4"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                    <div>
                        <div className="mb-2.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.72rem] font-semibold uppercase tracking-widest"
                            style={{ background: 'rgba(76,175,110,0.08)', border: '1px solid rgba(76,175,110,0.2)', color: '#4caf6e' }}>
                            <Shield size={11} /> Account
                        </div>
                        <h1 className="text-[1.85rem] font-bold text-gray-900 tracking-tight leading-tight mb-1">
                            Your Profile
                        </h1>
                        <p className="text-sm text-gray-400">Keep your details up to date so everything runs smoothly.</p>
                    </div>
                    <div className="mt-1 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-[0.75rem] font-medium text-gray-500"
                        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                        <BadgeCheck size={14} color="#4caf6e" />
                        {user?.myRole === 'Resident' ? 'Verified Resident' : 'Security Personnel'}
                    </div>
                </motion.header>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                    {/* ── Main Form ── */}
                    <motion.div
                        className="xl:col-span-2"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <form onSubmit={handleSave}
                            className="bg-white rounded-[20px] p-8 border border-black/[0.04]"
                            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)' }}>

                            {/* Personal Info */}
                            <div className="flex items-center gap-3 mb-5">
                                <span className="text-[0.65rem] font-semibold uppercase tracking-widest text-gray-400 whitespace-nowrap">Personal Details</span>
                                <div className="flex-1 h-px bg-gray-100" />
                            </div>

                            {/* Personal row 1 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[0.72rem] font-medium text-gray-500 uppercase tracking-wider">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
                                        <input
                                            className={inputClass}
                                            value={profile.fullName}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                const formatted = val.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
                                                setProfile({ ...profile, fullName: formatted });
                                            }}
                                            placeholder="Your full name"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[0.72rem] font-medium text-gray-500 uppercase tracking-wider">NRC Number (Identity)</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
                                        <input
                                            className={inputClass}
                                            value={profile.ic}
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
                                            placeholder="123456/11/1"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Personal row 2 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[0.72rem] font-medium text-gray-500 uppercase tracking-wider">Role</label>
                                    <div className="relative">
                                        <BadgeCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
                                        <input className={readonlyClass} value={user?.myRole || 'Resident'} readOnly />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[0.72rem] font-medium text-gray-500 uppercase tracking-wider">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
                                        <input
                                            type="email"
                                            className={inputClass}
                                            value={profile.email}
                                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                            placeholder="you@example.com"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Personal row 3 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[0.72rem] font-medium text-gray-500 uppercase tracking-wider">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
                                        <input
                                            className={inputClass}
                                            value={profile.phone}
                                            onChange={(e) => {
                                                let val = e.target.value;
                                                if (!val.startsWith('+260')) val = '+260';
                                                const rest = val.slice(4).replace(/\D/g, '');
                                                setProfile({ ...profile, phone: '+260' + rest.slice(0, 9) });
                                            }}
                                            placeholder="+260 9xx xxx xxx"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Save row */}
                            <div className="flex items-center justify-between pt-6" style={{ borderTop: '1px solid #f2f2f0' }}>
                                <AnimatePresence>
                                    {saved && (
                                        <motion.div
                                            initial={{ opacity: 0, x: -8 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0 }}
                                            className="flex items-center gap-2 text-sm font-medium"
                                            style={{ color: '#4caf6e' }}
                                        >
                                            <BadgeCheck size={16} /> Profile updated!
                                        </motion.div>
                                    )}
                                    {!saved && <span />}
                                </AnimatePresence>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex items-center gap-2 px-7 py-3 text-sm font-semibold text-white rounded-xl transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
                                    style={{
                                        background: 'linear-gradient(135deg, #4caf6e, #5ec47f)',
                                        boxShadow: '0 4px 14px rgba(76,175,110,0.28)'
                                    }}
                                >
                                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                    {saving ? 'Saving…' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </motion.div>

                    {/* ── Side Column ── */}
                    <motion.div
                        className="flex flex-col gap-5"
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
                    >
                        {/* Avatar card */}
                        <div className="bg-white rounded-[20px] p-7 border border-black/[0.04] text-center relative overflow-hidden group"
                            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)' }}>
                            {/* Green top bar */}
                            <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[20px]"
                                style={{ background: 'linear-gradient(90deg, #4caf6e, #81c995)' }} />

                            <div className="relative inline-block mb-4 mt-2">
                                <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-bold text-2xl transition-transform group-hover:scale-105"
                                    style={{ background: 'linear-gradient(135deg, #4caf6e, #81c995)', boxShadow: '0 4px 16px rgba(76,175,110,0.28)' }}>
                                    {initials}
                                </div>
                                <button className="absolute -bottom-1.5 -right-1.5 w-8 h-8 bg-white rounded-lg border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors"
                                    style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }}>
                                    <Camera size={14} />
                                </button>
                            </div>

                            <h3 className="text-base font-bold text-gray-900 leading-tight mb-0.5">{profile.fullName || 'Your Name'}</h3>
                            <p className="text-[0.65rem] font-semibold uppercase tracking-widest mb-4" style={{ color: '#4caf6e' }}>
                                {user?.myRole || 'Resident'}
                            </p>

                            <div className="pt-4" style={{ borderTop: '1px solid #f2f2f0' }}>
                                <p className="text-[0.62rem] text-gray-400 font-medium uppercase tracking-widest mb-1.5">Login Email</p>
                                <span className="inline-block text-xs font-mono font-medium text-gray-700 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-lg truncate max-w-full">
                                    {user?.email}
                                </span>
                            </div>
                        </div>

                        {/* Manager card */}
                        <div className="bg-white rounded-[20px] p-6 border border-black/[0.04]"
                            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)' }}>
                            <div className="flex items-center gap-2 mb-2">
                                <Shield size={13} color="#4caf6e" />
                                <h4 className="text-[0.72rem] font-semibold uppercase tracking-widest text-gray-400">
                                    {user?.myRole === 'Resident' ? 'Your Manager' : 'Property Admin'}
                                </h4>
                            </div>
                            {manager && (
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600 font-bold text-sm border border-green-100 shadow-sm">
                                        {manager.profileImage ? (
                                            <img src={manager.profileImage} alt="Manager" className="w-full h-full object-cover rounded-xl" />
                                        ) : (
                                            manager.name[0].toUpperCase()
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="text-sm font-bold text-gray-900 leading-tight">{manager.name}</p>
                                        <p className="text-[0.65rem] text-gray-400 font-medium">Building Management</p>
                                    </div>
                                </div>
                            )}
                            <p className="text-[0.8rem] text-gray-400 mb-4 leading-relaxed">
                                Have a question about your room or the building? Your property manager is here to help.
                            </p>
                            <button
                                onClick={() => setIsManagerModalOpen(true)}
                                className="w-full py-3 text-sm font-semibold rounded-xl border flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
                                style={{ background: 'rgba(76,175,110,0.08)', border: '1px solid rgba(76,175,110,0.2)', color: '#4caf6e' }}
                            >
                                <User size={15} /> View Details
                            </button>
                        </div>

                        {/* Security card */}
                        <div className="rounded-[20px] p-6 text-white relative overflow-hidden"
                            style={{ background: '#1a1a1a', boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }}>
                            <div className="absolute bottom-0 right-0 w-28 h-28 rounded-full pointer-events-none"
                                style={{ background: 'radial-gradient(circle, rgba(76,175,110,0.15) 0%, transparent 70%)', transform: 'translate(30%, 30%)' }} />
                            <div className="flex items-center gap-2 mb-5">
                                <Lock size={14} color="#4caf6e" />
                                <h4 className="text-[0.72rem] font-semibold uppercase tracking-widest text-gray-400">Security</h4>
                            </div>
                            <button
                                onClick={() => setIsPasswordModalOpen(true)}
                                className="w-full flex items-center justify-between p-3.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                                <div className="text-left">
                                    <p className="text-sm font-semibold text-white">Reset Password</p>
                                    <p className="text-[0.68rem] text-white/40 mt-0.5">Change your login credentials</p>
                                </div>
                                <ChevronRight size={15} color="#4caf6e" />
                            </button>
                            <p className="mt-5 text-[0.65rem] text-white/25 leading-relaxed">
                                Secured by Malo. Last active: {new Date().toLocaleDateString()}
                            </p>
                        </div>
                    </motion.div>
                </div>
            </main>

            {/* ── Manager Modal ── */}
            <AnimatePresence>
                {isManagerModalOpen && manager && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsManagerModalOpen(false)}
                            className="absolute inset-0 bg-black/20 backdrop-blur-[3px]"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 16 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 16 }}
                            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                            className="relative w-full max-w-sm bg-white rounded-[22px] overflow-hidden"
                            style={{ boxShadow: '0 8px 48px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)' }}
                        >
                            {/* Green top bar */}
                            <div className="absolute top-0 left-0 right-0 h-[3px]"
                                style={{ background: 'linear-gradient(90deg, #4caf6e, #81c995)' }} />

                            <div className="p-6 pt-7">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-lg overflow-hidden flex-shrink-0"
                                            style={{ background: 'linear-gradient(135deg, #4caf6e, #81c995)', boxShadow: '0 2px 8px rgba(76,175,110,0.25)' }}>
                                            {manager.profileImage
                                                ? <img src={manager.profileImage} alt="Manager" className="w-full h-full object-cover" />
                                                : manager.name[0].toUpperCase()
                                            }
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 leading-tight">{manager.name}</p>
                                            <p className="text-[0.65rem] font-medium uppercase tracking-widest mt-0.5" style={{ color: '#4caf6e' }}>
                                                Property Manager
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsManagerModalOpen(false)}
                                        className="w-8 h-8 rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>

                                {/* Details */}
                                <div className="flex flex-col gap-3 rounded-xl p-4 mb-5"
                                    style={{ background: '#f9f9f8', border: '1px solid #ebebea' }}>
                                    {[
                                        { icon: Mail, label: 'Email', value: manager.email },
                                        { icon: Phone, label: 'Phone', value: manager.phone },
                                        { icon: MapPin, label: 'Property', value: manager.propertyName },
                                    ].map(({ icon: Icon, label, value }) => (
                                        <div key={label} className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center flex-shrink-0"
                                                style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                                                <Icon size={14} color="#4caf6e" />
                                            </div>
                                            <div>
                                                <p className="text-[0.62rem] text-gray-400 uppercase tracking-widest font-medium">{label}</p>
                                                <p className="text-sm font-semibold text-gray-800">{value}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => setIsManagerModalOpen(false)}
                                    className="w-full py-3 text-sm font-semibold text-white rounded-xl transition-all hover:-translate-y-0.5"
                                    style={{
                                        background: 'linear-gradient(135deg, #4caf6e, #5ec47f)',
                                        boxShadow: '0 4px 14px rgba(76,175,110,0.25)'
                                    }}
                                >
                                    Got it
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* ── Password Reset Modal ── */}
                {isPasswordModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            onClick={() => setIsPasswordModalOpen(false)}
                            className="absolute inset-0 bg-black/20 backdrop-blur-[3px]"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative w-full max-w-sm bg-white rounded-[22px] overflow-hidden p-6"
                            style={{ boxShadow: '0 8px 48px rgba(0,0,0,0.12)' }}
                        >
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Change Password</h3>
                            <form onSubmit={handlePasswordChange} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[0.7rem] font-semibold text-gray-400 uppercase tracking-widest">Current Password</label>
                                    <input
                                        type="password" required className={inputClass.replace('pl-11', 'pl-4')}
                                        value={pwData.oldPassword} onChange={e => setPwData({ ...pwData, oldPassword: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[0.7rem] font-semibold text-gray-400 uppercase tracking-widest">New Password</label>
                                    <input
                                        type="password" required className={inputClass.replace('pl-11', 'pl-4')}
                                        value={pwData.newPassword} onChange={e => setPwData({ ...pwData, newPassword: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[0.7rem] font-semibold text-gray-400 uppercase tracking-widest">Confirm New Password</label>
                                    <input
                                        type="password" required className={inputClass.replace('pl-11', 'pl-4')}
                                        value={pwData.confirmPassword} onChange={e => setPwData({ ...pwData, confirmPassword: e.target.value })}
                                    />
                                </div>

                                {pwError && <p className="text-xs text-red-500 font-medium">{pwError}</p>}

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button" onClick={() => setIsPasswordModalOpen(false)}
                                        className="flex-1 py-3 text-sm font-semibold text-gray-500 hover:bg-gray-50 rounded-xl transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit" disabled={pwSaving}
                                        className="flex-1 py-3 text-sm font-semibold text-white rounded-xl transition-all hover:-translate-y-0.5 disabled:opacity-50"
                                        style={{ background: 'linear-gradient(135deg, #4caf6e, #5ec47f)', boxShadow: '0 4px 14px rgba(76,175,110,0.25)' }}
                                    >
                                        {pwSaving ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Update Password'}
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