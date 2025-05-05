import { NextResponse } from 'next/server';


import { WebAuthnService } from '@/lib/auth/webauthn-service';

import { getServerSession } from 'next-auth';


import { authOptions } from '@/lib/auth/auth-options';

import { AuthenticationResponseJSON } from '@simplewebauthn/typescript-types';

export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session.user.id) {
      return new NextResponse('Unauthorized', { status: 401 });
const body = await request.json();
    const { assertionResponse } = body as { assertionResponse: AuthenticationResponseJSON };

    if (!assertionResponse) {
      return new NextResponse('Missing assertion response', { status: 400 });
const verification = await WebAuthnService.verifyAuthentication(
      session.user.id,
      assertionResponse,
return NextResponse.json({ verified: verification });
catch (error) {
    console.error('WebAuthn authentication verification error:', error);
    return new NextResponse(error instanceof Error ? error.message : 'Internal server error', {
      status: 500,
