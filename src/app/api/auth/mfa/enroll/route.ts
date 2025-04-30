import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth0 } from '@/lib/auth0';
import { getSession } from '@auth0/nextjs-auth0';

// Schema for validating the request body
const enrollSchema = z.object({
  method: z.enum(['webauthn', 'totp', 'sms'])
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
    const result = enrollSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: result.error.format() },
        { status: 400 }
      );
    }

    const { method } = result.data;

    // Get Auth0 Management API token
    const token = await auth0.getAccessToken();

    // Call Auth0 Management API to enable MFA
    const response = await fetch(`${process.env['AUTH0_ISSUER_BASE_URL']}/api/v2/users/${session.user.sub}/multifactor`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        provider: method === 'webauthn' ? 'webauthn' : method === 'totp' ? 'google-authenticator' : 'sms',
        enabled: true
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Auth0 MFA enrollment error:', error);
      return NextResponse.json(
        { error: 'Failed to enable MFA' },
        { status: response.status }
      );
    }

    // For TOTP, we need to return the secret and QR code
    if (method === 'totp') {
      const mfaData = await response.json();
      return NextResponse.json({
        success: true,
        data: {
          secret: mfaData.secret,
          qrCode: mfaData.qr_code
        }
      });
    }

    // For WebAuthn, return the challenge
    if (method === 'webauthn') {
      const mfaData = await response.json();
      return NextResponse.json({
        success: true,
        data: {
          challenge: mfaData.challenge,
          rpId: mfaData.rpId,
          allowCredentials: mfaData.allowCredentials
        }
      });
    }

    // For SMS, return success
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in MFA enrollment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 