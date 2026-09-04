import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionToken } from '@/lib/auth/session-token';

import { mockStore } from '@/lib/supabase/mock-store';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const roleCookie = request.cookies.get('nha_co_tiec_role')?.value;
  const sessionCookie = request.cookies.get('nha_co_tiec_session')?.value;
  const userIdCookie = request.cookies.get('nha_co_tiec_user_id')?.value;

  // Determine trusted role: cryptographic verification or trusted database record
  let trustedRole: 'USER' | 'ADMIN' | null = null;
  const sessionResult = verifySessionToken(sessionCookie);

  if (sessionResult.valid && sessionResult.role) {
    trustedRole = sessionResult.role;
  } else if (sessionCookie) {
    // Tampered session token
    trustedRole = null;
  } else if (userIdCookie) {
    // When sessionCookie is not set, verify userId against trusted store. NEVER trust roleCookie blindly!
    const trustedUser = mockStore.users.find(
      (u) => u.id === userIdCookie && u.status === 'ACTIVE'
    );
    if (trustedUser) {
      trustedRole = trustedUser.role;
    }
  }

  // Generate or forward unique request correlation ID
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID();
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-request-id', requestId);

  const createNextResponse = () => {
    const res = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
    res.headers.set('x-request-id', requestId);
    return res;
  };

  const createRedirectResponse = (url: URL) => {
    const res = NextResponse.redirect(url);
    res.headers.set('x-request-id', requestId);
    return res;
  };

  // 1. Allow public assets, API routes, auth callbacks, and login pages
  if (
    pathname === '/admin/login' ||
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/forgot-password' ||
    pathname === '/403'
  ) {
    return createNextResponse();
  }

  // 2. Protect Admin routes (/admin and /admin/*)
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    // If not authenticated at all -> Redirect to Admin Login
    if (!trustedRole && !userIdCookie && !roleCookie) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return createRedirectResponse(loginUrl);
    }

    // If authenticated as normal USER or role spoofing attempt -> Deny access with 403
    if (trustedRole !== 'ADMIN') {
      return createRedirectResponse(new URL('/403', request.url));
    }

    // If ADMIN verified -> Allow access
    return createNextResponse();
  }

  // 3. Protect User Dashboard routes (/dashboard and /dashboard/*)
  if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
    // If not authenticated -> Redirect to User Login
    if (!trustedRole && !userIdCookie) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return createRedirectResponse(loginUrl);
    }

    // If authenticated as ADMIN -> Route to /admin
    if (trustedRole === 'ADMIN') {
      return createRedirectResponse(new URL('/admin', request.url));
    }

    // If authenticated USER -> Allow access
    return createNextResponse();
  }

  return createNextResponse();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
