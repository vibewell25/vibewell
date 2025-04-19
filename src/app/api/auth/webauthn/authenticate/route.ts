import { generateAuthenticationOptions, verifyAuthenticationResponse } from '@simplewebauthn/server';
import { type NextRequest } from 'next/server';

// WebAuthn configuration
const rpName = 'Vibewell';
const rpID = process.env.NEXT_PUBLIC_DOMAIN || 'localhost';
const origin = process.env.NEXT_PUBLIC_APP_URL || `https://${rpID}`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Missing user ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get user's authenticators from your database
    // const userAuthenticators = await getUserAuthenticators(userId);

    const options = await generateAuthenticationOptions({
      rpID,
      // allowCredentials: userAuthenticators.map((authenticator) => ({
      //   id: authenticator.credentialID,
      //   type: 'public-key',
      //   transports: authenticator.transports,
      // })),
      userVerification: 'preferred',
    });

    // Store challenge in session or database for verification
    // await storeChallenge(userId, options.challenge);

    return new Response(JSON.stringify(options), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('WebAuthn authentication error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 