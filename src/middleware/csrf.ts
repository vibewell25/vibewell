import { doubleCsrf } from 'csrf-csrf';
import { NextApiRequest, NextApiResponse } from 'next';
import { Request } from 'express';

// CSRF Protection Configuration
const {
  generateToken,
  doubleCsrfProtection,
} = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET || 'PLEASE_USE_ENVIRONMENT_VARIABLE',
  cookieName: '__Host-psifi.csrf-token',
  cookieOptions: {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
  },
  size: 64,
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
  getTokenFromRequest: (req: Request) => req.headers['x-csrf-token'] as string,
});

// Middleware to generate CSRF token
export const csrfTokenMiddleware = (req: NextApiRequest, res: NextApiResponse) => {
  const token = generateToken(req, res);
  return token;
};

// Middleware to protect routes from CSRF
export const csrfProtection = doubleCsrfProtection;

// Export config for Next.js middleware
export const config = {
  matcher: [
    // Apply to all API routes except auth and webhooks
    '/api/:path*',
    '!api/auth/:path*',
    '!api/webhooks/:path*',
  ],
}; 