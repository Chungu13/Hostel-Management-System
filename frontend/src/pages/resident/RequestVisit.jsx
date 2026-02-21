import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Calendar, MessageSquare, Key, ShieldCheck, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const RequestVisit = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        visitorName: '',
        visitorUsername: '',
        visitorPassword: '',
        visitDate: '',
        purpose: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/api/visits/request', {
                ...formData,
                residentUsername: user.userName
            });
            setSuccess(true);
            setFormData({ visitorName: '', visitorUsername: '', visitorPassword: '', visitDate: '', purpose: '' });
        } catch (err) {
            console.error("Error submitting visit request:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

                .rv-root {
                    display: flex;
                    min-height: 100vh;
                    background-color: #f7f7f5;
                    background-image:
                        radial-gradient(circle at 5% 10%, rgba(134, 197, 152, 0.1) 0%, transparent 45%),
                        radial-gradient(circle at 95% 90%, rgba(134, 197, 152, 0.07) 0%, transparent 45%);
                    font-family: 'Plus Jakarta Sans', sans-serif;
                }

                .rv-main {
                    margin-left: 0;
                    padding: 40px 40px 40px 80px;
                    width: 100%;
                    box-sizing: border-box;
                }

                @media (max-width: 640px) {
                    .rv-main { padding: 24px 20px 24px 70px; }
                }

                /* Header */
                .rv-header {
                    margin-bottom: 32px;
                }

                .rv-step-badge {
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
                    margin-bottom: 10px;
                }

                .rv-step-dot {
                    width: 6px;
                    height: 6px;
                    background: #4caf6e;
                    border-radius: 50%;
                }

                .rv-heading {
                    font-size: 1.85rem;
                    font-weight: 700;
                    color: #111;
                    letter-spacing: -0.03em;
                    line-height: 1.2;
                    margin: 0 0 6px;
                }

                .rv-subtext {
                    font-size: 0.875rem;
                    color: #999;
                    font-weight: 400;
                    margin: 0;
                }

                /* Card */
                .rv-card {
                    max-width: 640px;
                    background: #fff;
                    border-radius: 20px;
                    padding: 36px;
                    box-shadow:
                        0 1px 3px rgba(0,0,0,0.04),
                        0 8px 32px rgba(0,0,0,0.06),
                        0 0 0 1px rgba(0,0,0,0.04);
                    position: relative;
                    overflow: hidden;
                }

                .rv-card::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; right: 0;
                    height: 3px;
                    background: linear-gradient(90deg, #4caf6e, #81c995);
                    border-radius: 20px 20px 0 0;
                }

                /* Form */
                .rv-form {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .rv-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                }

                @media (max-width: 560px) {
                    .rv-grid { grid-template-columns: 1fr; }
                }

                .rv-field {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .rv-label {
                    font-size: 0.78rem;
                    font-weight: 500;
                    color: #555;
                    letter-spacing: 0.06em;
                    text-transform: uppercase;
                }

                .rv-input-wrap {
                    position: relative;
                }

                .rv-input-icon {
                    position: absolute;
                    left: 14px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #bbb;
                    width: 16px;
                    height: 16px;
                    pointer-events: none;
                }

                .rv-textarea-icon {
                    position: absolute;
                    left: 14px;
                    top: 14px;
                    color: #bbb;
                    width: 16px;
                    height: 16px;
                    pointer-events: none;
                }

                .rv-input {
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

                .rv-input-bare {
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
                }

                .rv-input::placeholder,
                .rv-input-bare::placeholder {
                    color: #c8c8c5;
                }

                .rv-input:focus,
                .rv-input-bare:focus {
                    border-color: #4caf6e;
                    background: #fff;
                    box-shadow: 0 0 0 3px rgba(76, 175, 110, 0.1);
                }

                .rv-textarea {
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

                .rv-textarea::placeholder { color: #c8c8c5; }

                .rv-textarea:focus {
                    border-color: #4caf6e;
                    background: #fff;
                    box-shadow: 0 0 0 3px rgba(76, 175, 110, 0.1);
                }

                /* Credentials Box */
                .rv-credentials-box {
                    background: #f9f9f8;
                    border: 1.5px solid #e8e8e6;
                    border-radius: 16px;
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .rv-credentials-header {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: #444;
                    letter-spacing: 0.02em;
                }

                /* Section divider */
                .rv-section-divider {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .rv-section-label {
                    font-size: 0.7rem;
                    font-weight: 600;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                    color: #bbb;
                    white-space: nowrap;
                }

                .rv-section-line {
                    flex: 1;
                    height: 1px;
                    background: #e8e8e6;
                }

                /* Submit Button */
                .rv-btn {
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
                    margin-top: 4px;
                }

                .rv-btn:hover:not(:disabled) {
                    opacity: 0.93;
                    transform: translateY(-1px);
                    box-shadow: 0 6px 20px rgba(76, 175, 110, 0.3);
                }

                .rv-btn:disabled {
                    opacity: 0.65;
                    cursor: not-allowed;
                }

                /* Success */
                .rv-success {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    padding: 32px 16px;
                    gap: 12px;
                }

                .rv-success-icon {
                    width: 72px;
                    height: 72px;
                    background: linear-gradient(135deg, rgba(76,175,110,0.12), rgba(129,201,149,0.18));
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 2px solid rgba(76,175,110,0.2);
                    margin-bottom: 8px;
                }

                .rv-success-title {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #111;
                    letter-spacing: -0.02em;
                    margin: 0;
                }

                .rv-success-msg {
                    font-size: 0.875rem;
                    color: #888;
                    line-height: 1.6;
                    max-width: 300px;
                    margin: 0;
                }

                .rv-success-btn {
                    margin-top: 8px;
                    padding: 10px 24px;
                    background: rgba(76,175,110,0.1);
                    border: 1.5px solid rgba(76,175,110,0.25);
                    color: #4caf6e;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    font-size: 0.875rem;
                    font-weight: 600;
                    border-radius: 10px;
                    cursor: pointer;
                    transition: background 0.2s;
                }

                .rv-success-btn:hover {
                    background: rgba(76,175,110,0.15);
                }

                @keyframes spin { to { transform: rotate(360deg); } }
                .spin { animation: spin 0.8s linear infinite; }
            `}</style>

            <div className="rv-root">
                <Sidebar />
                <main className="rv-main">

                    {/* Header */}
                    <motion.header
                        className="rv-header"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <div className="rv-step-badge">
                            <div className="rv-step-dot" />
                            Visit Management
                        </div>
                        <h1 className="rv-heading">Request a Visit</h1>
                        <p className="rv-subtext">Generate credentials for your guest to access the hostel</p>
                    </motion.header>

                    {/* Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
                        className="rv-card"
                    >
                        <AnimatePresence mode="wait">
                            {!success ? (
                                <motion.div
                                    key="form"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0, x: 16 }}
                                >
                                    <form onSubmit={handleSubmit} className="rv-form">

                                        {/* Visitor Info */}
                                        <div className="rv-section-divider">
                                            <span className="rv-section-label">Visitor Info</span>
                                            <div className="rv-section-line" />
                                        </div>

                                        <div className="rv-grid">
                                            <div className="rv-field">
                                                <label className="rv-label">Visitor Full Name</label>
                                                <div className="rv-input-wrap">
                                                    <User className="rv-input-icon" />
                                                    <input
                                                        type="text"
                                                        className="rv-input"
                                                        placeholder="e.g. Jane Doe"
                                                        value={formData.visitorName}
                                                        onChange={(e) => setFormData({ ...formData, visitorName: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="rv-field">
                                                <label className="rv-label">Visit Date</label>
                                                <div className="rv-input-wrap">
                                                    <Calendar className="rv-input-icon" />
                                                    <input
                                                        type="date"
                                                        className="rv-input"
                                                        value={formData.visitDate}
                                                        onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Guest Credentials */}
                                        <div className="rv-section-divider">
                                            <span className="rv-section-label">Guest Credentials</span>
                                            <div className="rv-section-line" />
                                        </div>

                                        <div className="rv-credentials-box">
                                            <div className="rv-credentials-header">
                                                <ShieldCheck size={15} color="#4caf6e" />
                                                Guest Login Credentials
                                            </div>
                                            <div className="rv-grid">
                                                <div className="rv-field">
                                                    <label className="rv-label">Guest Username</label>
                                                    <input
                                                        type="text"
                                                        className="rv-input-bare"
                                                        placeholder="Unique ID for guest"
                                                        value={formData.visitorUsername}
                                                        onChange={(e) => setFormData({ ...formData, visitorUsername: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                                <div className="rv-field">
                                                    <label className="rv-label">Guest Access Password</label>
                                                    <div className="rv-input-wrap">
                                                        <Key className="rv-input-icon" />
                                                        <input
                                                            type="password"
                                                            className="rv-input"
                                                            placeholder="Verification PIN"
                                                            value={formData.visitorPassword}
                                                            onChange={(e) => setFormData({ ...formData, visitorPassword: e.target.value })}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Purpose */}
                                        <div className="rv-section-divider">
                                            <span className="rv-section-label">Details</span>
                                            <div className="rv-section-line" />
                                        </div>

                                        <div className="rv-field">
                                            <label className="rv-label">Purpose of Visit</label>
                                            <div className="rv-input-wrap">
                                                <MessageSquare className="rv-textarea-icon" />
                                                <textarea
                                                    className="rv-textarea"
                                                    placeholder="Briefly describe the reason for the visit..."
                                                    value={formData.purpose}
                                                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <button type="submit" disabled={loading} className="rv-btn">
                                            {loading
                                                ? <Loader2 size={17} className="spin" />
                                                : <Send size={17} />
                                            }
                                            {loading ? 'Processing…' : 'Send Visit Request'}
                                        </button>
                                    </form>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.92 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                    className="rv-success"
                                >
                                    <div className="rv-success-icon">
                                        <CheckCircle2 size={32} color="#4caf6e" strokeWidth={2} />
                                    </div>
                                    <h2 className="rv-success-title">Request Sent!</h2>
                                    <p className="rv-success-msg">
                                        Your visit request has been submitted. Share the guest credentials with your visitor.
                                    </p>
                                    <button className="rv-success-btn" onClick={() => setSuccess(false)}>
                                        Submit Another Request
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                </main>
            </div>
        </>
    );
};

export default RequestVisit;
