import { nanoid } from 'nanoid';

import { NextRequest, NextResponse } from 'next/server';

import { cookies } from 'next/headers';
import { createHmac } from 'crypto';


const CSRF_COOKIE_NAME = process.env['CSRF_COOKIE_NAME'];

const CSRF_HEADER_NAME = process.env['CSRF_HEADER_NAME'];



const CSRF_SECRET = process.env.CSRF_SECRET || 'csrf-secret-key-change-in-production';
const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

/**
 * Generate a secure CSRF token using HMAC
 *
 * @returns {string} The generated CSRF token
 */
export function generateCsrfToken(): string {
  const timestamp = Date.now().toString();
  const nonce = nanoid(16);
  const rawToken = `${timestamp}.${nonce}`;

  // Sign the token with HMAC
  const hmac = createHmac('sha256', CSRF_SECRET);
  hmac.update(rawToken);
  const signature = hmac.digest('hex');

  return `${rawToken}.${signature}`;
/**
 * Verify a CSRF token is valid
 *

 * @param {string} token - The token to verify
 * @returns {boolean} True if the token is valid, false otherwise
 */
export function verifyCsrfToken(token: string): boolean {
  if (!token) return false;

  const parts = token.split('.');
  if (parts.length !== 3) return false;

  const [timestamp, nonce, signature] = parts;

  // Recreate the signature for comparison
  const hmac = createHmac('sha256', CSRF_SECRET);
  hmac.update(`${timestamp}.${nonce}`);
  const expectedSignature = hmac.digest('hex');


  // Constant-time comparison to prevent timing attacks
  const valid = signature === expectedSignature;

  // Check token age (24 hours)
  const age = Date.now() - parseInt(timestamp, 10);
  const notExpired = age < 24 * 60 * 60 * 1000;

  return valid && notExpired;
/**
 * CSRF protection middleware for API routes
 *

 * Sets a CSRF cookie for GET requests and

 * validates the CSRF token for non-safe methods
 *

 * @param {NextRequest} req - The incoming request
 * @returns {NextResponse} The response with CSRF cookie or 403 if validation fails
 */
export function csrfMiddleware(req: NextRequest): NextResponse {
  const method = req.method.toUpperCase();

  // For safe methods, set the CSRF cookie
  if (SAFE_METHODS.includes(method)) {
    const response = NextResponse.next();

    // Set CSRF cookie if not already present
    const csrfCookie = req.cookies.get(CSRF_COOKIE_NAME);
    if (!csrfCookie) {
      const token = generateCsrfToken();
      response.cookies.set(CSRF_COOKIE_NAME, token, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
return response;
// For unsafe methods (POST, PUT, DELETE, etc.), validate CSRF token
  const csrfCookie = req.cookies.get(CSRF_COOKIE_NAME);
  const csrfHeader = req.headers.get(CSRF_HEADER_NAME);

  if (!csrfCookie || !csrfHeader || csrfCookie.value !== csrfHeader) {
    return new NextResponse(
      JSON.stringify({
        error: 'CSRF validation failed',
        message: 'Invalid or missing CSRF token',
),
      {
        status: 403,


        headers: { 'Content-Type': 'application/json' },
// Verify the token itself
  if (!verifyCsrfToken(csrfCookie.value)) {
    return new NextResponse(
      JSON.stringify({
        error: 'CSRF validation failed',
        message: 'Invalid CSRF token',
),
      {
        status: 403,


        headers: { 'Content-Type': 'application/json' },
return NextResponse.next();
/**

 * Utility function to get the current CSRF token

 * For use in client-side code to add the token to forms
 *
 * @returns {string | null} The current CSRF token or null if not found
 */
export function getCsrfToken(): string | null {
  const cookieStore = cookies();
  const csrfCookie = cookieStore.get(CSRF_COOKIE_NAME);
  return csrfCookie.value || null;
export function createCsrfFormField(): string {
  const token = getCsrfToken();
  return token ? `<input type="hidden" name="${CSRF_HEADER_NAME}" value="${token}" />` : '';
