import { Icons } from '@/components/icons';
import { Event } from '@/types/events';
import { format, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
interface EventShareCardProps {
  event: Event;
  onShare?: () => void;
  onAttend?: () => void;
  isAttending?: boolean;
}
export function EventShareCard({ event, onShare, onAttend, isAttending }: EventShareCardProps) {
  const startDate = parseISO(event.startDate);
  const isVirtual = event.location.virtual;
  return (
    <Card className="w-full">
      <CardHeader className="p-0">
        {event.imageUrl ? (
          <div className="relative h-48 w-full">
            <Image src={event.imageUrl} alt={event.title} fill className="object-cover" />
          </div>
        ) : (
          <div className="h-48 bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center text-white">
            <Icons.CalendarIcon className="h-12 w-12" />
          </div>
        )}
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex gap-2 mb-2">
          <Badge variant="secondary">{event.category}</Badge>
          {isVirtual && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              Virtual
            </Badge>
          )}
        </div>
        <h3 className="text-lg font-semibold mb-2">{event.title}</h3>
        <p className="text-gray-600 text-sm mb-4">{event.shortDescription}</p>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Icons.CalendarIcon className="h-4 w-4" />
            <span>{format(startDate, 'MMM d, yyyy h:mm a')}</span>
          </div>
          {!isVirtual && event.location.address && (
            <div className="flex items-center gap-2">
              <Icons.MapPinIcon className="h-4 w-4" />
              <span>{event.location.address}</span>
            </div>
          )}
          {isVirtual && event.location.meetingUrl && (
            <div className="flex items-center gap-2">
              <Icons.VideoCameraIcon className="h-4 w-4" />
              <span>Virtual Event</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Icons.UsersIcon className="h-4 w-4" />
            <span>{event.participantsCount} attending</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button variant="outline" className="flex-1" onClick={onShare}>
          Share
        </Button>
        <Button
          variant={isAttending ? 'secondary' : 'default'}
          className="flex-1"
          onClick={onAttend}
        >
          {isAttending ? 'Attending' : 'Attend'}
        </Button>
      </CardFooter>
    </Card>
  );
}
