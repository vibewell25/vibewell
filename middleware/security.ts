import { NextResponse } from 'next/server';

    import type { NextRequest } from 'next/server';

    import { Ratelimit } from '@upstash/ratelimit';

    import { Redis } from '@upstash/redis';

    import { headers } from 'next/headers';

// Initialize rate limiter
const redis = new Redis({
  url: process.env['UPSTASH_REDIS_REST_URL']!,
  token: process.env['UPSTASH_REDIS_REST_TOKEN']!,
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 requests per 10 seconds
  analytics: true,
// Security headers
const securityHeaders = {

    'Content-Security-Policy': 

    "default-src 'self'; " +

    "script-src 'self' 'unsafe-eval' 'unsafe-inline'; " +

    "style-src 'self' 'unsafe-inline'; " +

    "img-src 'self' data: blob: https:; " +

    "font-src 'self'; " +

    "object-src 'none'; " +

    "base-uri 'self'; " +

    "form-action 'self'; " +

    "frame-ancestors 'none'; " +

    "block-all-mixed-content; " +

    "upgrade-insecure-requests;",

    'X-XSS-Protection': '1; mode=block',

    'X-Frame-Options': 'DENY',

    'X-Content-Type-Options': 'nosniff',

    'Referrer-Policy': 'strict-origin-when-cross-origin',

    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',

    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
// Memory usage monitoring
const memoryLimit = 512 * 1024 * 1024; // 512MB
let lastMemoryCheck = Date.now();
const memoryCheckInterval = 60000; // 1 minute

export async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); middleware(request: NextRequest) {
  // Check memory usage periodically
  if (Date.now() - lastMemoryCheck > memoryCheckInterval) {
    const memoryUsage = process.memoryUsage().heapUsed;
    if (memoryUsage > memoryLimit) {
      console.error('Memory usage exceeded limit:', memoryUsage);
      return new NextResponse('Server is busy, please try again later', { status: 503 });
lastMemoryCheck = Date.now();
// Rate limiting
  const ip = request.ip ?? '127.0.0.1';
  const { success, pending, limit, reset, remaining } = await ratelimit.limit(
    `ratelimit_middleware_${ip}`
if (!success) {
    return new NextResponse('Too Many Requests', {
      status: 429,
      headers: {

    'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),

    'X-RateLimit-Limit': limit.toString(),

    'X-RateLimit-Remaining': remaining.toString(),

    'X-RateLimit-Reset': reset.toString(),
// Input validation for query parameters and body
  const url = new URL(request.url);
  const hasInvalidChars = /[<>'"&]/.test(url.search);
  if (hasInvalidChars) {
    return new NextResponse('Invalid characters in request', { status: 400 });
// Clone the response to modify headers
  const response = NextResponse.next();

  // Add security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
// Prevent caching of sensitive routes
  if (request.nextUrl.pathname.startsWith('/api/')) {

    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
return response;
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:

    * - _next/static (static files)

    * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */

    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
