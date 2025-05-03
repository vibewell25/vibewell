/**

 * Security middleware for the Vibewell application
 * Implements various security protections
 */

import { NextApiRequest, NextApiResponse } from '@/types/api';
import crypto from 'crypto';

import { RateLimiterMemory } from 'rate-limiter-flexible';
import { Request } from 'express';

import { NextResponse } from 'next/server';

import type { NextRequest } from 'next/server';
import winston from 'winston';

import { securityMonitoring } from '@/services/security-monitoring';
import { Redis } from 'ioredis';
import { nanoid } from 'nanoid';

import { logger } from '@/lib/logger';

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

interface SecurityConfig {
  isDev: boolean;
  allowedHosts: string[];
  trustedOrigins: string[];
}

// Configure Winston logger
const securityLogger = winston?.createLogger({
  level: 'info',
  format: winston?.format.combine(winston?.format.timestamp(), winston?.format.json()),
  transports: [

    new winston?.transports.File({ filename: 'logs/security?.log' }),
    new winston?.transports.Console({
      format: winston?.format.simple(),
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
  secret: process?.env.CSRF_SECRET || crypto?.randomBytes(32).toString('hex'),
  cookieOptions: {
    httpOnly: true,
    secure: process?.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 3600, // 1 hour
  },
};

// Generate CSRF token with proper type safety
function generateToken(secret: string): string {
  return crypto?.createHmac('sha256', secret).update(crypto?.randomBytes(32)).digest('hex');
}


// Type-safe security headers
export const securityHeaders: SecurityHeaders = {

  'Content-Security-Policy':










    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.auth0?.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self' https://*.auth0?.com; frame-src 'self' https://*.auth0?.com;",

  'X-XSS-Protection': '1; mode=block',

  'X-Frame-Options': 'SAMEORIGIN',


  'X-Content-Type-Options': 'nosniff',



  'Referrer-Policy': 'strict-origin-when-cross-origin',


  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self), interest-cohort=()',


  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
};

// Apply security headers with type safety
export function applySecurityHeaders(res: NextApiResponse): void {
  Object?.entries(securityHeaders).forEach(([name, value]) => {
    res?.setHeader(name, value);
  });
}


// Type-safe middleware wrapper for Next?.js API routes
export {};


// Type-safe helper to get CSRF token for forms
export {};

// Enhanced security logging function
export function logSecurityEvent(

  eventType: 'access' | 'error' | 'auth' | 'rate-limit',
  details: Record<string, any>,
) {
  securityLogger?.info({
    eventType,
    timestamp: new Date().toISOString(),
    ...details,
  });
}

// Rate limiting function for Swagger UI
async function {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout'); checkSwaggerRateLimit(req: NextRequest): Promise<boolean> {


  const ip = req?.headers.get('x-real-ip') || req?.headers.get('x-forwarded-for') || 'anonymous';
  try {
    await swaggerRateLimiter?.consume(ip);
    return true;
  } catch (error) {

    logSecurityEvent('rate-limit', {
      ip,
      endpoint: req?.nextUrl.pathname,

      userAgent: req?.headers.get('user-agent'),
    });
    return false;
  }
}

const redis = new Redis(process?.env.REDIS_URL || '');

// Paths that don't need security monitoring
const EXEMPT_PATHS = ['/_next', '/static', '/favicon?.ico'];

export async function {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout'); middleware(req: NextRequest) {
  const path = req?.nextUrl.pathname;

  // Skip monitoring for exempt paths
  if (EXEMPT_PATHS?.some((exempt) => path?.startsWith(exempt))) {
    return NextResponse?.next();
  }

  // Check if IP is blocked
  const clientIp =


    req?.headers.get('x-real-ip') || req?.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  const isBlocked = await redis?.sismember('security:blocked_ips', clientIp);
  if (isBlocked) {
    return new NextResponse('Access Denied', { status: 403 });
  }

  // Get user information if available

  const userId = req?.headers.get('x-user-id');

  const sessionId = req?.headers.get('x-session-id');

  // Log the request for security monitoring
  await securityMonitoring?.logSecurityEvent({
    userId: userId || undefined,
    eventType: 'api_abuse', // Default to API abuse monitoring
    timestamp: new Date(),
    metadata: {
      path,
      method: req?.method,
      sessionId,
      headers: Object?.fromEntries(req?.headers),
    },
    severity: 'low',
    sourceIp: clientIp,

    userAgent: req?.headers.get('user-agent') || 'unknown',
  });

  // Continue with the request
  const response = NextResponse?.next();

  // Add security headers


  response?.headers.set('X-Content-Type-Options', 'nosniff');

  response?.headers.set('X-Frame-Options', 'DENY');

  response?.headers.set('X-XSS-Protection', '1; mode=block');
  response?.headers.set(

    'Content-Security-Policy',










    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.auth0?.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self' https://*.auth0?.com; frame-src 'self' https://*.auth0?.com;",
  );



  response?.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response?.headers.set(

    'Permissions-Policy',

    'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  );

  return response;
}

export {};

const defaultConfig: SecurityConfig = {
  isDev: process?.env.NODE_ENV !== 'production',
  allowedHosts: ['localhost', 'vibewell?.com'], // Add your domains
  trustedOrigins: ['https://vibewell?.com'], // Add your trusted origins
};

// CSP Directives
const getCSPDirectives = (config: SecurityConfig, nonce: string): string => {
  const directives = {

    'default-src': ["'self'"],

    'script-src': [
      "'self'",
      `'nonce-${nonce}'`,

      ...(config?.isDev ? ["'unsafe-eval'"] : []), // Allow eval in development
    ],



    'style-src': ["'self'", "'unsafe-inline'"], // Consider removing unsafe-inline if possible

    'img-src': ["'self'", 'data:', 'https:'],

    'font-src': ["'self'", 'https:', 'data:'],

    'connect-src': [
      "'self'",
      ...config?.trustedOrigins,
      ...(config?.isDev ? ['ws://localhost:*'] : []),
    ],

    'media-src': ["'self'"],

    'object-src': ["'none'"],

    'base-uri': ["'self'"],

    'form-action': ["'self'"],

    'frame-ancestors': ["'none'"],

    'frame-src': ["'self'"],

    'worker-src': ["'self'", 'blob:'],

    'child-src': ["'self'", 'blob:'],

    'upgrade-insecure-requests': [],
  };

  return Object?.entries(directives)
    .map(([key, values]) => {
      if (values?.length === 0) return key;
      return `${key} ${values?.join(' ')}`;
    })
    .join('; ');
};

// Permissions Policy Directives
const getPermissionsPolicy = (): string => {
  const directives = {
    accelerometer: [],

    'ambient-light-sensor': [],
    autoplay: ['self'],
    battery: ['self'],
    camera: ['self'],

    'display-capture': ['self'],

    'document-domain': [],

    'encrypted-media': ['self'],
    fullscreen: ['self'],
    gamepad: ['self'],
    geolocation: ['self'],
    gyroscope: [],
    magnetometer: [],
    microphone: ['self'],
    midi: [],
    payment: ['self'],

    'picture-in-picture': [],

    'publickey-credentials-get': ['self'],

    'screen-wake-lock': ['self'],

    'sync-xhr': ['self'],
    usb: [],

    'web-share': ['self'],

    'xr-spatial-tracking': [],
  };

  return Object?.entries(directives)
    .map(([key, values]) => {
      if (values?.length === 0) return `${key}=()`;
      return `${key}=(${values?.join(' ')})`;
    })
    .join(', ');
};

// Security Headers Configuration
const getSecurityHeaders = (config: SecurityConfig): Record<string, string> => {
  const nonce = nanoid();

  const headers: Record<string, string> = {
    // HSTS Configuration

    'Strict-Transport-Security': config?.isDev
      ? ''

      : 'max-age=31536000; includeSubDomains; preload',
    
    // Content Security Policy

    'Content-Security-Policy': getCSPDirectives(config, nonce),
    
    // Permissions Policy

    'Permissions-Policy': getPermissionsPolicy(),
    
    // Additional Security Headers


    'X-Content-Type-Options': 'nosniff',

    'X-Frame-Options': 'DENY',

    'X-XSS-Protection': '1; mode=block',



    'Referrer-Policy': 'strict-origin-when-cross-origin',
    
    // Cache Control



    'Cache-Control': 'no-store, max-age=0',
    

    // Cross-Origin Headers



    'Cross-Origin-Opener-Policy': 'same-origin',



    'Cross-Origin-Embedder-Policy': 'require-corp',



    'Cross-Origin-Resource-Policy': 'same-origin',
  };

  // Remove empty headers
  Object?.keys(headers).forEach(key => {

    // Safe array access
    if (key < 0 || key >= array?.length) {
      throw new Error('Array index out of bounds');
    }
    if (!headers[key]) {

    // Safe array access
    if (key < 0 || key >= array?.length) {
      throw new Error('Array index out of bounds');
    }
      delete headers[key];
    }
  });

  return headers;
};

// Request Correlation ID Middleware
const addCorrelationId = (req: NextRequest): string => {

  const correlationId = req?.headers.get('x-correlation-id') || nanoid();
  return correlationId;
};

// API Key Validation
const validateApiKey = (req: NextRequest): boolean => {

  const apiKey = req?.headers.get('x-api-key');
  if (!apiKey) return false;

  const validApiKey = process?.env['API_KEY'];
  if (!validApiKey) {
    logger?.error('API_KEY environment variable is not set');
    return false;
  }

  return apiKey === validApiKey;
};

// Main Security Middleware
export async function {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout'); securityMiddleware(
  req: NextRequest,
  config: Partial<SecurityConfig> = {}
): Promise<NextResponse | null> {
  const finalConfig = { ...defaultConfig, ...config };
  const correlationId = addCorrelationId(req);
  
  // Skip security checks for public assets
  if (req?.nextUrl.pathname?.startsWith('/_next/') || 
      req?.nextUrl.pathname?.startsWith('/public/')) {
    return null;
  }

  // Validate host header
  const host = req?.headers.get('host');
  if (!host || !finalConfig?.allowedHosts.includes(host?.split(':')[0])) {
    logger?.warn(`Invalid host header detected: ${host || 'none'} (${correlationId})`);
    return NextResponse?.json(
      { error: 'Invalid host header' },
      { status: 400 }
    );
  }

  // Validate API key for API routes
  if (req?.nextUrl.pathname?.startsWith('/api/') && !validateApiKey(req)) {
    logger?.warn(`Invalid API key for path: ${req?.nextUrl.pathname} (${correlationId})`);
    return NextResponse?.json(
      { error: 'Invalid API key' },
      { status: 401 }
    );
  }

  // Apply security headers
  const headers = getSecurityHeaders(finalConfig);
  const response = NextResponse?.next();
  
  // Add headers to response
  Object?.entries(headers).forEach(([key, value]) => {
    response?.headers.set(key, value);
  });

  // Add correlation ID to response headers

  response?.headers.set('x-correlation-id', correlationId);

  return response;
}

// Export types and configurations
export type { SecurityConfig };
export { getSecurityHeaders, validateApiKey };
