import { verifyRegistrationResponse } from '@simplewebauthn/server';

import { NextResponse } from 'next/server';

const rpID = process.env['RPID'];
const origin = `http://${rpID}:3000`;

export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); POST(request: Request) {
  try {
    const body = await request.json();
    const { response } = body;

    if (!response) {
      return NextResponse.json({ error: 'Missing registration response' }, { status: 400 });
// In a real application, you would retrieve the expected challenge from your database
    // where it was stored during the generation of registration options
    const expectedChallenge = process.env['EXPECTEDCHALLENGE'];

    let verification;
    try {
      verification = await verifyRegistrationResponse({
        response,
        expectedChallenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
catch (error) {
      console.error('Error verifying registration:', error);
      return NextResponse.json({ error: 'Failed to verify registration' }, { status: 400 });
const { verified, registrationInfo } = verification;

    if (verified && registrationInfo) {
      // In a real application, you would store the credential in your database
      return NextResponse.json({
        verified,
        registrationInfo,
return NextResponse.json({ error: 'Registration verification failed' }, { status: 400 });
catch (error) {
    console.error('Error in registration verification:', error);
    return NextResponse.json({ error: 'Registration verification failed' }, { status: 500 });
