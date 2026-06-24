import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  // Verify the caller is an authenticated admin
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('users')
    .select('role, property_id')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'Managing Staff') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  if (!profile.property_id) {
    return NextResponse.json({ error: 'Your account has no property assigned. Complete onboarding first.' }, { status: 400 })
  }

  const { name, email, phone, gender, passkey } = await req.json()
  if (!name || !passkey) {
    return NextResponse.json({ error: 'Name and passkey are required.' }, { status: 400 })
  }

  // Derive a unique auth email from the staff name (never shown to staff — they log in with name+passkey)
  const authEmail = `${name.toLowerCase().replace(/\s+/g, '.')}@staff.malo`

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email: authEmail,
    password: passkey,
    email_confirm: true,
  })

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 })
  }

  const staffUserId = authData.user.id

  // Create users row for the new staff member
  const { error: userError } = await admin.from('users').insert({
    id: staffUserId,
    email: authEmail,
    full_name: name,
    role: 'Security Staff',
    property_id: profile.property_id,
    is_onboarded: true,
    is_approved: true,
  })

  if (userError) {
    await admin.auth.admin.deleteUser(staffUserId)
    return NextResponse.json({ error: userError.message }, { status: 400 })
  }

  // Create security_staff row
  const { data: staff, error: staffError } = await admin
    .from('security_staff')
    .insert({
      user_id: staffUserId,
      name,
      email: email || authEmail,
      phone: phone || null,
      gender: gender || 'Male',
      passkey,
      property_id: profile.property_id,
      approved: true,
      on_duty: false,
    })
    .select()
    .single()

  if (staffError) {
    await admin.auth.admin.deleteUser(staffUserId)
    return NextResponse.json({ error: staffError.message }, { status: 400 })
  }

  return NextResponse.json({ staff })
}
