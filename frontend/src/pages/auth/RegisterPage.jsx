import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Lock, Mail, Check, Loader2 } from 'lucide-react';
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
                role: formData.role || 'Resident'
            });
            setSuccess(true);
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Try again.');
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
                if (response.data.needsOnboarding) {
                    navigate('/onboarding');
                } else {
                    const role = response.data.myRole;
                    if (role === 'Managing Staff') navigate('/admin');
                    else if (role === 'Resident') navigate('/resident');
                    else if (role === 'Security Staff') navigate('/security');
                }
            }
        } catch (err) {
            setError('Google sign-up failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Instrument+Serif:ital@0;1&display=swap');

                .reg-root {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 1.5rem;
                    background-color: #f7f7f5;
                    background-image:
                        radial-gradient(circle at 10% 20%, rgba(134, 197, 152, 0.12) 0%, transparent 50%),
                        radial-gradient(circle at 90% 80%, rgba(134, 197, 152, 0.08) 0%, transparent 50%);
                    font-family: 'DM Sans', sans-serif;
                }

                .reg-card {
                    width: 100%;
                    max-width: 480px;
                    background: #ffffff;
                    border-radius: 24px;
                    padding: 48px 44px;
                    box-shadow:
                        0 1px 3px rgba(0,0,0,0.04),
                        0 8px 32px rgba(0,0,0,0.06),
                        0 0 0 1px rgba(0,0,0,0.04);
                    position: relative;
                    overflow: hidden;
                }

                .reg-card::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; right: 0;
                    height: 3px;
                    background: linear-gradient(90deg, #4caf6e, #81c995);
                    border-radius: 24px 24px 0 0;
                }

                /* Brand */
                .reg-brand {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 36px;
                }

                .reg-logo-mark {
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

                .reg-logo-mark span {
                    font-family: 'Instrument Serif', serif;
                    font-size: 1.05rem;
                    color: #fff;
                    letter-spacing: -0.02em;
                    line-height: 1;
                    font-style: italic;
                }

                .reg-brand-text {
                    display: flex;
                    flex-direction: column;
                    gap: 1px;
                }

                .reg-brand-name {
                    font-family: 'Instrument Serif', serif;
                    font-size: 1.35rem;
                    color: #1a1a1a;
                    letter-spacing: -0.01em;
                    font-style: italic;
                    line-height: 1;
                }

                .reg-brand-tagline {
                    font-size: 0.62rem;
                    color: #4caf6e;
                    letter-spacing: 0.12em;
                    text-transform: uppercase;
                    font-weight: 500;
                }

                /* Heading */
                .reg-heading {
                    font-family: 'Instrument Serif', serif;
                    font-size: 2rem;
                    color: #111;
                    line-height: 1.15;
                    margin: 0 0 6px;
                }

                .reg-subtext {
                    font-size: 0.875rem;
                    color: #888;
                    margin: 0 0 32px;
                    font-weight: 400;
                    letter-spacing: 0.01em;
                }

                /* Form */
                .reg-form {
                    display: flex;
                    flex-direction: column;
                    gap: 18px;
                }

                .reg-field {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .reg-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 14px;
                }

                @media (max-width: 480px) {
                    .reg-grid {
                        grid-template-columns: 1fr;
                    }
                    .reg-card {
                        padding: 36px 24px;
                    }
                }

                .reg-label {
                    font-size: 0.78rem;
                    font-weight: 500;
                    color: #555;
                    letter-spacing: 0.06em;
                    text-transform: uppercase;
                }

                .reg-input-wrap {
                    position: relative;
                }

                .reg-input-icon {
                    position: absolute;
                    left: 14px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #bbb;
                    width: 16px;
                    height: 16px;
                    pointer-events: none;
                }

                .reg-input {
                    width: 100%;
                    padding: 12px 14px 12px 40px;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 0.9rem;
                    color: #111;
                    background: #f9f9f8;
                    border: 1.5px solid #e8e8e6;
                    border-radius: 12px;
                    outline: none;
                    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
                    box-sizing: border-box;
                }

                .reg-input::placeholder {
                    color: #c8c8c5;
                }

                .reg-input:focus {
                    border-color: #4caf6e;
                    background: #fff;
                    box-shadow: 0 0 0 3px rgba(76, 175, 110, 0.1);
                }

                .reg-error {
                    font-size: 0.82rem;
                    color: #e05c5c;
                    text-align: center;
                    background: #fff5f5;
                    border: 1px solid #fdd;
                    border-radius: 8px;
                    padding: 10px 14px;
                }

                .reg-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    width: 100%;
                    padding: 14px;
                    font-family: 'DM Sans', sans-serif;
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

                .reg-btn:hover:not(:disabled) {
                    opacity: 0.93;
                    transform: translateY(-1px);
                    box-shadow: 0 6px 20px rgba(76, 175, 110, 0.3);
                }

                .reg-btn:active:not(:disabled) {
                    transform: translateY(0);
                }

                .reg-btn:disabled {
                    opacity: 0.65;
                    cursor: not-allowed;
                }

                /* Divider */
                .reg-divider {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    margin: 24px 0;
                }

                .reg-divider-line {
                    flex: 1;
                    height: 1px;
                    background: #ebebea;
                }

                .reg-divider-text {
                    font-size: 0.75rem;
                    color: #bbb;
                    white-space: nowrap;
                    font-weight: 400;
                    letter-spacing: 0.04em;
                }

                .reg-google-wrap {
                    display: flex;
                    justify-content: center;
                }

                /* Success state */
                .reg-success {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    padding: 24px 0 16px;
                }

                .reg-success-icon {
                    width: 72px;
                    height: 72px;
                    background: linear-gradient(135deg, rgba(76,175,110,0.12), rgba(129,201,149,0.18));
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 20px;
                    border: 2px solid rgba(76,175,110,0.2);
                }

                .reg-success-title {
                    font-family: 'Instrument Serif', serif;
                    font-size: 1.8rem;
                    color: #111;
                    margin: 0 0 8px;
                }

                .reg-success-msg {
                    font-size: 0.875rem;
                    color: #888;
                    line-height: 1.6;
                    max-width: 280px;
                }

                /* Footer */
                .reg-footer {
                    text-align: center;
                    margin-top: 28px;
                    font-size: 0.85rem;
                    color: #999;
                }

                .reg-footer a {
                    color: #4caf6e;
                    font-weight: 500;
                    text-decoration: none;
                    transition: color 0.15s;
                }

                .reg-footer a:hover {
                    color: #3a9a5a;
                    text-decoration: underline;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                .spin { animation: spin 0.8s linear infinite; }
            `}</style>

            <div className="reg-root">
                <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className="reg-card"
                >
                    {/* Brand */}
                    <div className="reg-brand">
                        <div className="reg-logo-mark">
                            <span>M</span>
                        </div>
                        <div className="reg-brand-text">
                            <span className="reg-brand-name">Malo</span>
                            <span className="reg-brand-tagline">Hostel Management</span>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {!success ? (
                            <motion.div
                                key="form"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0, x: 20 }}
                            >
                                <h1 className="reg-heading">Create account</h1>
                                <p className="reg-subtext">Start your journey with Malo</p>

                                <form onSubmit={handleSubmit} className="reg-form">
                                    <div className="reg-field">
                                        <label className="reg-label">Email Address</label>
                                        <div className="reg-input-wrap">
                                            <Mail className="reg-input-icon" />
                                            <input
                                                type="email"
                                                className="reg-input"
                                                placeholder="you@example.com"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="reg-grid">
                                        <div className="reg-field">
                                            <label className="reg-label">Password</label>
                                            <div className="reg-input-wrap">
                                                <Lock className="reg-input-icon" />
                                                <input
                                                    type="password"
                                                    className="reg-input"
                                                    placeholder="••••••••"
                                                    value={formData.password}
                                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="reg-field">
                                        <label className="reg-label">Confirm Password</label>
                                        <div className="reg-input-wrap">
                                            <Lock className="reg-input-icon" />
                                            <input
                                                type="password"
                                                className="reg-input"
                                                placeholder="••••••••"
                                                value={formData.confirmPassword}
                                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {error && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="reg-error"
                                        >
                                            {error}
                                        </motion.p>
                                    )}

                                    <button type="submit" disabled={loading} className="reg-btn">
                                        {loading
                                            ? <Loader2 size={17} className="spin" />
                                            : <UserPlus size={17} />
                                        }
                                        {loading ? 'Creating Account…' : 'Sign Up with Email'}
                                    </button>
                                </form>

                                <div className="reg-divider">
                                    <div className="reg-divider-line" />
                                    <span className="reg-divider-text">or continue with</span>
                                    <div className="reg-divider-line" />
                                </div>

                                <div className="reg-google-wrap">
                                    <GoogleLogin
                                        onSuccess={handleGoogleSuccess}
                                        onError={() => setError('Google sign-up failed')}
                                        useOneTap
                                        theme="outline"
                                        shape="pill"
                                        size="large"
                                        text="signup_with"
                                    />
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.92 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                className="reg-success"
                            >
                                <div className="reg-success-icon">
                                    <Check size={32} color="#4caf6e" strokeWidth={2.5} />
                                </div>
                                <h2 className="reg-success-title">Account Created!</h2>
                                <p className="reg-success-msg">
                                    Please sign in to complete your onboarding details.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <p className="reg-footer">
                        Already have an account?{' '}
                        <Link to="/login">Log In</Link>
                    </p>
                </motion.div>
            </div>
        </>
    );
};

export default RegisterPage;
