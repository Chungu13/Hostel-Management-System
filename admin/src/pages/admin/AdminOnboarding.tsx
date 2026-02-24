import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Loader2, Landmark, ShieldCheck, ChevronRight } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const AdminOnboarding: React.FC = () => {
    const { user, login } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        propertyName: '',
        propertyAddress: '',
        propertyType: 'Hostel'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // ✅ No userId in the body — the backend reads it from the JWT header
            const response = await api.post('/api/auth/admin/onboarding', formData);

            // Update local user state: mark onboarded, store propertyId and the
            // refreshed token (backend re-issues with updated "Managing Staff" role claim)
            const updatedUser = {
                ...user!,
                myRole: 'Managing Staff',
                isOnboarded: true,
                propertyId: response.data.propertyId,
                token: response.data.token  // ← always use the freshest token
            };

            login(updatedUser);
            navigate('/dashboard');

        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to register property. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const inputClass = `
        w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl
        text-gray-900 text-sm font-medium outline-none transition-all
        placeholder:text-gray-300
        focus:bg-white focus:border-green-400 focus:ring-4 focus:ring-green-400/10
    `;

    const selectClass = `
        w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl
        text-gray-900 text-sm font-medium outline-none transition-all appearance-none cursor-pointer
        focus:bg-white focus:border-green-400 focus:ring-4 focus:ring-green-400/10
    `;

    const steps = [
        { num: '1', title: 'Set your display name', desc: 'Visible to staff and residents' },
        { num: '2', title: 'Register your property', desc: 'Name, type and address' },
        { num: '3', title: 'Start managing', desc: 'Full access to your console' },
    ];

    return (
        <div className="min-h-screen flex font-['Plus_Jakarta_Sans',sans-serif] bg-[#f7f7f5]"
            style={{
                backgroundImage: `
                    radial-gradient(circle at 10% 20%, rgba(134,197,152,0.12) 0%, transparent 50%),
                    radial-gradient(circle at 90% 80%, rgba(134,197,152,0.08) 0%, transparent 50%)
                `
            }}
        >
            {/* ── Left Panel ── */}
            <div className="hidden lg:flex w-[400px] flex-shrink-0 bg-white border-r border-gray-100 flex-col justify-between p-12 overflow-hidden relative">
                {/* glow */}
                <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
                    style={{ background: 'radial-gradient(circle, rgba(76,175,110,0.08) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />

                <div>
                    {/* Brand */}
                    <div className="flex items-center gap-3 mb-16">
                        <div className="w-9 h-9 rounded-[10px] flex items-center justify-center text-white font-bold text-base flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg, #4caf6e, #81c995)', boxShadow: '0 2px 8px rgba(76,175,110,0.28)' }}>
                            M
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <span className="font-bold text-gray-900 text-lg leading-none tracking-tight">Malo</span>
                            <span className="text-[0.58rem] text-green-500 uppercase tracking-[0.15em] font-semibold">Admin Console</span>
                        </div>
                    </div>

                    {/* Headline */}
                    <h2 className="text-[2rem] font-bold text-gray-900 tracking-tight leading-snug mb-4">
                        Let's get your<br />property <span className="text-green-500">set up.</span>
                    </h2>
                    <p className="text-sm text-gray-400 leading-relaxed max-w-[280px]">
                        Just a few details and your hostel management console will be ready to go.
                    </p>

                    {/* Steps */}
                    <div className="mt-11 flex flex-col gap-5">
                        {steps.map((step) => (
                            <div key={step.num} className="flex items-start gap-4">
                                <div className="w-[26px] h-[26px] rounded-full flex items-center justify-center text-[0.68rem] font-bold text-green-500 flex-shrink-0 mt-0.5"
                                    style={{ background: 'rgba(76,175,110,0.1)', border: '1.5px solid rgba(76,175,110,0.22)' }}>
                                    {step.num}
                                </div>
                                <div>
                                    <div className="text-[0.82rem] font-semibold text-gray-700 leading-tight mb-0.5">{step.title}</div>
                                    <div className="text-[0.72rem] text-gray-400 font-normal">{step.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <p className="text-[0.7rem] text-gray-300 tracking-wide">
                    © {new Date().getFullYear()} Malo · Hostel Management
                </p>
            </div>

            {/* ── Right / Form ── */}
            <div className="flex-1 flex items-center justify-center px-8 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full max-w-[460px]"
                >
                    {/* Mobile brand */}
                    <div className="flex lg:hidden items-center gap-3 mb-10">
                        <div className="w-9 h-9 rounded-[10px] flex items-center justify-center text-white font-bold text-base"
                            style={{ background: 'linear-gradient(135deg, #4caf6e, #81c995)', boxShadow: '0 2px 8px rgba(76,175,110,0.28)' }}>
                            M
                        </div>
                        <span className="font-bold text-gray-900 text-lg tracking-tight">Malo</span>
                    </div>

                    {/* Badge + heading */}
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[0.68rem] font-semibold uppercase tracking-widest mb-3"
                        style={{ background: 'rgba(76,175,110,0.08)', border: '1px solid rgba(76,175,110,0.2)', color: '#4caf6e' }}>
                        <ShieldCheck size={11} /> Manager Setup
                    </div>

                    <h1 className="text-[1.85rem] font-bold text-gray-900 tracking-tight leading-snug mb-1.5">
                        Property Registration
                    </h1>
                    <p className="text-sm text-gray-400 mb-8 leading-relaxed">
                        Initialize your property's management unit on the Malo platform.
                    </p>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">



                        {/* Property Details */}
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-[0.65rem] font-semibold uppercase tracking-widest text-gray-400 whitespace-nowrap">Property Details</span>
                                <div className="flex-1 h-px bg-gray-100" />
                            </div>
                            <div className="flex flex-col gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[0.72rem] font-medium text-gray-500 uppercase tracking-wider px-0.5">
                                        Building / Property Name
                                    </label>
                                    <div className="relative">
                                        <Landmark className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
                                        <input
                                            type="text"
                                            className={inputClass}
                                            placeholder="Skyline Residence"
                                            value={formData.propertyName}
                                            onChange={(e) => setFormData({ ...formData, propertyName: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[0.72rem] font-medium text-gray-500 uppercase tracking-wider px-0.5">
                                        Unit Classification
                                    </label>
                                    <select
                                        className={selectClass}
                                        value={formData.propertyType}
                                        onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                                    >
                                        <option value="Hostel">Hostel (Student / Worker Housing)</option>
                                        <option value="Apartment">Apartment / Condominium</option>
                                        <option value="Other">Other Complex</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[0.72rem] font-medium text-gray-500 uppercase tracking-wider px-0.5">
                                        Physical Address
                                    </label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
                                        <input
                                            type="text"
                                            className={inputClass}
                                            placeholder="Street, City, Postcode"
                                            value={formData.propertyAddress}
                                            onChange={(e) => setFormData({ ...formData, propertyAddress: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-3.5 bg-red-50 border border-red-100 rounded-xl text-red-500 text-sm font-medium flex items-center gap-2.5"
                            >
                                <span>⚠️</span> {error}
                            </motion.div>
                        )}

                        {/* Submit */}
                        <motion.button
                            whileHover={{ y: -1 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed group"
                            style={{
                                background: 'linear-gradient(135deg, #4caf6e, #5ec47f)',
                                boxShadow: '0 4px 16px rgba(76,175,110,0.28)'
                            }}
                        >
                            {loading
                                ? <Loader2 size={17} className="animate-spin" />
                                : <ShieldCheck size={17} className="group-hover:scale-110 transition-transform" />
                            }
                            {loading ? 'Initializing…' : 'Complete Registration'}
                            {!loading && <ChevronRight size={16} className="opacity-50 ml-1" />}
                        </motion.button>
                    </form>

                    {/* Footer */}
                    <p className="text-center text-gray-400 text-xs mt-8">
                        By registering, you agree to our{' '}
                        <span className="text-green-500 underline cursor-pointer hover:text-green-600 transition-colors">
                            Terms of Service
                        </span>.
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default AdminOnboarding;