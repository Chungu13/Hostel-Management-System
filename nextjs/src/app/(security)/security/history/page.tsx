import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

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
      <header className="mb-8">
        <p className="text-[0.7rem] font-semibold text-zinc-400 tracking-[0.14em] uppercase mb-1">Security</p>
        <h1 className="text-[1.85rem] font-bold text-zinc-900 tracking-[-0.03em]">Verification Records</h1>
      </header>

      {(records ?? []).length === 0 ? (
        <p className="text-[0.875rem] text-zinc-400 py-10">No verification records yet.</p>
      ) : (
        <div className="border border-zinc-100 divide-y divide-zinc-100 bg-white max-w-2xl">
          {(records ?? []).map(r => (
            <div key={r.id} className="flex items-center gap-4 px-5 py-4">
              <div className="w-8 h-8 bg-zinc-100 flex items-center justify-center text-[0.8rem] font-bold text-zinc-700 shrink-0">
                {(r.resident_name ?? 'U')[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[0.88rem] font-semibold text-zinc-900">{r.resident_name ?? 'Unknown'}</div>
                <div className="text-[0.75rem] font-mono text-zinc-400">{r.visit_code}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[0.72rem] font-semibold tracking-wide text-[#4caf6e]">{r.status}</div>
                <div className="text-[0.7rem] text-zinc-400 mt-0.5">
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
