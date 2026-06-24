import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  // Public paths — no auth needed
  const publicPaths = ['/login', '/register', '/guest-pass']
  if (publicPaths.some(p => path.startsWith(p))) return supabaseResponse

  // Unauthenticated → login
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Fetch user role from DB
  const { data: profile } = await supabase
    .from('users')
    .select('role, is_onboarded, is_approved')
    .eq('id', user.id)
    .single()

  // Not onboarded → onboarding
  if (profile && !profile.is_onboarded && path !== '/onboarding') {
    return NextResponse.redirect(new URL('/onboarding', request.url))
  }

  // Resident not yet approved → pending
  if (
    profile?.role === 'Resident' &&
    profile?.is_onboarded &&
    !profile?.is_approved &&
    path !== '/pending-approval'
  ) {
    return NextResponse.redirect(new URL('/pending-approval', request.url))
  }

  // Role-based path protection
  const role = profile?.role
  if (path.startsWith('/admin') && role !== 'Managing Staff') {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  if (path.startsWith('/security') && role !== 'Security Staff') {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  if (path.startsWith('/resident') && role !== 'Resident') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
}
