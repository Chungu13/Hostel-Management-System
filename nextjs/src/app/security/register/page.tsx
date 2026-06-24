'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function SecurityRegisterPage() {
  return (
    <div className="min-h-screen flex bg-white">
      <div className="hidden lg:flex w-[440px] shrink-0 bg-[#0f0f0f] flex-col justify-between px-12 py-14">
        <div>
          <div className="flex items-center gap-3 mb-20">
            <div className="w-8 h-8 rounded bg-[#4caf6e] flex items-center justify-center">
              <span className="text-white text-[0.95rem] font-bold">M</span>
            </div>
            <span className="text-white text-[1.1rem] font-semibold tracking-tight">Malo</span>
          </div>
          <h2 className="text-white text-[2.1rem] font-bold tracking-[-0.04em] leading-[1.15] mb-5">
            Join the team.<br />Keep the property <span className="text-[#4caf6e]">safe.</span>
          </h2>
        </div>
        <p className="text-zinc-700 text-[0.7rem] tracking-widest uppercase" suppressHydrationWarning>
          Malo &copy; {new Date().getFullYear()}
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center px-8 py-16 bg-white">
        <motion.div
          className="w-full max-w-[360px]"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex items-center gap-2.5 mb-12 lg:hidden">
            <div className="w-7 h-7 rounded bg-[#4caf6e] flex items-center justify-center">
              <span className="text-white text-[0.8rem] font-bold">M</span>
            </div>
            <span className="text-zinc-900 text-[1rem] font-semibold">Malo</span>
          </div>

          <p className="text-[0.7rem] font-semibold text-zinc-400 tracking-[0.15em] uppercase mb-3">Security Portal</p>
          <h1 className="text-[2rem] font-bold text-zinc-900 tracking-[-0.03em] leading-tight mb-4">Account access</h1>
          <p className="text-[0.875rem] text-zinc-400 leading-relaxed mb-10">
            Security staff accounts are created by your property administrator. Contact them to get your name and passkey, then sign in below.
          </p>

          <Link
            href="/security/login"
            className="w-full py-3.5 bg-zinc-900 text-white text-[0.88rem] font-semibold tracking-wide hover:bg-zinc-800 transition-colors duration-200 flex items-center justify-center"
          >
            Go to Sign In
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
