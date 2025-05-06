import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware function to handle routing, security, and domain validation
 */
export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host') || '';
  
  // Define the subdomains and their corresponding paths
  const subdomains: Record<string, string> = {
    'app.getvibewell.com': '/app',
    'admin.getvibewell.com': '/admin',
  };

  // Add security headers to all responses
  const secureHeaders = {
    'X-DNS-Prefetch-Control': 'on',
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    'X-XSS-Protection': '1; mode=block',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'origin-when-cross-origin',
    'X-Frame-Options': 'SAMEORIGIN',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self), interest-cohort=()',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' *.getvibewell.com; connect-src 'self' *.getvibewell.com; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; font-src 'self' data:; frame-src 'self'; base-uri 'self';"
  };
  
  // Create response object with security headers
  const response = NextResponse.next();
  
  // Add security headers to response
  Object.entries(secureHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Check if we are on a subdomain
  for (const [domain, path] of Object.entries(subdomains)) {
    if (hostname === domain) {
      // Rewrite the URL to include the subdomain path
      url.pathname = `${path}${url.pathname}`;
      
      // Create a response using the rewritten URL and apply security headers
      const subdomainResponse = NextResponse.rewrite(url);
      Object.entries(secureHeaders).forEach(([key, value]) => {
        subdomainResponse.headers.set(key, value);
      });
      
      return subdomainResponse;
    }
  }

  // For the main domain (with or without www), serve the marketing pages
  if (hostname === 'getvibewell.com' || hostname === 'www.getvibewell.com') {
    return response;
  }

  // Handle localhost for development
  if (hostname.includes('localhost')) {
    return response;
  }

  // Validate host header to prevent Host header injection
  if (!hostname || !hostname.match(/^(.*\.)?getvibewell\.com$|^localhost(:[0-9]+)?$/)) {
    return new Response('Invalid host', { status: 400 });
  }

  // Redirect unknown domains to the main site with security headers
  const redirectResponse = NextResponse.redirect(new URL('https://www.getvibewell.com'));
  Object.entries(secureHeaders).forEach(([key, value]) => {
    redirectResponse.headers.set(key, value);
  });
  
  return redirectResponse;
}

/**
 * Configure the middleware to run on specific paths
 */
export const config = {
  matcher: [
    // Match all paths except static files and api routes
    // But still apply to auth-related routes for security
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
