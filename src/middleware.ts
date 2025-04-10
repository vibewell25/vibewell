import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isAdmin } from '@/lib/utils/admin';
import redisClient from '@/lib/redis-client';

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

// Rate limiting configuration
const rateLimit = {
  windowMs: 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per windowMs
  store: new Map<string, number[]>(),
  keyPrefix: 'ratelimit:middleware:',
};

// Helper function for Redis-based rate limiting in production
async function redisRateLimit(req: NextRequest): Promise<NextResponse | null> {
  try {
    // Only use Redis in production
    if (process.env.NODE_ENV !== 'production') {
      return null; // In development, skip Redis rate limiting
    }

    const ip = req.headers.get('x-real-ip') || 
               req.headers.get('x-forwarded-for') || 
               'anonymous';
    
    const key = `${rateLimit.keyPrefix}${ip}`;
    const windowKey = `${key}:window`;
    
    const now = Date.now();
    const [requestCount, windowExpires] = await Promise.all([
      redisClient.get(key),
      redisClient.get(windowKey),
    ]);
    
    // If window doesn't exist or has expired, create a new one
    if (!windowExpires || parseInt(windowExpires, 10) < now) {
      const resetTime = now + rateLimit.windowMs;
      await Promise.all([
        redisClient.set(key, '1'),
        redisClient.set(windowKey, resetTime.toString(), { ex: Math.ceil(rateLimit.windowMs / 1000) }),
      ]);
      
      return null; // Allow the request
    }
    
    // Check if over limit
    const count = requestCount ? parseInt(requestCount, 10) : 0;
    if (count >= rateLimit.max) {
      const resetTime = parseInt(windowExpires, 10);
      const retryAfter = Math.ceil((resetTime - now) / 1000);
      
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: {
          'Retry-After': String(retryAfter),
          'X-RateLimit-Limit': String(rateLimit.max),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(resetTime / 1000)),
          'Content-Type': 'text/plain',
        }
      });
    }
    
    // Increment the counter
    await redisClient.incr(key);
    
    // Request within limit, allow it
    return null;
  } catch (error) {
    console.error('Redis rate limiting error:', error);
    return null; // Fail open on Redis errors
  }
}

export async function middleware(req: NextRequest) {
  // Try Redis-based rate limiting in production
  const redisRateLimitResponse = await redisRateLimit(req);
  if (redisRateLimitResponse) {
    return redisRateLimitResponse;
  }
  
  // Fallback to in-memory rate limiting for development or if Redis fails
  if (process.env.NODE_ENV !== 'production') {
    const ip = req.headers.get('x-real-ip') || 
               req.headers.get('x-forwarded-for') || 
               'anonymous';
    const now = Date.now();
    const windowStart = now - rateLimit.windowMs;
    
    // Get or create entry for this IP
    if (!rateLimit.store.has(ip)) {
      rateLimit.store.set(ip, []);
    }
    
    // Clean old requests and add current request
    const requests = rateLimit.store.get(ip) || [];
    const recentRequests = requests.filter((timestamp: number) => timestamp > windowStart);
    recentRequests.push(now);
    rateLimit.store.set(ip, recentRequests);
    
    // Check if rate limit exceeded
    if (recentRequests.length > rateLimit.max) {
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: {
          'Retry-After': '60',
          'Content-Type': 'text/plain',
        }
      });
    }
  }

  // Initialize response with security headers
  const res = NextResponse.next();
  
  // Add security headers
  const securityHeaders = {
    'X-DNS-Prefetch-Control': 'on',
    'X-XSS-Protection': '1; mode=block',
    'X-Frame-Options': 'SAMEORIGIN',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://res.cloudinary.com; font-src 'self' data:; connect-src 'self' https://*.supabase.co; frame-src 'self' https://js.stripe.com; object-src 'none'; base-uri 'self';",
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self), interest-cohort=()',
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload'
  };

  // Apply security headers to response
  Object.entries(securityHeaders).forEach(([key, value]) => {
    res.headers.set(key, value);
  });
  
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

  // Ensure user is authenticated for protected routes
  if (!session?.user) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
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