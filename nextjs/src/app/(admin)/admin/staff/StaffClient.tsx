'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, Plus, Loader2, X, Trash2, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Staff = { id: string; name: string; email: string; phone?: string; gender?: string; on_duty: boolean; passkey?: string }
interface Props { propertyId: string; staff: Staff[] }

export default function StaffClient({ propertyId, staff: initial }: Props) {
  const [staff, setStaff] = useState(initial)
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPasskey, setShowPasskey] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', gender: 'Male', passkey: '' })
  const [error, setError] = useState('')
  const supabase = createClient()

  const filtered = staff.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  )

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/admin/create-staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    const result = await res.json()
    if (!res.ok) { setError(result.error ?? 'Failed to add staff.'); setLoading(false); return }

    setStaff(s => [result.staff, ...s])
    setShowAdd(false)
    setForm({ name: '', email: '', phone: '', gender: 'Male', passkey: '' })
    setShowPasskey(false)
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    await supabase.from('security_staff').delete().eq('id', id)
    setStaff(s => s.filter(x => x.id !== id))
  }

  return (
    <>
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.7rem] font-semibold text-zinc-400 tracking-[0.14em] uppercase mb-1">Admin</p>
          <h1 className="text-[1.85rem] font-bold text-zinc-900 tracking-[-0.03em]">Security Staff</h1>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-[0.82rem] font-semibold text-white bg-zinc-900 hover:bg-zinc-800 transition-colors"
        >
          <Plus size={14} /> Add Staff
        </button>
      </header>

      <div className="mb-6 relative max-w-xs">
        <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-300 w-4 h-4" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search staff..."
          className="w-full pl-6 pr-3 py-2.5 text-[0.875rem] bg-transparent border-0 border-b border-zinc-200 outline-none focus:border-zinc-900 transition-colors placeholder:text-zinc-300"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-[0.875rem] text-zinc-400 py-10">No staff found.</p>
      ) : (
        <div className="border border-zinc-100 divide-y divide-zinc-100 bg-white max-w-2xl">
          {filtered.map(s => (
            <div key={s.id} className="flex items-center gap-4 px-5 py-4">
              <div className="w-8 h-8 bg-zinc-100 flex items-center justify-center text-[0.8rem] font-bold text-zinc-700 shrink-0">
                {s.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[0.88rem] font-semibold text-zinc-900">{s.name}</div>
                <div className="text-[0.75rem] text-zinc-400">{s.email}</div>
              </div>
              {s.passkey && (
                <div className="text-[0.75rem] text-zinc-400 font-mono bg-zinc-50 border border-zinc-100 px-2 py-1">
                  {s.passkey}
                </div>
              )}
              <span className={`text-[0.72rem] font-semibold tracking-wide ${s.on_duty ? 'text-[#4caf6e]' : 'text-zinc-300'}`}>
                {s.on_duty ? 'On Duty' : 'Off Duty'}
              </span>
              <button
                onClick={() => handleDelete(s.id)}
                className="w-7 h-7 flex items-center justify-center text-zinc-300 hover:text-rose-500 transition-colors"
              >
                <Trash2 size={13} />
              </button>
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
                <h3 className="text-[1.1rem] font-bold text-zinc-900 tracking-tight">Add Security Staff</h3>
                <button onClick={() => setShowAdd(false)} className="w-7 h-7 flex items-center justify-center border border-zinc-200 hover:bg-zinc-50 transition">
                  <X size={13} className="text-zinc-500" />
                </button>
              </div>
              <form onSubmit={handleAdd} className="flex flex-col gap-6">
                {[
                  { label: 'Full Name', key: 'name', type: 'text', placeholder: 'John Security', required: true },
                  { label: 'Email (optional)', key: 'email', type: 'email', placeholder: 'john@example.com', required: false },
                  { label: 'Phone (optional)', key: 'phone', type: 'text', placeholder: '+260 XXXXXXXXX', required: false },
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

                <div>
                  <label className="block text-[0.7rem] font-semibold text-zinc-400 tracking-[0.12em] uppercase mb-2">
                    Passkey <span className="text-zinc-300 normal-case tracking-normal font-normal">— staff uses this to log in</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPasskey ? 'text' : 'password'}
                      value={form.passkey}
                      onChange={e => setForm(p => ({ ...p, passkey: e.target.value }))}
                      placeholder="Set a passkey"
                      required
                      className="w-full bg-transparent border-0 border-b border-zinc-200 px-0 py-2.5 pr-8 text-[0.9rem] text-zinc-900 outline-none focus:border-zinc-900 transition-colors placeholder:text-zinc-300"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasskey(v => !v)}
                      className="absolute right-0 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-zinc-600 transition-colors"
                    >
                      {showPasskey ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {error && <p className="text-[0.82rem] text-rose-500">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 bg-zinc-900 text-white text-[0.88rem] font-semibold hover:bg-zinc-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 size={14} className="animate-spin" />}
                  {loading ? 'Creating account...' : 'Add Staff'}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
