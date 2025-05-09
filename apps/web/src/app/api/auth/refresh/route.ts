import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { loginRateLimiter, applyRateLimit } from '../rate-limit-middleware';

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
 * Refreshes the user's session if they have a valid, but potentially expiring token
 */
export async function POST(req: NextRequest) {
  try {
    // Apply rate limiting to prevent abuse
    const rateLimitResponse = await applyRateLimit(req, loginRateLimiter);
    if (rateLimitResponse) {
      return addSecurityHeaders(rateLimitResponse);
    }
    
    // Get the current session
    const res = NextResponse.next();
    const session = await getSession(req, res);
    
    if (!session?.user) {
      const errorResponse = NextResponse.json(
        { error: 'Unauthorized - no valid session' },
        { status: 401 }
      );
      return addSecurityHeaders(errorResponse);
    }
    
    // Auth0 SDK automatically refreshes the access token if it's expired
    // as long as the refresh token is valid, so we just need to return the session
    
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
    console.error('Token refresh error:', error);
    
    const errorResponse = NextResponse.json(
      { error: 'Failed to refresh token' },
      { status: 500 }
    );
    
    return addSecurityHeaders(errorResponse);
  }
}

// Set the runtime to edge for better performance
export const runtime = 'edge'; 