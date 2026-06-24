import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ResidentsClient from './ResidentsClient'

export default async function ResidentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: profile } = await supabase.from('users').select('property_id').eq('id', user.id).single()

  const { data: residents } = profile?.property_id
    ? await supabase
        .from('residents')
        .select('id, name, email, phone, room, gender, approved, created_at')
        .eq('property_id', profile.property_id)
        .order('created_at', { ascending: false })
    : { data: [] }

  return <ResidentsClient propertyId={profile?.property_id ?? ''} residents={residents ?? []} />
}
