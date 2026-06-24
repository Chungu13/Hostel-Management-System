'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ShieldCheck, Search, Plus, Loader2, X, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Staff = { id: string; name: string; email: string; phone?: string; gender?: string; on_duty: boolean }
interface Props { propertyId: string; staff: Staff[] }

export default function StaffClient({ propertyId, staff: initial }: Props) {
  const [staff, setStaff] = useState(initial)
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', gender: 'Male' })
  const [error, setError] = useState('')
  const supabase = createClient()

  const filtered = staff.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase())
  )

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { data, error: err } = await supabase.from('security_staff').insert({ ...form, property_id: propertyId, approved: true, on_duty: false }).select().single()
    if (err || !data) { setError('Failed to add staff.'); setLoading(false); return }
    setStaff(s => [data, ...s])
    setShowAdd(false)
    setForm({ name: '', email: '', phone: '', gender: 'Male' })
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    await supabase.from('security_staff').delete().eq('id', id)
    setStaff(s => s.filter(x => x.id !== id))
  }

  return (
    <>
      <header className="mb-7 flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2"><ShieldCheck size={24} className="text-zinc-400" /><span className="text-black">Security Staff</span></h1>
          <p className="mt-1 text-sm text-zinc-400">Manage your security team.</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition">
          <Plus size={16} /> Add Staff
        </button>
      </header>

      <div className="mb-5 relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-300 w-4 h-4" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search staff…" className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-zinc-200 rounded-xl outline-none focus:border-emerald-500 transition" />
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center py-12">
          <ShieldCheck size={32} className="text-zinc-200 mx-auto mb-3" />
          <p className="text-sm text-zinc-400">No staff found.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 max-w-2xl">
          {filtered.map(s => (
            <div key={s.id} className="card flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-600 font-bold text-sm">{s.name[0]}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-zinc-900">{s.name}</div>
                <div className="text-xs text-zinc-400">{s.email}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${s.on_duty ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-zinc-100 text-zinc-400'}`}>
                  {s.on_duty ? '● On Duty' : '○ Off Duty'}
                </span>
                <button onClick={() => handleDelete(s.id)} className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-50 transition">
                  <Trash2 size={14} />
                </button>
              </div>
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
                <h3 className="text-lg font-bold text-zinc-900">Add Security Staff</h3>
                <button onClick={() => setShowAdd(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-100 hover:bg-zinc-200 transition"><X size={16} /></button>
              </div>
              <form onSubmit={handleAdd} className="flex flex-col gap-3">
                {[
                  { label: 'Full Name', key: 'name', type: 'text', placeholder: 'John Security', required: true },
                  { label: 'Email', key: 'email', type: 'email', placeholder: 'john@example.com', required: true },
                  { label: 'Phone', key: 'phone', type: 'text', placeholder: '+260XXXXXXXXX', required: false },
                ].map(({ label, key, type, placeholder, required }) => (
                  <div key={key} className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{label}</label>
                    <input type={type} value={form[key as keyof typeof form]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} placeholder={placeholder} required={required} className="w-full px-3 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-emerald-500 focus:bg-white transition" />
                  </div>
                ))}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Gender</label>
                  <select value={form.gender} onChange={e => setForm(p => ({ ...p, gender: e.target.value }))} className="w-full px-3 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-emerald-500 transition">
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
                {error && <p className="text-sm text-rose-500 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">{error}</p>}
                <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition disabled:opacity-60">
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  {loading ? 'Adding…' : 'Add Staff'}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
