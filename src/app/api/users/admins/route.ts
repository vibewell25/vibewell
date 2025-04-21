import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';

export async function GET() {
  try {
    // Get all users with admin role
    const { data, error } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('role', 'admin');

    if (error) throw error;

    // Return the list of admin users
    return NextResponse.json({
      data,
      count: data.length,
    });
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return NextResponse.json({ error: 'Failed to fetch admin users' }, { status: 500 });
  }
}
