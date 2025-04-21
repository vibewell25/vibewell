import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/client';

export async function GET(request: NextRequest) {
  try {
    // Check if Supabase environment variables are available
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn('Supabase environment variables are missing, returning mock response');
      return NextResponse.json({
        success: true,
        events: [
          {
            id: 'mock-1',
            timestamp: new Date().toISOString(),
            ip: '192.168.1.1',
            endpoint: '/api/graphql',
            count: 10,
          },
          {
            id: 'mock-2',
            timestamp: new Date().toISOString(),
            ip: '192.168.1.2',
            endpoint: '/api/auth',
            count: 5,
          },
        ],
      });
    }

    // Check if user is authenticated and has admin role
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin role
    const userRole = user.user_metadata?.role || 'customer';
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'all';
    const exceeded = searchParams.get('exceeded') || 'all';
    const timeframe = searchParams.get('timeframe') || '24h';

    // Calculate the timestamp for the timeframe
    const now = new Date();
    let startTime: Date;

    switch (timeframe) {
      case '1h':
        startTime = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '7d':
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '24h':
      default:
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
    }

    // In a real implementation, you would query your database
    // Here, we'll return mock data for demonstration purposes

    // Simulated database query
    let query = supabase
      .from('rate_limit_events')
      .select('*')
      .gte('created_at', startTime.toISOString());

    // Apply filters
    if (type !== 'all') {
      query = query.ilike('rate_limiter', `%${type}%`);
    }

    if (exceeded !== 'all') {
      query = query.eq('exceeded', exceeded === 'true');
    }

    // Execute the query
    const { data: events, error } = await query
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Database query error:', error);
      return NextResponse.json({ error: 'Failed to retrieve rate limit events' }, { status: 500 });
    }

    // Transform data to match the frontend interface
    const formattedEvents = events.map((event: any) => ({
      id: event.id,
      timestamp: event.created_at,
      ip: event.ip,
      userId: event.user_id,
      path: event.path,
      rateLimiter: event.rate_limiter,
      exceeded: event.exceeded,
      remaining: event.remaining,
      resetTime: event.reset_time,
    }));

    return NextResponse.json({ events: formattedEvents });
  } catch (error) {
    console.error('Error fetching rate limit events:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch rate limit events' },
      { status: 500 }
    );
  }
}
