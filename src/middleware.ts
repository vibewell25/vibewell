import { NextResponse, type NextRequest } from 'next/server';
import { auth0 } from '@/lib/auth0';

// Define protected routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/profile',
  '/bookings',
  '/settings',
  '/appointments',
];

// Define routes that require specific roles
const ROLE_PROTECTED_ROUTES = {
  '/admin': ['admin'],
  '/provider': ['provider'],
  '/business': ['business_owner'],
};

/**
 * Check if a path requires authentication
 */
function isProtectedRoute(path: string): boolean {
  return PROTECTED_ROUTES.some(route => path.startsWith(route));
}

/**
 * Check if a path requires specific roles
 */
function getRolesForRoute(path: string): string[] | null {
  for (const [route, roles] of Object.entries(ROLE_PROTECTED_ROUTES)) {
    if (path.startsWith(route)) {
      return roles;
    }
  }
  return null;
}

/**
 * Auth0 middleware to handle authentication
 * This middleware will:
 * 1. Mount the authentication routes (/auth/*)
 * 2. Handle session management
 * 3. Keep access tokens fresh
 * 4. Protect routes based on authentication and roles
 */
export async function middleware(request: NextRequest) {
  // Get the pathname from the URL
  const { pathname } = request.nextUrl;
  const { origin } = new URL(request.url);

  // Let Auth0 handle its routes
  if (pathname.startsWith('/auth')) {
    return auth0.middleware(request);
  }

  try {
    // Get the user's session
    const session = await auth0.getSession();
    const user = session?.user;

    // Check if the route requires authentication
    if (isProtectedRoute(pathname)) {
      if (!session) {
        const returnTo = encodeURIComponent(pathname);
        return NextResponse.redirect(`${origin}/auth/login?returnTo=${returnTo}`);
      }
    }

    // Check if the route requires specific roles
    const requiredRoles = getRolesForRoute(pathname);
    if (requiredRoles && (!user?.roles || !requiredRoles.some(role => user.roles.includes(role)))) {
      // User doesn't have the required role - redirect to home
      return NextResponse.redirect(origin);
    }

    // Continue with the request
    return auth0.middleware(request);
  } catch (error) {
    console.error('Auth middleware error:', error);
    // On error, redirect to login
    return NextResponse.redirect(`${origin}/auth/login`);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
