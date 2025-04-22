import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getSkinConditionAnalytics } from '@/lib/api/skincare';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const days = searchParams.get('days');

    const analytics = await getSkinConditionAnalytics(
      session.user.id,
      days ? parseInt(days, 10) : undefined
    );

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error in GET /api/skincare/analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch skin condition analytics' },
      { status: 500 }
    );
  }
} 