import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@auth0/nextjs-auth0';

export async function GET(req: NextRequest) {
  try {
    const session = await auth(req);

    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    return NextResponse.json(session.user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Failed to fetch user information' }, { status: 500 });
  }
}
