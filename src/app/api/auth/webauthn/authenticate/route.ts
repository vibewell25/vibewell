import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { WebAuthnService } from '@/lib/auth/webauthn-service';
import { WebAuthnError } from '@/lib/auth/webauthn-types';
import { AuthenticationResponseJSON } from '@simplewebauthn/types';

const webAuthnService = new WebAuthnService();

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
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
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
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
      options
    );

    return NextResponse.json({ verified: verification.verified });
  } catch (error) {
    if (error instanceof WebAuthnError) {
      return NextResponse.json(
        { error: error.message, code: error.code, details: error.details },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
