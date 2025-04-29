import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // Allow API auth routes, 2FA page, Next.js internals, and static assets
  if (
    pathname.startsWith('/api/auth') ||
    pathname === '/2fa' ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check for Auth0 session cookie and 2FA verification flag
  const isAuthenticated = !!req.cookies.get('appSession')?.value;
  const twoF = req.cookies.get('twoFactorVerified')?.value;

  if (isAuthenticated && twoF !== 'true') {
    const url = req.nextUrl.clone();
    url.pathname = '/2fa';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}
