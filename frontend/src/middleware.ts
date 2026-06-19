import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that require authentication
const PROTECTED_PREFIXES = ['/dashboard', '/admin']
// Routes that are only for unauthenticated users
const AUTH_ONLY_PREFIXES = ['/auth/login', '/auth/register', '/auth/forgot-password']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('accessToken')?.value
    || request.headers.get('authorization')?.replace('Bearer ', '')

  // Check localStorage is not accessible in middleware — we use a cookie approach.
  // The frontend sets an "auth_session" cookie on login for SSR middleware detection.
  const sessionCookie = request.cookies.get('auth_session')?.value

  const isAuthenticated = Boolean(sessionCookie || token)
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))
  const isAuthOnly = AUTH_ONLY_PREFIXES.some((p) => pathname.startsWith(p))

  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isAuthOnly && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
  ],
}
