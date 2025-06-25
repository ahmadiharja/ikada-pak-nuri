import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // === Alumni Area ===
  if (pathname.startsWith('/alumni')) {
    const alumniToken = req.cookies.get('alumni_token')?.value
    if (!alumniToken) {
      return NextResponse.redirect(new URL('/alumni-login', req.url))
    }
    return NextResponse.next()
  }

  // === Admin Area ===
  if (pathname.startsWith('/dashboard')) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token || !['PUSAT', 'SYUBIYAH'].includes(token.role)) {
      return NextResponse.redirect(new URL('/admin', req.url))
    }
    return NextResponse.next()
  }

  // === Default: allow ===
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/alumni/:path*',
    '/dashboard/:path*',
  ]
}