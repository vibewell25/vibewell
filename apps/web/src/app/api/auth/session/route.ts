import { NextRequest, NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { apiRateLimiter, applyRateLimit } from '../rate-limit-middleware';

// Add security headers to response
function addSecurityHeaders(response: NextResponse): NextResponse {
  // Strict Transport Security - force HTTPS
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  
  // Prevent content type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY');
  
  // XSS protection
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Referrer policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Cache control - no caching for auth routes
  response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  
  return response;
}

/**
 * Returns the current user session if authenticated
 */
export async function GET(req: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await applyRateLimit(req, apiRateLimiter);
    if (rateLimitResponse) {
      return addSecurityHeaders(rateLimitResponse);
    }
    
    // Follow Auth0 v4 Next.js 15 compatibility
    // getSession() in Next.js 15 must be called without extra params for proper compatibility
    const session = await auth0.getSession();
    
    if (!session?.user) {
      // Return empty session rather than error for unauthenticated requests
      const emptyResponse = NextResponse.json({ user: null });
      return addSecurityHeaders(emptyResponse);
    }
    
    // Create a sanitized user object to return
    const user = {
      sub: session.user.sub,
      email: session.user.email,
      name: session.user.name,
      picture: session.user.picture,
      roles: session.user.roles || [],
      isAdmin: session.user.isAdmin || false,
      isProvider: session.user.isProvider || false,
      isUser: session.user.isUser || false,
    };
    
    const successResponse = NextResponse.json({ 
      user,
      expiresAt: session.accessTokenExpiresAt 
    });
    
    return addSecurityHeaders(successResponse);
  } catch (error) {
    console.error('Session check error:', error);
    
    // Don't expose error details to client
    const errorResponse = NextResponse.json(
      { user: null },
      { status: 200 } // Use 200 to avoid revealing authentication state
    );
    
    return addSecurityHeaders(errorResponse);
  }
}

// Set the runtime to edge for better performance
export const runtime = 'edge'; 