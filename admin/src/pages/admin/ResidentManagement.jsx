import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, CheckCircle, XCircle, Trash2, Edit2, Plus, X, Loader2, Mail, Phone, MapPin, CreditCard, Home } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const ResidentManagement = () => {
    const { user } = useAuth();
    const [residents, setResidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingResident, setEditingResident] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        name: '',
        email: '',
        phone: '',
        ic: '',
        gender: 'Male',
        address: '',
        room: '',
        approved: false
    });

    useEffect(() => {
        if (user?.propertyId) {
            fetchResidents();
        }
    }, [user]);

    const fetchResidents = async () => {
        try {
            const response = await api.get(`/api/admin/residents?propertyId=${user.propertyId}`);
            setResidents(response.data);
        } catch (err) {
            console.error("Error fetching residents:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (username) => {
        try {
            await api.post(`/api/admin/approve-resident/${username}?propertyId=${user.propertyId}`);
            fetchResidents();
        } catch (err) {
            alert("Failed to approve resident");
        }
    };

    const handleDelete = async (username) => {
        if (!window.confirm("Are you sure you want to delete this resident?")) return;
        try {
            await api.delete(`/api/admin/residents/${username}?propertyId=${user.propertyId}`);
            fetchResidents();
        } catch (err) {
            alert("Failed to delete resident");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingResident) {
                await api.put(`/api/admin/residents/${editingResident.username}?propertyId=${user.propertyId}`, formData);
            } else {
                await api.post(`/api/admin/residents?propertyId=${user.propertyId}`, formData);
            }
            setIsModalOpen(false);
            setEditingResident(null);
            fetchResidents();
        } catch (err) {
            alert(err.response?.data?.message || "Operation failed");
        }
    };

    const openEditModal = (resident) => {
        setEditingResident(resident);
        setFormData(resident);
        setIsModalOpen(true);
    };

    const openAddModal = () => {
        setEditingResident(null);
        setFormData({
            username: '',
            name: '',
            email: '',
            phone: '',
            ic: '',
            gender: 'Male',
            address: '',
            room: '',
            approved: false
        });
        setIsModalOpen(true);
    };

    const filteredResidents = residents.filter(r => {
        const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.username.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'all' ||
            (filter === 'pending' && !r.approved) ||
            (filter === 'approved' && r.approved);
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="flex bg-bg-darker min-h-screen">
            <Sidebar />
            <main className="flex-1 p-8 pt-20 lg:pt-8 w-full">
                <header className="mb-10 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">Resident Management</h1>
                        <p className="text-text-muted mt-2">Oversee all hostel residents and applications</p>
                    </div>
                    <button onClick={openAddModal} className="btn btn-primary">
                        <Plus /> Add New Resident
                    </button>
                </header>

                <div className="glass p-6 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by name or username..."
                            className="input-field pl-12 mb-0"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        {['all', 'pending', 'approved'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f ? 'bg-primary text-white' : 'glass hover:bg-white/5 text-text-muted'
                                    }`}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <AnimatePresence>
                        {filteredResidents.map((resident) => (
                            <motion.div
                                key={resident.username}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="glass p-6 group transition-all hover:border-primary/30"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                            <Users className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold italic">{resident.name}</h3>
                                            <p className="text-text-muted text-sm">@{resident.username}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {!resident.approved && (
                                            <button onClick={() => handleApprove(resident.username)} className="p-2 glass text-success hover:bg-success/10 rounded-lg">
                                                <CheckCircle className="w-5 h-5" />
                                            </button>
                                        )}
                                        <button onClick={() => openEditModal(resident)} className="p-2 glass text-primary hover:bg-primary/10 rounded-lg">
                                            <Edit2 className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => handleDelete(resident.username)} className="p-2 glass text-error hover:bg-error/10 rounded-lg">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                                    <div className="flex items-center gap-2 text-text-muted">
                                        <Mail className="w-4 h-4 text-primary" /> {resident.email}
                                    </div>
                                    <div className="flex items-center gap-2 text-text-muted">
                                        <Phone className="w-4 h-4 text-primary" /> {resident.phone}
                                    </div>
                                    <div className="flex items-center gap-2 text-text-muted">
                                        <CreditCard className="w-4 h-4 text-primary" /> {resident.ic}
                                    </div>
                                    <div className="flex items-center gap-2 text-text-muted">
                                        <Home className="w-4 h-4 text-primary" /> Room {resident.room}
                                    </div>
                                    <div className="col-span-2 flex items-center gap-2 text-text-muted">
                                        <MapPin className="w-4 h-4 text-primary" /> {resident.address}
                                    </div>
                                </div>

                                <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${resident.approved ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'
                                        }`}>
                                        {resident.approved ? 'Approved' : 'Pending Approval'}
                                    </span>
                                    <span className="text-xs text-text-muted">Gender: {resident.gender}</span>
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
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
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
                                    <h2 className="text-2xl font-bold">{editingResident ? 'Edit Resident' : 'Add Resident'}</h2>
                                    <button onClick={() => setIsModalOpen(false)} className="text-text-muted hover:text-white transition-colors">
                                        <X />
                                    </button>
                                </div>
                                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label>Username</label>
                                        <input
                                            disabled={editingResident}
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
                                        <input
                                            type="email"
                                            className="input-field"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label>Phone</label>
                                        <input
                                            className="input-field"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label>IC / Passport</label>
                                        <input
                                            className="input-field"
                                            value={formData.ic}
                                            onChange={(e) => setFormData({ ...formData, ic: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label>Room Number</label>
                                        <input
                                            className="input-field"
                                            value={formData.room}
                                            onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label>Gender</label>
                                        <select
                                            className="input-field"
                                            value={formData.gender}
                                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                        >
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label>Approved State</label>
                                        <select
                                            className="input-field"
                                            value={formData.approved.toString()}
                                            onChange={(e) => setFormData({ ...formData, approved: e.target.value === 'true' })}
                                        >
                                            <option value="true">Approved</option>
                                            <option value="false">Pending</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label>Home Address</label>
                                        <textarea
                                            className="input-field min-h-[100px]"
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn glass">Cancel</button>
                                        <button type="submit" className="btn btn-primary px-8">
                                            {editingResident ? 'Save Changes' : 'Create Resident'}
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

export default ResidentManagement;
