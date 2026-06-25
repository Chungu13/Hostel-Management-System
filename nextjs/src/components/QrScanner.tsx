'use client'

import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'

interface Props {
  onScan: (code: string) => void
  onClose: () => void
}

export default function QrScanner({ onScan, onClose }: Props) {
  const divId = 'qr-scanner-container'
  const scannerRef = useRef<any>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    const start = async () => {
      const { Html5Qrcode, Html5QrcodeScannerState } = await import('html5-qrcode')
      const scanner = new Html5Qrcode(divId)
      scannerRef.current = scanner

      try {
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 220, height: 220 } },
          (decodedText: string) => {
            if (!mounted) return
            const match = decodedText.match(/[A-Z0-9]{6,}/)
            const code = match ? match[0] : decodedText.trim().toUpperCase()
            onScan(code)
          },
          () => {}
        )
      } catch (err: any) {
        setError(err?.message ?? 'Could not access camera.')
      }
    }

    start()

    return () => {
      mounted = false
      const scanner = scannerRef.current
      if (!scanner) return
      try {
        const { Html5QrcodeScannerState } = require('html5-qrcode')
        const state = scanner.getState()
        if (state === Html5QrcodeScannerState.SCANNING || state === Html5QrcodeScannerState.PAUSED) {
          scanner.stop().catch(() => {})
        }
      } catch {
        // ignore cleanup errors
      }
    }
  }, [])

  return (
    <div className="border border-zinc-100 bg-white overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-100">
        <span className="text-[0.75rem] font-semibold text-zinc-400 tracking-[0.12em] uppercase">Camera Scanner</span>
        <button onClick={onClose} className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-zinc-700 transition-colors">
          <X size={15} />
        </button>
      </div>

      {error ? (
        <div className="px-5 py-8 text-[0.82rem] text-rose-500 text-center">{error}</div>
      ) : (
        <div className="relative">
          {/* html5-qrcode renders its video into this div */}
          <div id={divId} className="w-full" />
          {/* Crosshair overlay */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="w-[220px] h-[220px] relative">
              <span className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[#4caf6e]" />
              <span className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[#4caf6e]" />
              <span className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[#4caf6e]" />
              <span className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[#4caf6e]" />
            </div>
          </div>
        </div>
      )}

      <p className="text-center text-[0.72rem] text-zinc-400 py-3 border-t border-zinc-100">
        Point the camera at a visitor&apos;s QR code
      </p>
    </div>
  )
}
