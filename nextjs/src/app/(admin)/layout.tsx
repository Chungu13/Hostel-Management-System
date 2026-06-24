import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/Sidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('role, full_name, email')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'Managing Staff') redirect('/login')

  return (
    <div className="flex min-h-screen bg-[#f7f7f5]" style={{ backgroundImage: 'radial-gradient(circle at 5% 10%, rgba(134,197,152,0.10) 0%, transparent 45%)' }}>
      <Sidebar role="Managing Staff" name={profile.full_name ?? ''} email={profile.email ?? ''} />
      <main className="w-full box-border px-5 py-6 md:py-10 md:pl-20 md:pr-10">
        {children}
      </main>
    </div>
  )
}
