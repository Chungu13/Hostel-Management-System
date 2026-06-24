import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { History, Calendar, CheckCircle2, Clock, XCircle } from 'lucide-react'

export default async function AdminHistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('users').select('property_id').eq('id', user.id).single()

  const { data: visits } = profile?.property_id
    ? await supabase
        .from('visit_requests')
        .select('id, visitor_name, resident_name, visit_code, visit_date, status, request_date')
        .eq('property_id', profile.property_id)
        .order('request_date', { ascending: false })
        .limit(100)
    : { data: [] }

  const statusColor: Record<string, string> = {
    Approved: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    Verified: 'bg-sky-50 text-sky-600 border-sky-200',
    Rejected: 'bg-rose-50 text-rose-600 border-rose-200',
    Expired: 'bg-zinc-100 text-zinc-500 border-zinc-200',
    Pending: 'bg-amber-50 text-amber-600 border-amber-200',
  }

  return (
    <>
      <header className="mb-7">
        <h1 className="page-title flex items-center gap-2"><History size={24} className="text-zinc-400" /><span className="text-black">Visitor History</span></h1>
        <p className="mt-1 text-sm text-zinc-400">Complete log of all visitor requests for your property.</p>
      </header>

      {(visits ?? []).length === 0 ? (
        <div className="card text-center py-12">
          <History size={32} className="text-zinc-200 mx-auto mb-3" />
          <p className="text-sm text-zinc-400">No visitor history yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 max-w-2xl">
          {(visits ?? []).map(v => (
            <div key={v.id} className="card flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-zinc-900">{v.visitor_name}</span>
                  <span className={`inline-flex items-center text-[0.7rem] font-semibold px-2 py-0.5 rounded-full border ${statusColor[v.status] ?? 'bg-zinc-100 text-zinc-500'}`}>{v.status}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-400">
                  <span>Resident: {v.resident_name ?? '—'}</span>
                  <span className="flex items-center gap-1"><Calendar size={10} />{v.visit_date}</span>
                  <span className="font-mono">{v.visit_code}</span>
                </div>
              </div>
              <div className="text-xs text-zinc-300">{new Date(v.request_date).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
