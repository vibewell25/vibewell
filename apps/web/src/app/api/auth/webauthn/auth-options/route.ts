
import { NextResponse } from 'next/server';


import { WebAuthnService } from '@/lib/auth/webauthn-service';

import { getServerSession } from 'next-auth';


import { authOptions } from '@/lib/auth/auth-options';

export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session.user.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const options = await WebAuthnService.startAuthentication(session.user.id);
    return NextResponse.json(options);
  } catch (error) {
    console.error('WebAuthn authentication options error:', error);
    return new NextResponse(error instanceof Error ? error.message : 'Internal server error', {
      status: 500,
    });
  }
}
