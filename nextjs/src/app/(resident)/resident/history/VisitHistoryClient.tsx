'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { History, Search, CheckCircle2, XCircle, Clock, AlertCircle, X, Calendar } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'

type Visit = {
  id: string
  visitor_name: string
  visit_code: string
  visit_date: string
  visit_time?: string
  purpose?: string
  status: string
  request_date: string
}

const statusConfig: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  Approved: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', icon: <CheckCircle2 size={14} /> },
  Verified: { bg: 'bg-sky-50 border-sky-200', text: 'text-sky-700', icon: <CheckCircle2 size={14} /> },
  Pending: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', icon: <Clock size={14} /> },
  Rejected: { bg: 'bg-rose-50 border-rose-200', text: 'text-rose-700', icon: <XCircle size={14} /> },
  Expired: { bg: 'bg-zinc-100 border-zinc-200', text: 'text-zinc-500', icon: <AlertCircle size={14} /> },
}

export default function VisitHistoryClient({ visits }: { visits: Visit[] }) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Visit | null>(null)

  const filtered = visits.filter(v =>
    v.visitor_name.toLowerCase().includes(search.toLowerCase()) ||
    v.visit_code.toLowerCase().includes(search.toLowerCase())
  )

  const cfg = (status: string) => statusConfig[status] ?? statusConfig.Pending

  return (
    <>
      <header className="mb-7">
        <h1 className="page-title flex items-center gap-2"><History size={24} className="text-zinc-400" /><span className="text-black">Visit History</span></h1>
        <p className="mt-1 text-sm text-zinc-400">All your guest passes in one place.</p>
      </header>

      <div className="mb-5 relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-300 w-4 h-4" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by visitor or code…"
          className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-zinc-200 rounded-xl outline-none focus:border-emerald-500 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.1)] transition"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center py-12">
          <History size={32} className="text-zinc-200 mx-auto mb-3" />
          <p className="text-sm font-medium text-zinc-400">No visit records found.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(visit => {
            const c = cfg(visit.status)
            return (
              <motion.div
                key={visit.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelected(visit)}
                className="card cursor-pointer hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-shadow flex items-center gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-zinc-900 truncate">{visit.visitor_name}</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.7rem] font-semibold border ${c.bg} ${c.text}`}>
                      {c.icon} {visit.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-zinc-400">
                    <span className="flex items-center gap-1"><Calendar size={11} />{visit.visit_date}</span>
                    <span className="font-mono font-medium text-zinc-500">{visit.visit_code}</span>
                  </div>
                </div>
                <div className="text-xs text-zinc-300 font-mono">{visit.visit_code}</div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Visit Detail Modal */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              className="fixed inset-0 z-[400] bg-black/30 backdrop-blur-sm"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
            />
            <motion.div
              className="fixed inset-x-4 bottom-0 z-[500] bg-white rounded-t-[24px] p-6 pb-10 max-w-md mx-auto md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-[24px] md:max-w-sm md:w-full"
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-zinc-900">{selected.visitor_name}</h3>
                <button onClick={() => setSelected(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-100 hover:bg-zinc-200 transition">
                  <X size={16} />
                </button>
              </div>

              <div className="flex justify-center mb-5">
                <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-100">
                  <QRCodeSVG value={selected.visit_code} size={140} />
                </div>
              </div>

              <div className="space-y-2 text-sm">
                {[
                  ['Code', selected.visit_code],
                  ['Date', selected.visit_date],
                  ['Time', selected.visit_time ?? '—'],
                  ['Purpose', selected.purpose ?? '—'],
                  ['Status', selected.status],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-zinc-400">{label}</span>
                    <span className="font-medium text-zinc-800">{value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
