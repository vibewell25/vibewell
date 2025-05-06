import { NextRequest, NextResponse } from 'next/server';

import { getServerSession } from 'next-auth';


import { WebAuthnService } from '@/lib/auth/webauthn-service';


import { WebAuthnError } from '@/lib/auth/webauthn-types';

import { RegistrationResponseJSON } from '@simplewebauthn/types';

const webAuthnService = new WebAuthnService();

export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
const body = await req.json();
    const { response, options = {} } = body;

    if (!response) {
      return NextResponse.json({ error: 'Missing registration response' }, { status: 400 });
const verification = await webAuthnService.verifyRegistration(
      session.user.id,
      response as RegistrationResponseJSON,
      options,
return NextResponse.json({ verified: verification.verified });
catch (error) {
    if (error instanceof WebAuthnError) {
      return NextResponse.json(
        { error: error.message, code: error.code, details: error.details },
        { status: 400 },
return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
