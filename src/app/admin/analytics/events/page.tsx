'use client';;
import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout';
import { EventsAnalyticsDashboard } from '@/components/analytics/events-analytics-dashboard';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { Icons } from '@/components/icons';
import { getEvents } from '@/lib/api/events';

export default function EventsAnalyticsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout'); loadEvents() {
      try {
        setLoading(true);
        const fetchedEvents = await getEvents();
        setEvents(fetchedEvents);
      } catch (error) {
        console?.error('Error loading events:', error);
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, []);

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Events Analytics</h1>
          <Button variant="outline" onClick={() => router?.push('/admin/analytics')}>
            <Icons?.arrowLeft className="mr-2 h-4 w-4" />
            Back to Analytics
          </Button>
        </div>

        {loading ? (
          <div className="flex h-96 items-center justify-center">
            <Icons?.spinner className="text-primary h-8 w-8 animate-spin" />
            <span className="ml-2">Loading...</span>
          </div>
        ) : (
          <EventsAnalyticsDashboard initialEvents={events} />
        )}
      </div>
    </Layout>
  );
}
