'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function SecurityLoginPage() {
  const [name, setName] = useState('')
  const [passkey, setPasskey] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Derive the auth email from the staff name (matches how admin creates the account)
    const authEmail = `${name.toLowerCase().replace(/\s+/g, '.')}@staff.malo`

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: authEmail,
      password: passkey,
    })

    if (authError) {
      setError('Incorrect name or passkey.')
      setLoading(false)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data: profile } = await supabase
      .from('users')
      .select('role, is_onboarded')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'Security Staff') {
      await supabase.auth.signOut()
      setError('This portal is for security staff only.')
      setLoading(false)
      return
    }

    if (!profile.is_onboarded) { router.push('/onboarding'); return }
    router.push('/security/dashboard')
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left — dark brand panel */}
      <div className="hidden lg:flex w-[440px] shrink-0 bg-[#0f0f0f] flex-col justify-between px-12 py-14">
        <div>
          <div className="flex items-center gap-3 mb-20">
            <div className="w-8 h-8 rounded bg-[#4caf6e] flex items-center justify-center">
              <span className="text-white text-[0.95rem] font-bold">M</span>
            </div>
            <span className="text-white text-[1.1rem] font-semibold tracking-tight">Malo</span>
          </div>

          <h2 className="text-white text-[2.1rem] font-bold tracking-[-0.04em] leading-[1.15] mb-5">
            Secure entry.<br />Every visitor <span className="text-[#4caf6e]">verified.</span>
          </h2>
          <p className="text-zinc-500 text-[0.85rem] leading-relaxed max-w-[260px]">
            The professional tool for gate control and visitor management.
          </p>

          <div className="flex flex-col gap-4 mt-14">
            {['Scan & verify QR passes', 'Log visitor arrivals', 'View entry history', 'Real-time gate control'].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-[0.82rem] text-zinc-500">
                <div className="w-1 h-1 rounded-full bg-[#4caf6e]" />
                {item}
              </div>
            ))}
          </div>
        </div>
        <p className="text-zinc-700 text-[0.7rem] tracking-widest uppercase" suppressHydrationWarning>
          Malo &copy; {new Date().getFullYear()}
        </p>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center px-8 py-16 bg-white">
        <motion.div
          className="w-full max-w-[360px]"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-12 lg:hidden">
            <div className="w-7 h-7 rounded bg-[#4caf6e] flex items-center justify-center">
              <span className="text-white text-[0.8rem] font-bold">M</span>
            </div>
            <span className="text-zinc-900 text-[1rem] font-semibold">Malo</span>
          </div>

          <p className="text-[0.7rem] font-semibold text-zinc-400 tracking-[0.15em] uppercase mb-3">Security Portal</p>
          <h1 className="text-[2rem] font-bold text-zinc-900 tracking-[-0.03em] leading-tight mb-10">Sign in</h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-7">
            <div>
              <label className="block text-[0.7rem] font-semibold text-zinc-400 tracking-[0.12em] uppercase mb-2">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-zinc-200 px-0 py-3 text-[0.95rem] text-zinc-900 outline-none focus:border-zinc-900 transition-colors duration-200 placeholder:text-zinc-300"
                placeholder="Your full name"
                required
              />
            </div>

            <div>
              <label className="block text-[0.7rem] font-semibold text-zinc-400 tracking-[0.12em] uppercase mb-2">Passkey</label>
              <input
                type="password"
                value={passkey}
                onChange={e => setPasskey(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-zinc-200 px-0 py-3 text-[0.95rem] text-zinc-900 outline-none focus:border-zinc-900 transition-colors duration-200 placeholder:text-zinc-300"
                placeholder="••••••••"
                required
              />
            </div>

            {error && <p className="text-[0.82rem] text-rose-500">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-2 bg-zinc-900 text-white text-[0.88rem] font-semibold tracking-wide hover:bg-zinc-800 transition-colors duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={15} className="animate-spin" />}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-10 text-[0.75rem] text-zinc-300 leading-relaxed">
            Your name and passkey are set by your property administrator.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
