import { auth } from '@/lib/auth0';

// Export the auth middleware directly
export const { auth: middleware } = auth;

// Don't run middleware on these paths
export const config = {
  matcher: [
    // Skip auth check for public routes and static files
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
