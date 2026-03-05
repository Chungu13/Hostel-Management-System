import React, { useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
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
    ChevronRight,
    type LucideIcon,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

type Role = "Managing Staff" | "Resident" | "Security Staff" | string;

type MenuItem = {
    path: string;
    icon: LucideIcon;
    label: string;
};

type UserShape = {
    name?: string;
    email?: string;
    myRole?: Role;
};

const Sidebar: React.FC = () => {
    const { user, logout } = useAuth() as { user?: UserShape; logout: () => void };
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const menuItems: Record<string, MenuItem[]> = useMemo(
        () => ({
            "Managing Staff": [
                { path: "/admin", icon: LayoutDashboard, label: "Overview" },
                { path: "/admin/residents", icon: Users, label: "Residents" },
                { path: "/admin/staff", icon: ShieldCheck, label: "Staff" },
                { path: "/admin/reports", icon: FileText, label: "Reports" },
            ],
            Resident: [
                { path: "/resident", icon: LayoutDashboard, label: "Overview" },
                { path: "/resident/visit-request", icon: FileText, label: "Request Visit" },
                { path: "/resident/history", icon: History, label: "Visit History" },
            ],
            "Security Staff": [
                { path: "/security", icon: LayoutDashboard, label: "Dashboard" },
                { path: "/security/verify", icon: ShieldCheck, label: "Verify Visitor" },
                { path: "/security/history", icon: History, label: "Records" },
            ],
        }),
        []
    );

    const currentMenu: MenuItem[] = useMemo(() => {
        const role = user?.myRole || "";
        if (role === "Security Staff" || role === "Security") {
            return menuItems["Security Staff"];
        }
        return menuItems[role] || [];
    }, [user?.myRole, menuItems]);

    const initials = (user?.name || user?.email || "U")[0]?.toUpperCase();

    return (
        <>
            {/* Toggle Button — always visible */}
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                aria-label="Open menu"
                className="fixed left-5 top-5 z-[300] flex h-[42px] w-[42px] items-center justify-center rounded-xl border border-zinc-200 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition hover:-translate-y-[1px] hover:bg-zinc-50 hover:shadow-[0_4px_14px_rgba(0,0,0,0.10)]"
            >
                <Menu size={18} className="text-zinc-700" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Overlay */}
                        <motion.div
                            className="fixed inset-0 z-[400] bg-black/15 backdrop-blur-[2px]"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Sidebar Panel */}
                        <motion.aside
                            className="fixed left-0 top-0 z-[500] flex h-screen w-[260px] flex-col border-r border-zinc-200 bg-white px-4 py-6 shadow-[4px_0_32px_rgba(0,0,0,0.08)]"
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        >
                            {/* Brand */}
                            <div className="mb-8 flex items-center justify-between px-2">
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-[34px] w-[34px] items-center justify-center rounded-[9px] bg-gradient-to-br from-emerald-600 to-emerald-300 shadow-[0_2px_8px_rgba(16,185,129,0.28)]">
                                        <span className="text-[1rem] font-bold tracking-[-0.02em] text-white">
                                            M
                                        </span>
                                    </div>

                                    <div className="flex flex-col gap-[1px]">
                                        <span className="text-[1.15rem] font-bold tracking-[-0.02em] text-zinc-900 leading-none">
                                            Malo
                                        </span>

                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    aria-label="Close menu"
                                    className="flex h-[30px] w-[30px] items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 transition hover:bg-zinc-100"
                                >
                                    <X size={14} className="text-zinc-600" />
                                </button>
                            </div>

                            {/* User Card */}
                            <div className="mb-6 flex items-center gap-2.5 rounded-[14px] border border-zinc-200 bg-zinc-50 px-3.5 py-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-gradient-to-br from-emerald-600/15 to-emerald-300/25 text-[0.85rem] font-bold text-emerald-600">
                                    {initials}
                                </div>

                                <div>
                                    <div className="text-[0.85rem] font-semibold leading-tight text-zinc-900">
                                        {user?.name || user?.email || "User"}
                                    </div>
                                    <div className="text-[0.7rem] font-normal text-zinc-400">
                                        {user?.myRole || "—"}
                                    </div>
                                </div>
                            </div>

                            {/* Nav */}
                            <div className="mb-1.5 px-2 text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-zinc-400">
                                Menu
                            </div>

                            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
                                {currentMenu.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <NavLink
                                            key={item.path}
                                            to={item.path}
                                            end
                                            onClick={() => setIsOpen(false)}
                                            className={({ isActive }) =>
                                                [
                                                    "group flex items-center gap-2.5 rounded-[11px] px-3 py-2.5 text-[0.875rem] font-medium transition",
                                                    isActive
                                                        ? "bg-emerald-600/10 text-emerald-600 font-semibold"
                                                        : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900",
                                                ].join(" ")
                                            }
                                        >
                                            <Icon
                                                className={[
                                                    "h-[18px] w-[18px] shrink-0 transition",
                                                    "group-hover:text-zinc-700",
                                                ].join(" ")}
                                            />

                                            <span>{item.label}</span>

                                            <ChevronRight
                                                size={14}
                                                className="ml-auto text-emerald-600 opacity-0 transition group-[.active]:opacity-100"
                                            />
                                        </NavLink>
                                    );
                                })}
                            </nav>

                            {/* Footer */}
                            <div className="mt-2 border-t border-zinc-200 pt-4">
                                <NavLink
                                    to={user?.myRole === 'Resident' ? "/resident/profile" : "/security/profile"}
                                    onClick={() => setIsOpen(false)}
                                    className={({ isActive }) =>
                                        [
                                            "flex w-full items-center gap-2.5 rounded-[11px] px-3 py-2.5 text-[0.875rem] font-medium transition",
                                            isActive
                                                ? "bg-emerald-600/10 text-emerald-600 font-semibold"
                                                : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900",
                                        ].join(" ")
                                    }
                                >
                                    <UserCircle size={18} className="text-zinc-400" />
                                    <span>My Profile</span>
                                </NavLink>

                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="mt-1 flex w-full items-center gap-2.5 rounded-[11px] px-3 py-2.5 text-[0.875rem] font-medium text-rose-500 transition hover:bg-rose-50 hover:text-rose-600"
                                >
                                    <LogOut size={18} />
                                    <span>Sign Out</span>
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