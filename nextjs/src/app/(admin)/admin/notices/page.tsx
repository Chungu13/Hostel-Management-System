import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import NoticesClient from './NoticesClient'

export default async function NoticesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('users').select('property_id').eq('id', user.id).single()

  const { data: notices } = profile?.property_id
    ? await supabase
        .from('notices')
        .select('id, title, content, importance, updated_at')
        .eq('property_id', profile.property_id)
        .order('updated_at', { ascending: false })
    : { data: [] }

  return <NoticesClient propertyId={profile?.property_id ?? ''} notices={notices ?? []} />
}
