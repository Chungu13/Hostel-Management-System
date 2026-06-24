'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, Loader2, X, Trash2, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Resident = { id: string; name: string; email: string; phone?: string; room?: string; gender?: string; approved: boolean }
interface Props { propertyId: string; residents: Resident[] }

export default function ResidentsClient({ propertyId, residents: initial }: Props) {
  const [residents, setResidents] = useState(initial)
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', room: '', gender: 'Male' })
  const [error, setError] = useState('')
  const supabase = createClient()

  const filtered = residents.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.email.toLowerCase().includes(search.toLowerCase())
  )

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { data, error: err } = await supabase
      .from('residents')
      .insert({ ...form, property_id: propertyId, approved: false })
      .select()
      .single()
    if (err || !data) { setError(err?.message ?? 'Failed to add resident.'); setLoading(false); return }
    setResidents(r => [data, ...r])
    setShowAdd(false)
    setForm({ name: '', email: '', phone: '', room: '', gender: 'Male' })
    setLoading(false)
  }

  const handleApprove = async (id: string) => {
    await supabase.from('residents').update({ approved: true }).eq('id', id)
    setResidents(rs => rs.map(r => r.id === id ? { ...r, approved: true } : r))
  }

  const handleDelete = async (id: string) => {
    await supabase.from('residents').delete().eq('id', id)
    setResidents(rs => rs.filter(r => r.id !== id))
  }

  return (
    <>
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.7rem] font-semibold text-zinc-400 tracking-[0.14em] uppercase mb-1">Admin</p>
          <h1 className="text-[1.85rem] font-bold text-zinc-900 tracking-[-0.03em]">Residents</h1>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-[0.82rem] font-semibold text-white bg-zinc-900 hover:bg-zinc-800 transition-colors"
        >
          <Plus size={14} /> Add Resident
        </button>
      </header>

      <div className="mb-6 relative max-w-xs">
        <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-300 w-4 h-4" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search residents..."
          className="w-full pl-6 pr-3 py-2.5 text-[0.875rem] bg-transparent border-0 border-b border-zinc-200 outline-none focus:border-zinc-900 transition-colors placeholder:text-zinc-300"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-[0.875rem] text-zinc-400 py-10">No residents found.</p>
      ) : (
        <div className="border border-zinc-100 divide-y divide-zinc-100 bg-white max-w-2xl">
          {filtered.map(r => (
            <div key={r.id} className="flex items-center gap-4 px-5 py-4">
              <div className="w-8 h-8 bg-zinc-100 flex items-center justify-center text-[0.8rem] font-bold text-zinc-700 shrink-0">
                {r.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[0.88rem] font-semibold text-zinc-900">{r.name}</div>
                <div className="text-[0.75rem] text-zinc-400">
                  {r.email}{r.room ? ` · Room ${r.room}` : ''}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {r.approved ? (
                  <span className="text-[0.72rem] font-semibold text-[#4caf6e] tracking-wide">Approved</span>
                ) : (
                  <button
                    onClick={() => handleApprove(r.id)}
                    className="flex items-center gap-1.5 text-[0.75rem] font-semibold text-zinc-500 border border-zinc-200 px-2.5 py-1 hover:bg-zinc-50 transition-colors"
                  >
                    <Check size={11} /> Approve
                  </button>
                )}
                <button
                  onClick={() => handleDelete(r.id)}
                  className="w-7 h-7 flex items-center justify-center text-zinc-300 hover:text-rose-500 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
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
                <h3 className="text-[1.1rem] font-bold text-zinc-900 tracking-tight">Add Resident</h3>
                <button onClick={() => setShowAdd(false)} className="w-7 h-7 flex items-center justify-center border border-zinc-200 hover:bg-zinc-50 transition">
                  <X size={13} className="text-zinc-500" />
                </button>
              </div>
              <form onSubmit={handleAdd} className="flex flex-col gap-6">
                {[
                  { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Jane Doe', required: true },
                  { label: 'Email', key: 'email', type: 'email', placeholder: 'jane@example.com', required: true },
                  { label: 'Phone', key: 'phone', type: 'text', placeholder: '+260 XXXXXXXXX', required: false },
                  { label: 'Room', key: 'room', type: 'text', placeholder: 'A203', required: false },
                ].map(({ label, key, type, placeholder, required }) => (
                  <div key={key}>
                    <label className="block text-[0.7rem] font-semibold text-zinc-400 tracking-[0.12em] uppercase mb-2">{label}</label>
                    <input
                      type={type}
                      value={form[key as keyof typeof form]}
                      onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                      placeholder={placeholder}
                      required={required}
                      className="w-full bg-transparent border-0 border-b border-zinc-200 px-0 py-2.5 text-[0.9rem] text-zinc-900 outline-none focus:border-zinc-900 transition-colors placeholder:text-zinc-300"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-[0.7rem] font-semibold text-zinc-400 tracking-[0.12em] uppercase mb-2">Gender</label>
                  <select
                    value={form.gender}
                    onChange={e => setForm(p => ({ ...p, gender: e.target.value }))}
                    className="w-full bg-transparent border-0 border-b border-zinc-200 px-0 py-2.5 text-[0.9rem] text-zinc-900 outline-none focus:border-zinc-900 transition-colors"
                  >
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
                {error && <p className="text-[0.82rem] text-rose-500">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 bg-zinc-900 text-white text-[0.88rem] font-semibold hover:bg-zinc-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 size={14} className="animate-spin" />}
                  {loading ? 'Adding...' : 'Add Resident'}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
