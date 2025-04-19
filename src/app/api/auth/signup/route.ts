import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { signupRateLimiter, applyRateLimit } from '../rate-limit-middleware';
import { prisma } from '@/lib/database/client';
import { handleAuth, handleSignup } from '@auth0/nextjs-auth0';

// Schema for validating signup request
const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
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

// Signup endpoint
export async function POST(req: NextRequest) {
  try {
    // Apply specialized rate limiting for signup
    const rateLimitResponse = await applyRateLimit(req, signupRateLimiter);
    if (rateLimitResponse) {
      return rateLimitResponse; // Rate limit exceeded
    }

    // Parse and validate request body
    const body = await req.json();
    const result = signupSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: result.error.format() },
        { status: 400 }
      );
    }
    
    const { email, password, fullName, role } = result.data;
    
    // Check if email already exists in our database
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      // Don't reveal if the email exists for security reasons
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      );
    }
    
    try {
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
      const response = await auth0SignupHandler(modifiedReq);
      
      // If signup is successful, create a profile record in our database
      // We need to extract the user ID from the Auth0 response
      const responseData = await response.json();
      
      if (responseData?.user?.sub) {
        // Create profile record in our database
        await prisma.profile.create({
          data: {
            id: responseData.user.sub,
            fullName: fullName || '',
            email: email,
            role: role,
            isVerified: false
          },
        });
        
        // Set custom Auth0 user metadata for role - use Management API
        const auth0ManagementClient = new (require('auth0')).ManagementClient({
          domain: process.env.AUTH0_ISSUER_BASE_URL?.replace(/^https?:\/\//, '') || '',
          clientId: process.env.AUTH0_MANAGEMENT_CLIENT_ID || '',
          clientSecret: process.env.AUTH0_MANAGEMENT_CLIENT_SECRET || '',
        });
        
        await auth0ManagementClient.users.update(
          { id: responseData.user.sub },
          { 
            user_metadata: { role },
            app_metadata: { role } 
          }
        );
      }
      
      // Return success response
      return NextResponse.json({
        success: true,
        message: 'Account created successfully. Please verify your email.',
      });
    } catch (authError) {
      console.error('Auth0 signup error:', authError);
      return NextResponse.json(
        { error: 'Failed to create account' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error in signup API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 