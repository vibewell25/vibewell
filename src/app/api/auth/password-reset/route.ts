import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { passwordResetRateLimiter, applyRateLimit } from '../rate-limit-middleware';

// Schema for validating the request body
const passwordResetSchema = z.object({
  email: z.string().email('Invalid email address'),
});

// Schema for validating password update
const passwordUpdateSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  token: z.string(),
});

// Password reset request
export async function POST(req: NextRequest) {
  try {
    // Apply specialized rate limiting for password reset
    const rateLimitResponse = await applyRateLimit(req, passwordResetRateLimiter);
    if (rateLimitResponse) {
      return rateLimitResponse; // Rate limit exceeded
    }

    // Parse and validate request body
    const body = await req.json();
    const result = passwordResetSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: result.error.format() },
        { status: 400 }
      );
    }
    
    const { email } = result.data;
    
    // Create Supabase client
    const supabase = createRouteHandlerClient({ cookies });
    
    // Send password reset email
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
    });
    
    if (error) {
      console.error('Password reset error:', error);
      
      // Don't reveal if the email exists or not for security reasons
      return NextResponse.json({
        success: true,
        message: 'If your email is registered, you will receive password reset instructions.',
      });
    }
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: 'If your email is registered, you will receive password reset instructions.',
    });
  } catch (error) {
    console.error('Error in password reset API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update password with reset token
export async function PUT(req: NextRequest) {
  try {
    // Apply specialized rate limiting for password reset
    const rateLimitResponse = await applyRateLimit(req, passwordResetRateLimiter);
    if (rateLimitResponse) {
      return rateLimitResponse; // Rate limit exceeded
    }

    // Parse and validate request body
    const body = await req.json();
    const result = passwordUpdateSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: result.error.format() },
        { status: 400 }
      );
    }
    
    const { password, token } = result.data;
    
    // Create Supabase client
    const supabase = createRouteHandlerClient({ cookies });
    
    // Update user password using the token
    const { error } = await supabase.auth.updateUser({
      password: password,
    });
    
    if (error) {
      console.error('Password update error:', error);
      return NextResponse.json(
        { error: 'Failed to update password. The reset link may have expired.' },
        { status: 400 }
      );
    }
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    console.error('Error in password update API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 