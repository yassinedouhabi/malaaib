import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/login', '/register']

const ROLE_HOME: Record<string, string> = {
  player: '/fields',
  owner: '/dashboard',
  admin: '/admin/dashboard',
}

const OWNER_ROUTES = ['/dashboard', '/calendar', '/reservations', '/settings']
const ADMIN_ROUTES = ['/admin']

function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/'))
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
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

  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch {
    return response
  }

  // ── Unauthenticated ──────────────────────────────────────────────────────
  if (!user) {
    if (isPublicRoute(pathname)) return response
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // ── Authenticated: fetch profile ─────────────────────────────────────────
  let role: string | null = null
  try {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
    role = profile?.role ?? null
  } catch { /* fall through */ }

  // No profile yet → only /register allowed
  if (!role) {
    if (pathname.startsWith('/register')) return response
    return NextResponse.redirect(new URL('/register', request.url))
  }

  // Has profile → redirect away from auth pages
  if (isPublicRoute(pathname)) {
    return NextResponse.redirect(new URL(ROLE_HOME[role] ?? '/fields', request.url))
  }

  // Role-based access control
  const isOwnerRoute = OWNER_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/'))
  const isAdminRoute  = ADMIN_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/'))

  if (isOwnerRoute && role !== 'owner' && role !== 'admin') {
    return NextResponse.redirect(new URL('/fields', request.url))
  }
  if (isAdminRoute && role !== 'admin') {
    return NextResponse.redirect(new URL('/fields', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all paths EXCEPT:
     * - /api/* (API routes handle their own auth)
     * - _next/static, _next/image, favicon, static assets
     */
    '/((?!api|_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
