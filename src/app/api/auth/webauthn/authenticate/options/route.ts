import { generateAuthenticationOptions } from '@simplewebauthn/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // In a real application, you would:
    // 1. Get the user's registered credentials from your database
    // 2. Pass them as 'allowCredentials' in the options below
    const options = await generateAuthenticationOptions({
      rpID: 'localhost',
      // allowCredentials: [{
      //   id: base64url.decode(credentialID),
      //   type: 'public-key',
      //   transports: ['internal'],
      // }],
      userVerification: 'preferred',
    });

    // In a real application, you would save the challenge in your database
    // await saveChallenge(userId, options.challenge);

    return NextResponse.json(options);
  } catch (error) {
    console.error('Error generating authentication options:', error);
    return NextResponse.json(
      { error: 'Failed to generate authentication options' },
      { status: 500 },
    );
  }
}
