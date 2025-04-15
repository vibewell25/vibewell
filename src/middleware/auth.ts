import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { is2FAEnabled } from '@/lib/auth/two-factor';

// Paths that don't require MFA
const MFA_EXEMPT_PATHS = [
  '/auth/mfa-setup',
  '/auth/login',
  '/auth/signup',
  '/auth/forgot-password',
  '/api/auth',
  '/_next',
  '/static',
];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Get the current path
  const path = req.nextUrl.pathname;

  // Allow access to exempt paths
  if (MFA_EXEMPT_PATHS.some(exempt => path.startsWith(exempt))) {
    return res;
  }

  // If no session, redirect to login
  if (!session) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  // Check if user has MFA enabled
  const { enabled: mfaEnabled, error: mfaError } = await is2FAEnabled(session.user.id);

  // If there was an error checking MFA status, log it and allow access
  // This is a fail-open approach - in production you might want to fail-closed
  if (mfaError) {
    console.error('Error checking MFA status:', mfaError);
    return res;
  }

  // If MFA is not enabled, redirect to setup
  if (!mfaEnabled && !path.startsWith('/auth/mfa-setup')) {
    return NextResponse.redirect(new URL('/auth/mfa-setup', req.url));
  }

  return res;
} 