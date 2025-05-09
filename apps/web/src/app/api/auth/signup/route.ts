import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ManagementClient } from 'auth0';
import { signupRateLimiter, applyRateLimit } from '../rate-limit-middleware';
import { prisma } from '@/lib/database/client';
import { handleSignup } from '@auth0/nextjs-auth0';

// Schema for validating signup request
const signupSchema = z.object({
  email: z.string().email('Invalid email address').trim().toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  fullName: z.string().min(2, 'Name must be at least 2 characters').optional(),
  role: z.enum(['customer', 'provider']).default('customer'),
});

// Get Auth0 signup handler
const { POST: auth0SignupHandler } = handleSignup();

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

// Signup endpoint
export async function POST(req: NextRequest) {
  const start = Date.now();
  
  try {
    // Check for timeout
    if (Date.now() - start > 30000) {
      throw new Error('Request timeout');
    }
    
    // Apply specialized rate limiting for signup
    const rateLimitResponse = await applyRateLimit(req, signupRateLimiter);
    if (rateLimitResponse) {
      return addSecurityHeaders(rateLimitResponse); // Rate limit exceeded
    }

    // Parse and validate request body
    const body = await req.json().catch(() => ({}));
    const result = signupSchema.safeParse(body);

    if (!result.success) {
      const response = NextResponse.json(
        { error: 'Invalid request data', details: result.error.format() },
        { status: 400 }
      );
      return addSecurityHeaders(response);
    }

    const { email, password, fullName, role } = result.data;

    try {
      // Check if email already exists in our database
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });
      
      if (existingUser) {
        // Don't reveal if the email exists for security reasons
        const response = NextResponse.json(
          { error: 'Invalid request' }, 
          { status: 400 }
        );
        return addSecurityHeaders(response);
      }

      // Create a modified request that Auth0 SDK expects
      const url = new URL(req.url);
      url.searchParams.set('email', email);
      url.searchParams.set('password', password);
      url.searchParams.set('name', fullName || '');

      const modifiedReq = new Request(url, {
        method: 'POST',
        headers: req.headers,
      });

      // Use Auth0's built-in signup handler
      const authResponse = await auth0SignupHandler(modifiedReq);
      
      // Parse the response data
      const responseData = await authResponse.clone().json();

      if (responseData?.user?.sub) {
        try {
          // Create profile record in our database
          await prisma.profile.create({
            data: {
              id: responseData.user.sub,
              fullName: fullName || '',
              email: email,
              role: role,
              isVerified: false,
            }
          });
          
          // Set custom Auth0 user metadata for role - use Management API
          const auth0Domain = process.env.AUTH0_ISSUER_BASE_URL?.replace(/^https?:\/\//, '') || '';
          const auth0ClientId = process.env.AUTH0_MANAGEMENT_CLIENT_ID || '';
          const auth0ClientSecret = process.env.AUTH0_MANAGEMENT_CLIENT_SECRET || '';
          
          if (auth0Domain && auth0ClientId && auth0ClientSecret) {
            const auth0ManagementClient = new ManagementClient({
              domain: auth0Domain,
              clientId: auth0ClientId,
              clientSecret: auth0ClientSecret,
            });
            
            await auth0ManagementClient.users.update(
              { id: responseData.user.sub },
              {
                user_metadata: { role },
                app_metadata: { role },
              }
            );
          }
        } catch (dbError) {
          console.error('Database or Auth0 management error:', dbError);
          // Continue despite db error - user is created in Auth0 but may need profile sync later
        }
      }

      // Return success response
      const successResponse = NextResponse.json({
        success: true,
        message: 'Account created successfully. Please verify your email.',
      }, {
        status: 201,
        headers: authResponse.headers
      });
      
      return addSecurityHeaders(successResponse);
    } catch (authError) {
      console.error('Auth0 signup error:', authError);
      const errorResponse = NextResponse.json(
        { error: 'Failed to create account' }, 
        { status: 400 }
      );
      return addSecurityHeaders(errorResponse);
    }
  } catch (error) {
    console.error('Error in signup API:', error);
    const errorResponse = NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
    return addSecurityHeaders(errorResponse);
  }
}
