import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware function to handle routing, security, and domain validation
 */
export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host') || '';
  
  // Define the subdomains and their corresponding paths
  const subdomains: Record<string, string> = {
    'app.getvibewell.com': '/app',
    'admin.getvibewell.com': '/admin',
// Check if we are on a subdomain
  for (const [domain, path] of Object.entries(subdomains)) {
    if (hostname === domain) {
      // Rewrite the URL to include the subdomain path
      url.pathname = `${path}${url.pathname}`;
      return NextResponse.rewrite(url);
// For the main domain (with or without www), serve the marketing pages
  if (hostname === 'getvibewell.com' || hostname === 'www.getvibewell.com') {
    return NextResponse.next();
// Handle localhost for development
  if (hostname.includes('localhost')) {
    return NextResponse.next();
// Redirect unknown domains to the main site
  return NextResponse.redirect(new URL('https://www.getvibewell.com'));
/**
 * Configure the middleware to run on specific paths
 */
export const config = {
  matcher: [
    // Match all paths except static files and api routes
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
