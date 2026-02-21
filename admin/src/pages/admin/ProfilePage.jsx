import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, MapPin, Shield, Save, Loader2, CreditCard, CheckCircle, Camera } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const ProfilePage = () => {
    const { user, login } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        ic: '',
        gender: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user?.userName) return;
            try {
                const response = await api.get(`/api/profile/${user.userName}`);
                setProfile(response.data);
            } catch (err) {
                console.error("Error fetching profile:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [user?.userName]);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put(`/api/profile/${user.userName}`, profile);
            login({ ...user, name: profile.name });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            console.error("Error saving profile:", err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-bg-darker">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
    );

    const initials = (profile.name || user.userName || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

    return (
        <div className="flex bg-bg-darker min-h-screen">
            <Sidebar />
            <main className="flex-1 p-8 pt-20 lg:pt-8">
                <header className="mb-10">
                    <h1 className="text-3xl font-bold">Admin Profile</h1>
                    <p className="text-text-muted mt-2">Manage your account credentials and personal details</p>
                </header>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    <div className="xl:col-span-2 space-y-8">
                        <section className="glass p-8">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <User className="text-primary w-5 h-5" /> Personal Information
                            </h2>
                            <form onSubmit={handleSave} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-text-muted">Full Name</label>
                                        <input
                                            className="input-field"
                                            value={profile.name}
                                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-text-muted">Email Address</label>
                                        <input
                                            className="input-field"
                                            value={profile.email}
                                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-text-muted">Phone Number</label>
                                        <input
                                            className="input-field"
                                            value={profile.phone}
                                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-text-muted">IC / Passport</label>
                                        <input
                                            className="input-field opacity-60 cursor-not-allowed"
                                            value={profile.ic}
                                            readOnly
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-text-muted">Resident Address</label>
                                    <textarea
                                        className="input-field min-h-[100px]"
                                        value={profile.address}
                                        onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                                    />
                                </div>

                                <div className="flex items-center justify-end gap-4 pt-4 border-t border-white/5">
                                    <AnimatePresence>
                                        {saved && (
                                            <motion.span
                                                initial={{ opacity: 0, x: 10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0 }}
                                                className="text-success text-sm flex items-center gap-2"
                                            >
                                                <CheckCircle className="w-4 h-4" /> Changes saved successfully
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                    <button type="submit" disabled={saving} className="btn btn-primary px-8">
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </section>

                        <section className="glass p-8">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Shield className="text-primary w-5 h-5" /> Security & Access
                            </h2>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                                    <div>
                                        <p className="font-medium">Password Management</p>
                                        <p className="text-sm text-text-muted">Update your security credentials regularly</p>
                                    </div>
                                    <button className="btn glass text-sm">Change Password</button>
                                </div>
                                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                                    <div>
                                        <p className="font-medium">Two-Factor Authentication</p>
                                        <p className="text-sm text-text-muted">Add an extra layer of security to your account</p>
                                    </div>
                                    <span className="text-xs font-bold text-text-muted uppercase tracking-widest px-3 py-1 bg-white/5 rounded-full">Coming Soon</span>
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="space-y-8">
                        <section className="glass p-8 text-center">
                            <div className="relative inline-block mb-6">
                                <div className="w-32 h-32 rounded-3xl bg-primary/20 border-2 border-primary/30 flex items-center justify-center text-4xl font-bold text-primary">
                                    {initials}
                                </div>
                                <button className="absolute -bottom-2 -right-2 p-3 bg-primary rounded-2xl text-white shadow-xl hover:scale-110 transition-transform">
                                    <Camera className="w-5 h-5" />
                                </button>
                            </div>
                            <h3 className="text-2xl font-bold">{profile.name || user.userName}</h3>
                            <p className="text-primary font-medium">{user.myRole}</p>
                            <div className="mt-6 flex items-center justify-center gap-2 px-4 py-2 bg-success/10 text-success rounded-full text-sm font-bold">
                                <Shield className="w-4 h-4" /> Verified Administrator
                            </div>
                        </section>

                        <section className="glass p-8">
                            <h3 className="font-bold mb-4">Account Integrity</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="text-success w-5 h-5" />
                                    <span className="text-sm">Email Verified</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="text-success w-5 h-5" />
                                    <span className="text-sm">Property Linked</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="text-success w-5 h-5" />
                                    <span className="text-sm">Identity Confirmed</span>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProfilePage;
