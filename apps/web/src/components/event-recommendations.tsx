import { Icons } from '@/components/icons';
import { useState, useEffect } from 'react';
import { Event } from '@/types/events';
import { getEvents } from '@/lib/api/events';
import { useAuth } from '@/hooks/useAuth';
import { EventShareCard } from './event-share-card';
import { parseISO } from 'date-fns';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
interface EventRecommendationsProps {
  onShare?: (event: Event) => void;
  onAttend?: (event: Event) => void;
}
export function EventRecommendations({ onShare, onAttend }: EventRecommendationsProps) {
  const { user } = useAuth();
  const [recommendedEvents, setRecommendedEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchRecommendedEvents = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');) => {
      try {
        setLoading(true);
        setError(null);
        // In a real app, this would be an API call to get personalized recommendations
        // For now, we'll simulate it by filtering events based on some criteria
        const allEvents = await getEvents();
        const now = new Date();
        // Filter events that are upcoming and match user interests
        const recommended = allEvents
          .filter((event) => {
            const startDate = parseISO(event?.startDate);
            return startDate > now;
          })
          .sort((a, b) => {
            // Sort by date and then by participants count
            const dateA = parseISO(a?.startDate);
            const dateB = parseISO(b?.startDate);
            if (dateA?.getTime() === dateB?.getTime()) {
              return b?.participantsCount - a?.participantsCount;
            }
            return dateA?.getTime() - dateB?.getTime();
          })
          .slice(0, 3); // Show top 3 recommendations
        setRecommendedEvents(recommended);
      } catch (err) {
        console?.error('Error fetching recommended events:', err);
        setError('Failed to load event recommendations');
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendedEvents();
  }, [user?.id]);
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Icons?.SparklesIcon className="text-primary h-5 w-5" />
            <h3 className="text-lg font-semibold">Recommended Events</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  if (error) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Icons?.SparklesIcon className="text-primary h-5 w-5" />
            <h3 className="text-lg font-semibold">Recommended Events</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-gray-500">{error}</div>
        </CardContent>
      </Card>
    );
  }
  if (recommendedEvents?.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Icons?.SparklesIcon className="text-primary h-5 w-5" />
            <h3 className="text-lg font-semibold">Recommended Events</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-gray-500">
            No event recommendations available at the moment.
          </div>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Icons?.SparklesIcon className="text-primary h-5 w-5" />
          <h3 className="text-lg font-semibold">Recommended Events</h3>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendedEvents?.map((event) => (
            <EventShareCard
              key={event?.id}
              event={event}
              onShare={() => onShare?.(event)}
              onAttend={() => onAttend?.(event)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
