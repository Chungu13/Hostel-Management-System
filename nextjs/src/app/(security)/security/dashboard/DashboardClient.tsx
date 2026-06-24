'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, CheckCircle2, Clock, Users, ToggleLeft, ToggleRight, Calendar } from 'lucide-react'
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

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <>
      <header className="mb-9 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="page-title">Hello, <span className="text-black">{profile?.full_name || profile?.email}</span></h1>
          <p className="m-0 text-sm text-zinc-400">Monitor and verify visitor access.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3.5 py-2 text-[0.8rem] font-medium text-zinc-500 shadow-sm">
            <Calendar size={14} />{todayLabel}
          </div>
          <button
            onClick={toggleDuty}
            disabled={toggling}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition ${staff?.on_duty ? 'bg-emerald-600 text-white shadow-[0_4px_12px_rgba(16,185,129,0.3)]' : 'bg-zinc-100 text-zinc-600'}`}
          >
            {staff?.on_duty ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
            {staff?.on_duty ? 'On Duty' : 'Off Duty'}
          </button>
        </div>
      </header>

      <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: 'Total Verified', value: stats.verified, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-600/10', bar: 'from-emerald-600 to-emerald-300' },
          { label: 'Verified Today', value: stats.todayVerified, icon: Clock, color: 'text-sky-500', bg: 'bg-sky-500/10', bar: 'from-sky-400 to-sky-200' },
          { label: 'Staff On Duty', value: stats.onDutyCount, icon: Users, color: 'text-violet-500', bg: 'bg-violet-500/10', bar: 'from-violet-400 to-violet-200' },
        ].map(({ label, value, icon: Icon, color, bg, bar }) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-md border border-black/5 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.04)]"
          >
            <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-md ${bg}`}>
              <Icon size={20} className={color} />
            </div>
            <div className="mb-1 text-[2rem] font-bold tracking-[-0.03em] leading-none text-zinc-900">{value}</div>
            <div className="text-[0.8rem] text-zinc-400">{label}</div>
            <div className={`absolute bottom-0 left-0 right-0 h-[3px] rounded-b-[18px] bg-gradient-to-r ${bar}`} />
          </motion.div>
        ))}
      </div>

      <div className="card max-w-md">
        <h2 className="section-title mb-4">Quick Actions</h2>
        <a href="/security/verify" className="flex items-center gap-3 p-4 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition group">
          <div className="w-10 h-10 rounded bg-white/20 flex items-center justify-center">
            <ShieldCheck size={20} />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-sm">Verify Visitor</div>
            <div className="text-xs opacity-80">Scan QR code at gate</div>
          </div>
        </a>
      </div>
    </>
  )
}
