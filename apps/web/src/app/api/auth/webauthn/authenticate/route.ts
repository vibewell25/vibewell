
import { NextRequest, NextResponse } from 'next/server';

import { getServerSession } from 'next-auth';


import { WebAuthnService } from '@/lib/auth/webauthn-service';


import { WebAuthnError } from '@/lib/auth/webauthn-types';

import { AuthenticationResponseJSON } from '@simplewebauthn/types';

import { getSession } from '@auth0/nextjs-auth0';

import { prisma } from '@/lib/prisma';
import { 
  generateAuthentication,
  verifyAuthentication

} from '@/lib/webauthn';

const webAuthnService = new WebAuthnService();

// Helper to get user ID from session
async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); getUserId(request: Request) {
  const session = await getSession();
  if (!session.user.sub) {
    throw new WebAuthnError('Not authenticated', 'NOT_AUTHENTICATED');
  }
  const user = await prisma.user.findFirst({
    where: { 
      OR: [
        { auth0Id: session.user.sub },
        { email: session.user.email }
      ]
    }
  });
  if (!user) {
    throw new WebAuthnError('User not found', 'USER_NOT_FOUND');
  }
  return user.id;
}

export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const requireBiometrics = searchParams.get('requireBiometrics') === 'true';
    const userVerification =
      (searchParams.get('userVerification') as 'required' | 'preferred' | 'discouraged') ||
      'preferred';

    const options = await webAuthnService.generateAuthenticationOptions(session.user.id, {
      requireBiometrics,
      userVerificationLevel: userVerification,
    });

    return NextResponse.json(options);
  } catch (error) {
    if (error instanceof WebAuthnError) {
      return NextResponse.json(
        { error: error.message, code: error.code, details: error.details },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { response, options = {} } = body;

    if (!response) {
      return NextResponse.json({ error: 'Missing authentication response' }, { status: 400 });
    }

    const verification = await webAuthnService.verifyAuthentication(
      session.user.id,
      response as AuthenticationResponseJSON,
      options,
    );

    return NextResponse.json({ verified: verification.verified });
  } catch (error) {
    if (error instanceof WebAuthnError) {
      return NextResponse.json(
        { error: error.message, code: error.code, details: error.details },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Generate authentication options
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); GET_Auth0(request: Request) {
  try {
    const userId = await getUserId(request);
    const options = await generateAuthentication(userId);
    return NextResponse.json(options);
  } catch (error) {
    if (error instanceof WebAuthnError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: 400 }
      );
    }
    console.error('WebAuthn authentication error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Verify authentication response
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); POST_Auth0(request: Request) {
  try {
    const userId = await getUserId(request);
    const response = await request.json();
    const verification = await verifyAuthentication(userId, response);
    
    if (verification.verified) {
      // Here you can update the session or set additional cookies
      // to indicate successful WebAuthn authentication
      return NextResponse.json({ 
        verified: true,
        message: 'Authentication successful'
      });
    }
    
    return NextResponse.json({ 
      verified: false,
      message: 'Authentication failed'
    }, { status: 401 });

  } catch (error) {
    if (error instanceof WebAuthnError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: 400 }
      );
    }
    console.error('WebAuthn authentication verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
