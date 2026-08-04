import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { verifyAdminToken } from '@/lib/admin-auth'
import { safeInternalPath } from '@/lib/safe-redirect'

const ADMIN_COOKIE = 'admin_session'
const ADMIN_LOGIN = '/admin/giris'
const ADMIN_PREFIX = '/admin'
const ACCOUNT_PREFIX = '/hesabim'
const USER_LOGIN = '/giris'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Sayfa/layout'ların hangi yolda olduklarını bilebilmesi için
  // (admin layout giriş sayfasını kendi korumasından muaf tutmakta kullanır)
  const forwardHeaders = new Headers(req.headers)
  forwardHeaders.set('x-pathname', pathname)

  // ── 1. Admin rotaları (cookie tabanlı, Supabase kullanmıyor) ──────────────
  if (pathname.startsWith(ADMIN_PREFIX)) {
    if (pathname === ADMIN_LOGIN) {
      return NextResponse.next({ request: { headers: forwardHeaders } })
    }

    const session = req.cookies.get(ADMIN_COOKIE)?.value
    if (!(await verifyAdminToken(session))) {
      const url = new URL(ADMIN_LOGIN, req.url)
      url.searchParams.set('redirect', safeInternalPath(pathname, '/admin'))
      const res = NextResponse.redirect(url)
      // Geçersiz/eski token'ı temizle (eski 'authenticated' değeri dahil)
      if (session) res.cookies.delete(ADMIN_COOKIE)
      return res
    }
    return NextResponse.next({ request: { headers: forwardHeaders } })
  }

  // ── 2. Supabase oturum yenileme ──────────────────────────────────────────
  // Yalnızca oturumun gerçekten gerektiği yollarda çalıştırılır. Eskiden her
  // sayfa isteğinde (blog, hakkımızda dahil) Supabase'e ağ çağrısı yapılıyor ve
  // gözle görülür gecikme ekliyordu.
  const needsSession =
    pathname.startsWith(ACCOUNT_PREFIX) ||
    pathname === USER_LOGIN ||
    pathname === '/kayit' ||
    pathname === '/odeme' ||
    pathname.startsWith('/odeme/') ||
    pathname === '/sifre-yenile'

  if (!needsSession) {
    return NextResponse.next({ request: { headers: forwardHeaders } })
  }

  let response = NextResponse.next({ request: { headers: forwardHeaders } })

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
          response = NextResponse.next({ request: { headers: forwardHeaders } })
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
  /**
   * Yönlendirirken, Supabase'in bu istek sırasında yenilediği oturum
   * çerezlerini yeni yanıta taşı. Aksi hâlde token rotasyonu tam da
   * yönlendirme anına denk geldiğinde kullanıcının oturumu düşüyordu.
   */
  const redirectWithCookies = (url: URL) => {
    const res = NextResponse.redirect(url)
    response.cookies.getAll().forEach((cookie) => res.cookies.set(cookie))
    return res
  }

  if (pathname.startsWith(ACCOUNT_PREFIX) && !user) {
    const url = new URL(USER_LOGIN, req.url)
    url.searchParams.set('redirect', safeInternalPath(pathname, ACCOUNT_PREFIX))
    return redirectWithCookies(url)
  }

  // ── 4. /giris ve /kayit — zaten giriş yapmışsa hesabıma yönlendir ────────
  if ((pathname === USER_LOGIN || pathname === '/kayit') && user) {
    return redirectWithCookies(new URL(ACCOUNT_PREFIX, req.url))
  }

  return response
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/hesabim/:path*',
    '/giris',
    '/kayit',
    '/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
