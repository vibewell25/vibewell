import { NextResponse } from 'next/server';
import { verifyRegistration } from '@/lib/auth/webauthn-service';
import type { RegistrationResponseJSON } from '@simplewebauthn/types';

export async function POST(request: Request) {
  try {
    const { userId, response } = await request.json();

    if (!userId || !response) {
      return NextResponse.json(
        { error: 'User ID and response are required' },
        { status: 400 }
      );
    }

    const verification = await verifyRegistration(
      userId,
      response as RegistrationResponseJSON
    );

    return NextResponse.json(verification);
  } catch (error) {
    console.error('WebAuthn registration verification error:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
} 