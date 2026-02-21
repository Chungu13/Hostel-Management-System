import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    ShieldCheck,
    LogOut,
    UserCircle,
    History,
    FileText,
    Menu,
    X,
    ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = {
        'Resident': [
            { path: '/resident', icon: LayoutDashboard, label: 'Dashboard' },
            { path: '/resident/visit-request', icon: FileText, label: 'Request Visit' },
            { path: '/resident/history', icon: History, label: 'Visit History' },
        ],
        'Security Staff': [
            { path: '/security', icon: LayoutDashboard, label: 'Dashboard' },
            { path: '/security/verify', icon: ShieldCheck, label: 'Verify Visitor' },
            { path: '/security/history', icon: History, label: 'History' },
        ]
    };

    const currentMenu = menuItems[user?.myRole] || [];

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

                /* Toggle Button */
                .sb-toggle {
                    position: fixed;
                    top: 20px;
                    left: 20px;
                    z-index: 300;
                    width: 42px;
                    height: 42px;
                    background: #fff;
                    border: 1px solid #e8e8e6;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                    transition: background 0.2s, box-shadow 0.2s, transform 0.15s;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                }

                .sb-toggle:hover {
                    background: #f7f7f5;
                    box-shadow: 0 4px 14px rgba(0,0,0,0.1);
                    transform: translateY(-1px);
                }

                /* Overlay */
                .sb-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.15);
                    backdrop-filter: blur(2px);
                    z-index: 400;
                }

                /* Sidebar Panel */
                .sb-panel {
                    position: fixed;
                    left: 0;
                    top: 0;
                    height: 100vh;
                    width: 260px;
                    background: #fff;
                    z-index: 500;
                    display: flex;
                    flex-direction: column;
                    padding: 24px 16px;
                    box-sizing: border-box;
                    box-shadow: 4px 0 32px rgba(0,0,0,0.08);
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    border-right: 1px solid #ebebea;
                }

                /* Brand */
                .sb-brand {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 8px;
                    margin-bottom: 32px;
                }

                .sb-brand-inner {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .sb-logo-mark {
                    width: 34px;
                    height: 34px;
                    background: linear-gradient(135deg, #4caf6e, #81c995);
                    border-radius: 9px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    box-shadow: 0 2px 8px rgba(76, 175, 110, 0.28);
                }

                .sb-logo-mark span {
                    font-size: 1rem;
                    font-weight: 700;
                    color: #fff;
                    letter-spacing: -0.02em;
                    line-height: 1;
                }

                .sb-brand-text {
                    display: flex;
                    flex-direction: column;
                    gap: 1px;
                }

                .sb-brand-name {
                    font-size: 1.15rem;
                    font-weight: 700;
                    color: #1a1a1a;
                    letter-spacing: -0.02em;
                    line-height: 1;
                }

                .sb-brand-tagline {
                    font-size: 0.6rem;
                    color: #4caf6e;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                    font-weight: 500;
                }

                .sb-close {
                    width: 30px;
                    height: 30px;
                    border-radius: 8px;
                    border: 1px solid #e8e8e6;
                    background: #f9f9f8;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: background 0.15s;
                    flex-shrink: 0;
                }

                .sb-close:hover {
                    background: #f0f0ee;
                }

                /* User Card */
                .sb-user-card {
                    background: #f9f9f8;
                    border: 1px solid #e8e8e6;
                    border-radius: 14px;
                    padding: 12px 14px;
                    margin-bottom: 24px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .sb-user-avatar {
                    width: 36px;
                    height: 36px;
                    background: linear-gradient(135deg, rgba(76,175,110,0.15), rgba(129,201,149,0.25));
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    font-size: 0.85rem;
                    font-weight: 700;
                    color: #4caf6e;
                }

                .sb-user-info {}

                .sb-user-name {
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: #222;
                    line-height: 1.2;
                }

                .sb-user-role {
                    font-size: 0.7rem;
                    color: #999;
                    font-weight: 400;
                }

                /* Section Label */
                .sb-section-label {
                    font-size: 0.65rem;
                    font-weight: 600;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                    color: #bbb;
                    padding: 0 8px;
                    margin-bottom: 6px;
                }

                /* Nav */
                .sb-nav {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    overflow-y: auto;
                }

                .sb-nav-link {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px 12px;
                    border-radius: 11px;
                    text-decoration: none;
                    font-size: 0.875rem;
                    font-weight: 500;
                    color: #666;
                    transition: background 0.15s, color 0.15s;
                    position: relative;
                }

                .sb-nav-link:hover {
                    background: #f5f5f3;
                    color: #222;
                }

                .sb-nav-link.active {
                    background: rgba(76, 175, 110, 0.1);
                    color: #4caf6e;
                    font-weight: 600;
                }

                .sb-nav-link.active .sb-nav-icon {
                    color: #4caf6e;
                }

                .sb-nav-icon {
                    width: 18px;
                    height: 18px;
                    flex-shrink: 0;
                    color: #aaa;
                    transition: color 0.15s;
                }

                .sb-nav-link:hover .sb-nav-icon {
                    color: #555;
                }

                .sb-nav-chevron {
                    margin-left: auto;
                    opacity: 0;
                    transition: opacity 0.15s, transform 0.15s;
                    color: #4caf6e;
                }

                .sb-nav-link.active .sb-nav-chevron {
                    opacity: 1;
                }

                /* Footer */
                .sb-footer {
                    padding-top: 16px;
                    border-top: 1px solid #ebebea;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    margin-top: 8px;
                }

                .sb-footer-link {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px 12px;
                    border-radius: 11px;
                    text-decoration: none;
                    font-size: 0.875rem;
                    font-weight: 500;
                    color: #666;
                    transition: background 0.15s, color 0.15s;
                    cursor: pointer;
                    border: none;
                    background: none;
                    width: 100%;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    text-align: left;
                }

                .sb-footer-link:hover {
                    background: #f5f5f3;
                    color: #222;
                }

                .sb-footer-link.active {
                    background: rgba(76, 175, 110, 0.1);
                    color: #4caf6e;
                    font-weight: 600;
                }

                .sb-logout {
                    color: #e05c5c;
                }

                .sb-logout:hover {
                    background: #fff5f5;
                    color: #c94040;
                }
            `}</style>

            {/* Toggle Button — always visible */}
            <button className="sb-toggle" onClick={() => setIsOpen(true)} aria-label="Open menu">
                <Menu size={18} color="#444" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Overlay */}
                        <motion.div
                            className="sb-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Sidebar Panel */}
                        <motion.div
                            className="sb-panel"
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        >
                            {/* Brand */}
                            <div className="sb-brand">
                                <div className="sb-brand-inner">
                                    <div className="sb-logo-mark">
                                        <span>M</span>
                                    </div>
                                    <div className="sb-brand-text">
                                        <span className="sb-brand-name">Malo</span>
                                        <span className="sb-brand-tagline">Hostel Management</span>
                                    </div>
                                </div>
                                <button className="sb-close" onClick={() => setIsOpen(false)} aria-label="Close menu">
                                    <X size={14} color="#666" />
                                </button>
                            </div>

                            {/* User Card */}
                            <div className="sb-user-card">
                                <div className="sb-user-avatar">
                                    {(user?.name || user?.userName || 'U')[0].toUpperCase()}
                                </div>
                                <div className="sb-user-info">
                                    <div className="sb-user-name">{user?.name || user?.userName}</div>
                                    <div className="sb-user-role">{user?.myRole}</div>
                                </div>
                            </div>

                            {/* Nav */}
                            <div className="sb-section-label">Menu</div>
                            <nav className="sb-nav">
                                {currentMenu.map((item) => (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        end
                                        onClick={() => setIsOpen(false)}
                                        className={({ isActive }) => `sb-nav-link${isActive ? ' active' : ''}`}
                                    >
                                        <item.icon className="sb-nav-icon" />
                                        <span>{item.label}</span>
                                        <ChevronRight size={14} className="sb-nav-chevron" />
                                    </NavLink>
                                ))}
                            </nav>

                            {/* Footer */}
                            <div className="sb-footer">
                                <NavLink
                                    to="/profile"
                                    onClick={() => setIsOpen(false)}
                                    className={({ isActive }) => `sb-footer-link${isActive ? ' active' : ''}`}
                                >
                                    <UserCircle size={18} color="#aaa" />
                                    <span>My Profile</span>
                                </NavLink>

                                <button className="sb-footer-link sb-logout" onClick={handleLogout}>
                                    <LogOut size={18} />
                                    <span>Sign Out</span>
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default Sidebar;
