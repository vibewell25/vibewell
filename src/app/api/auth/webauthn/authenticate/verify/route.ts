import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import type { AuthenticationResponseJSON } from '@simplewebauthn/typescript-types';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const response: AuthenticationResponseJSON = body.response;

    if (!response) {
      return NextResponse.json(
        { error: 'Missing authentication response' },
        { status: 400 }
      );
    }

    // In a real application, you would:
    // 1. Get the user's credential from your database using response.id
    // 2. Get the stored challenge from your database
    // 3. Get the user's public key from your database
    const expectedChallenge = 'dummyChallenge';

    let verification;
    try {
      verification = await verifyAuthenticationResponse({
        response,
        expectedChallenge,
        expectedOrigin: 'http://localhost:3000',
        expectedRPID: 'localhost',
        credential: {
          // This would come from your database
          publicKey: new Uint8Array([]),
          id: '',  // Base64URL string of the credential ID
          counter: 0,
        },
      });
    } catch (error) {
      console.error('Error verifying authentication:', error);
      return NextResponse.json(
        { error: 'Failed to verify authentication' },
        { status: 400 }
      );
    }

    const { verified, authenticationInfo } = verification;

    if (verified && authenticationInfo) {
      // In a real application, you would:
      // 1. Update the authenticator's counter in your database
      // 2. Handle user sign in (e.g., create a session)
      return NextResponse.json({ verified, authenticationInfo });
    }

    return NextResponse.json(
      { error: 'Authentication verification failed' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing authentication:', error);
    return NextResponse.json(
      { error: 'Failed to process authentication' },
      { status: 500 }
    );
  }
} 