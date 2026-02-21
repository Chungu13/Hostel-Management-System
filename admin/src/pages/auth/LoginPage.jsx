import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, Lock, Loader2, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { GoogleLogin } from '@react-oauth/google';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await api.post('/api/auth/login', {
                email,
                password
            });

            if (response.data) {
                if (response.data.myRole !== 'Managing Staff') {
                    setError('Access denied. This portal is for managers only.');
                    setLoading(false);
                    return;
                }

                login(response.data);

                if (response.data.needsOnboarding) {
                    navigate('/admin-onboarding');
                } else {
                    navigate('/admin');
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
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
                if (response.data.myRole !== 'Managing Staff' && !response.data.needsOnboarding) {
                    setError('Access denied. This portal is for managers only.');
                    setLoading(false);
                    return;
                }

                login(response.data);
                if (response.data.needsOnboarding) {
                    navigate('/admin-onboarding');
                } else {
                    navigate('/admin');
                }
            }
        } catch (err) {
            setError('Google sign-in failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

                * { box-sizing: border-box; }

                .al-root {
                    min-height: 100vh;
                    display: flex;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    background-color: #f7f7f5;
                }

                /* ── Left panel ── */
                .al-panel {
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
                    .al-panel { display: flex; }
                }

                /* subtle green glow top-right */
                .al-panel::after {
                    content: '';
                    position: absolute;
                    top: -80px;
                    right: -80px;
                    width: 260px;
                    height: 260px;
                    background: radial-gradient(circle, rgba(76,175,110,0.1) 0%, transparent 70%);
                    pointer-events: none;
                }

                .al-panel-top {}

                .al-panel-brand {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 64px;
                }

                .al-panel-mark {
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

                .al-panel-mark span {
                    font-size: 1.05rem;
                    font-weight: 700;
                    color: #fff;
                    letter-spacing: -0.02em;
                    line-height: 1;
                }

                .al-panel-brand-text {
                    display: flex;
                    flex-direction: column;
                    gap: 1px;
                }

                .al-panel-name {
                    font-size: 1.2rem;
                    font-weight: 700;
                    color: #1a1a1a;
                    letter-spacing: -0.02em;
                    line-height: 1;
                }

                .al-panel-sub {
                    font-size: 0.6rem;
                    color: #4caf6e;
                    letter-spacing: 0.12em;
                    text-transform: uppercase;
                    font-weight: 500;
                }

                .al-panel-headline {
                    font-size: 2rem;
                    font-weight: 700;
                    color: #111;
                    letter-spacing: -0.04em;
                    line-height: 1.2;
                    margin-bottom: 16px;
                }

                .al-panel-headline span { color: #4caf6e; }

                .al-panel-desc {
                    font-size: 0.855rem;
                    color: #aaa;
                    line-height: 1.7;
                    max-width: 280px;
                    font-weight: 400;
                }

                /* minimal feature list */
                .al-panel-list {
                    display: flex;
                    flex-direction: column;
                    gap: 14px;
                    margin-top: 44px;
                }

                .al-panel-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 0.82rem;
                    color: #888;
                    font-weight: 400;
                }

                .al-panel-dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: #4caf6e;
                    flex-shrink: 0;
                    opacity: 0.7;
                }

                /* bottom footnote */
                .al-panel-bottom {
                    font-size: 0.72rem;
                    color: #ccc;
                    letter-spacing: 0.02em;
                }

                /* ── Right side ── */
                .al-right {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 40px 32px;
                    background-image:
                        radial-gradient(circle at 90% 10%, rgba(134,197,152,0.1) 0%, transparent 50%),
                        radial-gradient(circle at 10% 90%, rgba(134,197,152,0.07) 0%, transparent 50%);
                }

                .al-form-wrap {
                    width: 100%;
                    max-width: 380px;
                }

                /* Mobile-only brand */
                .al-mobile-brand {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 36px;
                }

                @media (min-width: 960px) {
                    .al-mobile-brand { display: none; }
                }

                .al-mobile-mark {
                    width: 34px;
                    height: 34px;
                    background: linear-gradient(135deg, #4caf6e, #81c995);
                    border-radius: 9px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 2px 8px rgba(76,175,110,0.28);
                }

                .al-mobile-mark span {
                    font-size: 0.95rem;
                    font-weight: 700;
                    color: #fff;
                    letter-spacing: -0.02em;
                }

                .al-mobile-name {
                    font-size: 1.15rem;
                    font-weight: 700;
                    color: #1a1a1a;
                    letter-spacing: -0.02em;
                }

                /* Access badge */
                .al-access-badge {
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

                .al-heading {
                    font-size: 1.85rem;
                    font-weight: 700;
                    color: #111;
                    letter-spacing: -0.03em;
                    line-height: 1.2;
                    margin: 0 0 6px;
                }

                .al-subtext {
                    font-size: 0.875rem;
                    color: #888;
                    margin: 0 0 32px;
                    font-weight: 400;
                }

                /* Form */
                .al-form { display: flex; flex-direction: column; gap: 18px; }
                .al-field { display: flex; flex-direction: column; gap: 6px; }

                .al-label {
                    font-size: 0.78rem;
                    font-weight: 500;
                    color: #555;
                    letter-spacing: 0.06em;
                    text-transform: uppercase;
                }

                .al-input-wrap { position: relative; }

                .al-input-icon {
                    position: absolute;
                    left: 14px; top: 50%;
                    transform: translateY(-50%);
                    color: #bbb;
                    width: 16px; height: 16px;
                    pointer-events: none;
                }

                .al-input {
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

                .al-input::placeholder { color: #c8c8c5; }

                .al-input:focus {
                    border-color: #4caf6e;
                    background: #fff;
                    box-shadow: 0 0 0 3px rgba(76,175,110,0.1);
                }

                .al-error {
                    font-size: 0.82rem;
                    color: #e05c5c;
                    text-align: center;
                    background: #fff5f5;
                    border: 1px solid #fdd;
                    border-radius: 8px;
                    padding: 10px 14px;
                }

                .al-btn {
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

                .al-btn:hover:not(:disabled) {
                    opacity: 0.93;
                    transform: translateY(-1px);
                    box-shadow: 0 6px 20px rgba(76,175,110,0.3);
                }

                .al-btn:disabled { opacity: 0.65; cursor: not-allowed; }

                .al-divider {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    margin: 24px 0;
                }

                .al-divider-line { flex: 1; height: 1px; background: #ebebea; }

                .al-divider-text {
                    font-size: 0.75rem;
                    color: #bbb;
                    white-space: nowrap;
                    letter-spacing: 0.04em;
                }

                .al-google-wrap { display: flex; justify-content: center; }

                .al-footer {
                    text-align: center;
                    margin-top: 28px;
                    font-size: 0.85rem;
                    color: #999;
                }

                .al-footer a {
                    color: #4caf6e;
                    font-weight: 500;
                    text-decoration: none;
                    transition: color 0.15s;
                }

                .al-footer a:hover { color: #3a9a5a; text-decoration: underline; }

                @keyframes spin { to { transform: rotate(360deg); } }
                .spin { animation: spin 0.8s linear infinite; }
            `}</style>

            <div className="al-root">

                {/* Left Panel */}
                <div className="al-panel">
                    <div className="al-panel-top">
                        <div className="al-panel-brand">
                            <div className="al-panel-mark"><span>M</span></div>
                            <div className="al-panel-brand-text">
                                <span className="al-panel-name">Malo</span>
                                <span className="al-panel-sub">Admin Console</span>
                            </div>
                        </div>

                        <h2 className="al-panel-headline">
                            Manage your<br />hostel <span>smarter.</span>
                        </h2>
                        <p className="al-panel-desc">
                            Full control over residents, visitor passes, staff, and reports — all in one place.
                        </p>

                        <div className="al-panel-list">
                            {[
                                'Resident management',
                                'Visitor access control',
                                'Staff oversight',
                                'Reports & analytics',
                            ].map((item, i) => (
                                <div key={i} className="al-panel-item">
                                    <div className="al-panel-dot" />
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="al-panel-bottom">
                        © {new Date().getFullYear()} Malo · Hostel Management
                    </div>
                </div>

                {/* Right — Form */}
                <div className="al-right">
                    <motion.div
                        className="al-form-wrap"
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    >
                        {/* Mobile brand */}
                        <div className="al-mobile-brand">
                            <div className="al-mobile-mark"><span>M</span></div>
                            <span className="al-mobile-name">Malo</span>
                        </div>

                        <div className="al-access-badge">
                            <ShieldCheck size={11} />
                            Admin Access Only
                        </div>
                        <h2 className="al-heading">Admin Login</h2>
                        <p className="al-subtext">Access your management console</p>

                        <form onSubmit={handleSubmit} className="al-form">
                            <div className="al-field">
                                <label className="al-label">Email Address</label>
                                <div className="al-input-wrap">
                                    <Mail className="al-input-icon" />
                                    <input
                                        type="email"
                                        className="al-input"
                                        placeholder="admin@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="al-field">
                                <label className="al-label">Password</label>
                                <div className="al-input-wrap">
                                    <Lock className="al-input-icon" />
                                    <input
                                        type="password"
                                        className="al-input"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {error && (
                                <motion.div
                                    className="al-error"
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    {error}
                                </motion.div>
                            )}

                            <button type="submit" className="al-btn" disabled={loading}>
                                {loading ? <Loader2 size={17} className="spin" /> : <LogIn size={17} />}
                                {loading ? 'Authenticating…' : 'Sign In'}
                            </button>
                        </form>

                        <div className="al-divider">
                            <div className="al-divider-line" />
                            <span className="al-divider-text">or continue with</span>
                            <div className="al-divider-line" />
                        </div>

                        <div className="al-google-wrap">
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={() => setError('Google login failed')}
                                theme="outline"
                                shape="pill"
                                size="large"
                            />
                        </div>

                        <div className="al-footer">
                            Need an admin account? <Link to="/register">Register building</Link>
                        </div>
                    </motion.div>
                </div>

            </div>
        </>
    );
};

export default LoginPage;
