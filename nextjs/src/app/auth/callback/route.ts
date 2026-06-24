import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/login'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          },
        },
      }
    )

    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && user) {
      // Ensure user row exists in public.users
      const { data: existing } = await supabase.from('users').select('id, is_onboarded, role, is_approved').eq('id', user.id).single()

      if (!existing) {
        await supabase.from('users').insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name ?? '',
          role: 'Resident',
          is_onboarded: false,
          is_approved: false,
        })
        return NextResponse.redirect(`${origin}/onboarding`)
      }

      if (!existing.is_onboarded) return NextResponse.redirect(`${origin}/onboarding`)
      if (existing.role === 'Resident' && !existing.is_approved) return NextResponse.redirect(`${origin}/pending-approval`)

      if (existing.role === 'Resident') return NextResponse.redirect(`${origin}/resident/dashboard`)
      if (existing.role === 'Security Staff') return NextResponse.redirect(`${origin}/security/dashboard`)
      if (existing.role === 'Managing Staff') return NextResponse.redirect(`${origin}/admin/dashboard`)
    }
  }

  return NextResponse.redirect(`${origin}/login`)
}
