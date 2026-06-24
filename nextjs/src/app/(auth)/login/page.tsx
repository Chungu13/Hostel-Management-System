'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
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

    if (profile?.role !== 'Resident') {
      await supabase.auth.signOut()
      setError('This portal is for residents only.')
      setLoading(false)
      return
    }

    if (!profile.is_onboarded) { router.push('/onboarding'); return }
    router.push('/resident/dashboard')
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 py-20">
      <motion.div
        className="w-full max-w-[360px]"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center gap-2.5 mb-14">
          <div className="w-7 h-7 rounded bg-[#4caf6e] flex items-center justify-center">
            <span className="text-white text-[0.8rem] font-bold">M</span>
          </div>
          <span className="text-zinc-900 text-[1rem] font-semibold tracking-tight">Malo</span>
        </div>

        <p className="text-[0.7rem] font-semibold text-zinc-400 tracking-[0.15em] uppercase mb-3">Resident Portal</p>
        <h1 className="text-[2rem] font-bold text-zinc-900 tracking-[-0.03em] leading-tight mb-10">Sign in</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-7">
          <div>
            <label className="block text-[0.7rem] font-semibold text-zinc-400 tracking-[0.12em] uppercase mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-transparent border-0 border-b border-zinc-200 px-0 py-3 text-[0.95rem] text-zinc-900 outline-none focus:border-zinc-900 transition-colors duration-200 placeholder:text-zinc-300"
              placeholder="you@example.com"
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

        <p className="mt-8 text-[0.82rem] text-zinc-400">
          No account yet?{' '}
          <Link href="/register" className="text-zinc-900 font-semibold hover:underline">Register</Link>
        </p>

        <div className="mt-16 pt-8 border-t border-zinc-100">
          <p className="text-[0.72rem] text-zinc-300 tracking-wide">
            Admin?{' '}
            <Link href="/admin/login" className="text-zinc-400 hover:text-zinc-600">Admin portal</Link>
            {' '}&middot;{' '}
            <Link href="/security/login" className="text-zinc-400 hover:text-zinc-600">Security portal</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
