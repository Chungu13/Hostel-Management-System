import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfileClient from './ProfileClient'

export default async function ResidentProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('full_name, email, phone, ic, address, profile_image')
    .eq('id', user.id)
    .single()

  const { data: resident } = await supabase
    .from('residents')
    .select('room, gender, name')
    .eq('user_id', user.id)
    .single()

  return <ProfileClient userId={user.id} profile={profile ?? {}} resident={resident ?? {}} />
}
