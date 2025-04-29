import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { 
  generateRegistration,
  verifyRegistration,
  generateAuthentication,
  verifyAuthentication,
  WebAuthnError
} from '@/lib/webauthn';
import { prisma } from '@/lib/prisma';

// Helper to get user ID from session
async function getUserId(request: Request) {
  const session = await getSession();
  if (!session?.user?.sub) {
    throw new WebAuthnError('Not authenticated', 'NOT_AUTHENTICATED');
  }
  const user = await prisma.user.findUnique({
    where: { auth0Id: session.user.sub }
  });
  if (!user) {
    throw new WebAuthnError('User not found', 'USER_NOT_FOUND');
  }
  return user.id;
}

// Generate registration options
export async function GET(request: Request) {
  try {
    const userId = await getUserId(request);
    const options = await generateRegistration(userId);
    return NextResponse.json(options);
  } catch (error) {
    if (error instanceof WebAuthnError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: 400 }
      );
    }
    console.error('WebAuthn registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Verify registration response
export async function POST(request: Request) {
  try {
    const userId = await getUserId(request);
    const response = await request.json();
    const verification = await verifyRegistration(userId, response);
    return NextResponse.json({ verified: verification.verified });
  } catch (error) {
    if (error instanceof WebAuthnError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: 400 }
      );
    }
    console.error('WebAuthn registration verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 