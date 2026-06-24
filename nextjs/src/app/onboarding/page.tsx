'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Loader2, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function OnboardingPage() {
  const [role, setRole] = useState('')
  const [properties, setProperties] = useState<any[]>([])
  const [fetchingProps, setFetchingProps] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '', phone: '', ic: '', gender: 'Male', room: '',
    propertyId: '', propertyName: '', propertyAddress: '', propertyType: 'Hostel',
  })
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
      const { data: property } = await supabase
        .from('properties')
        .insert({ name: formData.propertyName, address: formData.propertyAddress, property_type: formData.propertyType, admin_id: user.id })
        .select()
        .single()

      await supabase.from('users').update({
        full_name: formData.name, phone: formData.phone, ic: formData.ic,
        property_id: property?.id, is_onboarded: true, is_approved: true, role: 'Managing Staff',
      }).eq('id', user.id)

      router.push('/admin/dashboard')
    } else if (role === 'Security Staff') {
      await supabase.from('security_staff').insert({
        user_id: user.id, name: formData.name, email: user.email,
        phone: formData.phone, ic: formData.ic, gender: formData.gender,
        property_id: formData.propertyId, approved: true, on_duty: false,
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

  const field = (label: string, key: string, placeholder: string, type = 'text', required = false) => (
    <div key={key}>
      <label className="block text-[0.7rem] font-semibold text-zinc-400 tracking-[0.12em] uppercase mb-2">{label}</label>
      <input
        type={type}
        value={formData[key as keyof typeof formData]}
        onChange={e => setFormData(p => ({ ...p, [key]: e.target.value }))}
        placeholder={placeholder}
        required={required}
        className="w-full bg-transparent border-0 border-b border-zinc-200 px-0 py-3 text-[0.9rem] text-zinc-900 outline-none focus:border-zinc-900 transition-colors duration-200 placeholder:text-zinc-300"
      />
    </div>
  )

  if (fetchingProps) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-6 h-6 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 py-16">
      <motion.div
        className="w-full max-w-[420px]"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center gap-2.5 mb-12">
          <div className="w-7 h-7 rounded bg-[#4caf6e] flex items-center justify-center">
            <span className="text-white text-[0.8rem] font-bold">M</span>
          </div>
          <span className="text-zinc-900 text-[1rem] font-semibold tracking-tight">Malo</span>
        </div>

        <p className="text-[0.7rem] font-semibold text-zinc-400 tracking-[0.15em] uppercase mb-3">{role}</p>
        <h1 className="text-[1.9rem] font-bold text-zinc-900 tracking-[-0.03em] leading-tight mb-10">Complete your profile</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-7">
          {field('Full Name', 'name', 'Your full name', 'text', true)}
          {field('Phone', 'phone', '+260 XXXXXXXXX')}
          {field('NRC / ID Number', 'ic', '######/##/#')}

          {role !== 'Managing Staff' && (
            <div>
              <label className="block text-[0.7rem] font-semibold text-zinc-400 tracking-[0.12em] uppercase mb-2">Gender</label>
              <select
                value={formData.gender}
                onChange={e => setFormData(p => ({ ...p, gender: e.target.value }))}
                className="w-full bg-transparent border-0 border-b border-zinc-200 px-0 py-3 text-[0.9rem] text-zinc-900 outline-none focus:border-zinc-900 transition-colors duration-200"
              >
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
          )}

          {role === 'Resident' && field('Room Number', 'room', 'e.g. A203')}

          {role !== 'Managing Staff' ? (
            <div>
              <label className="block text-[0.7rem] font-semibold text-zinc-400 tracking-[0.12em] uppercase mb-2">Property</label>
              <select
                value={formData.propertyId}
                onChange={e => setFormData(p => ({ ...p, propertyId: e.target.value }))}
                className="w-full bg-transparent border-0 border-b border-zinc-200 px-0 py-3 text-[0.9rem] text-zinc-900 outline-none focus:border-zinc-900 transition-colors duration-200"
                required
              >
                {properties.map(p => (
                  <option key={p.id} value={p.id}>{p.name} — {p.address}</option>
                ))}
              </select>
            </div>
          ) : (
            <>
              {field('Property Name', 'propertyName', 'e.g. Sunset Residences', 'text', true)}
              {field('Property Address', 'propertyAddress', 'Full address', 'text', true)}
              <div>
                <label className="block text-[0.7rem] font-semibold text-zinc-400 tracking-[0.12em] uppercase mb-2">Property Type</label>
                <select
                  value={formData.propertyType}
                  onChange={e => setFormData(p => ({ ...p, propertyType: e.target.value }))}
                  className="w-full bg-transparent border-0 border-b border-zinc-200 px-0 py-3 text-[0.9rem] text-zinc-900 outline-none focus:border-zinc-900 transition-colors duration-200"
                >
                  <option>Hostel</option>
                  <option>Apartment Complex</option>
                  <option>Gated Community</option>
                  <option>Other</option>
                </select>
              </div>
            </>
          )}

          {error && <p className="text-[0.82rem] text-rose-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-2 bg-zinc-900 text-white text-[0.88rem] font-semibold tracking-wide hover:bg-zinc-800 transition-colors duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
            {loading ? 'Setting up...' : 'Complete Setup'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
