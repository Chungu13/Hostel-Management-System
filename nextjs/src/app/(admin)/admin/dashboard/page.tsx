import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Users, ShieldCheck, Clock, Calendar, Eye } from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('users').select('full_name, email, property_id').eq('id', user.id).single()

  const today = new Date().toISOString().split('T')[0]

  const [
    { count: totalResidents },
    { count: totalStaff },
    { count: pendingVisits },
    { count: todayVisitors },
    { data: recentActivity },
  ] = await Promise.all([
    supabase.from('residents').select('*', { count: 'exact', head: true }).eq('property_id', profile?.property_id ?? ''),
    supabase.from('security_staff').select('*', { count: 'exact', head: true }).eq('property_id', profile?.property_id ?? ''),
    supabase.from('visit_requests').select('*', { count: 'exact', head: true }).eq('property_id', profile?.property_id ?? '').eq('status', 'Approved'),
    supabase.from('verified_visitors').select('*', { count: 'exact', head: true }).eq('property_id', profile?.property_id ?? '').gte('verified_at', today),
    supabase.from('visit_requests').select('visitor_name, resident_name, status, request_date').eq('property_id', profile?.property_id ?? '').order('request_date', { ascending: false }).limit(5),
  ])

  const todayLabel = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

  const stats = [
    { label: 'Total Residents', value: totalResidents ?? 0, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-600/10', bar: 'from-emerald-600 to-emerald-300', href: '/admin/residents' },
    { label: 'Security Staff', value: totalStaff ?? 0, icon: ShieldCheck, color: 'text-violet-500', bg: 'bg-violet-500/10', bar: 'from-violet-400 to-violet-200', href: '/admin/staff' },
    { label: 'Pending Passes', value: pendingVisits ?? 0, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10', bar: 'from-amber-400 to-amber-200', href: '/admin/history' },
    { label: "Today's Visitors", value: todayVisitors ?? 0, icon: Calendar, color: 'text-sky-500', bg: 'bg-sky-500/10', bar: 'from-sky-400 to-sky-200', href: '/admin/history' },
  ]

  return (
    <>
      <header className="mb-9 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="page-title">Hello, <span className="text-black">{profile?.full_name || profile?.email}</span></h1>
          <p className="m-0 text-sm text-zinc-400">Manage your property residents, staff, and visitors.</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-[0.8rem] font-medium text-zinc-500 shadow-sm">
          <Calendar size={14} />{todayLabel}
        </div>
      </header>

      <div className="mb-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color, bg, bar, href }) => (
          <Link key={label} href={href} className="relative overflow-hidden rounded-[18px] border border-black/5 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-shadow">
            <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-[10px] ${bg}`}>
              <Icon size={20} className={color} />
            </div>
            <div className="mb-1 text-[2rem] font-bold tracking-[-0.03em] leading-none text-zinc-900">{value}</div>
            <div className="text-[0.8rem] text-zinc-400">{label}</div>
            <div className={`absolute bottom-0 left-0 right-0 h-[3px] rounded-b-[18px] bg-gradient-to-r ${bar}`} />
          </Link>
        ))}
      </div>

      <div className="card max-w-2xl">
        <h2 className="section-title mb-5 flex items-center gap-2">
          <Eye size={16} className="text-emerald-600" />
          Recent Activity
        </h2>
        {(recentActivity ?? []).length === 0 ? (
          <p className="text-sm text-zinc-400 text-center py-6">No recent activity.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {(recentActivity ?? []).map((a, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                <div>
                  <div className="text-sm font-medium text-zinc-900">{a.visitor_name}</div>
                  <div className="text-xs text-zinc-400">Requested by {a.resident_name ?? '—'}</div>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  a.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' :
                  a.status === 'Verified' ? 'bg-sky-50 text-sky-600' :
                  a.status === 'Rejected' ? 'bg-rose-50 text-rose-600' :
                  'bg-zinc-100 text-zinc-500'
                }`}>{a.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
