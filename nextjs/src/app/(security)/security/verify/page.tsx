'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, Search, CheckCircle2, XCircle, Loader2, ScanLine } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import dynamic from 'next/dynamic'

const QrScanner = dynamic(() => import('@/components/QrScanner'), { ssr: false })

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
  const [scanning, setScanning] = useState(false)
  const supabase = createClient()

  const doLookup = async (visitCode: string) => {
    setLoading(true)
    setError('')
    setResult(null)
    setVerified(false)

    const { data, error: qErr } = await supabase
      .from('visit_requests')
      .select('id, visitor_name, visit_code, visit_date, visit_time, purpose, status, resident_name')
      .eq('visit_code', visitCode.trim().toUpperCase())
      .single()

    if (qErr || !data) { setError('No pass found for this code.'); setLoading(false); return }
    setResult(data)
    setLoading(false)
  }

  const lookup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return
    await doLookup(code)
  }

  const handleScan = (scannedCode: string) => {
    setScanning(false)
    setCode(scannedCode)
    doLookup(scannedCode)
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

  const statusLabel: Record<string, { text: string; color: string }> = {
    Approved: { text: 'Approved', color: 'text-[#4caf6e]' },
    Verified: { text: 'Verified', color: 'text-zinc-500' },
    Expired: { text: 'Expired', color: 'text-zinc-400' },
    Rejected: { text: 'Rejected', color: 'text-rose-500' },
  }

  return (
    <>
      <header className="mb-8">
        <p className="text-[0.7rem] font-semibold text-zinc-400 tracking-[0.14em] uppercase mb-1">Security</p>
        <h1 className="text-[1.85rem] font-bold text-zinc-900 tracking-[-0.03em]">Verify Visitor</h1>
      </header>

      <div className="max-w-md">
        {/* Search bar + scan button */}
        <form onSubmit={lookup} className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-300 w-4 h-4" />
            <input
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="Enter visit code"
              className="w-full pl-6 pr-3 py-2.5 text-[0.9rem] font-mono text-zinc-900 bg-transparent border-0 border-b border-zinc-200 outline-none focus:border-zinc-900 transition-colors placeholder:text-zinc-300"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="px-5 py-2.5 text-[0.82rem] font-semibold text-white bg-zinc-900 hover:bg-zinc-800 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : 'Look up'}
          </button>
        </form>

        {/* Scan QR toggle */}
        <button
          type="button"
          onClick={() => setScanning(v => !v)}
          className={`flex items-center gap-2 mb-6 text-[0.82rem] font-semibold transition-colors ${scanning ? 'text-rose-500' : 'text-[#4caf6e]'}`}
        >
          <ScanLine size={15} />
          {scanning ? 'Close Scanner' : 'Scan QR Code'}
        </button>

        {/* Camera scanner */}
        <AnimatePresence>
          {scanning && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="mb-6"
            >
              <QrScanner onScan={handleScan} onClose={() => setScanning(false)} />
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <p className="text-[0.82rem] text-rose-500 mb-5">{error}</p>
        )}

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-zinc-100 bg-white"
            >
              <div className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between">
                <div>
                  <div className="text-[1rem] font-bold text-zinc-900">{result.visitor_name}</div>
                  <div className="text-[0.75rem] font-mono text-zinc-400 mt-0.5">{result.visit_code}</div>
                </div>
                <span className={`text-[0.75rem] font-semibold tracking-wide ${(statusLabel[result.status] ?? statusLabel['Expired']).color}`}>
                  {(statusLabel[result.status] ?? { text: result.status }).text}
                </span>
              </div>

              <div className="px-6 py-5 space-y-3">
                {[
                  ['Resident', result.resident_name ?? '—'],
                  ['Date', result.visit_date],
                  ['Time', result.visit_time ?? '—'],
                  ['Purpose', result.purpose ?? '—'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between text-[0.85rem]">
                    <span className="text-zinc-400">{label}</span>
                    <span className="font-medium text-zinc-800">{value}</span>
                  </div>
                ))}
              </div>

              <div className="px-6 pb-5">
                {result.status === 'Approved' && !verified && (
                  <button
                    onClick={handleVerify}
                    disabled={verifying}
                    className="w-full flex items-center justify-center gap-2 py-3 text-[0.88rem] font-semibold text-white bg-zinc-900 hover:bg-zinc-800 transition-colors disabled:opacity-60"
                  >
                    {verifying ? <Loader2 size={15} className="animate-spin" /> : <ShieldCheck size={15} />}
                    {verifying ? 'Verifying…' : 'Mark as Verified'}
                  </button>
                )}
                {(result.status === 'Verified' || verified) && (
                  <div className="w-full flex items-center justify-center gap-2 py-3 text-[0.88rem] font-semibold text-[#4caf6e] border border-zinc-100 bg-zinc-50">
                    <CheckCircle2 size={15} /> Access Verified
                  </div>
                )}
                {result.status === 'Expired' && (
                  <div className="w-full flex items-center justify-center gap-2 py-3 text-[0.88rem] font-semibold text-zinc-400 border border-zinc-100 bg-zinc-50">
                    <XCircle size={15} /> Pass Expired — Access Denied
                  </div>
                )}
                {result.status === 'Rejected' && (
                  <div className="w-full flex items-center justify-center gap-2 py-3 text-[0.88rem] font-semibold text-rose-500 border border-zinc-100 bg-zinc-50">
                    <XCircle size={15} /> Pass Rejected — Access Denied
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
