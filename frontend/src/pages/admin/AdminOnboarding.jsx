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

            const updatedUser = { ...user, userName: formData.userName, needsOnboarding: false };
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
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

                .ob-root {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem 1.5rem;
                    background-color: #f7f7f5;
                    background-image:
                        radial-gradient(circle at 10% 20%, rgba(134, 197, 152, 0.12) 0%, transparent 50%),
                        radial-gradient(circle at 90% 80%, rgba(134, 197, 152, 0.08) 0%, transparent 50%);
                    font-family: 'Plus Jakarta Sans', sans-serif;
                }

                .ob-card {
                    width: 100%;
                    max-width: 600px;
                    background: #ffffff;
                    border-radius: 24px;
                    padding: 48px 48px;
                    box-shadow:
                        0 1px 3px rgba(0,0,0,0.04),
                        0 8px 32px rgba(0,0,0,0.06),
                        0 0 0 1px rgba(0,0,0,0.04);
                    position: relative;
                    overflow: hidden;
                }

                .ob-card::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; right: 0;
                    height: 3px;
                    background: linear-gradient(90deg, #4caf6e, #81c995);
                    border-radius: 24px 24px 0 0;
                }

                .ob-header { margin-bottom: 32px; }

                .ob-step-badge {
                    display: inline-flex;
                    align-items: center; gap: 6px;
                    background: rgba(76, 175, 110, 0.08);
                    border: 1px solid rgba(76, 175, 110, 0.2);
                    color: #4caf6e;
                    font-size: 0.72rem;
                    font-weight: 600;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    padding: 4px 10px;
                    border-radius: 20px;
                    margin-bottom: 12px;
                }

                .ob-heading {
                    font-size: 1.85rem;
                    font-weight: 700;
                    color: #111;
                    line-height: 1.2;
                    margin: 0 0 6px;
                    letter-spacing: -0.02em;
                }

                .ob-subtext {
                    font-size: 0.875rem;
                    color: #888;
                    font-weight: 400;
                    line-height: 1.5;
                }

                .ob-grid { display: grid; grid-template-columns: 1fr; gap: 16px; }

                .ob-field { display: flex; flex-direction: column; gap: 6px; }

                .ob-label {
                    font-size: 0.78rem;
                    font-weight: 500;
                    color: #555;
                    letter-spacing: 0.06em;
                    text-transform: uppercase;
                }

                .ob-input-wrap { position: relative; }

                .ob-input-icon {
                    position: absolute;
                    left: 14px; top: 50%;
                    transform: translateY(-50%);
                    color: #bbb;
                    width: 16px; height: 16px;
                }

                .ob-input {
                    width: 100%;
                    padding: 12px 14px 12px 40px;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    font-size: 0.9rem;
                    color: #111;
                    background: #f9f9f8;
                    border: 1.5px solid #e8e8e6;
                    border-radius: 12px;
                    outline: none;
                    box-sizing: border-box;
                }

                .ob-input:focus {
                    border-color: #4caf6e;
                    background: #fff;
                    box-shadow: 0 0 0 3px rgba(76, 175, 110, 0.1);
                }

                .ob-select {
                    width: 100%;
                    padding: 12px 14px;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    font-size: 0.9rem;
                    background: #f9f9f8;
                    border: 1.5px solid #e8e8e6;
                    border-radius: 12px;
                }

                .ob-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    width: 100%;
                    padding: 14px;
                    font-weight: 600;
                    color: #fff;
                    background: linear-gradient(135deg, #4caf6e 0%, #5ec47f 100%);
                    border: none;
                    border-radius: 12px;
                    cursor: pointer;
                    margin-top: 16px;
                }

                .ob-error {
                    font-size: 0.82rem;
                    color: #e05c5c;
                    background: #fff5f5;
                    padding: 10px;
                    border-radius: 8px;
                    margin-top: 10px;
                }
            `}</style>

            <div className="ob-root">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="ob-card"
                >
                    <div className="ob-header">
                        <div className="ob-step-badge">Property Setup</div>
                        <h1 className="ob-heading">Register Your Property</h1>
                        <p className="ob-subtext">Set up your hostel or apartment management unit to start adding staff and residents.</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="ob-grid">
                            <div className="ob-field">
                                <label className="ob-label">Choose Manager Username</label>
                                <div className="ob-input-wrap">
                                    <User className="ob-input-icon" />
                                    <input
                                        type="text"
                                        className="ob-input"
                                        placeholder="admin_malo"
                                        value={formData.userName}
                                        onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="ob-field">
                                <label className="ob-label">Property Name</label>
                                <div className="ob-input-wrap">
                                    <Landmark className="ob-input-icon" />
                                    <input
                                        type="text"
                                        className="ob-input"
                                        placeholder="e.g. Malo Green Hostel"
                                        value={formData.propertyName}
                                        onChange={(e) => setFormData({ ...formData, propertyName: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="ob-field">
                                <label className="ob-label">Property Type</label>
                                <select
                                    className="ob-select"
                                    value={formData.propertyType}
                                    onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                                >
                                    <option value="Hostel">Hostel</option>
                                    <option value="Apartment">Apartment</option>
                                </select>
                            </div>

                            <div className="ob-field">
                                <label className="ob-label">Property Address</label>
                                <div className="ob-input-wrap">
                                    <MapPin className="ob-input-icon" />
                                    <input
                                        type="text"
                                        className="ob-input"
                                        placeholder="Full address of the property"
                                        value={formData.propertyAddress}
                                        onChange={(e) => setFormData({ ...formData, propertyAddress: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {error && <div className="ob-error">{error}</div>}

                        <button type="submit" disabled={loading} className="ob-btn">
                            {loading ? <Loader2 className="spin" /> : <ShieldCheck size={18} />}
                            {loading ? 'Creating Property…' : 'Register Property & Dashboard'}
                        </button>
                    </form>
                </motion.div>
            </div>
        </>
    );
};

export default AdminOnboarding;
