import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const roleCookie = request.cookies.get('nha_co_tiec_role')?.value;

  // 1. Allow public assets, API routes, auth callbacks, and login pages
  if (
    pathname === '/admin/login' ||
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/forgot-password' ||
    pathname === '/403'
  ) {
    return NextResponse.next();
  }

  // 2. Protect Admin routes (/admin and /admin/*)
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    // If not authenticated at all -> Redirect to Admin Login
    if (!roleCookie) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // If authenticated as normal USER -> Deny access with 403
    if (roleCookie === 'USER' || roleCookie !== 'ADMIN') {
      return NextResponse.redirect(new URL('/403', request.url));
    }

    // If ADMIN -> Allow access
    return NextResponse.next();
  }

  // 3. Protect User Dashboard routes (/dashboard and /dashboard/*)
  if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
    // If not authenticated -> Redirect to User Login
    if (!roleCookie) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // If authenticated (USER or ADMIN) -> Allow access
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
