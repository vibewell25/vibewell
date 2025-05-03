/**
 * CSRF Protection Middleware and Utilities
 *
 * This module provides CSRF protection for the VibeWell application using double-submit cookies.
 */
import { doubleCsrf } from 'csrf-csrf';
import type { NextRequest, NextResponse } from 'next/server';
import { env } from '@/config/env';
import { logger } from '@/lib/logger';

// CSRF Protection Configuration
const { generateToken, doubleCsrfProtection } = doubleCsrf({
  getSecret: () => {
    // Use environment variable for CSRF secret, which should be a stable value
    const secret = env.CSRF_SECRET;
    if (!secret) {
      logger.error('CSRF_SECRET environment variable is missing');
      throw new Error('CSRF_SECRET environment variable is required');
    }
    return secret;
  },
  cookieName: '__Host-vibewell.csrf-token',
  cookieOptions: {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    // Set to 8 hours - balance between security and usability
    maxAge: 8 * 60 * 60, 
  },
  size: 64, // 64 bytes token for enhanced security
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
  // Look for token in headers, then in form data, then in query string (priority order)
  getCsrfTokenFromRequest: (req: any) => {
    const headerToken = req.headers['x-csrf-token'] as string;
    if (headerToken) return headerToken;
    
    // For multipart form data and traditional form submissions
    const formToken = (req.body as any)?.['csrf-token'];
    if (formToken) return formToken;
    
    // Last resort - URL query parameter (least secure, but sometimes necessary)
    const urlToken = new URL(req.url).searchParams.get('csrf-token');
    return urlToken || '';
  },
});

/**
 * Validates CSRF token on incoming requests
 * @param req - Next.js request object
 * @returns boolean indicating if the token is valid
 */
export async function validateCsrfToken(req: NextRequest): Promise<boolean> {
  try {
    // Skip validation for GET, HEAD, OPTIONS
    const method = req.method.toUpperCase();
    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      return true;
    }
    
    const result = await doubleCsrfProtection(req as any, {} as any, {} as any);
    return true;
  } catch (error) {
    logger.warn('CSRF validation failed', { 
      url: req.url,
      method: req.method,
      error: error instanceof Error ? error.message : String(error)
    });
    return false;
  }
}

/**
 * Middleware to check CSRF token and return appropriate error response
 */
export function csrfMiddleware(req: NextRequest): NextResponse | null {
  // Skip for non-mutating methods
  const method = req.method.toUpperCase();
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return null;
  }
  
  // Skip for certain endpoints that have their own CSRF protection
  const url = new URL(req.url);
  if (url.pathname.startsWith('/api/auth/') || url.pathname.startsWith('/api/webhook/')) {
    return null;
  }
  
  try {
    doubleCsrfProtection(req as any, {} as any, {} as any);
    return null;
  } catch (error) {
    logger.warn('CSRF middleware blocked request', { 
      url: req.url,
      method: req.method,
      error: error instanceof Error ? error.message : String(error)
    });
    
    return Response.json(
      { 
        error: 'Invalid CSRF token', 
        message: 'CSRF validation failed. Please refresh the page and try again.'
      },
      { status: 403 }
    ) as unknown as NextResponse;
  }
}

// Export utilities for the CSRF protection
export const csrfConfig = {
  generateToken,
  validateCsrfToken,
  csrfMiddleware,
};

// Helper to add CSRF token to responses
export function addCsrfTokenToResponse(res: NextResponse): NextResponse {
  const token = generateToken(res as any);
  res.headers.set('X-CSRF-Token', token);
  return res;
}
