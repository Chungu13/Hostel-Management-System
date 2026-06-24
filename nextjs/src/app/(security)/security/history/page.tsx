import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { History, CheckCircle2, Calendar } from 'lucide-react'

export default async function SecurityHistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/security/login')

  const { data: profile } = await supabase.from('users').select('property_id').eq('id', user.id).single()

  const { data: records } = profile?.property_id
    ? await supabase
        .from('verified_visitors')
        .select('id, resident_name, visit_code, status, verified_at')
        .eq('property_id', profile.property_id)
        .order('verified_at', { ascending: false })
        .limit(100)
    : { data: [] }

  return (
    <>
      <header className="mb-7">
        <h1 className="page-title flex items-center gap-2"><History size={24} className="text-zinc-400" /><span className="text-black">Verification Records</span></h1>
        <p className="mt-1 text-sm text-zinc-400">All verified visitors for your property.</p>
      </header>

      {(records ?? []).length === 0 ? (
        <div className="card text-center py-12">
          <History size={32} className="text-zinc-200 mx-auto mb-3" />
          <p className="text-sm text-zinc-400">No verification records yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 max-w-2xl">
          {(records ?? []).map(r => (
            <div key={r.id} className="card flex items-center gap-4">
              <div className="w-10 h-10 rounded-md bg-emerald-600/10 flex items-center justify-center">
                <CheckCircle2 size={18} className="text-emerald-600" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-zinc-900">{r.resident_name ?? 'Unknown'}</div>
                <div className="text-xs text-zinc-400 font-mono">{r.visit_code}</div>
              </div>
              <div className="text-right">
                <div className="text-xs font-medium text-emerald-600">{r.status}</div>
                <div className="text-[0.7rem] text-zinc-400 flex items-center gap-1">
                  <Calendar size={10} />
                  {new Date(r.verified_at).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
