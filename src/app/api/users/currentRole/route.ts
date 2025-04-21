import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // Get the session from cookies
    const cookieStore = cookies();
    const supabaseAuthToken = cookieStore.get('supabase-auth-token')?.value;

    if (!supabaseAuthToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get session from Supabase
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }

    // Get user role from database
    const { data, error } = await supabase.from('users').select('role').eq('id', user.id).single();

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch user role' }, { status: 500 });
    }

    // Return user role
    return NextResponse.json({
      role: data?.role || 'user',
    });
  } catch (error) {
    console.error('Error getting user role:', error);
    return NextResponse.json({ error: 'Failed to get user role' }, { status: 500 });
  }
}
