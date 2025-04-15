/**
 * Security middleware for the Vibewell application
 * Implements various security protections
 */
import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { Request } from 'express';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import winston from 'winston';
import { securityMonitoring } from '@/services/security-monitoring';
import { Redis } from 'ioredis';

// Type definitions
interface CsrfConfig {
  cookieName: string;
  headerName: string;
  secret: string;
  cookieOptions: {
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'strict';
    path: string;
    maxAge: number;
  };
}

interface SecurityHeaders {
  [key: string]: string;
}

interface RateLimitError {
  message: string;
  remainingPoints: number;
}

// Configure Winston logger
const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/security.log' }),
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

// Specific rate limiter for Swagger UI
const swaggerRateLimiter = new RateLimiterMemory({
  points: 30, // Number of requests
  duration: 60, // Per minute
  blockDuration: 300, // Block for 5 minutes if exceeded
});

// CSRF configuration with secure defaults
const csrfConfig: CsrfConfig = {
  cookieName: 'csrf-token',
  headerName: 'x-csrf-token',
  secret: process.env.CSRF_SECRET || crypto.randomBytes(32).toString('hex'),
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 3600 // 1 hour
  }
};

// Generate CSRF token with proper type safety
function generateToken(secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(crypto.randomBytes(32))
    .digest('hex');
}

// Type-safe security headers
export const securityHeaders: SecurityHeaders = {
  'Content-Security-Policy': 
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self' https://*.supabase.co; frame-src 'self';",
  'X-XSS-Protection': '1; mode=block',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self), interest-cohort=()',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload'
};

// Apply security headers with type safety
export function applySecurityHeaders(res: NextApiResponse): void {
  Object.entries(securityHeaders).forEach(([name, value]) => {
    res.setHeader(name, value);
  });
}

// Type-safe middleware wrapper for Next.js API routes
export const withSecurity = (handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) => {
  return async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    try {
      const expressReq = req as unknown as Request;
      const ipAddress = expressReq.ip || '0.0.0.0'; // Fallback IP if undefined
      const limiter = new RateLimiterMemory({
        points: 10,
        duration: 1
      });

      try {
        await limiter.consume(ipAddress);
      } catch (error) {
        const rateLimitError = error as RateLimitError;
        res.status(429).json({ 
          error: 'Too many requests, please try again later',
          retryAfter: rateLimitError.remainingPoints 
        });
        return;
      }

      await handler(req, res);
    } catch (error) {
      console.error('Security middleware error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};

// Type-safe helper to get CSRF token for forms
export const getToken = async (req: NextApiRequest, res: NextApiResponse): Promise<string> => {
  const token = generateToken(csrfConfig.secret);
  res.setHeader('Set-Cookie', `${csrfConfig.cookieName}=${token}; ${Object.entries(csrfConfig.cookieOptions)
    .map(([key, value]) => `${key}=${value}`)
    .join('; ')}`);
  return token;
};

// Enhanced security logging function
export function logSecurityEvent(
  eventType: 'access' | 'error' | 'auth' | 'rate-limit',
  details: Record<string, any>
) {
  securityLogger.info({
    eventType,
    timestamp: new Date().toISOString(),
    ...details,
  });
}

// Rate limiting function for Swagger UI
async function checkSwaggerRateLimit(req: NextRequest): Promise<boolean> {
  const ip = req.headers.get('x-real-ip') || 
             req.headers.get('x-forwarded-for') || 
             'anonymous';
  try {
    await swaggerRateLimiter.consume(ip);
    return true;
  } catch (error) {
    logSecurityEvent('rate-limit', {
      ip,
      endpoint: req.nextUrl.pathname,
      userAgent: req.headers.get('user-agent'),
    });
    return false;
  }
}

const redis = new Redis(process.env.REDIS_URL || '');

// Paths that don't need security monitoring
const EXEMPT_PATHS = [
  '/_next',
  '/static',
  '/favicon.ico',
];

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Skip monitoring for exempt paths
  if (EXEMPT_PATHS.some(exempt => path.startsWith(exempt))) {
    return NextResponse.next();
  }

  // Check if IP is blocked
  const clientIp = req.headers.get('x-real-ip') || 
                  req.headers.get('x-forwarded-for')?.split(',')[0] ||
                  'unknown';
  const isBlocked = await redis.sismember('security:blocked_ips', clientIp);
  if (isBlocked) {
    return new NextResponse('Access Denied', { status: 403 });
  }

  // Get user information if available
  const userId = req.headers.get('x-user-id');
  const sessionId = req.headers.get('x-session-id');

  // Log the request for security monitoring
  await securityMonitoring.logSecurityEvent({
    userId: userId || undefined,
    eventType: 'api_abuse', // Default to API abuse monitoring
    timestamp: new Date(),
    metadata: {
      path,
      method: req.method,
      sessionId,
      headers: Object.fromEntries(req.headers),
    },
    severity: 'low',
    sourceIp: clientIp,
    userAgent: req.headers.get('user-agent') || 'unknown',
  });

  // Continue with the request
  const response = NextResponse.next();

  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
  );
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api/auth/** (authentication endpoints)
     * 2. /_next/** (Next.js internals)
     * 3. /static/** (static files)
     * 4. /*.{png,jpg,gif,ico} (static images)
     */
    '/((?!api/auth|_next|static|.*\\.(?:png|jpg|gif|ico)).*)',
  ],
};
