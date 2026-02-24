import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    User,
    ShieldCheck,
    LogOut,
    BarChart,
    Settings,
    ShieldAlert,
    Menu,
    X,
    ChevronRight,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
        { path: '/residents', icon: Users, label: 'Residents' },
        { path: '/staff', icon: ShieldCheck, label: 'Staff Hub' },
        { path: '/reports', icon: BarChart, label: 'Critical Reports' },
        { path: '/profile', icon: User, label: 'Profile' },
    ];

    const initials = (user?.name || user?.email || 'A')[0].toUpperCase();

    const SidebarContent = () => (
        <div className="flex flex-col h-full p-7">

            {/* Brand */}
            <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-[10px] flex items-center justify-center text-white font-bold text-base flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #4caf6e, #81c995)', boxShadow: '0 2px 8px rgba(76,175,110,0.3)' }}>
                        M
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-gray-900 text-[1.1rem] leading-none tracking-tight">Malo</span>
                        <span className="text-[0.58rem] text-green-500 uppercase tracking-[0.15em] font-semibold">Admin Console</span>
                    </div>
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    className="lg:hidden w-8 h-8 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                    <X size={15} />
                </button>
            </div>

            {/* User Card */}
            <div className="mb-8 p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center gap-3 group cursor-pointer hover:border-green-100 hover:bg-green-50/40 transition-all">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-base flex-shrink-0 transition-transform group-hover:scale-105"
                    style={{ background: 'linear-gradient(135deg, #4caf6e, #81c995)', boxShadow: '0 2px 8px rgba(76,175,110,0.25)' }}>
                    {initials}
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-800 truncate leading-tight">
                        {user?.name || user?.email || 'Admin'}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                        <p className="text-[0.65rem] text-gray-400 font-medium uppercase tracking-wider truncate">
                            {user?.myRole || 'Admin'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 flex flex-col gap-1">
                <p className="text-[0.62rem] font-semibold text-gray-400 uppercase tracking-[0.15em] mb-2 px-3">
                    Menu
                </p>
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsOpen(false)}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative group text-sm font-medium
                            ${isActive
                                ? 'bg-green-50 text-green-600 border border-green-100'
                                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50 border border-transparent'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon
                                    size={17}
                                    className={isActive ? 'text-green-500' : 'text-gray-400 group-hover:text-gray-600 transition-colors'}
                                />
                                <span className="flex-1">{item.label}</span>
                                {isActive && <ChevronRight size={14} className="text-green-400" />}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Footer */}
            <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col gap-1">
                <NavLink
                    to="/settings"
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all border
                        ${isActive
                            ? 'bg-green-50 text-green-600 border-green-100'
                            : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50 border-transparent'
                        }`
                    }
                >
                    {({ isActive }) => (
                        <>
                            <Settings size={17} className={isActive ? 'text-green-500' : 'text-gray-400'} />
                            <span>Config Terminal</span>
                        </>
                    )}
                </NavLink>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-50 hover:text-red-500 transition-all border border-transparent group w-full"
                >
                    <div className="w-7 h-7 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                        <LogOut size={14} className="text-red-400" />
                    </div>
                    Logout
                </button>

                {/* Status chip */}
                <div className="mt-3 px-4 py-3 rounded-xl bg-green-50/60 border border-green-100">
                    <div className="flex items-center gap-2 mb-1">
                        <ShieldAlert size={12} className="text-green-500" />
                        <span className="text-[0.62rem] font-semibold text-green-600 uppercase tracking-wide">System Status</span>
                    </div>
                    <p className="text-[0.68rem] text-gray-400 leading-snug">
                        End-to-end encryption active. All actions are logged.
                    </p>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Hamburger toggle (always visible, push-out style like other Sidebar) */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed top-5 left-5 z-40 w-10 h-10 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-500 hover:text-gray-800 hover:shadow-md transition-all"
                style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)' }}
            >
                <Menu size={18} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 z-50 bg-black/10 backdrop-blur-[2px]"
                        />

                        {/* Drawer */}
                        <motion.aside
                            initial={{ x: -300 }}
                            animate={{ x: 0 }}
                            exit={{ x: -300 }}
                            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                            className="fixed left-0 top-0 bottom-0 z-[51] w-[280px] bg-white border-r border-gray-100"
                            style={{ boxShadow: '4px 0 32px rgba(0,0,0,0.06)' }}
                        >
                            <SidebarContent />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default Sidebar;
