import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Users, ShieldCheck, Clock, Calendar } from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

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
    supabase.from('visit_requests').select('visitor_name, resident_name, status, request_date').eq('property_id', profile?.property_id ?? '').order('request_date', { ascending: false }).limit(6),
  ])

  const todayLabel = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  const stats = [
    { label: 'Residents', value: totalResidents ?? 0, icon: Users, href: '/admin/residents' },
    { label: 'Security Staff', value: totalStaff ?? 0, icon: ShieldCheck, href: '/admin/staff' },
    { label: 'Pending Passes', value: pendingVisits ?? 0, icon: Clock, href: '/admin/history' },
    { label: "Today's Visitors", value: todayVisitors ?? 0, icon: Calendar, href: '/admin/history' },
  ]

  const statusStyle: Record<string, string> = {
    Approved: 'text-[#4caf6e]',
    Verified: 'text-sky-500',
    Rejected: 'text-rose-500',
  }

  return (
    <>
      <header className="mb-10">
        <p className="text-[0.7rem] font-semibold text-zinc-400 tracking-[0.14em] uppercase mb-1">{todayLabel}</p>
        <h1 className="text-[1.85rem] font-bold text-zinc-900 tracking-[-0.03em] leading-tight">
          {profile?.full_name ? `Hello, ${profile.full_name.split(' ')[0]}` : 'Dashboard'}
        </h1>
      </header>

      <div className="mb-8 grid grid-cols-2 gap-px bg-zinc-100 border border-zinc-100 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, href }) => (
          <Link key={label} href={href} className="bg-white p-6 hover:bg-zinc-50 transition-colors group">
            <Icon size={16} className="text-zinc-300 mb-4 group-hover:text-[#4caf6e] transition-colors" />
            <div className="text-[2.2rem] font-bold tracking-[-0.04em] leading-none text-zinc-900 mb-1.5">{value}</div>
            <div className="text-[0.78rem] text-zinc-400 font-medium">{label}</div>
          </Link>
        ))}
      </div>

      <div className="max-w-2xl">
        <h2 className="text-[0.7rem] font-semibold text-zinc-400 tracking-[0.14em] uppercase mb-4">Recent Activity</h2>
        {(recentActivity ?? []).length === 0 ? (
          <p className="text-[0.875rem] text-zinc-400 py-8">No recent activity.</p>
        ) : (
          <div className="border border-zinc-100 divide-y divide-zinc-100 bg-white">
            {(recentActivity ?? []).map((a, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <div className="text-[0.88rem] font-medium text-zinc-900">{a.visitor_name}</div>
                  <div className="text-[0.75rem] text-zinc-400 mt-0.5">Requested by {a.resident_name ?? '—'}</div>
                </div>
                <span className={`text-[0.75rem] font-semibold tracking-wide ${statusStyle[a.status] ?? 'text-zinc-400'}`}>
                  {a.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
