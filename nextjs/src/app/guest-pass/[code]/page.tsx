import { createClient } from '@/lib/supabase/server'
import { CheckCircle2, XCircle, Clock, Calendar, User } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'

export default async function GuestPassPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const supabase = await createClient()

  const { data: visit } = await supabase
    .from('visit_requests')
    .select('visitor_name, visit_code, visit_date, visit_time, purpose, status, resident_name')
    .eq('visit_code', code.toUpperCase())
    .single()

  const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
    Approved: { color: 'text-emerald-600 bg-emerald-50 border-emerald-200', icon: <CheckCircle2 size={16} />, label: 'Valid Pass' },
    Verified: { color: 'text-sky-600 bg-sky-50 border-sky-200', icon: <CheckCircle2 size={16} />, label: 'Verified' },
    Expired: { color: 'text-zinc-500 bg-zinc-100 border-zinc-200', icon: <Clock size={16} />, label: 'Expired' },
    Rejected: { color: 'text-rose-600 bg-rose-50 border-rose-200', icon: <XCircle size={16} />, label: 'Rejected' },
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#f7f7f5]"
      style={{ backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(134,197,152,0.12) 0%, transparent 50%)' }}>
      <div className="w-full max-w-sm bg-white rounded-[24px] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_32px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.04)]">
        <div className="h-[3px] bg-gradient-to-r from-emerald-600 to-emerald-300" />

        {/* Header */}
        <div className="px-8 pt-8 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-br from-emerald-600 to-emerald-300">
              <span className="text-white font-bold text-xs">M</span>
            </div>
            <span className="text-sm font-bold text-zinc-500 tracking-wide uppercase">Malo Guest Pass</span>
          </div>
        </div>

        {!visit ? (
          <div className="px-8 pb-8 text-center">
            <XCircle size={40} className="text-rose-400 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-zinc-900 mb-2">Pass Not Found</h2>
            <p className="text-sm text-zinc-500">The code <span className="font-mono font-semibold">{code}</span> doesn&apos;t match any pass.</p>
          </div>
        ) : (
          <div className="px-8 pb-8">
            {/* QR Code */}
            <div className="flex justify-center mb-5">
              <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-2xl">
                <QRCodeSVG value={visit.visit_code} size={150} />
              </div>
            </div>

            {/* Status */}
            {(() => {
              const cfg = statusConfig[visit.status] ?? statusConfig.Expired
              return (
                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border mb-4 ${cfg.color}`}>
                  {cfg.icon} {cfg.label}
                </div>
              )
            })()}

            {/* Visitor Info */}
            <div className="mb-1">
              <div className="flex items-center gap-2 mb-1">
                <User size={14} className="text-zinc-400" />
                <span className="text-xs text-zinc-400 uppercase tracking-wide font-medium">Visitor</span>
              </div>
              <div className="text-2xl font-bold text-zinc-900 tracking-[-0.02em]">{visit.visitor_name}</div>
            </div>

            <div className="mt-4 space-y-2 border-t border-zinc-100 pt-4">
              {[
                ['Resident', visit.resident_name ?? '—'],
                ['Date', visit.visit_date],
                ['Time', visit.visit_time ?? '—'],
                ['Purpose', visit.purpose ?? '—'],
                ['Code', visit.visit_code],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-zinc-400">{label}</span>
                  <span className={`font-medium text-zinc-800 ${label === 'Code' ? 'font-mono' : ''}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
