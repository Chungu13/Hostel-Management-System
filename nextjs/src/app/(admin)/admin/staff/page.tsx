import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import StaffClient from './StaffClient'

export default async function StaffPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: profile } = await supabase.from('users').select('property_id').eq('id', user.id).single()

  const { data: staff } = profile?.property_id
    ? await supabase
        .from('security_staff')
        .select('id, name, email, phone, gender, approved, on_duty, created_at')
        .eq('property_id', profile.property_id)
        .order('created_at', { ascending: false })
    : { data: [] }

  return <StaffClient propertyId={profile?.property_id ?? ''} staff={staff ?? []} />
}
