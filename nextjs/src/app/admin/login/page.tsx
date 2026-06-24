'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) { setError('Invalid email or password.'); setLoading(false); return }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data: profile } = await supabase.from('users').select('role, is_onboarded').eq('id', user.id).single()

    if (profile?.role !== 'Managing Staff') {
      await supabase.auth.signOut()
      setError('This portal is for administrators only.')
      setLoading(false)
      return
    }

    if (!profile.is_onboarded) { router.push('/onboarding'); return }
    router.push('/admin/dashboard')
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
            Manage your property<br />with full <span className="text-[#4caf6e]">control.</span>
          </h2>
          <p className="text-zinc-500 text-[0.85rem] leading-relaxed max-w-[260px]">
            The complete platform for hostels, apartments, and residential complexes.
          </p>

          <div className="flex flex-col gap-4 mt-14">
            {['Resident management', 'Visitor access control', 'Staff oversight', 'Reports & analytics'].map((item, i) => (
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

          <p className="text-[0.7rem] font-semibold text-zinc-400 tracking-[0.15em] uppercase mb-3">Admin Portal</p>
          <h1 className="text-[2rem] font-bold text-zinc-900 tracking-[-0.03em] leading-tight mb-10">Sign in</h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-7">
            <div>
              <label className="block text-[0.7rem] font-semibold text-zinc-400 tracking-[0.12em] uppercase mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-zinc-200 px-0 py-3 text-[0.95rem] text-zinc-900 outline-none focus:border-zinc-900 transition-colors duration-200 placeholder:text-zinc-300"
                placeholder="admin@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-[0.7rem] font-semibold text-zinc-400 tracking-[0.12em] uppercase mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-zinc-200 px-0 py-3 text-[0.95rem] text-zinc-900 outline-none focus:border-zinc-900 transition-colors duration-200 placeholder:text-zinc-300"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <p className="text-[0.82rem] text-rose-500">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-2 bg-zinc-900 text-white text-[0.88rem] font-semibold tracking-wide hover:bg-zinc-800 transition-colors duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={15} className="animate-spin" />}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-8 text-[0.82rem] text-zinc-400">
            Need an account?{' '}
            <Link href="/admin/register" className="text-zinc-900 font-semibold hover:underline">Register building</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
