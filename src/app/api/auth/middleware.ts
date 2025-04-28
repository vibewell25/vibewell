import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';

/**
 * Middleware to check if a user is authenticated with Auth0
 * If not authenticated, it returns a 401 Unauthorized response
 */
export async function withAuth(
  req: NextRequest,
  handler: (req: NextRequest, user: any) => Promise<NextResponse>,
): Promise<NextResponse> {
  try {
    const session = await getSession(req);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    return handler(req, session.user);
  } catch (error) {
    console.error('Auth middleware error:', error);
    return NextResponse.json({ error: 'Authentication error' }, { status: 500 });
  }
}

/**
 * Middleware to check if a user has a specific role
 */
export async function withRole(
  req: NextRequest,
  handler: (req: NextRequest, user: any) => Promise<NextResponse>,
  allowedRoles: string[] = [],
): Promise<NextResponse> {
  return withAuth(req, async (req, user) => {
    // Extract roles from Auth0 user
    // Note: This is implementation specific, adjust according to your Auth0 configuration
    const userRoles = user[`${process.env.AUTH0_NAMESPACE}/roles`] || [];

    const hasRole = allowedRoles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      return NextResponse.json({ error: 'Forbidden. Insufficient permissions.' }, { status: 403 });
    }

    return handler(req, user);
  });
}

/**
 * Admin-only middleware
 */
export async function withAdmin(
  req: NextRequest,
  handler: (req: NextRequest, user: any) => Promise<NextResponse>,
): Promise<NextResponse> {
  return withRole(req, handler, ['admin']);
}

/**
 * Provider-only middleware
 */
export async function withProvider(
  req: NextRequest,
  handler: (req: NextRequest, user: any) => Promise<NextResponse>,
): Promise<NextResponse> {
  return withRole(req, handler, ['provider', 'admin']);
}
