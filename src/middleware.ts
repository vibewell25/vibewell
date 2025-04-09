import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isAdmin } from '@/lib/utils/admin';

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/auth/login',
  '/auth/signup',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-email',
  '/api/auth/callback',
  '/_next',
  '/favicon.ico',
];

// Define protected routes based on user roles
const protectedRoutes: Record<string, string[]> = {
  customer: [
    '/dashboard',
    '/bookings',
    '/profile',
    '/virtual-try-on',
  ],
  provider: [
    '/provider/dashboard',
    '/provider/services',
    '/provider/bookings',
    '/provider/profile',
  ],
  admin: [
    '/admin/dashboard',
    '/admin/users',
    '/admin/services',
    '/admin/bookings',
    '/admin/settings',
  ],
};

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Check if the user is trying to access an admin route
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!session?.user) {
      // Redirect to login if not authenticated
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Check if the user has admin role
    const isUserAdmin = await isAdmin(session.user.id);
    if (!isUserAdmin) {
      // Redirect to home if not an admin
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  // Check if the request path is public
  if (publicRoutes.some(route => req.nextUrl.pathname.startsWith(route))) {
    return res;
  }

  // Get user role from session
  const userRole = session.user.user_metadata.role || 'customer';

  // Check if user has access to the requested route
  const userRoutes = protectedRoutes[userRole] || [];
  const hasAccess = userRoutes.some(route => req.nextUrl.pathname.startsWith(route));

  if (!hasAccess) {
    // Redirect to appropriate dashboard based on role
    const dashboardPath = `/${userRole}/dashboard`;
    return NextResponse.redirect(new URL(dashboardPath, req.url));
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
    '/admin/:path*',
  ],
}; 