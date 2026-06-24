'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { User, Calendar, Clock, FileText, Loader2, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function RequestVisitPage() {
  const [formData, setFormData] = useState({ visitorName: '', visitDate: '', visitTime: '', purpose: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [visitCode, setVisitCode] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data: profile } = await supabase.from('users').select('property_id, full_name').eq('id', user.id).single()
    const { data: resident } = await supabase.from('residents').select('id').eq('user_id', user.id).single()

    if (!resident) { setError('Resident profile not found. Please complete onboarding.'); setLoading(false); return }

    // Generate 8-char code
    const code = Math.random().toString(36).substring(2, 10).toUpperCase()

    const { error: insertError } = await supabase.from('visit_requests').insert({
      resident_id: resident.id,
      resident_name: profile?.full_name,
      visitor_name: formData.visitorName,
      visit_code: code,
      visit_date: formData.visitDate,
      visit_time: formData.visitTime || null,
      purpose: formData.purpose,
      status: 'Approved',
      property_id: profile?.property_id,
    })

    if (insertError) { setError('Failed to create pass. Please try again.'); setLoading(false); return }

    setVisitCode(code)
    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto">
        <div className="card text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-300 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-emerald-500" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 mb-2">Pass Created!</h2>
          <p className="text-sm text-zinc-500 mb-4">Share this code with your guest.</p>
          <div className="bg-zinc-50 border border-zinc-200 rounded-md p-4 mb-6">
            <div className="text-[2rem] font-bold tracking-[0.15em] text-emerald-600">{visitCode}</div>
            <div className="text-xs text-zinc-400 mt-1">Visit Access Code</div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { setSuccess(false); setFormData({ visitorName: '', visitDate: '', visitTime: '', purpose: '' }) }}
              className="flex-1 py-3 rounded-md border border-zinc-200 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition"
            >
              New Pass
            </button>
            <button
              onClick={() => router.push('/resident/history')}
              className="flex-1 py-3 rounded-md bg-emerald-600 text-sm font-medium text-white hover:bg-emerald-700 transition"
            >
              View History
            </button>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <>
      <header className="mb-9">
        <h1 className="page-title"><span className="text-black">New Visit Pass</span></h1>
        <p className="mt-1 text-sm text-zinc-400">Register a guest for entry to your property.</p>
      </header>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-md">
        <form onSubmit={handleSubmit} className="card flex flex-col gap-5">
          <div className="flex flex-col gap-[6px]">
            <label className="text-[0.78rem] font-medium text-[#555] tracking-[0.06em] uppercase">Visitor Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-300 w-4 h-4 pointer-events-none" />
              <input
                type="text"
                value={formData.visitorName}
                onChange={e => setFormData(p => ({ ...p, visitorName: e.target.value }))}
                className="w-full pl-10 pr-3 py-3 text-sm text-zinc-900 bg-zinc-50 border border-zinc-200 rounded-md outline-none focus:border-emerald-500 focus:bg-white focus:shadow-[0_0_0_3px_rgba(16,185,129,0.1)] transition"
                placeholder="John Doe"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-[6px]">
            <label className="text-[0.78rem] font-medium text-[#555] tracking-[0.06em] uppercase">Visit Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-300 w-4 h-4 pointer-events-none" />
              <input
                type="date"
                value={formData.visitDate}
                onChange={e => setFormData(p => ({ ...p, visitDate: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                className="w-full pl-10 pr-3 py-3 text-sm text-zinc-900 bg-zinc-50 border border-zinc-200 rounded-md outline-none focus:border-emerald-500 focus:bg-white focus:shadow-[0_0_0_3px_rgba(16,185,129,0.1)] transition"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-[6px]">
            <label className="text-[0.78rem] font-medium text-[#555] tracking-[0.06em] uppercase">Visit Time <span className="text-zinc-300 normal-case">(optional)</span></label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-300 w-4 h-4 pointer-events-none" />
              <input
                type="time"
                value={formData.visitTime}
                onChange={e => setFormData(p => ({ ...p, visitTime: e.target.value }))}
                className="w-full pl-10 pr-3 py-3 text-sm text-zinc-900 bg-zinc-50 border border-zinc-200 rounded-md outline-none focus:border-emerald-500 focus:bg-white focus:shadow-[0_0_0_3px_rgba(16,185,129,0.1)] transition"
              />
            </div>
          </div>

          <div className="flex flex-col gap-[6px]">
            <label className="text-[0.78rem] font-medium text-[#555] tracking-[0.06em] uppercase">Purpose</label>
            <div className="relative">
              <FileText className="absolute left-3 top-3.5 text-zinc-300 w-4 h-4 pointer-events-none" />
              <textarea
                value={formData.purpose}
                onChange={e => setFormData(p => ({ ...p, purpose: e.target.value }))}
                className="w-full pl-10 pr-3 py-3 text-sm text-zinc-900 bg-zinc-50 border border-zinc-200 rounded-md outline-none focus:border-emerald-500 focus:bg-white focus:shadow-[0_0_0_3px_rgba(16,185,129,0.1)] transition resize-none"
                placeholder="Family visit, delivery, etc."
                rows={3}
              />
            </div>
          </div>

          {error && <p className="text-[0.82rem] text-rose-500 bg-rose-50 border border-rose-200 rounded-md px-4 py-3">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 text-sm font-semibold text-white rounded-md bg-gradient-to-br from-emerald-600 to-emerald-500 shadow-[0_4px_16px_rgba(16,185,129,0.25)] transition hover:opacity-95 hover:-translate-y-[1px] disabled:opacity-60"
          >
            {loading ? <Loader2 size={17} className="animate-spin" /> : null}
            {loading ? 'Creating Pass…' : 'Create Visit Pass'}
          </button>
        </form>
      </motion.div>
    </>
  )
}
