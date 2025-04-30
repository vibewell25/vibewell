import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth0 } from '@/lib/auth0';
import { getSession } from '@auth0/nextjs-auth0';

// Schema for validating the request body
const verifySchema = z.object({
  method: z.enum(['webauthn', 'totp', 'sms']),
  code: z.string().min(1, 'Verification code is required')
});

export async function POST(req: NextRequest) {
  try {
    // Get the current session
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate request body
    const body = await req.json();
    const result = verifySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: result.error.format() },
        { status: 400 }
      );
    }

    const { method, code } = result.data;

    // Get Auth0 Management API token
    const token = await auth0.getAccessToken();

    // Call Auth0 Management API to verify MFA
    const response = await fetch(`${process.env['AUTH0_ISSUER_BASE_URL']}/api/v2/users/${session.user.sub}/multifactor/challenge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        client_id: process.env['AUTH0_CLIENT_ID'],
        challenge_type: method === 'webauthn' ? 'webauthn' : method === 'totp' ? 'otp' : 'sms',
        code
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Auth0 MFA verification error:', error);
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 401 }
      );
    }

    // Update session to indicate MFA is verified
    await auth0.updateSession(req as any, {
      ...session,
      user: {
        ...session.user,
        mfa_verified: true
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in MFA verification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 