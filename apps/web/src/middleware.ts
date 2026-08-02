import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    const hasError = (token as any)?.error === 'RefreshTokenError'

    if (pathname.startsWith('/admin')) {
      if (!token || hasError) {
        return NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, req.url))
      }
      if (token.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/', req.url))
      }
    }

    if (pathname.startsWith('/employer')) {
      if (!token || hasError) {
        return NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, req.url))
      }
      if (token.role !== 'EMPLOYER' && token.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/', req.url))
      }
    }

    if (
      pathname.startsWith('/profile') ||
      pathname.startsWith('/applications') ||
      (pathname.startsWith('/resumes') && !pathname.startsWith('/resumes/templates'))
    ) {
      if (!token || hasError) {
        return NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: () => true,
    },
  },
)

export const config = {
  matcher: [
    '/admin/:path*',
    '/employer/:path*',
    '/profile/:path*',
    '/applications/:path*',
    '/resumes/:path*',
  ],
}
