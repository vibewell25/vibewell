import { getSession } from '@auth0/nextjs-auth0';
import { NextRequest, NextResponse } from 'next/server';

export async function requireAuth(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session?.user) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    return session;
  } catch (error) {
    console.error('Auth error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function requireRole(req: NextRequest, allowedRoles: string[]) {
  const session = await requireAuth(req);
  if (session instanceof NextResponse) {
    return session;
  }

  const userRole = session.user.role || 'user';
  if (!allowedRoles.includes(userRole)) {
    return new NextResponse(
      JSON.stringify({ error: 'Forbidden' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return session;
}

export function getUserId(session: { user: { sub: string } }) {
  return session.user.sub;
} 