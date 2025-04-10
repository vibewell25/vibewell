import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { signupRateLimiter, applyRateLimit } from '../rate-limit-middleware';

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
    
    // Create Supabase client
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single();
    
    if (existingUser) {
      // Don't reveal if the email exists for security reasons
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      );
    }
    
    // Create user in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/verify-email`,
      },
    });
    
    if (error) {
      console.error('Signup error:', error);
      return NextResponse.json(
        { error: 'Failed to create account' },
        { status: 400 }
      );
    }
    
    // Create profile record in profiles table
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: data.user.id,
            full_name: fullName,
            email: email,
            role: role,
          },
        ]);
      
      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Continue anyway, as auth was successful
      }
    }
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Account created successfully. Please verify your email.',
    });
  } catch (error) {
    console.error('Error in signup API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 