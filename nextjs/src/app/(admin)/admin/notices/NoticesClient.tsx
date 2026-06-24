'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell, Plus, Loader2, X, Trash2, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Notice = { id: string; title: string; content: string; importance: string; updated_at: string }
interface Props { propertyId: string; notices: Notice[] }

export default function NoticesClient({ propertyId, notices: initial }: Props) {
  const [notices, setNotices] = useState(initial)
  const [showAdd, setShowAdd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ title: '', content: '', importance: 'Low' })
  const [error, setError] = useState('')
  const supabase = createClient()

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: err } = await supabase
      .from('notices')
      .insert({ ...form, property_id: propertyId, updated_at: new Date().toISOString() })
      .select()
      .single()

    if (err || !data) { setError('Failed to publish notice.'); setLoading(false); return }
    setNotices(n => [data, ...n])
    setShowAdd(false)
    setForm({ title: '', content: '', importance: 'Low' })
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    await supabase.from('notices').delete().eq('id', id)
    setNotices(n => n.filter(x => x.id !== id))
  }

  const importanceColor: Record<string, string> = {
    High: 'bg-rose-50 text-rose-600 border-rose-200',
    Medium: 'bg-amber-50 text-amber-600 border-amber-200',
    Low: 'bg-zinc-100 text-zinc-500 border-zinc-200',
  }

  return (
    <>
      <header className="mb-7 flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2"><Bell size={24} className="text-zinc-400" /><span className="text-black">Notices</span></h1>
          <p className="mt-1 text-sm text-zinc-400">Publish announcements to all residents.</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition">
          <Plus size={16} /> New Notice
        </button>
      </header>

      {notices.length === 0 ? (
        <div className="card text-center py-12">
          <Bell size={32} className="text-zinc-200 mx-auto mb-3" />
          <p className="text-sm text-zinc-400">No notices published yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 max-w-2xl">
          {notices.map(n => (
            <div key={n.id} className="card">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} className={n.importance === 'High' ? 'text-rose-500' : n.importance === 'Medium' ? 'text-amber-500' : 'text-zinc-400'} />
                  <span className="font-semibold text-zinc-900">{n.title}</span>
                  <span className={`text-[0.65rem] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide ${importanceColor[n.importance] ?? importanceColor.Low}`}>{n.importance}</span>
                </div>
                <button onClick={() => handleDelete(n.id)} className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-50 transition">
                  <Trash2 size={14} />
                </button>
              </div>
              <p className="text-sm text-zinc-600 leading-relaxed mb-2">{n.content}</p>
              <div className="text-xs text-zinc-400">{new Date(n.updated_at).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showAdd && (
          <>
            <motion.div className="fixed inset-0 z-[400] bg-black/30 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAdd(false)} />
            <motion.div className="fixed inset-x-4 top-1/2 z-[500] bg-white rounded-[24px] p-6 max-w-md mx-auto -translate-y-1/2" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-zinc-900">Publish Notice</h3>
                <button onClick={() => setShowAdd(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-100 hover:bg-zinc-200 transition"><X size={16} /></button>
              </div>
              <form onSubmit={handlePublish} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Title</label>
                  <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Notice title" required className="w-full px-3 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-emerald-500 focus:bg-white transition" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Content</label>
                  <textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} placeholder="Notice content…" required rows={4} className="w-full px-3 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-emerald-500 focus:bg-white transition resize-none" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Importance</label>
                  <select value={form.importance} onChange={e => setForm(p => ({ ...p, importance: e.target.value }))} className="w-full px-3 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-emerald-500 transition">
                    <option>Low</option><option>Medium</option><option>High</option>
                  </select>
                </div>
                {error && <p className="text-sm text-rose-500 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">{error}</p>}
                <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition disabled:opacity-60">
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Bell size={16} />}
                  {loading ? 'Publishing…' : 'Publish Notice'}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
