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

// Define API versions
export enum ApiVersion {
  V1 = 'v1',
  V2 = 'v2',
  V3 = 'v3',
  LEGACY = 'legacy',
  LATEST = 'latest'
}

// API version to path mapping
const API_VERSION_PATHS: Record<string, string> = {
  [ApiVersion.V1]: 'v1',
  [ApiVersion.V2]: 'v2',
  [ApiVersion.V3]: 'v3',
  [ApiVersion.LEGACY]: 'legacy',
  [ApiVersion.LATEST]: 'v3' // latest points to most recent version
};

// Minimum supported version 
const MIN_SUPPORTED_VERSION = ApiVersion.V1;

// API paths that should be versioned
const API_PATH_PATTERN = /^\/api\/(?!auth|webhooks)/;

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

// Generate a random nonce for CSP
function generateNonce(): string {
  const crypto = require('crypto');
  return crypto.randomBytes(16).toString('base64');
}

// In-memory rate limiting function
async function inMemoryRateLimit(req: NextRequest): Promise<NextResponse | null> {
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
  
  return null;
}

// Helper to parse Accept header for API version
function parseApiVersionFromAcceptHeader(acceptHeader: string | null): ApiVersion | null {
  if (!acceptHeader) return null;
  
  // Example: application/json; version=v2
  const versionMatch = acceptHeader.match(/version=([^;]+)/i);
  if (versionMatch && versionMatch[1]) {
    // Check if it's a valid version
    if (Object.values(ApiVersion).includes(versionMatch[1] as ApiVersion)) {
      return versionMatch[1] as ApiVersion;
    }
  }
  
  return null;
}

// Check if a path is a versioned API path
function isVersionedPath(path: string): boolean {
  // Check if path matches API pattern and contains version
  return API_PATH_PATTERN.test(path) && 
         Object.values(API_VERSION_PATHS).some(version => 
           path.includes(`/api/${version}/`));
}

// Normalize path to latest version alias if needed
function normalizeApiPath(path: string, version: ApiVersion): string {
  if (version === ApiVersion.LATEST) {
    // Map LATEST to actual latest version
    const targetVersion = API_VERSION_PATHS[ApiVersion.LATEST];
    return path.replace(/\/api\/latest\//, `/api/${targetVersion}/`);
  }
  return path;
}

// Extract version from path
function extractVersionFromPath(path: string): ApiVersion | null {
  for (const [version, versionPath] of Object.entries(API_VERSION_PATHS)) {
    if (path.includes(`/api/${versionPath}/`)) {
      return version as ApiVersion;
    }
  }
  return null;
}

export async function middleware(req: NextRequest) {
  // Try Redis-based rate limiting in production
  const rateLimitResponse = await redisRateLimit(req);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  // Apply rate limits to specific routes
  if (req.nextUrl.pathname.startsWith('/api/')) {
    const limitResult = await inMemoryRateLimit(req);
    if (limitResult) {
      return limitResult;
    }
  }

  // Initialize response with security headers
  const res = NextResponse.next();
  
  // Generate a unique nonce for this request
  const scriptNonce = generateNonce();
  const styleNonce = generateNonce();
  
  // Store nonces in response headers so they can be accessed by the app
  res.headers.set('X-Script-Nonce', scriptNonce);
  res.headers.set('X-Style-Nonce', styleNonce);
  
  // Add security headers
  const securityHeaders = {
    'X-DNS-Prefetch-Control': 'on',
    'X-XSS-Protection': '1; mode=block',
    'X-Frame-Options': 'SAMEORIGIN',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': `
      default-src 'self';
      script-src 'self' 'nonce-${scriptNonce}' https://js.stripe.com https://cdn.jsdelivr.net;
      style-src 'self' 'nonce-${styleNonce}' https://fonts.googleapis.com;
      img-src 'self' data: https://res.cloudinary.com https://*.stripe.com;
      font-src 'self' data: https://fonts.gstatic.com;
      connect-src 'self' https://*.supabase.co https://api.stripe.com wss://*.supabase.co;
      frame-src 'self' https://js.stripe.com https://hooks.stripe.com;
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      frame-ancestors 'self';
      upgrade-insecure-requests;
      block-all-mixed-content;
    `.replace(/\s+/g, ' ').trim(),
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self), interest-cohort=(), payment=(self)',
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

  // Only apply to API routes except auth and webhooks
  if (!API_PATH_PATTERN.test(req.nextUrl.pathname)) {
    return res;
  }
  
  // Check if path already contains version
  if (isVersionedPath(req.nextUrl.pathname)) {
    const pathVersion = extractVersionFromPath(req.nextUrl.pathname);
    
    // Normalize if it's using the "latest" alias
    if (pathVersion === ApiVersion.LATEST) {
      const normalizedPath = normalizeApiPath(req.nextUrl.pathname, ApiVersion.LATEST);
      req.nextUrl.pathname = normalizedPath;
      return NextResponse.rewrite(req.nextUrl);
    }
    
    // Path already has version, continue
    return res;
  }
  
  // Handle unversioned API paths
  let targetVersion: ApiVersion;
  
  // Try to extract version from Accept header
  const acceptHeader = req.headers.get('accept');
  const headerVersion = parseApiVersionFromAcceptHeader(acceptHeader);
  
  if (headerVersion) {
    // Use version from Accept header
    targetVersion = headerVersion;
  } else {
    // Default to latest version
    targetVersion = ApiVersion.LATEST;
  }
  
  // Insert version into path
  const versionedPath = req.nextUrl.pathname.replace('/api/', `/api/${API_VERSION_PATHS[targetVersion]}/`);
  req.nextUrl.pathname = normalizeApiPath(versionedPath, targetVersion);
  
  // Add API version to response headers for tracking
  res.headers.set('X-API-Version', API_VERSION_PATHS[targetVersion]);
  
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