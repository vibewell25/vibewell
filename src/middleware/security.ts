/**
 * Security middleware for the Vibewell application
 * Implements various security protections
 */
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import xss from 'xss-clean';
import csrf from 'csurf';
import { NextApiRequest, NextApiResponse } from 'next';

export const securityHeaders = {
  'Content-Security-Policy': 
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self' https://*.supabase.co; frame-src 'self';",
  'X-XSS-Protection': '1; mode=block',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self), interest-cohort=()'
};

// Apply security headers to a response
export function applySecurityHeaders(res: NextApiResponse) {
  Object.keys(securityHeaders).forEach((headerName) => {
    res.setHeader(headerName, securityHeaders[headerName]);
  });
}

// Rate limiting middleware
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' }
});

// Middleware wrapper for Next.js API routes
export const withSecurity = (handler: Function) => async (req: NextApiRequest, res: NextApiResponse) => {
  // Apply security headers
  applySecurityHeaders(res);
  
  // Apply XSS protection
  xss({ enabled: true })(req, res, () => {});
  
  // Apply rate limiting
  if (process.env.NODE_ENV === 'production') {
    await new Promise((resolve) => {
      apiRateLimiter(req, res, () => {
        resolve(true);
      });
    });
  }
  
  // Call the original handler
  return handler(req, res);
};
