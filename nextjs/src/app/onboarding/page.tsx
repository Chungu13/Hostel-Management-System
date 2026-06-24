'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { User, Phone, Home, Building2, Loader2, Check, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function OnboardingPage() {
  const [role, setRole] = useState('')
  const [properties, setProperties] = useState<any[]>([])
  const [fetchingProps, setFetchingProps] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({ name: '', phone: '', ic: '', gender: 'Male', room: '', propertyId: '', propertyName: '', propertyAddress: '', propertyType: 'Hostel' })
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
      setRole(profile?.role ?? 'Resident')
      if (profile?.role !== 'Managing Staff') {
        const { data: props } = await supabase.from('properties').select('id, name, address, property_type')
        setProperties(props ?? [])
        if (props?.length) setFormData(p => ({ ...p, propertyId: props[0].id }))
      }
      setFetchingProps(false)
    }
    load()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (role === 'Managing Staff') {
      // Create property + update user
      const { data: property } = await supabase
        .from('properties')
        .insert({ name: formData.propertyName, address: formData.propertyAddress, property_type: formData.propertyType, admin_id: user.id })
        .select()
        .single()

      await supabase.from('users').update({
        full_name: formData.name,
        phone: formData.phone,
        ic: formData.ic,
        property_id: property?.id,
        is_onboarded: true,
        is_approved: true,
        role: 'Managing Staff',
      }).eq('id', user.id)

      router.push('/admin/dashboard')
    } else if (role === 'Security Staff') {
      await supabase.from('security_staff').insert({
        user_id: user.id,
        name: formData.name,
        email: user.email,
        phone: formData.phone,
        ic: formData.ic,
        gender: formData.gender,
        property_id: formData.propertyId,
        approved: true,
        on_duty: false,
      })
      await supabase.from('users').update({
        full_name: formData.name, phone: formData.phone, ic: formData.ic,
        property_id: formData.propertyId, is_onboarded: true, is_approved: true,
      }).eq('id', user.id)
      router.push('/security/dashboard')
    } else {
      await supabase.from('residents').insert({
        user_id: user.id, name: formData.name, email: user.email ?? '',
        phone: formData.phone, ic: formData.ic, gender: formData.gender,
        room: formData.room, property_id: formData.propertyId, approved: false,
      })
      await supabase.from('users').update({
        full_name: formData.name, phone: formData.phone, ic: formData.ic,
        property_id: formData.propertyId, is_onboarded: true,
      }).eq('id', user.id)
      router.push('/pending-approval')
    }
    setLoading(false)
  }

  if (fetchingProps) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f7f5]">
      <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#f7f7f5]"
      style={{ backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(134,197,152,0.12) 0%, transparent 50%)' }}>
      <motion.div
        initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden w-full max-w-md bg-white rounded-[24px] px-8 py-10 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_32px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.04)]"
      >
        <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[24px] bg-gradient-to-r from-[#4caf6e] to-[#81c995]" />

        <div className="flex items-center gap-3 mb-7">
          <div className="w-9 h-9 rounded-[10px] flex items-center justify-center bg-gradient-to-br from-[#4caf6e] to-[#81c995] shadow-[0_2px_8px_rgba(76,175,110,0.3)]">
            <span className="text-white font-bold">M</span>
          </div>
          <div>
            <span className="text-lg font-bold text-zinc-900 tracking-[-0.02em]">Complete Your Profile</span>
            <div className="text-xs text-zinc-400">{role}</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {[
            { label: 'Full Name', key: 'name', icon: User, placeholder: 'Your full name', required: true },
            { label: 'Phone', key: 'phone', icon: Phone, placeholder: '+260XXXXXXXXX', required: false },
            { label: 'NRC / ID Number', key: 'ic', icon: User, placeholder: '######/##/#', required: false },
          ].map(({ label, key, icon: Icon, placeholder, required }) => (
            <div key={key} className="flex flex-col gap-1.5">
              <label className="text-[0.75rem] font-medium text-zinc-500 tracking-[0.06em] uppercase">{label}</label>
              <div className="relative">
                <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-300 w-4 h-4" />
                <input value={formData[key as keyof typeof formData]} onChange={e => setFormData(p => ({ ...p, [key]: e.target.value }))} placeholder={placeholder} required={required} className="w-full pl-9 pr-3 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-emerald-500 focus:bg-white transition" />
              </div>
            </div>
          ))}

          {role !== 'Managing Staff' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.75rem] font-medium text-zinc-500 tracking-[0.06em] uppercase">Gender</label>
              <select value={formData.gender} onChange={e => setFormData(p => ({ ...p, gender: e.target.value }))} className="w-full px-3 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-emerald-500 transition">
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
          )}

          {role === 'Resident' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.75rem] font-medium text-zinc-500 tracking-[0.06em] uppercase">Room Number</label>
              <div className="relative">
                <Home className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-300 w-4 h-4" />
                <input value={formData.room} onChange={e => setFormData(p => ({ ...p, room: e.target.value }))} placeholder="e.g. A203" className="w-full pl-9 pr-3 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-emerald-500 focus:bg-white transition" />
              </div>
            </div>
          )}

          {role !== 'Managing Staff' ? (
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.75rem] font-medium text-zinc-500 tracking-[0.06em] uppercase">Select Property</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-300 w-4 h-4" />
                <select value={formData.propertyId} onChange={e => setFormData(p => ({ ...p, propertyId: e.target.value }))} className="w-full pl-9 pr-3 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-emerald-500 transition" required>
                  {properties.map(p => <option key={p.id} value={p.id}>{p.name} — {p.address}</option>)}
                </select>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.75rem] font-medium text-zinc-500 tracking-[0.06em] uppercase">Property Name</label>
                <input value={formData.propertyName} onChange={e => setFormData(p => ({ ...p, propertyName: e.target.value }))} placeholder="e.g. Sunset Residences" required className="w-full px-3 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-emerald-500 transition" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.75rem] font-medium text-zinc-500 tracking-[0.06em] uppercase">Property Address</label>
                <input value={formData.propertyAddress} onChange={e => setFormData(p => ({ ...p, propertyAddress: e.target.value }))} placeholder="Full address" required className="w-full px-3 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-emerald-500 transition" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.75rem] font-medium text-zinc-500 tracking-[0.06em] uppercase">Property Type</label>
                <select value={formData.propertyType} onChange={e => setFormData(p => ({ ...p, propertyType: e.target.value }))} className="w-full px-3 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-emerald-500 transition">
                  <option>Hostel</option><option>Apartment Complex</option><option>Gated Community</option><option>Other</option>
                </select>
              </div>
            </>
          )}

          {error && <p className="text-sm text-rose-500 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">{error}</p>}

          <button type="submit" disabled={loading} className="mt-1 w-full flex items-center justify-center gap-2 py-3.5 text-sm font-semibold text-white rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-500 shadow-[0_4px_16px_rgba(16,185,129,0.25)] transition hover:opacity-95 disabled:opacity-60">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            {loading ? 'Setting up…' : 'Complete Setup'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
