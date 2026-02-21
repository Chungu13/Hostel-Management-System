import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, Lock, Loader2, Mail } from 'lucide-react';
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
                login(response.data);

                if (response.data.needsOnboarding) {
                    if (response.data.myRole === 'Managing Staff') {
                        navigate('/admin-onboarding');
                    } else {
                        navigate('/onboarding');
                    }
                    return;
                }

                const role = response.data.myRole;
                if (role === 'Managing Staff') navigate('/admin');
                else if (role === 'Resident') navigate('/resident');
                else if (role === 'Security Staff') navigate('/security');
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
                login(response.data);
                if (response.data.needsOnboarding) {
                    if (response.data.myRole === 'Managing Staff') {
                        navigate('/admin-onboarding');
                    } else {
                        navigate('/onboarding');
                    }
                } else {
                    const role = response.data.myRole;
                    if (role === 'Managing Staff') navigate('/admin');
                    else if (role === 'Resident') navigate('/resident');
                    else if (role === 'Security Staff') navigate('/security');
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
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Instrument+Serif:ital@0;1&display=swap');

                .login-root {
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

                .login-card {
                    width: 100%;
                    max-width: 420px;
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

                .login-card::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; right: 0;
                    height: 3px;
                    background: linear-gradient(90deg, #4caf6e, #81c995);
                    border-radius: 24px 24px 0 0;
                }

                .login-brand {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 36px;
                }

                .login-logo-mark {
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

                .login-logo-mark span {
                    font-family: 'Instrument Serif', serif;
                    font-size: 1.05rem;
                    color: #fff;
                    letter-spacing: -0.02em;
                    line-height: 1;
                    font-style: italic;
                }

                .login-brand-text {
                    display: flex;
                    flex-direction: column;
                    gap: 1px;
                }

                .login-brand-name {
                    font-family: 'Instrument Serif', serif;
                    font-size: 1.35rem;
                    color: #1a1a1a;
                    letter-spacing: -0.01em;
                    font-style: italic;
                    line-height: 1;
                }

                .login-brand-tagline {
                    font-size: 0.62rem;
                    color: #4caf6e;
                    letter-spacing: 0.12em;
                    text-transform: uppercase;
                    font-weight: 500;
                }

                .login-heading {
                    font-family: 'Instrument Serif', serif;
                    font-size: 2rem;
                    color: #111;
                    line-height: 1.15;
                    margin: 0 0 6px;
                }

                .login-subtext {
                    font-size: 0.875rem;
                    color: #888;
                    margin: 0 0 32px;
                    font-weight: 400;
                    letter-spacing: 0.01em;
                }

                .login-form {
                    display: flex;
                    flex-direction: column;
                    gap: 18px;
                }

                .login-field {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .login-label {
                    font-size: 0.78rem;
                    font-weight: 500;
                    color: #555;
                    letter-spacing: 0.06em;
                    text-transform: uppercase;
                }

                .login-input-wrap {
                    position: relative;
                }

                .login-input-icon {
                    position: absolute;
                    left: 14px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #bbb;
                    width: 16px;
                    height: 16px;
                    pointer-events: none;
                }

                .login-input {
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

                .login-input::placeholder {
                    color: #c8c8c5;
                }

                .login-input:focus {
                    border-color: #4caf6e;
                    background: #fff;
                    box-shadow: 0 0 0 3px rgba(76, 175, 110, 0.1);
                }

                .login-error {
                    font-size: 0.82rem;
                    color: #e05c5c;
                    text-align: center;
                    background: #fff5f5;
                    border: 1px solid #fdd;
                    border-radius: 8px;
                    padding: 10px 14px;
                }

                .login-btn {
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

                .login-btn:hover:not(:disabled) {
                    opacity: 0.93;
                    transform: translateY(-1px);
                    box-shadow: 0 6px 20px rgba(76, 175, 110, 0.3);
                }

                .login-btn:active:not(:disabled) {
                    transform: translateY(0);
                }

                .login-btn:disabled {
                    opacity: 0.65;
                    cursor: not-allowed;
                }

                .login-divider {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    margin: 24px 0;
                }

                .login-divider-line {
                    flex: 1;
                    height: 1px;
                    background: #ebebea;
                }

                .login-divider-text {
                    font-size: 0.75rem;
                    color: #bbb;
                    white-space: nowrap;
                    font-weight: 400;
                    letter-spacing: 0.04em;
                }

                .login-google-wrap {
                    display: flex;
                    justify-content: center;
                }

                .login-footer {
                    text-align: center;
                    margin-top: 28px;
                    font-size: 0.85rem;
                    color: #999;
                }

                .login-footer a {
                    color: #4caf6e;
                    font-weight: 500;
                    text-decoration: none;
                    transition: color 0.15s;
                }

                .login-footer a:hover {
                    color: #3a9a5a;
                    text-decoration: underline;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                .spin { animation: spin 0.8s linear infinite; }
            `}</style>

            <div className="login-root">
                <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className="login-card"
                >
                    <div className="login-brand">
                        <div className="login-logo-mark">
                            <span>M</span>
                        </div>
                        <div className="login-brand-text">
                            <span className="login-brand-name">Malo</span>
                            <span className="login-brand-tagline">Hostel Management</span>
                        </div>
                    </div>

                    <h1 className="login-heading">Sign in</h1>
                    <p className="login-subtext">Manage your hostel profile</p>

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="login-field">
                            <label className="login-label">Email Address</label>
                            <div className="login-input-wrap">
                                <Mail className="login-input-icon" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="login-input"
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="login-field">
                            <label className="login-label">Password</label>
                            <div className="login-input-wrap">
                                <Lock className="login-input-icon" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="login-input"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <motion.p
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="login-error"
                            >
                                {error}
                            </motion.p>
                        )}

                        <button type="submit" disabled={loading} className="login-btn">
                            {loading
                                ? <Loader2 size={17} className="spin" />
                                : <LogIn size={17} />
                            }
                            {loading ? 'Signing in…' : 'Sign In'}
                        </button>
                    </form>

                    <div className="login-divider">
                        <div className="login-divider-line" />
                        <span className="login-divider-text">or continue with</span>
                        <div className="login-divider-line" />
                    </div>

                    <div className="login-google-wrap">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => setError('Google sign-in failed')}
                            useOneTap
                            theme="outline"
                            shape="pill"
                            size="large"
                        />
                    </div>

                    <p className="login-footer">
                        Don't have an account?{' '}
                        <Link to="/register">Create one</Link>
                    </p>
                </motion.div>
            </div>
        </>
    );
};

export default LoginPage;
