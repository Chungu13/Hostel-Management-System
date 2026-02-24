import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    LogOut,
    UserCircle,
    History,
    FileText,
    Menu,
    X,
    ChevronRight,
    Home,
    Settings,
    Bell,
    ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const residentMenu = [
        { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/resident/visit-request', icon: FileText, label: 'Resident Pass' },
        { path: '/resident/history', icon: History, label: 'Access History' },
    ];

    const securityMenu = [
        { path: '/security', icon: LayoutDashboard, label: 'Control Hub' },
        { path: '/security/verify', icon: ShieldCheck, label: 'Verify Entry' },
        { path: '/security/history', icon: History, label: 'Visit Logs' },
    ];

    const activeMenu = user?.myRole === 'Security Staff' ? securityMenu : residentMenu;

    const checkIsActive = (path: string) => {
        if (path === '/' && location.pathname === '/') return true;
        if (path !== '/' && location.pathname.startsWith(path)) return true;
        return false;
    };

    return (
        <>
            {/* Mobile Header/Toggle */}
            <div className={`fixed top-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-md z-40 lg:hidden flex items-center justify-between px-6 border-b border-slate-100 transition-all ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-sm">M</div>
                    <span className="font-bold text-slate-800 tracking-tight">Malo Resident</span>
                </div>
                <button
                    onClick={() => setIsOpen(true)}
                    className="p-2.5 bg-slate-50 text-slate-600 rounded-xl active:scale-95 transition-all"
                >
                    <Menu size={20} />
                </button>
            </div>

            {/* Desktop Sidebar + Mobile Panel */}
            <AnimatePresence>
                {(isOpen || window.innerWidth >= 1024) && (
                    <>
                        {/* Backdrop for mobile */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] lg:hidden"
                        />

                        {/* Sidebar Panel */}
                        <motion.aside
                            initial={{ x: -300 }}
                            animate={{ x: 0 }}
                            exit={{ x: -300 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed left-0 top-0 bottom-0 w-[280px] bg-white z-[101] border-r border-slate-100 flex flex-col p-8 lg:z-30 lg:translate-x-0"
                        >
                            {/* Brand */}
                            <div className="flex items-center justify-between mb-12">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/20">
                                        M
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-900 text-lg leading-none">Malo</span>
                                        <span className="text-[10px] text-primary uppercase tracking-widest font-bold">Residency</span>
                                    </div>
                                </div>
                                <button onClick={() => setIsOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-slate-900">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* User Profile */}
                            <div className="mb-10 p-5 bg-slate-50 rounded-[2rem] border border-slate-100 group cursor-pointer hover:bg-white hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-primary font-bold text-lg group-hover:scale-110 transition-transform">
                                        {user?.name?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-900 truncate group-hover:text-primary transition-colors">
                                            {user?.name}
                                        </p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">
                                            Tenant Access
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Navigation */}
                            <nav className="flex-1 space-y-2">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 px-4">Management</p>
                                {activeMenu.map((item) => (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setIsOpen(false)}
                                        className={({ isActive }) => `
                                            flex items-center gap-4 px-5 py-4 rounded-2xl transition-all relative group
                                            ${isActive
                                                ? 'bg-primary text-white shadow-xl shadow-primary/25 font-bold'
                                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
                                        `}
                                    >
                                        {({ isActive }) => (
                                            <>
                                                <item.icon size={20} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-primary transition-colors'} />
                                                <span className="text-sm">{item.label}</span>
                                                {isActive && (
                                                    <motion.div
                                                        layoutId="active-pill"
                                                        className="ml-auto"
                                                    >
                                                        <ChevronRight size={16} className="text-white/50" />
                                                    </motion.div>
                                                )}
                                            </>
                                        )}
                                    </NavLink>
                                ))}
                            </nav>

                            {/* Footer Functions */}
                            <div className="mt-auto space-y-2 pt-8 border-t border-slate-50">
                                <NavLink
                                    to="/resident/profile"
                                    onClick={() => setIsOpen(false)}
                                    className={({ isActive }) => `
                                        flex items-center gap-4 px-5 py-4 rounded-2xl transition-all group
                                        ${isActive ? 'bg-slate-900 text-white font-bold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
                                    `}
                                >
                                    {({ isActive }) => (
                                        <>
                                            <UserCircle size={20} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-900'} />
                                            <span className="text-sm">Account Settings</span>
                                        </>
                                    )}
                                </NavLink>

                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-red-500 hover:bg-red-50 transition-all group"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-all">
                                        <LogOut size={16} />
                                    </div>
                                    <span className="text-sm font-bold">Terminate Session</span>
                                </button>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default Sidebar;
