'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Users, ShieldCheck, LogOut, UserCircle,
  History, FileText, Menu, X, Bell,
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
    if (role === 'Managing Staff') router.push('/admin/login')
    else if (role === 'Security Staff') router.push('/security/login')
    else router.push('/login')
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open menu"
        className="fixed left-5 top-5 z-[300] flex h-10 w-10 items-center justify-center border border-zinc-200 bg-white transition hover:bg-zinc-50"
      >
        <Menu size={17} className="text-zinc-700" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-[400] bg-black/10"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setIsOpen(false)}
            />
            <motion.aside
              className="fixed left-0 top-0 z-[500] flex h-screen w-[256px] flex-col border-r border-zinc-100 bg-white px-4 py-6"
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Brand */}
              <div className="mb-9 flex items-center justify-between px-1">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-[#4caf6e]">
                    <span className="text-[0.9rem] font-bold text-white">M</span>
                  </div>
                  <span className="text-[1.05rem] font-semibold tracking-tight text-zinc-900">Malo</span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex h-7 w-7 items-center justify-center border border-zinc-200 transition hover:bg-zinc-50"
                >
                  <X size={13} className="text-zinc-500" />
                </button>
              </div>

              {/* User card */}
              <div className="mb-7 flex items-center gap-2.5 border-b border-zinc-100 pb-5 px-1">
                <div className="flex h-8 w-8 items-center justify-center bg-zinc-100 text-[0.8rem] font-bold text-zinc-700">
                  {initials}
                </div>
                <div className="min-w-0">
                  <div className="text-[0.85rem] font-semibold leading-tight text-zinc-900 truncate">{name || email}</div>
                  <div className="text-[0.7rem] text-zinc-400">{role}</div>
                </div>
              </div>

              <p className="mb-2 px-1 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-zinc-300">Navigation</p>

              <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto">
                {menuItems.map(item => {
                  const Icon = item.icon
                  const isActive = pathname === item.path
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={() => setIsOpen(false)}
                      className={[
                        'flex items-center gap-2.5 px-3 py-2.5 text-[0.85rem] font-medium transition-colors',
                        isActive
                          ? 'bg-zinc-900 text-white'
                          : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900',
                      ].join(' ')}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </nav>

              <div className="mt-3 border-t border-zinc-100 pt-4 flex flex-col gap-0.5">
                <Link
                  href={profilePath}
                  onClick={() => setIsOpen(false)}
                  className={[
                    'flex items-center gap-2.5 px-3 py-2.5 text-[0.85rem] font-medium transition-colors',
                    pathname === profilePath
                      ? 'bg-zinc-900 text-white'
                      : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900',
                  ].join(' ')}
                >
                  <UserCircle size={16} />
                  <span>My Profile</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 px-3 py-2.5 text-[0.85rem] font-medium text-zinc-400 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
                >
                  <LogOut size={16} />
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
