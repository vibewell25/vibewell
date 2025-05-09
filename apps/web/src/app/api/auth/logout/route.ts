import { NextRequest, NextResponse } from 'next/server';
import { handleLogout } from '@auth0/nextjs-auth0';

// Get Auth0 logout handler
const { GET: auth0LogoutHandler } = handleLogout();

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
 * Logout endpoint - supports both GET and POST for flexibility
 */
export async function GET(req: NextRequest) {
  try {
    // Use Auth0's built-in logout handler
    const response = await auth0LogoutHandler(req);
    
    // Add security headers to Auth0's response
    const responseClone = new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    });
    
    return addSecurityHeaders(responseClone);
  } catch (error) {
    console.error('Logout error:', error);
    
    const errorResponse = NextResponse.json(
      { error: 'Logout failed' }, 
      { status: 500 }
    );
    
    return addSecurityHeaders(errorResponse);
  }
}

// Also support POST for logout for compatibility with some clients
export async function POST(req: NextRequest) {
  return GET(req);
}

// Set the runtime to edge for better performance
export const runtime = 'edge'; 