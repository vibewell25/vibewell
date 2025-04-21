'use client';

import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout';
import { EventsAnalyticsDashboard } from '@/components/analytics/events-analytics-dashboard';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Icons } from '@/components/icons';
import { getEvents } from '@/lib/api/events';
import { Event } from '@/types/events';

export default function EventsAnalyticsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEvents() {
      try {
        setLoading(true);
        const fetchedEvents = await getEvents();
        setEvents(fetchedEvents);
      } catch (error) {
        console.error('Error loading events:', error);
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, []);

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Events Analytics</h1>
          <Button variant="outline" onClick={() => router.push('/admin/analytics')}>
            <Icons.arrowLeft className="mr-2 h-4 w-4" />
            Back to Analytics
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-96">
            <Icons.spinner className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading...</span>
          </div>
        ) : (
          <EventsAnalyticsDashboard initialEvents={events} />
        )}
      </div>
    </Layout>
  );
} 