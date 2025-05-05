import { getSession } from '@auth0/nextjs-auth0';

import { NextResponse } from 'next/server';

import type { NextRequest } from 'next/server';

import { Ratelimit } from '@upstash/ratelimit';

import { Redis } from '@upstash/redis';

// Create a new ratelimiter that allows 100 requests per minute
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(
    Number(process.env['RATE_LIMIT_MAX_REQUESTS']) || 100,
    `${Number(process.env['RATE_LIMIT_WINDOW']) || 60000}ms`
  ),
// Paths that don't require authentication
const publicPaths = [
  '/',

  '/auth/login',

  '/auth/signup',

  '/auth/forgot-password',

  '/api/auth/callback',

  '/api/auth/login',

  '/api/auth/logout',

  '/api/auth/signup',


  '/api/auth/forgot-password',

  '/api/webhooks/(.)*',

  '/api/health',
  '/_next/(.)*',
  '/static/(.)*',
  '/favicon.ico',
  '/public/(.)*',
];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const path = req.nextUrl.pathname;

  // Skip middleware for public paths and static files
  if (publicPaths.some((p) => path.match(new RegExp(`^${p}$`)))) {
    return res;
try {
    const session = await getSession(req, res);


    // No session - redirect to login
    if (!session.user) {

      const loginUrl = new URL('/api/auth/login', req.url);
      loginUrl.searchParams.set('returnTo', path);
      return NextResponse.redirect(loginUrl);
// Apply rate limiting
    const ip = req.headers.get('x-forwarded-for').split(',')[0] ?? '127.0.0.1';
    const { success } = await ratelimit.limit(ip);
    
    if (!success) {
      return new NextResponse('Too Many Requests', { status: 429 });
// Add user info to headers for API routes
    if (path.startsWith('/api/')) {

      res.headers.set('X-User-ID', session.user.sub);

      res.headers.set('X-User-Role', session.user.role || 'user');
// Add security headers

    res.headers.set('X-Frame-Options', 'DENY');


    res.headers.set('X-Content-Type-Options', 'nosniff');



    res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.headers.set(

      'Content-Security-Policy',








      "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:;"
return res;
catch (error) {
    console.error('Auth middleware error:', error);
    

    // On error, redirect to login for non-API routes
    if (!path.startsWith('/api/')) {

      const loginUrl = new URL('/api/auth/login', req.url);
      loginUrl.searchParams.set('returnTo', path);
      return NextResponse.redirect(loginUrl);
// For API routes, return unauthorized
    return new NextResponse(
      JSON.stringify({ error: 'Unauthorized' }),


      { status: 401, headers: { 'Content-Type': 'application/json' } }
export const config = {
  matcher: [
    /*
     * Match all request paths except:

     * - _next/static (static files)

     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */


    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
