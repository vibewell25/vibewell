import { NextRequest, NextResponse } from 'next/server';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
} from '@simplewebauthn/server';
import { cookies } from 'next/headers';
import { sign } from 'jsonwebtoken';

// WebAuthn configuration
const rpName = 'VibeWell';
const rpID = process.env.NEXT_PUBLIC_DOMAIN || 'localhost';
const origin = process.env.NEXT_PUBLIC_APP_URL || `https://${rpID}`;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// In-memory storage for demo purposes
// In production, use a database
const authenticators = new Map<string, any>();

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get('email');
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userID: email,
      userName: email,
      attestationType: 'none',
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'preferred',
        requireResidentKey: false,
      },
    });

    // Store challenge for verification
    cookies().set('current_challenge', options.challenge, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    return NextResponse.json(options);
  } catch (error) {
    console.error('WebAuthn registration options error:', error);
    return NextResponse.json(
      { error: 'Failed to generate registration options' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = body.email;
    const challenge = cookies().get('current_challenge')?.value;

    if (!email || !challenge) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge: challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    });

    if (verification.verified) {
      // Store the authenticator
      authenticators.set(email, verification.registrationInfo);

      // Create session token
      const token = sign(
        {
          email,
          provider: 'webauthn',
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Set session cookie
      cookies().set('session_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
      });

      // Clear challenge cookie
      cookies().delete('current_challenge');

      return NextResponse.json({
        verified: true,
        message: 'Registration successful',
      });
    }

    return NextResponse.json(
      { error: 'Registration verification failed' },
      { status: 400 }
    );
  } catch (error) {
    console.error('WebAuthn registration verification error:', error);
    return NextResponse.json(
      { error: 'Registration verification failed' },
      { status: 500 }
    );
  }
} 