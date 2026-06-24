'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { LogIn, Lock, Mail, Loader2 } from 'lucide-react'
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
    if (authError) {
      setError('Invalid credentials. Please try again.')
      setLoading(false)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data: profile } = await supabase
      .from('users')
      .select('role, is_onboarded, is_approved')
      .eq('id', user.id)
      .single()

    if (!profile?.is_onboarded) { router.push('/onboarding'); return }
    if (profile.role === 'Resident' && !profile.is_approved) { router.push('/pending-approval'); return }

    if (profile.role === 'Resident') router.push('/resident/dashboard')
    else if (profile.role === 'Security Staff') router.push('/security/dashboard')
    else if (profile.role === 'Managing Staff') router.push('/admin/dashboard')
    else setError('Unknown role. Contact your administrator.')
    setLoading(false)
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) { setError('Google sign-in failed.'); setLoading(false) }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden w-full max-w-[420px] bg-white rounded-[24px] px-[44px] py-[48px] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_32px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.04)]"
    >
      <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[24px] bg-gradient-to-r from-[#4caf6e] to-[#81c995]" />

      <div className="flex items-center gap-[10px] mb-9">
        <div className="w-9 h-9 rounded-[10px] flex items-center justify-center bg-gradient-to-br from-[#4caf6e] to-[#81c995] shadow-[0_2px_8px_rgba(76,175,110,0.3)]">
          <span className="text-white text-[1.05rem] font-bold">M</span>
        </div>
        <span className="text-[1.35rem] font-bold text-[#1a1a1a] tracking-[-0.02em]">Malo</span>
      </div>

      <h1 className="text-[1.85rem] font-bold text-[#111] leading-[1.2] tracking-[-0.02em] mb-6">Sign in</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-[18px]">
        <div className="flex flex-col gap-[6px]">
          <label className="text-[0.78rem] font-medium text-[#555] tracking-[0.06em] uppercase">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-[14px] top-1/2 -translate-y-1/2 text-[#bbb] w-4 h-4 pointer-events-none" />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full box-border pl-10 pr-[14px] py-3 text-[0.9rem] text-[#111] bg-[#f9f9f8] border-[1.5px] border-[#e8e8e6] rounded-xl outline-none transition-[border-color,background,box-shadow] duration-200 placeholder:text-[#c8c8c5] focus:border-[#4caf6e] focus:bg-white focus:shadow-[0_0_0_3px_rgba(76,175,110,0.1)]"
              placeholder="you@example.com"
              required
            />
          </div>
        </div>

        <div className="flex flex-col gap-[6px]">
          <label className="text-[0.78rem] font-medium text-[#555] tracking-[0.06em] uppercase">Password</label>
          <div className="relative">
            <Lock className="absolute left-[14px] top-1/2 -translate-y-1/2 text-[#bbb] w-4 h-4 pointer-events-none" />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full box-border pl-10 pr-[14px] py-3 text-[0.9rem] text-[#111] bg-[#f9f9f8] border-[1.5px] border-[#e8e8e6] rounded-xl outline-none transition-[border-color,background,box-shadow] duration-200 placeholder:text-[#c8c8c5] focus:border-[#4caf6e] focus:bg-white focus:shadow-[0_0_0_3px_rgba(76,175,110,0.1)]"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[0.82rem] text-[#e05c5c] text-center bg-[#fff5f5] border border-[#ffdddd] rounded-lg px-[14px] py-[10px]"
          >
            {error}
          </motion.p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-1 w-full flex items-center justify-center gap-2 px-4 py-[14px] text-[0.92rem] font-semibold text-white rounded-xl border-0 cursor-pointer bg-gradient-to-br from-[#4caf6e] to-[#5ec47f] shadow-[0_4px_16px_rgba(76,175,110,0.25)] transition-[opacity,transform,box-shadow] duration-200 disabled:opacity-65 disabled:cursor-not-allowed hover:opacity-95 hover:-translate-y-[1px] hover:shadow-[0_6px_20px_rgba(76,175,110,0.3)] active:translate-y-0"
        >
          {loading ? <Loader2 size={17} className="animate-spin" /> : <LogIn size={17} />}
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>

      <div className="flex items-center gap-[14px] my-6">
        <div className="flex-1 h-px bg-[#ebebea]" />
        <span className="text-[0.75rem] text-[#bbb] whitespace-nowrap font-normal tracking-[0.04em]">or continue with</span>
        <div className="flex-1 h-px bg-[#ebebea]" />
      </div>

      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-[#e8e8e6] rounded-xl text-[0.9rem] font-medium text-[#333] bg-white hover:bg-[#f9f9f8] transition disabled:opacity-60"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Continue with Google
      </button>

      <p className="text-center mt-7 text-[0.85rem] text-[#999]">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-[#4caf6e] font-medium hover:text-[#3a9a5a] hover:underline">Create one</Link>
      </p>
    </motion.div>
  )
}
