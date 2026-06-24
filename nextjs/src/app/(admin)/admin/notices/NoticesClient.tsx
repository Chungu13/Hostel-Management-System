'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, Loader2, X, Trash2 } from 'lucide-react'
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
    if (err || !data) { setError(err?.message ?? 'Failed to publish notice.'); setLoading(false); return }
    setNotices(n => [data, ...n])
    setShowAdd(false)
    setForm({ title: '', content: '', importance: 'Low' })
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    await supabase.from('notices').delete().eq('id', id)
    setNotices(n => n.filter(x => x.id !== id))
  }

  const importanceDot: Record<string, string> = {
    High: 'bg-rose-500',
    Medium: 'bg-amber-400',
    Low: 'bg-zinc-300',
  }

  return (
    <>
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.7rem] font-semibold text-zinc-400 tracking-[0.14em] uppercase mb-1">Admin</p>
          <h1 className="text-[1.85rem] font-bold text-zinc-900 tracking-[-0.03em]">Notices</h1>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-[0.82rem] font-semibold text-white bg-zinc-900 hover:bg-zinc-800 transition-colors"
        >
          <Plus size={14} /> New Notice
        </button>
      </header>

      {notices.length === 0 ? (
        <p className="text-[0.875rem] text-zinc-400 py-10">No notices published yet.</p>
      ) : (
        <div className="flex flex-col gap-px max-w-2xl">
          {notices.map(n => (
            <div key={n.id} className="bg-white border border-zinc-100 px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 mt-0.5 ${importanceDot[n.importance] ?? importanceDot.Low}`} />
                  <span className="text-[0.88rem] font-semibold text-zinc-900 truncate">{n.title}</span>
                  <span className="text-[0.68rem] font-semibold text-zinc-400 tracking-widest uppercase shrink-0">{n.importance}</span>
                </div>
                <button
                  onClick={() => handleDelete(n.id)}
                  className="w-7 h-7 flex items-center justify-center text-zinc-300 hover:text-rose-500 transition-colors shrink-0"
                >
                  <Trash2 size={13} />
                </button>
              </div>
              <p className="text-[0.82rem] text-zinc-500 leading-relaxed mt-2 ml-4">{n.content}</p>
              <p className="text-[0.72rem] text-zinc-300 mt-2 ml-4">
                {new Date(n.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showAdd && (
          <>
            <motion.div
              className="fixed inset-0 z-[400] bg-black/20"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowAdd(false)}
            />
            <motion.div
              className="fixed inset-x-4 top-1/2 z-[500] bg-white p-8 max-w-md mx-auto -translate-y-1/2 shadow-lg"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-[1.1rem] font-bold text-zinc-900 tracking-tight">Publish Notice</h3>
                <button onClick={() => setShowAdd(false)} className="w-7 h-7 flex items-center justify-center border border-zinc-200 hover:bg-zinc-50 transition">
                  <X size={13} className="text-zinc-500" />
                </button>
              </div>
              <form onSubmit={handlePublish} className="flex flex-col gap-6">
                <div>
                  <label className="block text-[0.7rem] font-semibold text-zinc-400 tracking-[0.12em] uppercase mb-2">Title</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                    placeholder="Notice title"
                    required
                    className="w-full bg-transparent border-0 border-b border-zinc-200 px-0 py-2.5 text-[0.9rem] text-zinc-900 outline-none focus:border-zinc-900 transition-colors placeholder:text-zinc-300"
                  />
                </div>
                <div>
                  <label className="block text-[0.7rem] font-semibold text-zinc-400 tracking-[0.12em] uppercase mb-2">Content</label>
                  <textarea
                    value={form.content}
                    onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                    placeholder="Write your notice..."
                    required
                    rows={4}
                    className="w-full bg-transparent border-0 border-b border-zinc-200 px-0 py-2.5 text-[0.9rem] text-zinc-900 outline-none focus:border-zinc-900 transition-colors resize-none placeholder:text-zinc-300"
                  />
                </div>
                <div>
                  <label className="block text-[0.7rem] font-semibold text-zinc-400 tracking-[0.12em] uppercase mb-2">Importance</label>
                  <select
                    value={form.importance}
                    onChange={e => setForm(p => ({ ...p, importance: e.target.value }))}
                    className="w-full bg-transparent border-0 border-b border-zinc-200 px-0 py-2.5 text-[0.9rem] text-zinc-900 outline-none focus:border-zinc-900 transition-colors"
                  >
                    <option>Low</option><option>Medium</option><option>High</option>
                  </select>
                </div>
                {error && <p className="text-[0.82rem] text-rose-500">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 bg-zinc-900 text-white text-[0.88rem] font-semibold hover:bg-zinc-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 size={14} className="animate-spin" />}
                  {loading ? 'Publishing...' : 'Publish Notice'}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
