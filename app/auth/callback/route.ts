import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { AuthService } from '@/lib/auth/auth-service';
import { cookies } from 'next/headers';
import { ErrorMonitoring } from '@/lib/monitoring/sentry';

/**
 * Validates a destination URL against open redirect vulnerabilities
 */
function sanitizeRedirectUrl(url: string | null): string {
  if (!url) return '/dashboard';

  // Must be a relative path starting with single slash
  if (!url.startsWith('/') || url.startsWith('//') || url.includes('://')) {
    return '/dashboard';
  }

  return url;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const errorParam = requestUrl.searchParams.get('error');
  const rawNext = requestUrl.searchParams.get('next');
  const safeNext = sanitizeRedirectUrl(rawNext);

  // 1. Handle OAuth provider errors
  if (errorParam) {
    ErrorMonitoring.captureMessage(`OAuth provider error: ${errorParam}`, 'warning', {
      route: '/auth/callback',
      extra: { errorDescription: requestUrl.searchParams.get('error_description') },
    });
    return NextResponse.redirect(new URL('/login?error=oauth_denied', requestUrl.origin));
  }

  // 2. Validate authorization code
  if (!code) {
    return NextResponse.redirect(new URL('/login?error=invalid_code', requestUrl.origin));
  }

  try {
    let authUser: { id: string; email?: string; user_metadata?: Record<string, unknown> } | null = null;

    // 3. Supabase Code Exchange
    const isSupabaseConfigured = Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
    );

    if (isSupabaseConfigured) {
      const supabase = await createClient();
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        ErrorMonitoring.captureException(exchangeError, {
          route: '/auth/callback',
          classification: 'OAUTH_ERROR',
        });
        return NextResponse.redirect(new URL('/login?error=oauth_failed', requestUrl.origin));
      }

      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        return NextResponse.redirect(new URL('/login?error=oauth_failed', requestUrl.origin));
      }

      authUser = userData.user;
    } else {
      // 4. Mock / Development / Testing Mode
      authUser = {
        id: `usr-google-${Date.now()}`,
        email: 'google.user@example.com',
        user_metadata: {
          full_name: 'Khách Hàng Google',
          avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        },
      };
    }

    if (!authUser || !authUser.email) {
      return NextResponse.redirect(new URL('/login?error=oauth_failed', requestUrl.origin));
    }

    // 5. User profile sync & duplicate account handling
    const { user: profile, error: syncError } = await AuthService.syncOAuthUserProfile(authUser);

    if (syncError === 'ACCOUNT_SUSPENDED') {
      return NextResponse.redirect(new URL('/login?error=account_suspended', requestUrl.origin));
    }

    if (!profile) {
      return NextResponse.redirect(new URL('/login?error=oauth_failed', requestUrl.origin));
    }

    // 6. Role-aware safe redirect
    let destination = safeNext;
    if (profile.role === 'ADMIN' && (destination === '/dashboard' || destination === '/')) {
      destination = '/admin';
    } else if (profile.role === 'USER' && destination.startsWith('/admin')) {
      destination = '/dashboard';
    }

    const response = NextResponse.redirect(new URL(destination, requestUrl.origin));
    const cookieOptions = {
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
      sameSite: 'lax' as const,
    };

    // Attach cookies directly to HTTP redirect response
    response.cookies.set('nha_co_tiec_role', profile.role, cookieOptions);
    response.cookies.set('nha_co_tiec_user_id', profile.id, cookieOptions);
    response.cookies.set('nha_co_tiec_user', JSON.stringify(profile), cookieOptions);

    // Also persist in Next.js cookie store if within request scope
    try {
      const cookieStore = await cookies();
      cookieStore.set('nha_co_tiec_role', profile.role, cookieOptions);
      cookieStore.set('nha_co_tiec_user_id', profile.id, cookieOptions);
      cookieStore.set('nha_co_tiec_user', JSON.stringify(profile), cookieOptions);
    } catch {
      // Ignored outside Next.js request lifecycle (e.g. standalone test runner)
    }

    return response;
  } catch (err) {
    ErrorMonitoring.captureException(err, {
      route: '/auth/callback',
      classification: 'OAUTH_ERROR',
    });
    return NextResponse.redirect(new URL('/login?error=oauth_failed', requestUrl.origin));
  }
}
