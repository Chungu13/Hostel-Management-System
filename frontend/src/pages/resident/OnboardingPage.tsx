import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Phone, MapPin, Home, Info, Loader2, Check, ShieldCheck, Building2 } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const OnboardingPage: React.FC = () => {
    const { user, login } = useAuth();
    const navigate = useNavigate();
    const [properties, setProperties] = useState<any[]>([]);
    const [fetchingProps, setFetchingProps] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        ic: '',
        gender: 'Male',
        room: '',
        propertyId: ''
    });

    React.useEffect(() => {
        const fetchProperties = async () => {
            try {
                const res = await api.get('/api/auth/properties');
                setProperties(res.data);
                if (res.data.length > 0) {
                    setFormData(prev => ({ ...prev, propertyId: res.data[0].id }));
                }
            } catch (err) {
                console.error("Failed to fetch properties", err);
            } finally {
                setFetchingProps(false);
            }
        };
        fetchProperties();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await api.post('/api/auth/onboarding', {
                userId: user?.id,
                ...formData,
                address: 'Property Resident' // Default value since they reside at the property
            });

            const updatedUser = {
                ...user!,
                name: formData.name,
                isOnboarded: true,
                needsOnboarding: false,
                isApproved: false
            };
            login(updatedUser);

            navigate('/resident');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save information. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-6 bg-slate-50 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-3xl bg-white rounded-[2.5rem] p-12 shadow-2xl shadow-slate-200/60 border border-slate-100 relative z-10"
            >
                <div className="flex items-center gap-3 mb-10">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/30">
                        M
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-900 text-xl leading-none">Malo</span>
                        <span className="text-[10px] text-primary uppercase tracking-widest font-semibold">User Setup</span>
                    </div>
                </div>

                <div className="mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-600 text-[10px] font-bold uppercase tracking-widest mb-4">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                        Final Step
                    </div>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Complete Your Profile</h1>
                    <p className="text-slate-400 font-medium mt-2 leading-relaxed">
                        Welcome to Malo! We just need a few more details to finalize your resident profile.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-12">
                    {/* Section 1: Identity */}
                    <div>
                        <div className="flex items-center gap-4 mb-8">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Personal Identification</span>
                            <div className="h-px bg-slate-100 w-full" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">Display Name</label>
                                <div className="relative">
                                    <Info className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 outline-none transition-all focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 placeholder:text-slate-300 font-medium"
                                        placeholder="Full Legal Name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">IC / Passport</label>
                                <div className="relative">
                                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 outline-none transition-all focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 placeholder:text-slate-300 font-medium"
                                        placeholder="Identification Number"
                                        value={formData.ic}
                                        onChange={(e) => setFormData({ ...formData, ic: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">Mobile Phone</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <input
                                        type="tel"
                                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 outline-none transition-all focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 placeholder:text-slate-300 font-medium"
                                        placeholder="+60 12 345 6789"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Residency */}
                    <div>
                        <div className="flex items-center gap-4 mb-8">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Residency Details</span>
                            <div className="h-px bg-slate-100 w-full" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">Gender</label>
                                <select
                                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 outline-none transition-all focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 font-medium appearance-none cursor-pointer"
                                    value={formData.gender}
                                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                >
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className="space-y-1.5 lg:col-span-2">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">Target Property / Apartment</label>
                                <div className="space-y-3">
                                    <select
                                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 outline-none transition-all focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 font-bold appearance-none cursor-pointer disabled:opacity-50"
                                        value={formData.propertyId}
                                        onChange={(e) => setFormData(prev => ({ ...prev, propertyId: e.target.value }))}
                                        disabled={fetchingProps}
                                        required
                                    >
                                        <option value="" disabled>Select your hostel/apartment</option>
                                        {fetchingProps ? (
                                            <option>Loading properties...</option>
                                        ) : (
                                            properties.map(p => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))
                                        )}
                                        {!fetchingProps && properties.length === 0 && (
                                            <option>No properties available</option>
                                        )}
                                    </select>

                                    {/* Detailed Property Connection Card */}
                                    {formData.propertyId && properties.find(p => p.id.toString() === formData.propertyId.toString()) && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-5 bg-gradient-to-br from-slate-50 to-white border border-slate-100 rounded-2xl shadow-sm"
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm">
                                                    <Building2 size={20} />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <h4 className="text-sm font-bold text-slate-900">
                                                            {properties.find(p => p.id.toString() === formData.propertyId.toString())?.name}
                                                        </h4>
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">
                                                            {properties.find(p => p.id.toString() === formData.propertyId.toString())?.propertyType}
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] text-slate-400 font-medium mt-1 flex items-center gap-1">
                                                        <MapPin size={10} />
                                                        {properties.find(p => p.id.toString() === formData.propertyId.toString())?.address}
                                                    </p>
                                                    <div className="mt-3 pt-3 border-t border-slate-50 flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-600 font-bold">
                                                            <User size={12} />
                                                        </div>
                                                        <div>
                                                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight leading-none">Property Manager</p>
                                                            <p className="text-[11px] text-primary font-bold mt-1">
                                                                {properties.find(p => p.id.toString() === formData.propertyId.toString())?.admin?.fullName || 'Allocated Manager'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="mt-3 text-[10px] text-slate-400 font-medium leading-relaxed italic">
                                                By selecting this apartment, your enrollment request will be sent directly to this manager for physical verification.
                                            </p>
                                        </motion.div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-1.5 lg:col-span-3">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">Room Number / Block</label>
                                <div className="relative">
                                    <Home className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 outline-none transition-all focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 placeholder:text-slate-300 font-extrabold"
                                        placeholder="e.g. Block A, Unit 12-04"
                                        value={formData.room}
                                        onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>



                    {error && (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-medium flex items-center gap-3">
                            <span className="text-lg">⚠️</span>
                            {error}
                        </div>
                    )}

                    <motion.button
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        className="w-full py-5 bg-gradient-to-r from-primary to-emerald-500 text-white font-extrabold rounded-2xl shadow-xl shadow-primary/30 flex items-center justify-center gap-3 transition-all disabled:opacity-70 disabled:cursor-not-allowed group"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} className="group-hover:scale-125 transition-transform" />}
                        {loading ? 'Finalizing Profile...' : 'Complete Profile Setup'}
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
};

export default OnboardingPage;
