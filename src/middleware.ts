import { NextRequest, NextResponse } from 'next/server'

const ADMIN_COOKIE = 'admin_session'
const LOGIN_PATH = '/admin/giris'
const ADMIN_PREFIX = '/admin'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Sadece /admin/* rotalarını koru
  if (!pathname.startsWith(ADMIN_PREFIX)) {
    return NextResponse.next()
  }

  // Giriş sayfası herkese açık
  if (pathname === LOGIN_PATH) {
    return NextResponse.next()
  }

  // Cookie kontrolü
  const session = req.cookies.get(ADMIN_COOKIE)?.value
  if (!session || session !== 'authenticated') {
    const loginUrl = new URL(LOGIN_PATH, req.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
