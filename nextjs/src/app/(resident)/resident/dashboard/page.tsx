import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, Calendar, PlusCircle, History, ArrowRight, ShieldCheck, AlertCircle, Clock } from 'lucide-react'

export default async function ResidentDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('full_name, email, property_id')
    .eq('id', user.id)
    .single()

  const { data: resident } = await supabase
    .from('residents')
    .select('id')
    .eq('user_id', user.id)
    .single()

  const [{ data: visits }, { data: notice }, { data: onDuty }] = await Promise.all([
    resident
      ? supabase.from('visit_requests').select('id, status, visit_date').eq('resident_id', resident.id)
      : { data: [] },
    profile?.property_id
      ? supabase.from('notices').select('title, content, importance, updated_at').eq('property_id', profile.property_id).order('updated_at', { ascending: false }).limit(1).single()
      : { data: null },
    profile?.property_id
      ? supabase.from('security_staff').select('name').eq('property_id', profile.property_id).eq('on_duty', true)
      : { data: [] },
  ])

  const approvedVisits = (visits ?? []).filter(v => v.status === 'Approved')
  const now = new Date()
  const upcoming = approvedVisits
    .map(v => ({ ...v, _d: new Date(v.visit_date) }))
    .filter(v => !isNaN(v._d.getTime()) && v._d >= now)
    .sort((a, b) => a._d.getTime() - b._d.getTime())[0] ?? null

  const todayLabel = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  const displayName = profile?.full_name || profile?.email || 'Resident'

  return (
    <>
      {/* Header */}
      <header className="mb-9 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="page-title">Hello, <span className="text-black">{displayName}</span></h1>
          <p className="m-0 text-sm font-normal text-zinc-400">Manage your visitor passes and stay updated.</p>
        </div>
        <div className="mt-1 inline-flex items-center gap-2 whitespace-nowrap rounded-md border border-zinc-200 bg-white px-3.5 py-2 text-[0.8rem] font-medium text-zinc-500 shadow-sm">
          <Calendar size={14} />
          {todayLabel}
        </div>
      </header>

      {/* Stat Cards */}
      <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="relative overflow-hidden rounded-md border border-black/5 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.04)]">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-emerald-600/10">
            <CheckCircle2 size={20} className="text-emerald-600" />
          </div>
          <div className="mb-1 text-[2rem] font-bold tracking-[-0.03em] leading-none text-zinc-900">{approvedVisits.length}</div>
          <div className="text-[0.8rem] font-normal text-zinc-400">Active Passes</div>
          <div className="absolute bottom-0 left-0 right-0 h-[3px] rounded-b-[18px] bg-gradient-to-r from-emerald-600 to-emerald-300" />
        </div>

        <div className="relative overflow-hidden rounded-md border border-black/5 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.04)]">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-sky-500/10">
            <Calendar size={20} className="text-sky-400" />
          </div>
          <div className="mb-1 text-[1.1rem] font-bold tracking-[-0.02em] leading-snug text-zinc-900">
            {upcoming ? upcoming.visit_date : 'No Upcoming'}
          </div>
          <div className="text-[0.8rem] font-normal text-zinc-400">Next Guest Visit</div>
          <div className="absolute bottom-0 left-0 right-0 h-[3px] rounded-b-[18px] bg-gradient-to-r from-sky-400 to-sky-200" />
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {/* Security on Duty */}
        <section className="card">
          <h2 className="section-title mb-5 flex items-center gap-2">
            <ShieldCheck size={17} className="text-emerald-600" />
            Security on Duty
          </h2>
          <div className="space-y-3">
            {(onDuty ?? []).length > 0 ? (
              (onDuty ?? []).map((staff, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-md bg-zinc-50 border border-zinc-100">
                  <div className="w-8 h-8 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-600 font-bold text-xs">
                    {staff.name?.[0] ?? 'S'}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-zinc-900">{staff.name}</div>
                    <div className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">Active Patrol</div>
                  </div>
                  <div className="ml-auto w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
              ))
            ) : (
              <div className="p-4 rounded-md bg-amber-50 border border-amber-100 flex flex-col items-center text-center">
                <AlertCircle size={20} className="text-amber-500 mb-2" />
                <p className="text-xs font-bold text-amber-900">Reduced Presence</p>
                <p className="text-[10px] text-amber-700 font-medium">Remote monitoring active</p>
              </div>
            )}
          </div>
        </section>

        {/* Quick Tools */}
        <section className="card">
          <h2 className="section-title mb-5">Quick Tools</h2>
          <Link
            href="/resident/visit-request"
            className="group mb-2.5 flex items-center gap-3.5 rounded-md bg-gradient-to-br from-emerald-600 to-emerald-500 px-4 py-4 text-white shadow-[0_4px_14px_rgba(16,185,129,0.25)] transition hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(16,185,129,0.32)]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white/20">
              <PlusCircle size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="text-[0.9rem] font-semibold leading-none">New Visit Pass</div>
              <div className="mt-1 text-xs opacity-80">Register a guest for entry</div>
            </div>
            <ArrowRight size={18} className="transition group-hover:translate-x-1" />
          </Link>
          <Link
            href="/resident/history"
            className="group flex items-center gap-3.5 rounded-md border border-zinc-200 bg-zinc-50 px-4 py-4 text-zinc-800 transition hover:-translate-y-0.5 hover:bg-zinc-100"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-600/10">
              <History size={20} className="text-emerald-600" />
            </div>
            <div className="flex-1">
              <div className="text-[0.9rem] font-semibold leading-none">Past Records</div>
              <div className="mt-1 text-xs text-zinc-500">Review your visitor logs</div>
            </div>
            <ArrowRight size={18} className="text-zinc-400 transition group-hover:translate-x-1" />
          </Link>
        </section>

        {/* Notice */}
        <section className="card">
          <h2 className="mb-5 flex items-center gap-2 section-title">
            <AlertCircle size={17} className={(notice as any)?.importance === 'High' ? 'text-rose-500' : 'text-emerald-600'} />
            Resident Notice
          </h2>
          <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4">
            {notice && (
              <div className="flex items-center gap-2 mb-2.5">
                <span className="text-[0.9rem] font-bold text-zinc-900">{(notice as any).title}</span>
                {(notice as any).importance !== 'Low' && (
                  <span className={`px-2 py-0.5 rounded-md text-[0.6rem] font-bold uppercase tracking-tight ${(notice as any).importance === 'High' ? 'bg-rose-50 text-rose-500' : 'bg-amber-50 text-amber-500'}`}>
                    {(notice as any).importance}
                  </span>
                )}
              </div>
            )}
            <p className="mb-3 text-[0.855rem] leading-relaxed text-zinc-600">
              {(notice as any)?.content ?? 'Please ensure your guests have their QR Access Code ready for security staff upon arrival.'}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <Clock size={12} />
              {(notice as any)?.updated_at ? `Updated ${new Date((notice as any).updated_at).toLocaleDateString()}` : 'No recent notices'}
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
