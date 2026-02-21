import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Phone, MapPin, Home, Info, Loader2, Check } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const OnboardingPage = () => {
    const { user, login } = useAuth();
    const navigate = useNavigate();
    const [properties, setProperties] = useState([]);
    const [fetchingProps, setFetchingProps] = useState(true);

    const [formData, setFormData] = useState({
        userName: '',
        name: '',
        phone: '',
        ic: '',
        gender: 'Male',
        address: '',
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await api.post('/api/auth/onboarding', {
                userId: user.id,
                ...formData
            });

            const updatedUser = { ...user, userName: formData.userName, name: formData.name, needsOnboarding: false };
            login(updatedUser);

            navigate('/resident');
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
                    max-width: 680px;
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

                /* Brand */
                .ob-brand {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 36px;
                }

                .ob-logo-mark {
                    width: 36px;
                    height: 36px;
                    background: linear-gradient(135deg, #4caf6e, #81c995);
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    box-shadow: 0 2px 8px rgba(76, 175, 110, 0.3);
                }

                .ob-logo-mark span {
                    font-size: 1.05rem;
                    font-weight: 700;
                    color: #fff;
                    letter-spacing: -0.02em;
                    line-height: 1;
                }

                .ob-brand-text {
                    display: flex;
                    flex-direction: column;
                    gap: 1px;
                }

                .ob-brand-name {
                    font-size: 1.35rem;
                    font-weight: 700;
                    color: #1a1a1a;
                    letter-spacing: -0.02em;
                    line-height: 1;
                }

                .ob-brand-tagline {
                    font-size: 0.62rem;
                    color: #4caf6e;
                    letter-spacing: 0.12em;
                    text-transform: uppercase;
                    font-weight: 500;
                }

                /* Header */
                .ob-header {
                    margin-bottom: 32px;
                }

                .ob-step-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
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

                .ob-step-dot {
                    width: 6px;
                    height: 6px;
                    background: #4caf6e;
                    border-radius: 50%;
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
                    max-width: 460px;
                }

                /* Divider */
                .ob-section-divider {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin: 28px 0 20px;
                }

                .ob-section-label {
                    font-size: 0.7rem;
                    font-weight: 600;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                    color: #bbb;
                    white-space: nowrap;
                }

                .ob-section-line {
                    flex: 1;
                    height: 1px;
                    background: #ebebea;
                }

                /* Grid */
                .ob-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                }

                @media (max-width: 560px) {
                    .ob-grid { grid-template-columns: 1fr; }
                    .ob-card { padding: 36px 24px; }
                }

                /* Fields */
                .ob-field {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .ob-label {
                    font-size: 0.78rem;
                    font-weight: 500;
                    color: #555;
                    letter-spacing: 0.06em;
                    text-transform: uppercase;
                }

                .ob-input-wrap {
                    position: relative;
                }

                .ob-input-icon {
                    position: absolute;
                    left: 14px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #bbb;
                    width: 16px;
                    height: 16px;
                    pointer-events: none;
                }

                .ob-textarea-icon {
                    position: absolute;
                    left: 14px;
                    top: 14px;
                    color: #bbb;
                    width: 16px;
                    height: 16px;
                    pointer-events: none;
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
                    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
                    box-sizing: border-box;
                }

                .ob-input::placeholder {
                    color: #c8c8c5;
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
                    color: #111;
                    background: #f9f9f8;
                    border: 1.5px solid #e8e8e6;
                    border-radius: 12px;
                    outline: none;
                    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
                    box-sizing: border-box;
                    appearance: none;
                    cursor: pointer;
                }

                .ob-select:focus {
                    border-color: #4caf6e;
                    background: #fff;
                    box-shadow: 0 0 0 3px rgba(76, 175, 110, 0.1);
                }

                .ob-textarea {
                    width: 100%;
                    padding: 12px 14px 12px 40px;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    font-size: 0.9rem;
                    color: #111;
                    background: #f9f9f8;
                    border: 1.5px solid #e8e8e6;
                    border-radius: 12px;
                    outline: none;
                    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
                    box-sizing: border-box;
                    min-height: 100px;
                    resize: vertical;
                    line-height: 1.5;
                }

                .ob-textarea::placeholder {
                    color: #c8c8c5;
                }

                .ob-textarea:focus {
                    border-color: #4caf6e;
                    background: #fff;
                    box-shadow: 0 0 0 3px rgba(76, 175, 110, 0.1);
                }

                /* Error */
                .ob-error {
                    font-size: 0.82rem;
                    color: #e05c5c;
                    text-align: center;
                    background: #fff5f5;
                    border: 1px solid #fdd;
                    border-radius: 8px;
                    padding: 10px 14px;
                }

                /* Button */
                .ob-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    width: 100%;
                    padding: 14px;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    font-size: 0.92rem;
                    font-weight: 600;
                    color: #fff;
                    background: linear-gradient(135deg, #4caf6e 0%, #5ec47f 100%);
                    border: none;
                    border-radius: 12px;
                    cursor: pointer;
                    letter-spacing: 0.02em;
                    transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
                    box-shadow: 0 4px 16px rgba(76, 175, 110, 0.25);
                    margin-top: 8px;
                }

                .ob-btn:hover:not(:disabled) {
                    opacity: 0.93;
                    transform: translateY(-1px);
                    box-shadow: 0 6px 20px rgba(76, 175, 110, 0.3);
                }

                .ob-btn:active:not(:disabled) {
                    transform: translateY(0);
                }

                .ob-btn:disabled {
                    opacity: 0.65;
                    cursor: not-allowed;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                .spin { animation: spin 0.8s linear infinite; }
            `}</style>

            <div className="ob-root">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className="ob-card"
                >
                    {/* Brand */}
                    <div className="ob-brand">
                        <div className="ob-logo-mark">
                            <span>M</span>
                        </div>
                        <div className="ob-brand-text">
                            <span className="ob-brand-name">Malo</span>
                            <span className="ob-brand-tagline">Hostel Management</span>
                        </div>
                    </div>

                    {/* Header */}
                    <div className="ob-header">
                        <div className="ob-step-badge">
                            <div className="ob-step-dot" />
                            Setup
                        </div>
                        <h1 className="ob-heading">Complete Your Profile</h1>
                        <p className="ob-subtext">Welcome aboard! We just need a few more details to set up your hostel account.</p>
                    </div>

                    <form onSubmit={handleSubmit}>

                        {/* Personal Info */}
                        <div className="ob-section-divider">
                            <span className="ob-section-label">Personal Info</span>
                            <div className="ob-section-line" />
                        </div>

                        <div className="ob-grid">
                            <div className="ob-field">
                                <label className="ob-label">Choose Username</label>
                                <div className="ob-input-wrap">
                                    <User className="ob-input-icon" />
                                    <input
                                        type="text"
                                        className="ob-input"
                                        placeholder="johndoe123"
                                        value={formData.userName}
                                        onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="ob-field">
                                <label className="ob-label">Full Name</label>
                                <div className="ob-input-wrap">
                                    <Info className="ob-input-icon" />
                                    <input
                                        type="text"
                                        className="ob-input"
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="ob-field">
                                <label className="ob-label">Phone Number</label>
                                <div className="ob-input-wrap">
                                    <Phone className="ob-input-icon" />
                                    <input
                                        type="tel"
                                        className="ob-input"
                                        placeholder="+260 97 123 4567"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="ob-field">
                                <label className="ob-label">IC / Passport Number</label>
                                <div className="ob-input-wrap">
                                    <Info className="ob-input-icon" />
                                    <input
                                        type="text"
                                        className="ob-input"
                                        placeholder="A12345678"
                                        value={formData.ic}
                                        onChange={(e) => setFormData({ ...formData, ic: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="ob-field">
                                <label className="ob-label">Hostel / Apartment</label>
                                <select
                                    className="ob-select"
                                    value={formData.propertyId}
                                    onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
                                    disabled={fetchingProps}
                                    required
                                >
                                    {fetchingProps ? (
                                        <option>Loading properties...</option>
                                    ) : (
                                        properties.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))
                                    )}
                                    {properties.length === 0 && !fetchingProps && (
                                        <option>No properties found</option>
                                    )}
                                </select>
                            </div>

                            <div className="ob-field">
                                <label className="ob-label">Gender</label>
                                <select
                                    className="ob-select"
                                    value={formData.gender}
                                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                >
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className="ob-field">
                                <label className="ob-label">Assigned Room (Temp)</label>
                                <div className="ob-input-wrap">
                                    <Home className="ob-input-icon" />
                                    <input
                                        type="text"
                                        className="ob-input"
                                        placeholder="e.g. A-01-01"
                                        value={formData.room}
                                        onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Address */}
                        <div className="ob-section-divider">
                            <span className="ob-section-label">Address</span>
                            <div className="ob-section-line" />
                        </div>

                        <div className="ob-field">
                            <label className="ob-label">Home Address</label>
                            <div className="ob-input-wrap">
                                <MapPin className="ob-textarea-icon" />
                                <textarea
                                    className="ob-textarea"
                                    placeholder="Enter your full permanent address"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <motion.p
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="ob-error"
                                style={{ marginTop: '16px' }}
                            >
                                {error}
                            </motion.p>
                        )}

                        <button type="submit" disabled={loading} className="ob-btn">
                            {loading
                                ? <Loader2 size={17} className="spin" />
                                : <Check size={17} />
                            }
                            {loading ? 'Saving Profile…' : 'Complete Onboarding'}
                        </button>
                    </form>
                </motion.div>
            </div>
        </>
    );
};

export default OnboardingPage;
