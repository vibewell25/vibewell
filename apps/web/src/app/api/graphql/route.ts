import { createYoga } from 'graphql-yoga';
import { schema } from '@/lib/graphql/schema';
import { createContext } from '@/lib/graphql/context';
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { apiRateLimiter, applyRateLimit } from '@/app/api/auth/rate-limit-middleware';

// Security headers for GraphQL responses
function addSecurityHeaders(response: Response): Response {
  // Clone the response to make it mutable
  const newResponse = new Response(response.body, response);
  
  // Add security headers
  newResponse.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  newResponse.headers.set('X-Content-Type-Options', 'nosniff');
  newResponse.headers.set('X-Frame-Options', 'DENY');
  newResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  newResponse.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Disable caching for GraphQL responses
  newResponse.headers.set('Cache-Control', 'no-store, private, max-age=0');
  
  return newResponse;
}

// Helper function to get client IP
function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  return 'unknown';
}

// Create the Yoga GraphQL handler
const yoga = createYoga({
  schema,
  context: async ({ request }) => {
    // Create a NextResponse to pass to getSession
    const res = new Response();
    
    // Convert the fetch Request to a NextRequest
    const req = new NextRequest(request.url, {
      method: request.method,
      headers: request.headers,
      body: request.body,
    });
    
    // Get the user session
    const session = await getSession(req, res);
    
    // Get client IP for logging and rate limiting
    const ip = getClientIp(req);
    
    // Create and return the context with user info if available
    return createContext({
      req,
      session,
      ip,
    });
  },
  graphqlEndpoint: '/api/graphql',
  fetchAPI: { Response },
  graphiql: process.env.NODE_ENV !== 'production',
  // Add response validation against the schema
  validationCache: true,
  // Set execution limits
  maskedErrors: process.env.NODE_ENV === 'production',
  // Add introspection option based on environment
  introspection: process.env.NODE_ENV !== 'production',
});

// Handler for GraphQL requests with rate limiting and security headers
async function handler(req: NextRequest) {
  // Check for rate limiting
  const rateLimitResponse = await applyRateLimit(req, apiRateLimiter);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }
  
  try {
    // Call the GraphQL handler
    const response = await yoga.handleRequest(req);
    
    // Add security headers
    return addSecurityHeaders(response);
  } catch (error) {
    console.error('GraphQL execution error:', error);
    
    // Create an error response
    const errorResponse = new Response(
      JSON.stringify({
        errors: [{
          message: 'Internal server error',
          extensions: { code: 'INTERNAL_SERVER_ERROR' }
        }]
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
    
    // Add security headers to error response
    return addSecurityHeaders(errorResponse);
  }
}

// Export the API route handlers
export { handler as GET, handler as POST };

// Set Edge runtime for better performance
export const runtime = 'edge';
