import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Lock, Mail, Check, Loader2, ShieldCheck } from 'lucide-react';
import api from '../../utils/api';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await api.post('/api/auth/register', {
                email: formData.email,
                password: formData.password,
                role: 'Managing Staff'
            });

            if (response.data) {
                setSuccess(true);
                setTimeout(() => {
                    login(response.data);
                    navigate('/admin-onboarding');
                }, 1500);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            setLoading(true);
            const response = await api.post('/api/auth/google', {
                token: credentialResponse.credential
            });
            if (response.data) {
                login(response.data);
                navigate('/admin-onboarding');
            }
        } catch (err) {
            setError('Google registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

                * { box-sizing: border-box; }

                .ar-root {
                    min-height: 100vh;
                    display: flex;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    background-color: #f7f7f5;
                }

                /* ── Left panel ── */
                .ar-panel {
                    display: none;
                    width: 420px;
                    flex-shrink: 0;
                    background: #fff;
                    border-right: 1px solid #ebebea;
                    flex-direction: column;
                    justify-content: space-between;
                    padding: 48px 44px;
                    position: relative;
                    overflow: hidden;
                }

                @media (min-width: 960px) {
                    .ar-panel { display: flex; }
                }

                .ar-panel::after {
                    content: '';
                    position: absolute;
                    top: -80px;
                    right: -80px;
                    width: 260px;
                    height: 260px;
                    background: radial-gradient(circle, rgba(76,175,110,0.1) 0%, transparent 70%);
                    pointer-events: none;
                }

                .ar-panel-brand {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 64px;
                }

                .ar-panel-mark {
                    width: 36px;
                    height: 36px;
                    background: linear-gradient(135deg, #4caf6e, #81c995);
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 2px 8px rgba(76,175,110,0.28);
                    flex-shrink: 0;
                }

                .ar-panel-mark span {
                    font-size: 1.05rem;
                    font-weight: 700;
                    color: #fff;
                    letter-spacing: -0.02em;
                    line-height: 1;
                }

                .ar-panel-brand-text {
                    display: flex;
                    flex-direction: column;
                    gap: 1px;
                }

                .ar-panel-name {
                    font-size: 1.2rem;
                    font-weight: 700;
                    color: #1a1a1a;
                    letter-spacing: -0.02em;
                    line-height: 1;
                }

                .ar-panel-sub {
                    font-size: 0.6rem;
                    color: #4caf6e;
                    letter-spacing: 0.12em;
                    text-transform: uppercase;
                    font-weight: 500;
                }

                .ar-panel-headline {
                    font-size: 2rem;
                    font-weight: 700;
                    color: #111;
                    letter-spacing: -0.04em;
                    line-height: 1.2;
                    margin-bottom: 16px;
                }

                .ar-panel-headline span { color: #4caf6e; }

                .ar-panel-desc {
                    font-size: 0.855rem;
                    color: #aaa;
                    line-height: 1.7;
                    max-width: 280px;
                    font-weight: 400;
                }

                .ar-panel-list {
                    display: flex;
                    flex-direction: column;
                    gap: 14px;
                    margin-top: 44px;
                }

                .ar-panel-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 0.82rem;
                    color: #888;
                    font-weight: 400;
                }

                .ar-panel-dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: #4caf6e;
                    flex-shrink: 0;
                    opacity: 0.7;
                }

                .ar-panel-bottom {
                    font-size: 0.72rem;
                    color: #ccc;
                    letter-spacing: 0.02em;
                }

                /* ── Right side ── */
                .ar-right {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 40px 32px;
                    background-image:
                        radial-gradient(circle at 90% 10%, rgba(134,197,152,0.1) 0%, transparent 50%),
                        radial-gradient(circle at 10% 90%, rgba(134,197,152,0.07) 0%, transparent 50%);
                }

                .ar-form-wrap {
                    width: 100%;
                    max-width: 400px;
                    position: relative;
                }

                /* Mobile brand */
                .ar-mobile-brand {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 36px;
                }

                @media (min-width: 960px) {
                    .ar-mobile-brand { display: none; }
                }

                .ar-mobile-mark {
                    width: 34px;
                    height: 34px;
                    background: linear-gradient(135deg, #4caf6e, #81c995);
                    border-radius: 9px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 2px 8px rgba(76,175,110,0.28);
                }

                .ar-mobile-mark span {
                    font-size: 0.95rem;
                    font-weight: 700;
                    color: #fff;
                    letter-spacing: -0.02em;
                }

                .ar-mobile-name {
                    font-size: 1.15rem;
                    font-weight: 700;
                    color: #1a1a1a;
                    letter-spacing: -0.02em;
                }

                /* Badge */
                .ar-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    background: rgba(76,175,110,0.08);
                    border: 1px solid rgba(76,175,110,0.2);
                    color: #4caf6e;
                    font-size: 0.7rem;
                    font-weight: 600;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    padding: 4px 10px;
                    border-radius: 20px;
                    margin-bottom: 10px;
                }

                .ar-heading {
                    font-size: 1.85rem;
                    font-weight: 700;
                    color: #111;
                    letter-spacing: -0.03em;
                    line-height: 1.2;
                    margin: 0 0 6px;
                }

                .ar-subtext {
                    font-size: 0.875rem;
                    color: #888;
                    margin: 0 0 32px;
                    font-weight: 400;
                }

                /* Form */
                .ar-form { display: flex; flex-direction: column; gap: 18px; }
                .ar-field { display: flex; flex-direction: column; gap: 6px; }

                .ar-label {
                    font-size: 0.78rem;
                    font-weight: 500;
                    color: #555;
                    letter-spacing: 0.06em;
                    text-transform: uppercase;
                }

                .ar-input-wrap { position: relative; }

                .ar-input-icon {
                    position: absolute;
                    left: 14px; top: 50%;
                    transform: translateY(-50%);
                    color: #bbb;
                    width: 16px; height: 16px;
                    pointer-events: none;
                }

                .ar-input {
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

                .ar-input::placeholder { color: #c8c8c5; }

                .ar-input:focus {
                    border-color: #4caf6e;
                    background: #fff;
                    box-shadow: 0 0 0 3px rgba(76,175,110,0.1);
                }

                .ar-error {
                    font-size: 0.82rem;
                    color: #e05c5c;
                    text-align: center;
                    background: #fff5f5;
                    border: 1px solid #fdd;
                    border-radius: 8px;
                    padding: 10px 14px;
                }

                .ar-btn {
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
                    background: linear-gradient(135deg, #4caf6e, #5ec47f);
                    border: none;
                    border-radius: 12px;
                    cursor: pointer;
                    letter-spacing: 0.02em;
                    transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
                    box-shadow: 0 4px 16px rgba(76,175,110,0.25);
                    margin-top: 4px;
                }

                .ar-btn:hover:not(:disabled) {
                    opacity: 0.93;
                    transform: translateY(-1px);
                    box-shadow: 0 6px 20px rgba(76,175,110,0.3);
                }

                .ar-btn:disabled { opacity: 0.65; cursor: not-allowed; }

                .ar-divider {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    margin: 24px 0;
                }

                .ar-divider-line { flex: 1; height: 1px; background: #ebebea; }

                .ar-divider-text {
                    font-size: 0.75rem;
                    color: #bbb;
                    white-space: nowrap;
                    letter-spacing: 0.04em;
                }

                .ar-google-wrap { display: flex; justify-content: center; }

                .ar-footer {
                    text-align: center;
                    margin-top: 28px;
                    font-size: 0.85rem;
                    color: #999;
                }

                .ar-footer a {
                    color: #4caf6e;
                    font-weight: 500;
                    text-decoration: none;
                    transition: color 0.15s;
                }

                .ar-footer a:hover { color: #3a9a5a; text-decoration: underline; }

                /* Success overlay */
                .ar-success {
                    position: absolute;
                    inset: 0;
                    background: #fff;
                    border-radius: 20px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    z-index: 10;
                    text-align: center;
                    padding: 40px;
                }

                .ar-success-icon {
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

                .ar-success-title {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #111;
                    letter-spacing: -0.02em;
                    margin: 0;
                }

                .ar-success-msg {
                    font-size: 0.875rem;
                    color: #888;
                    line-height: 1.6;
                    margin: 0;
                }

                @keyframes spin { to { transform: rotate(360deg); } }
                .spin { animation: spin 0.8s linear infinite; }
            `}</style>

            <div className="ar-root">

                {/* Left Panel */}
                <div className="ar-panel">
                    <div>
                        <div className="ar-panel-brand">
                            <div className="ar-panel-mark"><span>M</span></div>
                            <div className="ar-panel-brand-text">
                                <span className="ar-panel-name">Malo</span>
                                <span className="ar-panel-sub">Admin Console</span>
                            </div>
                        </div>

                        <h2 className="ar-panel-headline">
                            Your hostel,<br />your <span>control.</span>
                        </h2>
                        <p className="ar-panel-desc">
                            Register your building and get instant access to resident management, visitor control, and reporting.
                        </p>

                        <div className="ar-panel-list">
                            {[
                                'Set up in minutes',
                                'Manage residents & staff',
                                'Control visitor access',
                                'Reports & analytics',
                            ].map((item, i) => (
                                <div key={i} className="ar-panel-item">
                                    <div className="ar-panel-dot" />
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="ar-panel-bottom">
                        © {new Date().getFullYear()} Malo · Hostel Management
                    </div>
                </div>

                {/* Right — Form */}
                <div className="ar-right">
                    <motion.div
                        className="ar-form-wrap"
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <AnimatePresence>
                            {success && (
                                <motion.div
                                    className="ar-success"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                                >
                                    <div className="ar-success-icon">
                                        <Check size={32} color="#4caf6e" strokeWidth={2.5} />
                                    </div>
                                    <h3 className="ar-success-title">Registration Successful</h3>
                                    <p className="ar-success-msg">Setting up your manager profile…</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Mobile brand */}
                        <div className="ar-mobile-brand">
                            <div className="ar-mobile-mark"><span>M</span></div>
                            <span className="ar-mobile-name">Malo</span>
                        </div>

                        <div className="ar-badge">
                            <ShieldCheck size={11} />
                            Manager Registration
                        </div>
                        <h2 className="ar-heading">Register Building</h2>
                        <p className="ar-subtext">Join Malo as a property manager</p>

                        <form onSubmit={handleSubmit} className="ar-form">
                            <div className="ar-field">
                                <label className="ar-label">Email Address</label>
                                <div className="ar-input-wrap">
                                    <Mail className="ar-input-icon" />
                                    <input
                                        type="email"
                                        className="ar-input"
                                        placeholder="admin@example.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="ar-field">
                                <label className="ar-label">Password</label>
                                <div className="ar-input-wrap">
                                    <Lock className="ar-input-icon" />
                                    <input
                                        type="password"
                                        className="ar-input"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="ar-field">
                                <label className="ar-label">Confirm Password</label>
                                <div className="ar-input-wrap">
                                    <Lock className="ar-input-icon" />
                                    <input
                                        type="password"
                                        className="ar-input"
                                        placeholder="••••••••"
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            {error && (
                                <motion.div
                                    className="ar-error"
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    {error}
                                </motion.div>
                            )}

                            <button type="submit" className="ar-btn" disabled={loading}>
                                {loading ? <Loader2 size={17} className="spin" /> : <UserPlus size={17} />}
                                {loading ? 'Creating Account…' : 'Register as Manager'}
                            </button>
                        </form>

                        <div className="ar-divider">
                            <div className="ar-divider-line" />
                            <span className="ar-divider-text">or continue with</span>
                            <div className="ar-divider-line" />
                        </div>

                        <div className="ar-google-wrap">
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={() => setError('Google Registration Failed')}
                                theme="outline"
                                shape="pill"
                                size="large"
                            />
                        </div>

                        <div className="ar-footer">
                            Already have a manager account? <Link to="/login">Sign in</Link>
                        </div>
                    </motion.div>
                </div>

            </div>
        </>
    );
};

export default RegisterPage;
