import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SecurityProfileClient from './SecurityProfileClient'

export default async function SecurityProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/security/login')

  const { data: profile } = await supabase.from('users').select('full_name, email, phone, ic, address').eq('id', user.id).single()
  const { data: staff } = await supabase.from('security_staff').select('gender, on_duty').eq('user_id', user.id).single()

  return <SecurityProfileClient userId={user.id} profile={profile ?? {}} staff={staff ?? {}} />
}
