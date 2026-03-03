import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const PUBLIC_ROUTES = ['/', '/login', '/verify', '/fields']
const PLAYER_ROUTES = ['/bookings', '/favorites']
const OWNER_ROUTES = ['/dashboard', '/calendar', '/owner']
const ADMIN_ROUTES = ['/admin']

function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/'))
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Not logged in trying to access protected route
  if (!user && !isPublicRoute(pathname)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user) {
    // Fetch role from DB
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role

    // Redirect logged-in users away from auth pages
    if (pathname === '/login' || pathname === '/verify') {
      if (role === 'owner') return NextResponse.redirect(new URL('/dashboard', request.url))
      if (role === 'admin') return NextResponse.redirect(new URL('/admin/dashboard', request.url))
      return NextResponse.redirect(new URL('/fields', request.url))
    }

    // Enforce role access
    const isOwnerRoute = OWNER_ROUTES.some(r => pathname.startsWith(r))
    const isAdminRoute = ADMIN_ROUTES.some(r => pathname.startsWith(r))

    if (isOwnerRoute && role !== 'owner' && role !== 'admin') {
      return NextResponse.redirect(new URL('/fields', request.url))
    }
    if (isAdminRoute && role !== 'admin') {
      return NextResponse.redirect(new URL('/fields', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

// Next.js 16 proxy alias
export { proxy as default }
