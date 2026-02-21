import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Phone, MapPin, Home, Info, Loader2, Check, Landmark, ShieldCheck } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const AdminOnboarding = () => {
    const { user, login } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        userName: '',
        propertyName: '',
        propertyAddress: '',
        propertyType: 'Hostel' // Hostel or Apartment
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await api.post('/api/auth/admin/onboarding', {
                userId: user.id,
                ...formData
            });

            const updatedUser = { ...user, userName: formData.userName, needsOnboarding: false, propertyId: response.data.propertyId };
            login(updatedUser);

            navigate('/admin');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save information. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

                .ob-root {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem 1.5rem;
                    background-color: #020617;
                    background-image:
                        radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
                        radial-gradient(circle at 90% 80%, rgba(99, 102, 241, 0.05) 0%, transparent 50%);
                    font-family: 'Outfit', sans-serif;
                }

                .ob-card {
                    width: 100%;
                    max-width: 600px;
                    background: #0f172a;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 24px;
                    padding: 48px;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
                    position: relative;
                }

                .ob-header { margin-bottom: 32px; }

                .ob-step-badge {
                    display: inline-flex;
                    align-items: center; gap: 6px;
                    background: rgba(99, 102, 241, 0.1);
                    border: 1px solid rgba(99, 102, 241, 0.2);
                    color: #818cf8;
                    font-size: 0.72rem;
                    font-weight: 600;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    padding: 4px 10px;
                    border-radius: 20px;
                    margin-bottom: 12px;
                }

                .ob-heading {
                    font-size: 2rem;
                    font-weight: 700;
                    color: #fff;
                    margin-bottom: 8px;
                }

                .ob-subtext {
                    font-size: 0.9rem;
                    color: #94a3b8;
                }

                .ob-grid { display: grid; grid-template-columns: 1fr; gap: 20px; }

                .ob-field { display: flex; flex-direction: column; gap: 8px; }

                .ob-label {
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: #94a3b8;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .ob-input-wrap { position: relative; }

                .ob-input-icon {
                    position: absolute;
                    left: 14px; top: 50%;
                    transform: translateY(-50%);
                    color: #64748b;
                    width: 18px; height: 18px;
                }

                .ob-input {
                    width: 100%;
                    padding: 12px 14px 12px 42px;
                    background: rgba(15, 23, 42, 0.5);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    color: #fff;
                    outline: none;
                    font-size: 1rem;
                }

                .ob-input:focus {
                    border-color: #6366f1;
                    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
                }

                .ob-select {
                    width: 100%;
                    padding: 12px 14px;
                    background: rgba(15, 23, 42, 0.5);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    color: #fff;
                    font-size: 1rem;
                    outline: none;
                }

                .ob-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    width: 100%;
                    padding: 14px;
                    font-weight: 600;
                    color: #fff;
                    background: #6366f1;
                    border: none;
                    border-radius: 12px;
                    cursor: pointer;
                    margin-top: 16px;
                    transition: all 0.2s;
                }

                .ob-btn:hover:not(:disabled) {
                    background: #4f46e5;
                    transform: translateY(-2px);
                }

                .ob-error {
                    font-size: 0.85rem;
                    color: #ef4444;
                    background: rgba(239, 68, 68, 0.1);
                    padding: 12px;
                    border-radius: 10px;
                    margin-top: 10px;
                    text-align: center;
                }

                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>

            <div className="ob-root">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="ob-card"
                >
                    <div className="ob-header">
                        <div className="ob-step-badge">Manager Setup</div>
                        <h1 className="ob-heading">Property Registration</h1>
                        <p className="ob-subtext">Initialize your property's management unit on the Malo Platform.</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="ob-grid">
                            <div className="ob-field">
                                <label className="ob-label">Display Name (Visible to Staff)</label>
                                <div className="ob-input-wrap">
                                    <User className="ob-input-icon" />
                                    <input
                                        type="text"
                                        className="ob-input"
                                        placeholder="John Manager"
                                        value={formData.userName}
                                        onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="ob-field">
                                <label className="ob-label">Building / Property Name</label>
                                <div className="ob-input-wrap">
                                    <Landmark className="ob-input-icon" />
                                    <input
                                        type="text"
                                        className="ob-input"
                                        placeholder="Skyline Residence"
                                        value={formData.propertyName}
                                        onChange={(e) => setFormData({ ...formData, propertyName: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="ob-field">
                                <label className="ob-label">Unit Classification</label>
                                <select
                                    className="ob-select"
                                    value={formData.propertyType}
                                    onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                                >
                                    <option value="Hostel">Hostel (Student/Worker Housing)</option>
                                    <option value="Apartment">Apartment / Condominium</option>
                                </select>
                            </div>

                            <div className="ob-field">
                                <label className="ob-label">Physical Address</label>
                                <div className="ob-input-wrap">
                                    <MapPin className="ob-input-icon" />
                                    <input
                                        type="text"
                                        className="ob-input"
                                        placeholder="Street, City, Postcode"
                                        value={formData.propertyAddress}
                                        onChange={(e) => setFormData({ ...formData, propertyAddress: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {error && <div className="ob-error">{error}</div>}

                        <button type="submit" disabled={loading} className="ob-btn">
                            {loading ? <Loader2 className="spin" /> : <ShieldCheck size={20} />}
                            {loading ? 'Finalizing Setup…' : 'Complete Registration'}
                        </button>
                    </form>
                </motion.div>
            </div>
        </>
    );
};

export default AdminOnboarding;
