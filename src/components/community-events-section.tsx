import { Icons } from '@/components/icons';
import { useState, useEffect } from 'react';
import { Event } from '@/types/events';
import { getUpcomingEvents, registerForEvent, cancelEventRegistration } from '@/lib/api/events';
import { useAuth } from '@/lib/auth';
import { format, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import Link from 'next/link';
import { EventShareCard } from './event-share-card';
interface CommunityEventsSectionProps {
  title?: string;
  limit?: number;
  showCreateButton?: boolean;
  showViewAllButton?: boolean;
  className?: string;
}
export function CommunityEventsSection({
  title = 'Community Events',
  limit = 3,
  showCreateButton = false,
  showViewAllButton = true,
  className = ''
}: CommunityEventsSectionProps) {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sharedEvents, setSharedEvents] = useState<{[key: string]: boolean}>({});
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const upcomingEvents = await getUpcomingEvents(limit);
        setEvents(upcomingEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, [limit]);
  const handleEventShare = async (eventId: string) => {
    if (!user?.id) return;
    try {
      const event = events.find(e => e.id === eventId);
      if (!event) return;
      const postContent = `I'm excited about this event! 🎉\n\n${event.title}\n${event.shortDescription}\n\nJoin me at ${format(parseISO(event.startDate), 'MMM d, yyyy h:mm a')}`;
      // In a real app, this would create a post in the social feed
      console.log('Sharing event:', event.title);
      setSharedEvents(prev => ({ ...prev, [eventId]: true }));
    } catch (err) {
      console.error('Error sharing event:', err);
    }
  };
  const handleEventAttendance = async (eventId: string) => {
    if (!user?.id) return;
    try {
      const isAttending = sharedEvents[eventId];
      if (isAttending) {
        await cancelEventRegistration(eventId, user.id);
      } else {
        await registerForEvent(eventId, user.id, user.user_metadata?.full_name || 'Anonymous', user.user_metadata?.avatar_url);
      }
      setSharedEvents(prev => ({ ...prev, [eventId]: !isAttending }));
      // Refresh events
      const upcomingEvents = await getUpcomingEvents(limit);
      setEvents(upcomingEvents);
    } catch (err) {
      console.error('Error updating event attendance:', err);
    }
  };
  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{title}</h2>
        <div className="flex items-center gap-2">
          {showCreateButton && user && (
            <Link href="/events/create">
              <Button size="sm">Create Event</Button>
            </Link>
          )}
          {showViewAllButton && (
            <Link href="/events" className="text-primary flex items-center hover:underline">
              View all <Icons.CalendarIcon className="ml-1 h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(limit).fill(0).map((_, idx) => (
            <Card key={idx} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-muted rounded w-1/2 mb-4"></div>
                <div className="h-2 bg-muted rounded w-full mb-2"></div>
                <div className="h-2 bg-muted rounded w-2/3"></div>
              </CardContent>
              <CardFooter>
                <div className="h-8 bg-muted rounded w-24"></div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(event => (
            <EventShareCard
              key={event.id}
              event={event}
              onShare={() => handleEventShare(event.id)}
              onAttend={() => handleEventAttendance(event.id)}
              isAttending={sharedEvents[event.id]}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Icons.CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center mb-4">No upcoming community events.</p>
            {user && (
              <Link href="/events/create">
                <Button>
                  Create an Event
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 