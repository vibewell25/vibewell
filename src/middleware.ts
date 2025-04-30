import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { securityHeadersMiddleware } from '@/middleware/securityHeaders';
import { validateAndSanitizeRequest } from '@/middleware/rateLimit';
import { nanoid } from 'nanoid';

// Simple CSRF token validation
function validateCsrfToken(req: NextRequest): boolean {
  const token = req.headers.get('x-csrf-token');
  const cookie = req.cookies.get('csrf-token');
  
  if (!token || !cookie || !cookie.value) {
    return false;
  }

  return token === cookie.value;
}

export async function middleware(req: NextRequest) {
  // Apply security headers
  const securityResponse = await securityHeadersMiddleware(req);
  if (securityResponse) return securityResponse;

  // Apply CSRF protection for mutations
  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    if (!validateCsrfToken(req)) {
      return NextResponse.json(
        { error: 'CSRF token validation failed' },
        { status: 403 }
      );
    }
  }

  // Apply rate limiting and request validation
  const { error } = await validateAndSanitizeRequest(req);
  if (error) return error;

  // Generate new CSRF token for GET requests
  if (req.method === 'GET') {
    const response = NextResponse.next();
    const token = nanoid();
    response.cookies.set('csrf-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });
    response.headers.set('x-csrf-token', token);
    return response;
  }

  // Continue with the request
  return NextResponse.next();
}

// Configure paths that require middleware
export const config = {
  matcher: [
    // Apply to all routes except static files and api routes
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
