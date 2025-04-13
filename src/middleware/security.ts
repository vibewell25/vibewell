/**
 * Security middleware for the Vibewell application
 * Implements various security protections
 */
import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { Request } from 'express';

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
