import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';

// Paths that don't require authentication
const PUBLIC_PATHS = [
  '/',
  '/auth/login',
  '/auth/signup',
  '/auth/forgot-password',
  '/api/auth/login',
  '/api/auth/signup',
  '/api/auth/forgot-password'
];

// Paths that are part of the MFA flow
const MFA_PATHS = [
  '/auth/mfa-setup',
  '/auth/mfa-verify',
  '/api/auth/mfa/enroll',
  '/api/auth/mfa/verify'
];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const path = req.nextUrl.pathname;

  // Skip middleware for public paths and static files
  if (PUBLIC_PATHS.includes(path) || path.startsWith('/_next') || path.includes('.')) {
    return res;
  }

  try {
    const session = await getSession(req, res);

    // No session - redirect to login
    if (!session?.user) {
      const loginUrl = new URL('/auth/login', req.url);
      loginUrl.searchParams.set('returnTo', path);
      return NextResponse.redirect(loginUrl);
    }

    // Check if MFA is required but not enrolled
    if (session.user.mfa_required && !session.user.mfa_enrolled && !MFA_PATHS.includes(path)) {
      return NextResponse.redirect(new URL('/auth/mfa-setup', req.url));
    }

    // Check if MFA is required and enrolled but not verified for this session
    if (
      session.user.mfa_required &&
      session.user.mfa_enrolled &&
      !session.user.mfa_verified &&
      !MFA_PATHS.includes(path)
    ) {
      return NextResponse.redirect(new URL('/auth/mfa-verify', req.url));
    }

    // Add user info to headers for API routes
    if (path.startsWith('/api/')) {
      res.headers.set('X-User-ID', session.user.sub);
      res.headers.set('X-User-Role', session.user.role || 'user');
    }

    return res;
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    // On error, redirect to login for non-API routes
    if (!path.startsWith('/api/')) {
      const loginUrl = new URL('/auth/login', req.url);
      loginUrl.searchParams.set('returnTo', path);
      return NextResponse.redirect(loginUrl);
    }

    // For API routes, return unauthorized
    return new NextResponse(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. Matches any request that starts with:
     *  - _next
     *  - static (static files)
     *  - favicon.ico (favicon file)
     *  - public folder
     * 2. Matches based on functions above
     */
    '/((?!_next/|static/|favicon.ico|public/).*)',
  ],
};
