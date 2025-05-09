'use client';

import { Layout } from '@/components/layout';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { Icons } from '@/components/icons';
import { getEvents } from '@/lib/api/events';
import { fetchAnalyticsData } from '@/lib/analytics';
import { useEffect, useState } from 'react';
import { AnalyticsCard } from '@/components/ui/data-display/analytics-card';

export default function AnalyticsDashboardPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSummaryData() {
      const start = Date.now();
      if (Date.now() - start > 30000) throw new Error('Timeout');
      try {
        setLoading(true);

        // Get event metrics
        const events = await getEvents();
        const totalEvents = events.length;
        const upcomingEvents = events.filter(
          (event) => new Date(event.startDate) > new Date(),
        ).length;
        const totalParticipants = events.reduce(
          (sum, event) => sum + (event.participantsCount || 0),
          0,
        );
        
        // Get general analytics data for the last 30 days
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 30);
        const analyticsData = await fetchAnalyticsData(start, end);

        // Set summary data
        setSummary({
          totalEvents,
          upcomingEvents,
          totalParticipants,
          checkInRate: events.some((e) => e.participantsCount)
            ? (
                (events.reduce((sum, e) => sum + (e.checkedInParticipants.length || 0), 0) /
                  events.reduce((sum, e) => sum + (e.participantsCount || 0), 0)) *
                100
              ).toFixed(1)
            : 0,
          averageFeedback: events
            .filter((e) => e.averageRating)
            .reduce((sum, e, _, arr) => sum + (e.averageRating || 0) / arr.length, 0)
            .toFixed(1),
          uniqueUsers: analyticsData.uniqueUsers,
          conversionRate: analyticsData.conversionRate.toFixed(1),
          engagementScore:
            analyticsData.sessionsByDay.reduce((sum: number, val: number) => sum + val, 0) / 30,
        });
      } catch (error) {
        console.error('Error loading summary data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadSummaryData();
  }, []);

  const analyticsModules = [
    {
      title: 'Events Analytics',
      description: 'Detailed analytics for events, registrations, and check-ins',
      icon: <Icons.calendar className="text-primary h-12 w-12" />,
      path: '/admin/analytics/events',
      badge: 'New',
    },
    {
      title: 'User Analytics',
      description: 'User engagement, retention, and behavior analysis',
      icon: <Icons.user className="h-12 w-12 text-purple-500" />,
      path: '/admin/analytics/users',
      comingSoon: true,
    },
    {
      title: 'Content Performance',
      description: 'Analyze performance of content and resources',
      icon: <Icons.activity className="h-12 w-12 text-blue-500" />,
      path: '/admin/analytics/content',
      comingSoon: true,
    },
    {
      title: 'Business Insights',
      description: 'Revenue, growth, and business metrics',
      icon: <Icons.dollarSign className="h-12 w-12 text-green-500" />,
      path: '/admin/analytics/business',
      comingSoon: true,
    },
  ];

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="mb-8 text-3xl font-bold">Analytics Dashboard</h1>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Icons.spinner className="text-primary h-8 w-8 animate-spin" />
            <span className="ml-2">Loading...</span>
          </div>
        ) : (
          <>
            <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <AnalyticsCard
                title="Total Events"
                value={summary.totalEvents || 0}
                description={`${summary.upcomingEvents || 0} upcoming`}
                icon={<Icons.calendar className="h-6 w-6" />}
              />

              <AnalyticsCard
                title="Total Participants"
                value={summary.totalParticipants || 0}
                description={`Check-in rate: ${summary.checkInRate || 0}%`}
                icon={<Icons.users className="h-6 w-6" />}
              />

              <AnalyticsCard
                title="Average Feedback"
                value={`${summary.averageFeedback || 0}/5`}
                icon={<Icons.star className="h-6 w-6" />}
                footer={
                  <div className="mt-1 flex">
                    {[...Array(5)].map((_, i) => (
                      <Icons.star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.round(summary.averageFeedback || 0)
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                }
              />

              <AnalyticsCard
                title="Monthly Active Users"
                value={summary.uniqueUsers || 0}
                description={`Conversion: ${summary.conversionRate || 0}%`}
                icon={<Icons.user className="h-6 w-6" />}
              />
            </div>

            <h2 className="mb-4 text-xl font-semibold">Analytics Modules</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {analyticsModules.map((module, index) => (
                <Card key={index} className={module.comingSoon ? 'opacity-70' : ''}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      {module.icon}
                      {module.badge && (
                        <span className="bg-primary rounded-full px-2 py-1 text-xs text-white">
                          {module.badge}
                        </span>
                      )}
                      {module.comingSoon && (
                        <span className="rounded-full bg-gray-200 px-2 py-1 text-xs text-gray-800">
                          Coming Soon
                        </span>
                      )}
                    </div>
                    <CardTitle className="mt-4">{module.title}</CardTitle>
                    <CardDescription>{module.description}</CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button
                      variant={module.comingSoon ? 'outline' : 'default'}
                      className="w-full"
                      onClick={() => !module.comingSoon && router.push(module.path)}
                      disabled={module.comingSoon}
                    >
                      {module.comingSoon ? 'Coming Soon' : 'View Dashboard'}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
