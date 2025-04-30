import { doubleCsrf } from 'csrf-csrf';
import type { NextRequest } from 'next/server';

// CSRF Protection Configuration
const { generateToken, doubleCsrfProtection } = doubleCsrf({
  getSecret: () => {
    const secret = process.env['CSRF_SECRET'];
    if (!secret) {
      throw new Error('CSRF_SECRET environment variable is required');
    }
    return secret;
  },
  cookieName: '__Host-psifi.csrf-token',
  cookieOptions: {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
  },
  size: 64,
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
  getTokenFromRequest: (req) => req.headers['x-csrf-token'] as string,
});

// Middleware to validate CSRF token
export async function validateCsrfToken(req: NextRequest): Promise<boolean> {
  try {
    await doubleCsrfProtection(req as any);
    return true;
  } catch (error) {
    return false;
  }
}

// Export config for Next.js middleware
export const csrfConfig = {
  generateToken,
  validateCsrfToken,
};
