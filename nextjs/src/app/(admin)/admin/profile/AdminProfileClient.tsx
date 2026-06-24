'use client'

import { useState } from 'react'
import { User, Phone, MapPin, Building2, Loader2, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'

interface Props { userId: string; profile: Record<string, any>; property: Record<string, any> }

export default function AdminProfileClient({ userId, profile, property }: Props) {
  const [formData, setFormData] = useState({ full_name: profile.full_name ?? '', phone: profile.phone ?? '', ic: profile.ic ?? '', address: profile.address ?? '' })
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error: err } = await supabase.from('users').update(formData).eq('id', userId)
    if (err) setError('Failed to save changes.')
    else { setSaved(true); setTimeout(() => setSaved(false), 2500) }
    setLoading(false)
  }

  const initials = (formData.full_name || profile.email || 'A')[0].toUpperCase()

  return (
    <>
      <header className="mb-9">
        <h1 className="page-title"><span className="text-black">My Profile</span></h1>
        <p className="mt-1 text-sm text-zinc-400">Manage your admin account and property details.</p>
      </header>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg space-y-5">
        <div className="card flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600/10 flex items-center justify-center text-emerald-600 font-bold text-xl">{initials}</div>
          <div>
            <div className="font-semibold text-zinc-900">{formData.full_name || 'Unnamed'}</div>
            <div className="text-sm text-zinc-400">{profile.email}</div>
            <div className="text-xs text-emerald-600 font-medium mt-0.5">Managing Staff</div>
          </div>
        </div>

        {property.name && (
          <div className="card bg-emerald-50 border-emerald-200">
            <div className="flex items-center gap-2 mb-2">
              <Building2 size={16} className="text-emerald-600" />
              <span className="font-semibold text-zinc-900 text-sm">Property</span>
            </div>
            <div className="text-sm font-medium text-zinc-900">{property.name}</div>
            <div className="text-xs text-zinc-500">{property.address}</div>
            <div className="text-xs text-zinc-400 mt-0.5">{property.property_type}</div>
          </div>
        )}

        <form onSubmit={handleSave} className="card flex flex-col gap-4">
          {[
            { label: 'Full Name', key: 'full_name', icon: User, placeholder: 'Your name' },
            { label: 'Phone', key: 'phone', icon: Phone, placeholder: '+260XXXXXXXXX' },
            { label: 'NRC / ID', key: 'ic', icon: User, placeholder: '######/##/#' },
            { label: 'Address', key: 'address', icon: MapPin, placeholder: 'Your address' },
          ].map(({ label, key, icon: Icon, placeholder }) => (
            <div key={key} className="flex flex-col gap-1.5">
              <label className="text-[0.78rem] font-medium text-zinc-500 tracking-[0.06em] uppercase">{label}</label>
              <div className="relative">
                <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-300 w-4 h-4" />
                <input value={formData[key as keyof typeof formData]} onChange={e => setFormData(p => ({ ...p, [key]: e.target.value }))} placeholder={placeholder} className="w-full pl-9 pr-3 py-2.5 text-sm text-zinc-900 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-emerald-500 focus:bg-white transition" />
              </div>
            </div>
          ))}
          {error && <p className="text-sm text-rose-500 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">{error}</p>}
          <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-white rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-500 transition hover:opacity-95 disabled:opacity-60">
            {loading ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : null}
            {saved ? 'Saved!' : loading ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </motion.div>
    </>
  )
}
