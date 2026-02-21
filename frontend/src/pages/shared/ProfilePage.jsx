import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Shield, Save, Loader2, CreditCard, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const ProfilePage = () => {
    const { user, login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        ic: '',
        gender: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/api/profile/${user.userName}`);
                setProfile(response.data);
            } catch (err) {
                console.error("Error fetching profile:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [user.userName]);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put(`/api/profile/${user.userName}`, profile);
            login({ ...user, name: profile.name });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            console.error("Error saving profile:", err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7f7f5', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <Loader2 size={28} color="#4caf6e" style={{ animation: 'spin 0.8s linear infinite' }} />
        </div>
    );

    const initials = (profile.name || user.userName || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

                .pp-root {
                    display: flex;
                    min-height: 100vh;
                    background-color: #f7f7f5;
                    background-image:
                        radial-gradient(circle at 5% 10%, rgba(134, 197, 152, 0.1) 0%, transparent 45%),
                        radial-gradient(circle at 95% 90%, rgba(134, 197, 152, 0.07) 0%, transparent 45%);
                    font-family: 'Plus Jakarta Sans', sans-serif;
                }

                .pp-main {
                    margin-left: 0;
                    padding: 40px 40px 40px 80px;
                    width: 100%;
                    box-sizing: border-box;
                }

                @media (max-width: 640px) {
                    .pp-main { padding: 24px 20px 24px 70px; }
                    .pp-layout { grid-template-columns: 1fr !important; }
                }

                /* Header */
                .pp-header { margin-bottom: 32px; }

                .pp-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    background: rgba(76,175,110,0.08);
                    border: 1px solid rgba(76,175,110,0.2);
                    color: #4caf6e;
                    font-size: 0.72rem;
                    font-weight: 600;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    padding: 4px 10px;
                    border-radius: 20px;
                    margin-bottom: 10px;
                }

                .pp-badge-dot {
                    width: 6px; height: 6px;
                    background: #4caf6e;
                    border-radius: 50%;
                }

                .pp-heading {
                    font-size: 1.85rem;
                    font-weight: 700;
                    color: #111;
                    letter-spacing: -0.03em;
                    line-height: 1.2;
                    margin: 0 0 6px;
                }

                .pp-subtext {
                    font-size: 0.875rem;
                    color: #999;
                    font-weight: 400;
                    margin: 0;
                }

                /* Layout */
                .pp-layout {
                    display: grid;
                    grid-template-columns: 1fr 300px;
                    gap: 20px;
                    align-items: start;
                }

                /* Card */
                .pp-card {
                    background: #fff;
                    border-radius: 20px;
                    padding: 32px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.05);
                    border: 1px solid rgba(0,0,0,0.04);
                    position: relative;
                    overflow: hidden;
                }

                .pp-card::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; right: 0;
                    height: 3px;
                    background: linear-gradient(90deg, #4caf6e, #81c995);
                    border-radius: 20px 20px 0 0;
                }

                /* Form */
                .pp-form { display: flex; flex-direction: column; gap: 20px; }

                .pp-section-divider {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .pp-section-label {
                    font-size: 0.7rem;
                    font-weight: 600;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                    color: #bbb;
                    white-space: nowrap;
                }

                .pp-section-line {
                    flex: 1; height: 1px;
                    background: #ebebea;
                }

                .pp-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                }

                @media (max-width: 560px) { .pp-grid { grid-template-columns: 1fr; } }

                .pp-field { display: flex; flex-direction: column; gap: 6px; }

                .pp-label {
                    font-size: 0.78rem;
                    font-weight: 500;
                    color: #555;
                    letter-spacing: 0.06em;
                    text-transform: uppercase;
                }

                .pp-input-wrap { position: relative; }

                .pp-input-icon {
                    position: absolute;
                    left: 14px; top: 50%;
                    transform: translateY(-50%);
                    color: #bbb;
                    width: 15px; height: 15px;
                    pointer-events: none;
                }

                .pp-textarea-icon {
                    position: absolute;
                    left: 14px; top: 13px;
                    color: #bbb;
                    width: 15px; height: 15px;
                    pointer-events: none;
                }

                .pp-input {
                    width: 100%;
                    padding: 11px 14px 11px 38px;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    font-size: 0.875rem;
                    color: #111;
                    background: #f9f9f8;
                    border: 1.5px solid #e8e8e6;
                    border-radius: 12px;
                    outline: none;
                    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
                    box-sizing: border-box;
                }

                .pp-input::placeholder { color: #c8c8c5; }

                .pp-input:focus {
                    border-color: #4caf6e;
                    background: #fff;
                    box-shadow: 0 0 0 3px rgba(76,175,110,0.1);
                }

                .pp-input-readonly {
                    width: 100%;
                    padding: 11px 14px 11px 38px;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    font-size: 0.875rem;
                    color: #bbb;
                    background: #f4f4f3;
                    border: 1.5px solid #ebebea;
                    border-radius: 12px;
                    outline: none;
                    box-sizing: border-box;
                    cursor: not-allowed;
                }

                .pp-textarea {
                    width: 100%;
                    padding: 11px 14px 11px 38px;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    font-size: 0.875rem;
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

                .pp-textarea:focus {
                    border-color: #4caf6e;
                    background: #fff;
                    box-shadow: 0 0 0 3px rgba(76,175,110,0.1);
                }

                /* Save button area */
                .pp-form-footer {
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                    gap: 12px;
                    padding-top: 4px;
                }

                .pp-saved-msg {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.8rem;
                    font-weight: 500;
                    color: #4caf6e;
                }

                .pp-save-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 11px 24px;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: #fff;
                    background: linear-gradient(135deg, #4caf6e, #5ec47f);
                    border: none;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
                    box-shadow: 0 4px 14px rgba(76,175,110,0.25);
                    letter-spacing: 0.02em;
                }

                .pp-save-btn:hover:not(:disabled) {
                    opacity: 0.92;
                    transform: translateY(-1px);
                    box-shadow: 0 6px 18px rgba(76,175,110,0.3);
                }

                .pp-save-btn:disabled { opacity: 0.65; cursor: not-allowed; }

                /* Right Column */
                .pp-right { display: flex; flex-direction: column; gap: 16px; }

                /* Avatar card */
                .pp-avatar-card {
                    background: #fff;
                    border-radius: 20px;
                    padding: 28px 24px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04);
                    border: 1px solid rgba(0,0,0,0.04);
                    text-align: center;
                }

                .pp-avatar {
                    width: 80px;
                    height: 80px;
                    border-radius: 20px;
                    background: linear-gradient(135deg, #4caf6e, #81c995);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.6rem;
                    font-weight: 700;
                    color: #fff;
                    letter-spacing: -0.02em;
                    margin: 0 auto 16px;
                    box-shadow: 0 4px 16px rgba(76,175,110,0.3);
                }

                .pp-avatar-name {
                    font-size: 1.05rem;
                    font-weight: 700;
                    color: #111;
                    letter-spacing: -0.01em;
                    margin-bottom: 4px;
                }

                .pp-avatar-role {
                    font-size: 0.78rem;
                    color: #999;
                    font-weight: 400;
                    margin-bottom: 16px;
                }

                .pp-verified-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    background: rgba(76,175,110,0.08);
                    border: 1px solid rgba(76,175,110,0.2);
                    color: #4caf6e;
                    font-size: 0.72rem;
                    font-weight: 600;
                    letter-spacing: 0.04em;
                    padding: 5px 12px;
                    border-radius: 20px;
                }

                /* Login details card */
                .pp-login-card {
                    background: #fff;
                    border-radius: 20px;
                    padding: 24px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04);
                    border: 1px solid rgba(0,0,0,0.04);
                }

                .pp-login-title {
                    font-size: 0.875rem;
                    font-weight: 700;
                    color: #222;
                    margin: 0 0 16px;
                    letter-spacing: -0.01em;
                }

                .pp-login-row {
                    margin-bottom: 12px;
                }

                .pp-login-key {
                    font-size: 0.68rem;
                    font-weight: 600;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    color: #bbb;
                    margin-bottom: 3px;
                }

                .pp-login-val {
                    font-size: 0.85rem;
                    font-family: 'Plus Jakarta Sans', monospace;
                    color: #333;
                    font-weight: 500;
                    background: #f9f9f8;
                    border: 1px solid #ebebea;
                    border-radius: 8px;
                    padding: 6px 10px;
                }

                .pp-change-pw {
                    background: none;
                    border: none;
                    color: #4caf6e;
                    font-size: 0.8rem;
                    font-weight: 600;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    cursor: pointer;
                    padding: 0;
                    margin-top: 12px;
                    transition: color 0.15s;
                }

                .pp-change-pw:hover { color: #3a9a5a; text-decoration: underline; }

                @keyframes spin { to { transform: rotate(360deg); } }
                .spin { animation: spin 0.8s linear infinite; }
            `}</style>

            <div className="pp-root">
                <Sidebar />
                <main className="pp-main">

                    {/* Header */}
                    <motion.header
                        className="pp-header"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <div className="pp-badge">
                            <div className="pp-badge-dot" />
                            Account
                        </div>
                        <h1 className="pp-heading">Account Settings</h1>
                        <p className="pp-subtext">Manage your personal information and preferences</p>
                    </motion.header>

                    <div className="pp-layout">
                        {/* Left — Form */}
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
                            className="pp-card"
                        >
                            <form onSubmit={handleSave} className="pp-form">

                                {/* Personal */}
                                <div className="pp-section-divider">
                                    <span className="pp-section-label">Personal Info</span>
                                    <div className="pp-section-line" />
                                </div>

                                <div className="pp-grid">
                                    <div className="pp-field">
                                        <label className="pp-label">Full Name</label>
                                        <div className="pp-input-wrap">
                                            <User className="pp-input-icon" />
                                            <input
                                                className="pp-input"
                                                placeholder="Your full name"
                                                value={profile.name}
                                                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="pp-field">
                                        <label className="pp-label">Email Address</label>
                                        <div className="pp-input-wrap">
                                            <Mail className="pp-input-icon" />
                                            <input
                                                className="pp-input"
                                                placeholder="your@email.com"
                                                value={profile.email}
                                                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Contact */}
                                <div className="pp-section-divider">
                                    <span className="pp-section-label">Contact & ID</span>
                                    <div className="pp-section-line" />
                                </div>

                                <div className="pp-grid">
                                    <div className="pp-field">
                                        <label className="pp-label">Phone Number</label>
                                        <div className="pp-input-wrap">
                                            <Phone className="pp-input-icon" />
                                            <input
                                                className="pp-input"
                                                placeholder="+260 97 000 0000"
                                                value={profile.phone}
                                                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="pp-field">
                                        <label className="pp-label">IC / Passport Number</label>
                                        <div className="pp-input-wrap">
                                            <CreditCard className="pp-input-icon" style={{ color: '#ddd' }} />
                                            <input
                                                className="pp-input-readonly"
                                                value={profile.ic}
                                                readOnly
                                                title="This field cannot be changed"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Address */}
                                <div className="pp-section-divider">
                                    <span className="pp-section-label">Address</span>
                                    <div className="pp-section-line" />
                                </div>

                                <div className="pp-field">
                                    <label className="pp-label">Home Address</label>
                                    <div className="pp-input-wrap">
                                        <MapPin className="pp-textarea-icon" />
                                        <textarea
                                            className="pp-textarea"
                                            placeholder="Your full permanent address"
                                            value={profile.address}
                                            onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="pp-form-footer">
                                    {saved && (
                                        <motion.div
                                            className="pp-saved-msg"
                                            initial={{ opacity: 0, x: 8 }}
                                            animate={{ opacity: 1, x: 0 }}
                                        >
                                            <CheckCircle size={14} />
                                            Profile updated!
                                        </motion.div>
                                    )}
                                    <button type="submit" disabled={saving} className="pp-save-btn">
                                        {saving
                                            ? <Loader2 size={15} className="spin" />
                                            : <Save size={15} />
                                        }
                                        {saving ? 'Saving…' : 'Update Profile'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>

                        {/* Right Column */}
                        <motion.div
                            className="pp-right"
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
                        >
                            {/* Avatar Card */}
                            <div className="pp-avatar-card">
                                <div className="pp-avatar">{initials}</div>
                                <div className="pp-avatar-name">{profile.name || user.userName}</div>
                                <div className="pp-avatar-role">{user.myRole}</div>
                                <div className="pp-verified-badge">
                                    <Shield size={11} />
                                    Verified Account
                                </div>
                            </div>

                            {/* Login Details */}
                            <div className="pp-login-card">
                                <p className="pp-login-title">Login Details</p>
                                <div className="pp-login-row">
                                    <div className="pp-login-key">Username</div>
                                    <div className="pp-login-val">{user.userName}</div>
                                </div>
                                <div className="pp-login-row">
                                    <div className="pp-login-key">Role</div>
                                    <div className="pp-login-val">{user.myRole}</div>
                                </div>
                                <button className="pp-change-pw">Change Password?</button>
                            </div>
                        </motion.div>
                    </div>

                </main>
            </div>
        </>
    );
};

export default ProfilePage;
