import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Loader2, Save, ShieldCheck, Camera } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

interface ProfileData {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    myRole: string;
    profileImage?: string;
    propertyName?: string;
    propertyAddress?: string;
    propertyType?: string;
}


const ProfilePage: React.FC = () => {
    const { user, login } = useAuth();
    const [profile, setProfile] = useState<ProfileData>({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        myRole: '',
        profileImage: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await api.get<ProfileData>('/api/profile/me');
            setProfile(response.data);
        } catch (error) {
            console.error('Error fetching profile:', error);
            setMessage({ text: 'Failed to load profile data. Please check your connection.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 1024 * 1024) { // 1MB limit
                setMessage({ text: 'Image size too large. Please use an image under 1MB.', type: 'error' });
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfile({ ...profile, profileImage: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ text: '', type: '' });

        try {
            await api.put('/api/profile/me', {
                fullName: profile.fullName,
                phone: profile.phone,
                address: profile.address,
                profileImage: profile.profileImage
            });

            // Update local auth context if name changed
            if (user) {
                login({
                    ...user,
                    name: profile.fullName || 'Admin'
                });
            }

            setMessage({ text: 'Profile updated successfully!', type: 'success' });
        } catch (error) {
            console.error('Error updating profile:', error);
            setMessage({ text: 'Failed to update profile. Please try again.', type: 'error' });
        } finally {
            setSaving(false);
        }
    };


    const inputClass = "w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm font-medium outline-none transition-all placeholder:text-gray-300 focus:bg-white focus:border-green-400 focus:ring-4 focus:ring-green-400/10";

    return (
        <div className="min-h-screen bg-[#f7f7f5]">
            <div className="flex min-h-screen bg-[radial-gradient(circle_at_5%_10%,rgba(134,197,152,0.10)_0%,transparent_45%),radial-gradient(circle_at_95%_90%,rgba(134,197,152,0.07)_0%,transparent_45%)] font-sans">
                <Sidebar />

                <main className="flex-1 w-full px-6 py-8 md:px-10 md:py-10 md:pl-20">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-3xl mx-auto"
                    >
                        {/* Header */}
                        <div className="mb-8">
                            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[0.72rem] font-semibold tracking-[0.08em] uppercase text-emerald-600 mb-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                                My Account
                            </div>
                            <h1 className="text-[1.85rem] font-bold tracking-tight text-zinc-900 leading-tight">Admin Profile</h1>
                            <p className="text-sm text-zinc-400 mt-1">Manage your professional information and contact details</p>
                        </div>

                        {loading ? (
                            <div className="h-64 flex items-center justify-center">
                                <Loader2 className="animate-spin text-emerald-500" size={32} />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {/* Side Card */}
                                <div className="md:col-span-1">
                                    <div className="bg-white rounded-3xl border border-black/5 shadow-[0_4px_24px_rgba(0,0,0,0.04)] p-8 text-center flex flex-col items-center">
                                        <div className="relative group mb-4">
                                            <div className="w-24 h-24 rounded-3xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 text-3xl font-bold border-2 border-emerald-500/20 shadow-sm transition-transform group-hover:scale-105 overflow-hidden">
                                                {profile.profileImage ? (
                                                    <img src={profile.profileImage} alt="Profile" className="w-full h-full object-cover" />
                                                ) : (
                                                    (profile.fullName || 'A')[0].toUpperCase()
                                                )}
                                            </div>
                                            <label className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-400 cursor-pointer hover:text-emerald-500 hover:shadow-md transition-all">
                                                <Camera size={14} />
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                />
                                            </label>
                                        </div>

                                        <h3 className="text-lg font-bold text-gray-900 truncate w-full px-2">
                                            {profile.fullName}
                                        </h3>
                                        <p className="text-xs text-emerald-600 font-semibold uppercase tracking-widest mt-1 mb-4">
                                            {profile.myRole}
                                        </p>
                                        <div className="w-full h-px bg-gray-100 my-4" />
                                        <div className="flex flex-col gap-3 w-full">
                                            <div className="flex items-center gap-2 text-[0.8rem] text-gray-500 justify-center">
                                                <Mail size={14} className="text-gray-300" />
                                                <span className="truncate">{profile.email}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[0.8rem] text-gray-500 justify-center">
                                                <ShieldCheck size={14} className="text-emerald-500" />
                                                <span className="text-emerald-600 font-medium">Verified Admin</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Form */}
                                <div className="md:col-span-2">
                                    <div className="bg-white rounded-3xl border border-black/5 shadow-[0_4px_24px_rgba(0,0,0,0.04)] p-8">
                                        <form onSubmit={handleUpdate} className="space-y-6">
                                            <div className="grid grid-cols-1 gap-6">
                                                <div className="space-y-1.5">
                                                    <label className="text-[0.72rem] font-medium text-gray-500 uppercase tracking-wider px-0.5 flex items-center gap-2">
                                                        <User size={12} /> Full Name
                                                    </label>
                                                    <div className="relative">
                                                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
                                                        <input
                                                            type="text"
                                                            className={inputClass}
                                                            placeholder="John Doe"
                                                            value={profile.fullName}
                                                            onChange={e => setProfile({ ...profile, fullName: e.target.value })}
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-1.5">
                                                    <label className="text-[0.72rem] font-medium text-gray-500 uppercase tracking-wider px-0.5 flex items-center gap-2">
                                                        <Mail size={12} /> Email Address
                                                    </label>
                                                    <div className="relative">
                                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4 px-0.5" />
                                                        <input
                                                            type="email"
                                                            className={`${inputClass} opacity-50 cursor-not-allowed`}
                                                            value={profile.email}
                                                            disabled
                                                        />
                                                    </div>
                                                    <p className="text-[0.65rem] text-gray-400 pl-1 italic">Email cannot be changed (Google/Auth Login)</p>
                                                </div>

                                                <div className="space-y-1.5">
                                                    <label className="text-[0.72rem] font-medium text-gray-500 uppercase tracking-wider px-0.5 flex items-center gap-2">
                                                        <Phone size={12} /> Phone Number
                                                    </label>
                                                    <div className="relative">
                                                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
                                                        <input
                                                            type="text"
                                                            className={inputClass}
                                                            placeholder="+60 12 345 6789"
                                                            value={profile.phone}
                                                            onChange={e => setProfile({ ...profile, phone: e.target.value })}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-1.5">
                                                    <label className="text-[0.72rem] font-medium text-gray-500 uppercase tracking-wider px-0.5 flex items-center gap-2">
                                                        <MapPin size={12} /> Permanent Address
                                                    </label>
                                                    <div className="relative">
                                                        <MapPin className="absolute left-3.5 top-[18px] text-gray-300 w-4 h-4" />
                                                        <textarea
                                                            className={`${inputClass} min-h-[100px] resize-none pt-3.5`}
                                                            placeholder="Enter your administrative address..."
                                                            value={profile.address}
                                                            onChange={e => setProfile({ ...profile, address: e.target.value })}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Property Section */}
                                            {profile.propertyName && (
                                                <div className="bg-emerald-50/50 rounded-2xl p-6 border border-emerald-100/50">
                                                    <div className="flex items-center gap-4 mb-4">
                                                        <div className="w-1 h-5 bg-emerald-500 rounded-full" />
                                                        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Managed Property Asset</h2>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Property Name</p>
                                                            <p className="text-xs font-bold text-slate-900">{profile.propertyName}</p>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Structure Type</p>
                                                            <p className="text-xs font-medium text-slate-600">{profile.propertyType}</p>
                                                        </div>
                                                        <div className="md:col-span-2 space-y-1">
                                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Physical Address</p>
                                                            <p className="text-xs font-medium text-slate-600">{profile.propertyAddress}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}


                                            {message.text && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className={`p-4 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                                                        }`}
                                                >
                                                    {message.text}
                                                </motion.div>
                                            )}

                                            <button
                                                type="submit"
                                                disabled={saving}
                                                className="w-full py-4 bg-gradient-to-br from-emerald-600 to-emerald-400 text-white font-bold rounded-2xl shadow-[0_4px_16px_rgba(76,175,110,0.25)] transition-all hover:scale-[1.01] hover:shadow-[0_8px_24px_rgba(76,175,110,0.3)] disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3 mt-4"
                                            >
                                                {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                                {saving ? 'Saving Changes...' : 'Update Profile'}
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </main>
            </div>
        </div>
    );
};

export default ProfilePage;
