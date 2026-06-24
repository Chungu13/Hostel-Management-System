'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Clock, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function PendingApprovalPage() {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-white">
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm text-center"
      >
        <div className="flex items-center justify-center gap-2.5 mb-14">
          <div className="w-7 h-7 rounded bg-[#4caf6e] flex items-center justify-center">
            <span className="text-white text-[0.8rem] font-bold">M</span>
          </div>
          <span className="text-zinc-900 text-[1rem] font-semibold tracking-tight">Malo</span>
        </div>
        <div className="w-12 h-12 border border-zinc-200 flex items-center justify-center mx-auto mb-6">
          <Clock size={22} className="text-zinc-400" />
        </div>
        <h1 className="text-[1.5rem] font-bold text-zinc-900 mb-3 tracking-[-0.02em]">Awaiting Approval</h1>
        <p className="text-[0.875rem] text-zinc-400 leading-relaxed mb-10">
          Your account is pending approval from your property administrator.
          You&apos;ll receive access once approved.
        </p>
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 text-[0.82rem] font-medium text-zinc-400 hover:text-zinc-900 transition-colors"
        >
          <LogOut size={14} /> Sign out
        </button>
      </motion.div>
    </div>
  )
}
