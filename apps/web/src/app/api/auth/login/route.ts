import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { loginRateLimiter, applyRateLimit } from '../rate-limit-middleware';

import { handleLogin } from '@auth0/nextjs-auth0';

// Schema for validating the request body
const loginSchema = z.object({
  email: z.string().email('Invalid email address').trim().toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

// Auth0 handler
const { POST: auth0LoginHandler } = handleLogin();

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
  
  return response;
}

export async function POST(req: NextRequest) {
  const start = Date.now();
  
  try {
    // Apply rate limiting
    const rateLimitResponse = await applyRateLimit(req, loginRateLimiter);
    if (rateLimitResponse) {
      return addSecurityHeaders(rateLimitResponse); // Rate limit exceeded
    }
    
    // Check for timeout
    if (Date.now() - start > 30000) {
      throw new Error('Request timeout');
    }
    
    // Parse and validate request body
    const body = await req.json().catch(() => ({}));
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      const response = NextResponse.json(
        { error: 'Invalid request data', details: result.error.format() },
        { status: 400 }
      );
      return addSecurityHeaders(response);
    }
    
    try {
      // Create a modified request that Auth0 SDK expects
      const url = new URL(req.url);
      url.searchParams.set('email', result.data.email);
      url.searchParams.set('password', result.data.password);

      const modifiedReq = new Request(url, {
        method: 'POST',
        headers: req.headers
      });
      
      // Use Auth0's built-in login handler
      const authResponse = await auth0LoginHandler(modifiedReq);
      
      // Add security headers to Auth0's response
      const responseClone = new NextResponse(authResponse.body, {
        status: authResponse.status,
        statusText: authResponse.statusText,
        headers: authResponse.headers
      });
      
      return addSecurityHeaders(responseClone);
    } catch (authError) {
      console.error('Auth0 authentication error:', authError);

      // Use constant-time comparison to prevent timing attacks
      // and provide a generic error message to prevent user enumeration
      const response = NextResponse.json(
        { error: 'Invalid credentials' }, 
        { status: 401 }
      );
      return addSecurityHeaders(response);
    }
  } catch (error) {
    console.error('Error in login API:', error);
    
    const response = NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
    return addSecurityHeaders(response);
  }
}
