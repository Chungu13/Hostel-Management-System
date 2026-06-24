import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { FileText } from 'lucide-react'

export default async function ReportsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('users').select('property_id').eq('id', user.id).single()

  const [
    { data: residents },
    { data: staff },
    { data: visits },
  ] = await Promise.all([
    supabase.from('residents').select('gender, approved').eq('property_id', profile?.property_id ?? ''),
    supabase.from('security_staff').select('gender').eq('property_id', profile?.property_id ?? ''),
    supabase.from('visit_requests').select('status, visit_date').eq('property_id', profile?.property_id ?? ''),
  ])

  const residentGender = { Male: 0, Female: 0, Other: 0 }
  for (const r of residents ?? []) {
    const g = r.gender as keyof typeof residentGender
    if (g in residentGender) residentGender[g]++
  }

  const approved = (residents ?? []).filter(r => r.approved).length
  const pending = (residents ?? []).filter(r => !r.approved).length

  const statusCounts: Record<string, number> = {}
  for (const v of visits ?? []) {
    statusCounts[v.status] = (statusCounts[v.status] ?? 0) + 1
  }

  return (
    <>
      <header className="mb-9">
        <h1 className="page-title flex items-center gap-2"><FileText size={24} className="text-zinc-400" /><span className="text-black">Reports</span></h1>
        <p className="mt-1 text-sm text-zinc-400">Analytics and reporting for your property.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl">
        {/* Resident Gender */}
        <div className="card">
          <h2 className="section-title mb-4">Resident Gender Distribution</h2>
          {Object.entries(residentGender).map(([gender, count]) => {
            const total = (residents ?? []).length || 1
            const pct = Math.round((count / total) * 100)
            return (
              <div key={gender} className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-zinc-600">{gender}</span>
                  <span className="font-semibold text-zinc-900">{count} ({pct}%)</span>
                </div>
                <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
        </div>

        {/* Approval Status */}
        <div className="card">
          <h2 className="section-title mb-4">Resident Approval Status</h2>
          <div className="space-y-3">
            {[
              { label: 'Approved', count: approved, color: 'bg-emerald-500' },
              { label: 'Pending', count: pending, color: 'bg-amber-400' },
            ].map(({ label, count, color }) => {
              const total = (residents ?? []).length || 1
              return (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-zinc-600">{label}</span>
                    <span className="font-semibold text-zinc-900">{count}</span>
                  </div>
                  <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full`} style={{ width: `${Math.round((count / total) * 100)}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Visit Status */}
        <div className="card md:col-span-2">
          <h2 className="section-title mb-4">Visit Request Status Breakdown</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status} className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-zinc-900 mb-1">{count}</div>
                <div className="text-xs text-zinc-500">{status}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
