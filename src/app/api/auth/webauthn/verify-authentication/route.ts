import { NextResponse } from 'next/server';
import { verifyAuthentication } from '@/lib/auth/webauthn-service';
import type { AuthenticationResponseJSON } from '@simplewebauthn/types';

export async function POST(request: Request) {
  try {
    const { userId, response } = await request.json();

    if (!userId || !response) {
      return NextResponse.json(
        { error: 'User ID and response are required' },
        { status: 400 }
      );
    }

    const verification = await verifyAuthentication(
      userId,
      response as AuthenticationResponseJSON
    );

    return NextResponse.json(verification);
  } catch (error) {
    console.error('WebAuthn authentication verification error:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
} 