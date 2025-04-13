/**
 * CSRF Protection utilities
 * 
 * This module provides functions for generating and validating CSRF tokens
 * to protect against Cross-Site Request Forgery attacks.
 */
import crypto from 'crypto';
import { NextApiRequest, NextApiResponse } from 'next';
import { getCookie, setCookie } from 'cookies-next';

const CSRF_TOKEN_COOKIE = 'vibewell_csrf_token';
const CSRF_HEADER = 'x-csrf-token';
const TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Generate a new CSRF token
 * 
 * @returns A random token string
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Set a CSRF token cookie and return the token for use in forms
 * 
 * @param req - Next.js request object
 * @param res - Next.js response object
 * @returns The generated CSRF token
 */
export function setCsrfToken(req: NextApiRequest, res: NextApiResponse): string {
  const token = generateCsrfToken();
  
  setCookie(CSRF_TOKEN_COOKIE, token, { 
    req, 
    res, 
    maxAge: TOKEN_EXPIRY / 1000, // Convert to seconds
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
  });
  
  return token;
}

/**
 * Get the current CSRF token from cookies
 * 
 * @param req - Next.js request object
 * @param res - Next.js response object
 * @returns The current CSRF token or null if not set
 */
export function getCsrfToken(req: NextApiRequest, res: NextApiResponse): string | null {
  return getCookie(CSRF_TOKEN_COOKIE, { req, res }) as string || null;
}

/**
 * Validate the CSRF token in the request
 * 
 * @param req - Next.js request object
 * @param res - Next.js response object
 * @returns True if the token is valid, false otherwise
 */
export function validateCsrfToken(req: NextApiRequest, res: NextApiResponse): boolean {
  const cookieToken = getCsrfToken(req, res);
  const headerToken = req.headers[CSRF_HEADER] as string;
  
  if (!cookieToken || !headerToken) {
    return false;
  }
  
  return cookieToken === headerToken;
}

/**
 * Middleware to require a valid CSRF token for specific requests
 * 
 * @param req - Next.js request object
 * @param res - Next.js response object
 * @param next - Next.js next function
 */
export function csrfProtection(
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => void
) {
  // Only validate non-GET, non-HEAD, non-OPTIONS requests
  const nonReadMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
  
  if (nonReadMethods.includes(req.method || '') && !validateCsrfToken(req, res)) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }
  
  next();
}

/**
 * React hook to get a CSRF token for a form
 * 
 * @returns An object with the CSRF token and a function to add it to a fetch request
 */
export function useCsrfToken() {
  // Token will be set by server-side in _app.js
  const token = typeof window !== 'undefined' 
    ? document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') 
    : null;
  
  const addTokenToHeaders = (headers: HeadersInit = {}): HeadersInit => {
    return {
      ...headers,
      [CSRF_HEADER]: token || '',
    };
  };
  
  return {
    token,
    addTokenToHeaders,
  };
} 