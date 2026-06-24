import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/Sidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: profile } = await supabase
    .from('users')
    .select('role, full_name, email')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'Managing Staff') redirect('/admin/login')

  return (
    <div className="flex min-h-screen bg-[#fafafa]">
      <Sidebar role="Managing Staff" name={profile.full_name ?? ''} email={profile.email ?? ''} />
      <main className="w-full box-border px-5 py-8 md:py-12 md:pl-20 md:pr-10">
        {children}
      </main>
    </div>
  )
}
