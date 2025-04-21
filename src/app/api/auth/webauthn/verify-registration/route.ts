import { NextResponse } from 'next/server';
import { WebAuthnService } from '@/lib/auth/webauthn-service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { RegistrationResponseJSON } from '@simplewebauthn/typescript-types';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { attestationResponse } = body as { attestationResponse: RegistrationResponseJSON };

    if (!attestationResponse) {
      return new NextResponse('Missing attestation response', { status: 400 });
    }

    const verification = await WebAuthnService.verifyRegistration(
      session.user.id,
      attestationResponse
    );

    return NextResponse.json({ verified: verification });
  } catch (error) {
    console.error('WebAuthn registration verification error:', error);
    return new NextResponse(error instanceof Error ? error.message : 'Internal server error', {
      status: 500,
    });
  }
}
