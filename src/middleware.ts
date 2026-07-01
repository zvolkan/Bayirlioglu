import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const ADMIN_COOKIE = 'admin_session'
const ADMIN_LOGIN = '/admin/giris'
const ADMIN_PREFIX = '/admin'
const ACCOUNT_PREFIX = '/hesabim'
const USER_LOGIN = '/giris'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // ── 1. Admin rotaları (cookie tabanlı, Supabase kullanmıyor) ──────────────
  if (pathname.startsWith(ADMIN_PREFIX)) {
    if (pathname === ADMIN_LOGIN) return NextResponse.next()
    const session = req.cookies.get(ADMIN_COOKIE)?.value
    if (!session || session !== 'authenticated') {
      const url = new URL(ADMIN_LOGIN, req.url)
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  // ── 2. Supabase oturum yenileme (tüm diğer rotalar) ──────────────────────
  let response = NextResponse.next({ request: req })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value))
          response = NextResponse.next({ request: req })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Oturumu yenile (token refresh)
  const { data: { user } } = await supabase.auth.getUser()

  // ── 3. /hesabim rotaları — giriş gerekli ────────────────────────────────
  if (pathname.startsWith(ACCOUNT_PREFIX) && !user) {
    const url = new URL(USER_LOGIN, req.url)
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // ── 4. /giris ve /kayit — zaten giriş yapmışsa hesabıma yönlendir ────────
  if ((pathname === USER_LOGIN || pathname === '/kayit') && user) {
    return NextResponse.redirect(new URL(ACCOUNT_PREFIX, req.url))
  }

  return response
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/hesabim/:path*',
    '/giris',
    '/kayit',
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
