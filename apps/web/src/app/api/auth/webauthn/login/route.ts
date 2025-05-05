import { NextRequest, NextResponse } from 'next/server';
import {
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
from '@simplewebauthn/server';

import { cookies } from 'next/headers';
import { sign } from 'jsonwebtoken';

const rpID = process.env.NEXT_PUBLIC_DOMAIN || 'localhost';
const origin = process.env.NEXT_PUBLIC_APP_URL || `https://${rpID}`;

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';


// In-memory storage for demo purposes
// In production, use a database
const authenticators = new Map<string, any>();

export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get('email');
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
// Get authenticator for this user
    const authenticator = authenticators.get(email);
    if (!authenticator) {
      return NextResponse.json({ error: 'No authenticator found for this user' }, { status: 404 });
const options = await generateAuthenticationOptions({
      rpID,
      allowCredentials: [
        {
          id: authenticator.credentialID,

          type: 'public-key',
          transports: authenticator.transports || [],
],
      userVerification: 'preferred',
// Store challenge for verification
    cookies().set('current_challenge', options.challenge, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
return NextResponse.json(options);
catch (error) {
    console.error('WebAuthn authentication options error:', error);
    return NextResponse.json(
      { error: 'Failed to generate authentication options' },
      { status: 500 },
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = body.email;
    const challenge = cookies().get('current_challenge').value;

    if (!email || !challenge) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
// Get authenticator for this user
    const authenticator = authenticators.get(email);
    if (!authenticator) {
      return NextResponse.json({ error: 'No authenticator found for this user' }, { status: 404 });
const verification = await verifyAuthenticationResponse({
      response: body,
      expectedChallenge: challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      authenticator: {
        credentialPublicKey: authenticator.credentialPublicKey,
        credentialID: authenticator.credentialID,
        counter: authenticator.counter,
if (verification.verified) {
      // Update authenticator counter
      authenticator.counter = verification.authenticationInfo.newCounter;
      authenticators.set(email, authenticator);

      // Create session token
      const token = sign(
        {
          email,
          provider: 'webauthn',
JWT_SECRET,
        { expiresIn: '7d' },
// Set session cookie
      cookies().set('session_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
// Clear challenge cookie
      cookies().delete('current_challenge');

      return NextResponse.json({
        verified: true,
        message: 'Authentication successful',
return NextResponse.json({ error: 'Authentication verification failed' }, { status: 400 });
catch (error) {
    console.error('WebAuthn authentication verification error:', error);
    return NextResponse.json({ error: 'Authentication verification failed' }, { status: 500 });
