'use client'

import { useState } from 'react'
import { Loader2, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Props { userId: string; profile: Record<string, any>; staff: Record<string, any> }

export default function SecurityProfileClient({ userId, profile, staff }: Props) {
  const [formData, setFormData] = useState({
    full_name: profile.full_name ?? '',
    phone: profile.phone ?? '',
    ic: profile.ic ?? '',
    address: profile.address ?? '',
    gender: staff.gender ?? '',
  })
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const [{ error: e1 }, { error: e2 }] = await Promise.all([
      supabase.from('users').update({ full_name: formData.full_name, phone: formData.phone, ic: formData.ic, address: formData.address }).eq('id', userId),
      supabase.from('security_staff').update({ name: formData.full_name, phone: formData.phone, ic: formData.ic, gender: formData.gender }).eq('user_id', userId),
    ])

    if (e1 || e2) setError('Failed to save changes.')
    else { setSaved(true); setTimeout(() => setSaved(false), 2500) }
    setLoading(false)
  }

  const initials = (formData.full_name || profile.email || 'S')[0].toUpperCase()

  return (
    <>
      <header className="mb-8">
        <p className="text-[0.7rem] font-semibold text-zinc-400 tracking-[0.14em] uppercase mb-1">Security</p>
        <h1 className="text-[1.85rem] font-bold text-zinc-900 tracking-[-0.03em]">My Profile</h1>
      </header>

      <div className="max-w-lg">
        <div className="border border-zinc-100 bg-white px-6 py-5 mb-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-zinc-100 flex items-center justify-center text-[1.1rem] font-bold text-zinc-700 shrink-0">
            {initials}
          </div>
          <div>
            <div className="text-[0.95rem] font-semibold text-zinc-900">{formData.full_name || 'Unnamed'}</div>
            <div className="text-[0.78rem] text-zinc-400">{profile.email}</div>
            <div className={`mt-1 text-[0.72rem] font-semibold tracking-wide ${staff.on_duty ? 'text-[#4caf6e]' : 'text-zinc-300'}`}>
              {staff.on_duty ? 'On Duty' : 'Off Duty'}
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="border border-zinc-100 bg-white px-6 py-6 flex flex-col gap-7">
          {[
            { label: 'Full Name', key: 'full_name', placeholder: 'Your name' },
            { label: 'Phone', key: 'phone', placeholder: '+260XXXXXXXXX' },
            { label: 'NRC / ID', key: 'ic', placeholder: '######/##/#' },
            { label: 'Address', key: 'address', placeholder: 'Your address' },
          ].map(({ label, key, placeholder }) => (
            <div key={key}>
              <label className="block text-[0.7rem] font-semibold text-zinc-400 tracking-[0.12em] uppercase mb-2">{label}</label>
              <input
                value={formData[key as keyof typeof formData]}
                onChange={e => setFormData(p => ({ ...p, [key]: e.target.value }))}
                placeholder={placeholder}
                className="w-full bg-transparent border-0 border-b border-zinc-200 px-0 py-2.5 text-[0.9rem] text-zinc-900 outline-none focus:border-zinc-900 transition-colors placeholder:text-zinc-300"
              />
            </div>
          ))}

          <div>
            <label className="block text-[0.7rem] font-semibold text-zinc-400 tracking-[0.12em] uppercase mb-2">Gender</label>
            <select
              value={formData.gender}
              onChange={e => setFormData(p => ({ ...p, gender: e.target.value }))}
              className="w-full bg-transparent border-0 border-b border-zinc-200 px-0 py-2.5 text-[0.9rem] text-zinc-900 outline-none focus:border-zinc-900 transition-colors"
            >
              <option value="">Select gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>

          {error && <p className="text-[0.82rem] text-rose-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 text-[0.88rem] font-semibold text-white bg-zinc-900 hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            {loading && <Loader2 size={15} className="animate-spin" />}
            {saved ? <><Check size={15} /> Saved</> : loading ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </div>
    </>
  )
}
