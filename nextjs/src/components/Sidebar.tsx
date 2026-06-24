'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Users, ShieldCheck, LogOut, UserCircle,
  History, FileText, Menu, X, ChevronRight, Bell,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

type MenuItem = { path: string; icon: React.ElementType; label: string }

const menuByRole: Record<string, MenuItem[]> = {
  'Managing Staff': [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { path: '/admin/residents', icon: Users, label: 'Residents' },
    { path: '/admin/staff', icon: ShieldCheck, label: 'Staff' },
    { path: '/admin/history', icon: History, label: 'Visitor History' },
    { path: '/admin/notices', icon: Bell, label: 'Notices' },
    { path: '/admin/reports', icon: FileText, label: 'Reports' },
  ],
  Resident: [
    { path: '/resident/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { path: '/resident/visit-request', icon: FileText, label: 'Request Visit' },
    { path: '/resident/history', icon: History, label: 'Visit History' },
  ],
  'Security Staff': [
    { path: '/security/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/security/verify', icon: ShieldCheck, label: 'Verify Visitor' },
    { path: '/security/history', icon: History, label: 'Records' },
  ],
}

const profileByRole: Record<string, string> = {
  Resident: '/resident/profile',
  'Security Staff': '/security/profile',
  'Managing Staff': '/admin/profile',
}

interface Props {
  role: string
  name: string
  email: string
}

export default function Sidebar({ role, name, email }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const menuItems = useMemo(() => menuByRole[role] ?? [], [role])
  const profilePath = profileByRole[role] ?? '/login'
  const initials = (name || email || 'U')[0].toUpperCase()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open menu"
        className="fixed left-5 top-5 z-[300] flex h-[42px] w-[42px] items-center justify-center rounded-xl border border-zinc-200 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition hover:-translate-y-[1px] hover:bg-zinc-50"
      >
        <Menu size={18} className="text-zinc-700" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-[400] bg-black/15 backdrop-blur-[2px]"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
            />
            <motion.aside
              className="fixed left-0 top-0 z-[500] flex h-screen w-[260px] flex-col border-r border-zinc-200 bg-white px-4 py-6 shadow-[4px_0_32px_rgba(0,0,0,0.08)]"
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Brand */}
              <div className="mb-8 flex items-center justify-between px-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-[34px] w-[34px] items-center justify-center rounded-[9px] bg-gradient-to-br from-emerald-600 to-emerald-300 shadow-[0_2px_8px_rgba(16,185,129,0.28)]">
                    <span className="text-[1rem] font-bold text-white">M</span>
                  </div>
                  <span className="text-[1.15rem] font-bold tracking-[-0.02em] text-zinc-900">Malo</span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex h-[30px] w-[30px] items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 transition hover:bg-zinc-100"
                >
                  <X size={14} className="text-zinc-600" />
                </button>
              </div>

              {/* User card */}
              <div className="mb-6 flex items-center gap-2.5 rounded-[14px] border border-zinc-200 bg-zinc-50 px-3.5 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-emerald-600/15 text-[0.85rem] font-bold text-emerald-600">
                  {initials}
                </div>
                <div>
                  <div className="text-[0.85rem] font-semibold leading-tight text-zinc-900">{name || email}</div>
                  <div className="text-[0.72rem] text-zinc-400">{role}</div>
                </div>
              </div>

              <div className="mb-1.5 px-2 text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-zinc-400">Menu</div>

              <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
                {menuItems.map(item => {
                  const Icon = item.icon
                  const isActive = pathname === item.path
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={() => setIsOpen(false)}
                      className={[
                        'group flex items-center gap-2.5 rounded-[11px] px-3 py-2.5 text-[0.875rem] font-medium transition',
                        isActive
                          ? 'bg-emerald-600/10 text-emerald-600 font-semibold'
                          : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900',
                      ].join(' ')}
                    >
                      <Icon className="h-[18px] w-[18px] shrink-0" />
                      <span>{item.label}</span>
                      {isActive && <ChevronRight size={14} className="ml-auto text-emerald-600" />}
                    </Link>
                  )
                })}
              </nav>

              <div className="mt-2 border-t border-zinc-200 pt-4">
                <Link
                  href={profilePath}
                  onClick={() => setIsOpen(false)}
                  className={[
                    'flex w-full items-center gap-2.5 rounded-[11px] px-3 py-2.5 text-[0.875rem] font-medium transition',
                    pathname === profilePath
                      ? 'bg-emerald-600/10 text-emerald-600 font-semibold'
                      : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900',
                  ].join(' ')}
                >
                  <UserCircle size={18} />
                  <span>My Profile</span>
                </Link>
                <button
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
  )
}
