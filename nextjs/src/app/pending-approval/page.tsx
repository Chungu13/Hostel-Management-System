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
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#f7f7f5]"
      style={{ backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(134,197,152,0.12) 0%, transparent 50%)' }}>
      <motion.div
        initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-[24px] px-8 py-12 text-center shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_32px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.04)]"
      >
        <div className="w-16 h-16 rounded-full bg-amber-50 border-2 border-amber-300 flex items-center justify-center mx-auto mb-5">
          <Clock size={28} className="text-amber-500 animate-pulse" />
        </div>
        <h1 className="text-2xl font-bold text-zinc-900 mb-3 tracking-[-0.02em]">Awaiting Approval</h1>
        <p className="text-sm text-zinc-500 leading-relaxed mb-8">
          Your account is pending approval from your property administrator.
          You&apos;ll receive access once approved. Please check back later.
        </p>
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 mx-auto text-sm font-medium text-zinc-500 hover:text-rose-500 transition"
        >
          <LogOut size={16} /> Sign out
        </button>
      </motion.div>
    </div>
  )
}
