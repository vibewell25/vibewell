import { NextRequest, NextResponse } from 'next/server';

import { getServerSession } from 'next-auth';


import { WebAuthnService } from '@/lib/auth/webauthn-service';


import { WebAuthnError } from '@/lib/auth/webauthn-types';

const webAuthnService = new WebAuthnService();

export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
const authenticators = await webAuthnService.listAuthenticators(session.user.id);
    return NextResponse.json(authenticators);
catch (error) {
    if (error instanceof WebAuthnError) {
      return NextResponse.json(
        { error: error.message, code: error.code, details: error.details },
        { status: 400 },
return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); DELETE(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
const { searchParams } = new URL(req.url);
    const authenticatorId = searchParams.get('id');

    if (!authenticatorId) {
      return NextResponse.json({ error: 'Missing authenticator ID' }, { status: 400 });
await webAuthnService.deleteAuthenticator(session.user.id, authenticatorId);
    return NextResponse.json({ success: true });
catch (error) {
    if (error instanceof WebAuthnError) {
      return NextResponse.json(
        { error: error.message, code: error.code, details: error.details },
        { status: 400 },
return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); PATCH(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
const { id, name } = await req.json();

    if (!id || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
await webAuthnService.renameAuthenticator(session.user.id, id, name);
    return NextResponse.json({ success: true });
catch (error) {
    if (error instanceof WebAuthnError) {
      return NextResponse.json(
        { error: error.message, code: error.code, details: error.details },
        { status: 400 },
return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
