import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isAdmin } from '@/lib/utils/admin';
import redisClient from '@/lib/redis-client';
import { securityMiddleware } from '@/middleware/security/index';
import { NextFetchEvent } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/auth/login',
  '/auth/signup',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-email',
  '/auth/sso-callback',
  '/api/auth/callback',
  '/_next',
  '/favicon.ico',
  '/locales',
  '/api/i18n',
];

// Define protected routes that require authentication
const protectedRoutes: string[] = [
  '/api/v1/users',
  '/api/v1/posts',
  '/dashboard',
  '/profile',
  '/settings',
  '/bookings',
  '/wellness',
  '/community',
  '/events'
];

// Define security-sensitive routes that require admin access 
const adminRoutes = [
  '/api-docs',  // Swagger UI route
  '/swagger',   // Alternative Swagger route
  '/admin',     // Admin dashboard
  '/metrics',   // Performance metrics
];

// Security headers configuration
const securityHeaders = {
  'X-DNS-Prefetch-Control': 'on',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'origin-when-cross-origin',
  'X-XSS-Protection': '1; mode=block',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "object-src 'none'",
    "media-src 'self'",
    "worker-src 'self' blob:",
    "frame-ancestors 'self'",
  ].join('; '),
  'Permissions-Policy': [
    'camera=self',
    'microphone=self',
    'geolocation=self',
    'accelerometer=self',
    'gyroscope=self',
    'magnetometer=self',
    'payment=self',
  ].join(', '),
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

/**
 * Generate a random nonce for CSP
 */
function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode.apply(null, Array.from(array)));
}

/**
 * Check if a path matches the API pattern that requires versioning
 */
function isVersionedPath(path: string): boolean {
  return API_PATH_PATTERN.test(path);
}

/**
 * Normalize an API path to include version information
 */
function normalizeApiPath(path: string, version: ApiVersion): string {
  const versionPath = API_VERSION_PATHS[version];
  
  // If the path already includes a version, don't modify it
  if (path.match(/\/api\/v\d+\//)) {
    return path;
  }
  
  return path.replace(/\/api\//, `/api/${versionPath}/`);
}

/**
 * Extract version from URL path if present
 */
function extractVersionFromPath(path: string): ApiVersion | null {
  const match = path.match(/\/api\/(v\d+)\//);
  if (!match) return null;
  
  const version = match[1];
  switch (version) {
    case 'v1': return ApiVersion.V1;
    case 'v2': return ApiVersion.V2;
    case 'v3': return ApiVersion.V3;
    case 'legacy': return ApiVersion.LEGACY;
    default: return null;
  }
}

// API path pattern for versioning
const API_PATH_PATTERN = /^\/api\/(?!auth|webhooks)/;

/**
 * Parse API version from Accept header
 * 
 * Example: Accept: application/json;version=v2
 */
function parseApiVersionFromAcceptHeader(acceptHeader: string | null): ApiVersion | null {
  if (!acceptHeader) return null;
  
  const versionMatch = acceptHeader.match(/version=v(\d+)/);
  if (!versionMatch) return null;
  
  const version = `v${versionMatch[1]}`;
  switch (version) {
    case 'v1': return ApiVersion.V1;
    case 'v2': return ApiVersion.V2;
    case 'v3': return ApiVersion.V3;
    default: return null;
  }
}

/**
 * Add security headers to the response
 */
function addSecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

/**
 * Handle API versioning
 */
function handleApiVersioning(req: NextRequest): NextResponse | null {
  const path = req.nextUrl.pathname;
  
  if (!isVersionedPath(path)) {
    return null;
  }
  
  // Check Accept header for version
  const acceptVersion = parseApiVersionFromAcceptHeader(req.headers.get('Accept'));
  
  // Check for version in path
  const pathVersion = extractVersionFromPath(path);
  
  // Default to latest version if not specified
  const version = acceptVersion || pathVersion || ApiVersion.LATEST;
  
  // Clone URL to modify it
  const url = req.nextUrl.clone();
  
  // If path doesn't contain version, rewrite URL
  if (!pathVersion) {
    url.pathname = normalizeApiPath(path, version);
    return NextResponse.rewrite(url);
  }
  
  return null;
}

/**
 * Check if a path is public (doesn't require authentication)
 */
function isPublicPath(path: string): boolean {
  return publicRoutes.some(route => {
    if (route.endsWith('*')) {
      const baseRoute = route.slice(0, -1);
      return path.startsWith(baseRoute);
    }
    return path === route;
  });
}

/**
 * Check if user has admin access
 */
async function checkAdminAccess(req: NextRequest): Promise<boolean> {
  // Using Auth0 session to check admin status
  try {
    const res = NextResponse.next();
    const session = await getSession(req, res);
    if (!session || !session.user) return false;
    
    const namespace = process.env.NEXT_PUBLIC_AUTH0_NAMESPACE || 'https://vibewell.com';
    const userRoles = session.user[`${namespace}/roles`] || [];
    
    return userRoles.includes('admin');
  } catch (error) {
    console.error('Error checking admin access:', error);
    return false;
  }
}

/**
 * Our main middleware function
 */
export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  
  // Apply security middleware (includes CSRF protection & rate limiting)
  const securityResponse = await securityMiddleware(req);
  if (securityResponse.status !== 200) {
    return new NextResponse(securityResponse.body, {
      status: securityResponse.status,
      headers: securityResponse.headers as HeadersInit,
    });
  }
  
  // Handle API versioning
  const versioningResponse = handleApiVersioning(req);
  if (versioningResponse) {
    return addSecurityHeaders(versioningResponse);
  }

  // Always apply security headers, even on public routes
  const response = NextResponse.next();
  addSecurityHeaders(response);
  
  // Public routes are accessible without authentication
  if (isPublicPath(path)) {
    return response;
  }
  
  // Get Auth0 session
  const session = await getSession(req, response);
  const isAuthenticated = !!session?.user;
  
  // For protected routes, check if user is authenticated
  if (protectedRoutes.some(route => path.startsWith(route)) && !isAuthenticated) {
    const loginUrl = new URL('/auth/login', req.url);
    loginUrl.searchParams.set('returnTo', path);
    return NextResponse.redirect(loginUrl);
  }
  
  // For admin routes, check if user is admin
  if (adminRoutes.some(route => path.startsWith(route)) && !(await checkAdminAccess(req))) {
    return NextResponse.redirect(new URL('/error/unauthorized', req.url));
  }
  
  return response;
}

export const config = {
  matcher: [
    // Match all routes except static assets and API routes that don't need middleware
    '/((?!_next/static|_next/image|favicon.ico|images|fonts|api/webhooks).*)',
  ],
}; 