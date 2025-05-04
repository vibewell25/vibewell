
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { authRateLimiter, applyRateLimit } from '../rate-limit-middleware';

import { handleLogin } from '@auth0/nextjs-auth0';

// Schema for validating the request body
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Auth0 handler
const { POST: auth0LoginHandler } = handleLogin();

export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); POST(req: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await applyRateLimit(req, authRateLimiter);
    if (rateLimitResponse) {
      return rateLimitResponse; // Rate limit exceeded
    }

    // Parse and validate request body
    const body = await req.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: result.error.format() },
        { status: 400 },
      );
    }

    // Call Auth0 login handler
    try {
      // Create a modified request that Auth0 SDK expects
      const url = new URL(req.url);
      url.searchParams.set('email', result.data.email);
      url.searchParams.set('password', result.data.password);

      const modifiedReq = new Request(url, {
        method: 'POST',
        headers: req.headers,
      });


      // Use Auth0's built-in login handler
      return await auth0LoginHandler(modifiedReq);
    } catch (authError) {
      console.error('Auth0 authentication error:', authError);

      // To prevent user enumeration, don't reveal whether the email exists
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
  } catch (error) {
    console.error('Error in login API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
