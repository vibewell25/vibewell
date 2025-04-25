import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { AnalyticsService } from '@/services/analytics-service';

const analyticsService = new AnalyticsService();

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get date range from query parameters
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    if (!from || !to) {
      return NextResponse.json(
        { error: 'Date range is required' },
        { status: 400 }
      );
    }

    const dateRange = {
      from: new Date(from),
      to: new Date(to),
    };

    // Fetch all analytics data in parallel
    const [
      revenue,
      appointments,
      clients,
      services,
      peakHours,
      staffPerformance,
    ] = await Promise.all([
      analyticsService.getRevenueAnalytics(dateRange),
      analyticsService.getAppointmentAnalytics(dateRange),
      analyticsService.getClientAnalytics(dateRange),
      analyticsService.getServiceAnalytics(dateRange),
      analyticsService.getPeakHourAnalytics(dateRange),
      analyticsService.getStaffPerformance(dateRange),
    ]);

    return NextResponse.json({
      revenue,
      appointments,
      clients,
      services,
      peakHours,
      staffPerformance,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 