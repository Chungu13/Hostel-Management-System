import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminProfileClient from './AdminProfileClient'

export default async function AdminProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: profile } = await supabase.from('users').select('full_name, email, phone, ic, address').eq('id', user.id).single()
  const { data: property } = await supabase.from('properties').select('name, address, property_type').eq('admin_id', user.id).single()

  return <AdminProfileClient userId={user.id} profile={profile ?? {}} property={property ?? {}} />
}
