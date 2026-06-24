'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, Search, CheckCircle2, XCircle, User, Calendar, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type VisitResult = {
  id: string
  visitor_name: string
  visit_code: string
  visit_date: string
  visit_time?: string
  purpose?: string
  status: string
  resident_name?: string
}

export default function VerifyVisitorPage() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<VisitResult | null>(null)
  const [error, setError] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [verified, setVerified] = useState(false)
  const supabase = createClient()

  const lookup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    setVerified(false)

    const { data, error: qErr } = await supabase
      .from('visit_requests')
      .select('id, visitor_name, visit_code, visit_date, visit_time, purpose, status, resident_name')
      .eq('visit_code', code.trim().toUpperCase())
      .single()

    if (qErr || !data) { setError('No pass found for this code.'); setLoading(false); return }
    setResult(data)
    setLoading(false)
  }

  const handleVerify = async () => {
    if (!result) return
    setVerifying(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase.from('users').select('property_id').eq('id', user.id).single()
    const { data: staff } = await supabase.from('security_staff').select('id').eq('user_id', user.id).single()

    await Promise.all([
      supabase.from('visit_requests').update({ status: 'Verified' }).eq('id', result.id),
      supabase.from('verified_visitors').insert({
        security_staff_id: staff?.id,
        resident_name: result.resident_name,
        visit_code: result.visit_code,
        status: 'Verified',
        property_id: profile?.property_id,
      }),
    ])

    setResult(r => r ? { ...r, status: 'Verified' } : r)
    setVerified(true)
    setVerifying(false)
  }

  const statusColor = {
    Approved: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    Verified: 'text-sky-600 bg-sky-50 border-sky-200',
    Expired: 'text-zinc-500 bg-zinc-100 border-zinc-200',
    Rejected: 'text-rose-600 bg-rose-50 border-rose-200',
  }

  return (
    <>
      <header className="mb-9">
        <h1 className="page-title"><span className="text-black">Verify Visitor</span></h1>
        <p className="mt-1 text-sm text-zinc-400">Enter or scan a visitor&apos;s QR code to verify access.</p>
      </header>

      <div className="max-w-md">
        <form onSubmit={lookup} className="card mb-5 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-300 w-4 h-4" />
            <input
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="Enter visit code…"
              className="w-full pl-9 pr-3 py-2.5 text-sm font-mono text-zinc-900 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-emerald-500 focus:bg-white focus:shadow-[0_0_0_3px_rgba(16,185,129,0.1)] transition"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="px-4 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : 'Look up'}
          </button>
        </form>

        {error && (
          <div className="card bg-rose-50 border-rose-200 text-rose-700 text-sm flex items-center gap-2 mb-5">
            <XCircle size={16} /> {error}
          </div>
        )}

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-zinc-900">{result.visitor_name}</h3>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusColor[result.status as keyof typeof statusColor] ?? 'text-zinc-500 bg-zinc-100 border-zinc-200'}`}>
                  {result.status === 'Approved' || result.status === 'Verified' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                  {result.status}
                </span>
              </div>

              <div className="space-y-2 text-sm mb-5">
                {[
                  ['Code', result.visit_code],
                  ['Resident', result.resident_name ?? '—'],
                  ['Date', result.visit_date],
                  ['Time', result.visit_time ?? '—'],
                  ['Purpose', result.purpose ?? '—'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-zinc-400">{label}</span>
                    <span className="font-medium text-zinc-800">{value}</span>
                  </div>
                ))}
              </div>

              {result.status === 'Approved' && !verified && (
                <button
                  onClick={handleVerify}
                  disabled={verifying}
                  className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition disabled:opacity-60"
                >
                  {verifying ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                  {verifying ? 'Verifying…' : 'Mark as Verified'}
                </button>
              )}
              {(result.status === 'Verified' || verified) && (
                <div className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-emerald-700 bg-emerald-50 rounded-xl border border-emerald-200">
                  <CheckCircle2 size={16} /> Access Verified
                </div>
              )}
              {result.status === 'Expired' && (
                <div className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-zinc-500 bg-zinc-100 rounded-xl">
                  Pass Expired — Access Denied
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
