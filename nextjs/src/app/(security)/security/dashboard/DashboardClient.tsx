'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, ToggleLeft, ToggleRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function SecurityDashboard() {
  const [profile, setProfile] = useState<any>(null)
  const [staff, setStaff] = useState<any>(null)
  const [stats, setStats] = useState({ verified: 0, todayVerified: 0, onDutyCount: 0 })
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [{ data: p }, { data: s }] = await Promise.all([
        supabase.from('users').select('full_name, email, property_id').eq('id', user.id).single(),
        supabase.from('security_staff').select('id, on_duty').eq('user_id', user.id).single(),
      ])

      setProfile(p)
      setStaff(s)

      if (p?.property_id) {
        const today = new Date().toISOString().split('T')[0]
        const [{ count: verified }, { count: todayVerified }, { count: onDutyCount }] = await Promise.all([
          supabase.from('verified_visitors').select('*', { count: 'exact', head: true }).eq('property_id', p.property_id),
          supabase.from('verified_visitors').select('*', { count: 'exact', head: true }).eq('property_id', p.property_id).gte('verified_at', today),
          supabase.from('security_staff').select('*', { count: 'exact', head: true }).eq('property_id', p.property_id).eq('on_duty', true),
        ])
        setStats({ verified: verified ?? 0, todayVerified: todayVerified ?? 0, onDutyCount: onDutyCount ?? 0 })
      }
      setLoading(false)
    }
    load()
  }, [])

  const toggleDuty = async () => {
    if (!staff) return
    setToggling(true)
    await supabase.from('security_staff').update({ on_duty: !staff.on_duty }).eq('id', staff.id)
    setStaff((s: any) => ({ ...s, on_duty: !s.on_duty }))
    setToggling(false)
  }

  const todayLabel = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-5 h-5 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <>
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[0.7rem] font-semibold text-zinc-400 tracking-[0.14em] uppercase mb-1">Security</p>
          <h1 className="text-[1.85rem] font-bold text-zinc-900 tracking-[-0.03em]">
            Hello, {profile?.full_name || profile?.email}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[0.78rem] text-zinc-400">{todayLabel}</span>
          <button
            onClick={toggleDuty}
            disabled={toggling}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-[0.82rem] font-semibold transition-colors disabled:opacity-50 ${
              staff?.on_duty
                ? 'bg-[#4caf6e] text-white hover:bg-[#3d9e5f]'
                : 'border border-zinc-200 text-zinc-600 hover:border-zinc-400'
            }`}
          >
            {staff?.on_duty ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
            {staff?.on_duty ? 'On Duty' : 'Go On Duty'}
          </button>
        </div>
      </header>

      <div className="mb-8 grid grid-cols-3 gap-px bg-zinc-100 border border-zinc-100 max-w-2xl">
        {[
          { label: 'Total Verified', value: stats.verified },
          { label: 'Verified Today', value: stats.todayVerified },
          { label: 'Staff On Duty', value: stats.onDutyCount },
        ].map(({ label, value }) => (
          <motion.div
            key={label}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white px-6 py-5"
          >
            <div className="text-[2rem] font-bold tracking-[-0.04em] leading-none text-zinc-900 mb-1">{value}</div>
            <div className="text-[0.75rem] text-zinc-400">{label}</div>
          </motion.div>
        ))}
      </div>

      <div className="max-w-sm">
        <p className="text-[0.7rem] font-semibold text-zinc-400 tracking-[0.14em] uppercase mb-3">Quick Actions</p>
        <a
          href="/security/verify"
          className="flex items-center gap-3 px-4 py-4 bg-[#4caf6e] hover:bg-[#3d9e5f] transition-colors"
        >
          <div className="w-9 h-9 bg-white/20 flex items-center justify-center shrink-0">
            <ShieldCheck size={16} className="text-white" />
          </div>
          <div>
            <div className="text-[0.88rem] font-semibold text-white">Verify Visitor</div>
            <div className="text-[0.75rem] text-white/70">Enter a visit code at the gate</div>
          </div>
        </a>
      </div>
    </>
  )
}
