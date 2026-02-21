import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldCheck, Search, Mail, Phone, MapPin, User, CheckCircle, X, Edit2,
    Trash2, ShieldAlert, Plus, Loader2, CreditCard, Clock
} from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const StaffManagement = () => {
    const { user } = useAuth();
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        name: '',
        email: '',
        phone: '',
        ic: '',
        gender: 'Male',
        address: '',
        approved: true
    });

    useEffect(() => {
        if (user?.propertyId) {
            fetchStaff();
        }
    }, [user]);

    const fetchStaff = async () => {
        try {
            const response = await api.get(`/api/admin/staff?propertyId=${user.propertyId}`);
            setStaff(response.data);
        } catch (err) {
            console.error("Error fetching staff:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (username) => {
        if (!window.confirm("Delete this security personnel account?")) return;
        try {
            await api.delete(`/api/admin/staff/${username}?propertyId=${user.propertyId}`);
            fetchStaff();
        } catch (err) {
            alert("Failed to delete staff");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingStaff) {
                await api.put(`/api/admin/staff/${editingStaff.username}?propertyId=${user.propertyId}`, formData);
            } else {
                await api.post('/api/admin/staff', { ...formData, propertyId: user.propertyId });
            }
            setIsModalOpen(false);
            setEditingStaff(null);
            fetchStaff();
        } catch (err) {
            alert(err.response?.data?.message || "Operation failed");
        }
    };

    const openEditModal = (s) => {
        setEditingStaff(s);
        setFormData(s);
        setIsModalOpen(true);
    };

    const openAddModal = () => {
        setEditingStaff(null);
        setFormData({
            username: '',
            name: '',
            email: '',
            phone: '',
            ic: '',
            gender: 'Male',
            address: '',
            approved: true
        });
        setIsModalOpen(true);
    };

    const filteredStaff = staff.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex bg-bg-darker min-h-screen">
            <Sidebar />
            <main className="ml-64 p-8 w-full">
                <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <ShieldAlert className="text-secondary" /> Staff Management
                        </h1>
                        <p className="text-text-muted mt-2">Manage security personnel and system access</p>
                    </div>
                    <button onClick={openAddModal} className="btn btn-secondary">
                        <Plus /> Register New Officer
                    </button>
                </header>

                <div className="glass p-6 mb-8 flex items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by name or ID..."
                            className="input-field pl-12 mb-0"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <AnimatePresence>
                        {filteredStaff.map((person) => (
                            <motion.div
                                key={person.username}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="glass p-6 group transition-all hover:border-secondary/30"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-all">
                                            <ShieldCheck className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold italic">{person.name}</h3>
                                            <p className="text-text-muted text-sm">Badge ID: {person.username}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => openEditModal(person)} className="p-2 glass text-secondary hover:bg-secondary/10 rounded-lg">
                                            <Edit2 className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => handleDelete(person.username)} className="p-2 glass text-error hover:bg-error/10 rounded-lg">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-6">
                                    <div className="flex items-center gap-2 text-text-muted">
                                        <Mail className="w-4 h-4 text-secondary" /> {person.email}
                                    </div>
                                    <div className="flex items-center gap-2 text-text-muted">
                                        <Phone className="w-4 h-4 text-secondary" /> {person.phone}
                                    </div>
                                    <div className="flex items-center gap-2 text-text-muted">
                                        <CreditCard className="w-4 h-4 text-secondary" /> {person.ic}
                                    </div>
                                    <div className="flex items-center gap-2 text-text-muted">
                                        <MapPin className="w-4 h-4 text-secondary" /> {person.address}
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-white/5 flex justify-between items-center text-xs">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-success"></span>
                                        <span className="text-text-muted">Duty Status: Active</span>
                                    </div>
                                    <span className="text-text-muted">Gender: {person.gender}</span>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Modal */}
                <AnimatePresence>
                    {isModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                onClick={() => setIsModalOpen(false)}
                                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="glass p-8 w-full max-w-2xl relative z-60 overflow-y-auto max-h-[90vh]"
                            >
                                <div className="flex justify-between items-center mb-8">
                                    <h2 className="text-2xl font-bold">{editingStaff ? 'Edit Officer' : 'Register Officer'}</h2>
                                    <button onClick={() => setIsModalOpen(false)} className="text-text-muted hover:text-white"><X /></button>
                                </div>
                                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label>Username (Badge ID)</label>
                                        <input
                                            disabled={editingStaff}
                                            className="input-field disabled:opacity-50"
                                            value={formData.username}
                                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label>Full Name</label>
                                        <input
                                            className="input-field"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label>Email</label>
                                        <input type="email" className="input-field" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                                    </div>
                                    <div className="space-y-2">
                                        <label>Phone</label>
                                        <input className="input-field" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
                                    </div>
                                    <div className="space-y-2">
                                        <label>IC / Passport</label>
                                        <input className="input-field" value={formData.ic} onChange={(e) => setFormData({ ...formData, ic: e.target.value })} required />
                                    </div>
                                    <div className="space-y-2">
                                        <label>Gender</label>
                                        <select className="input-field" value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })}>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label>Home Address</label>
                                        <textarea className="input-field min-h-[100px]" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} required />
                                    </div>
                                    <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn glass">Cancel</button>
                                        <button type="submit" className="btn btn-secondary px-8">
                                            {editingStaff ? 'Save Changes' : 'Register Officer'}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default StaffManagement;

