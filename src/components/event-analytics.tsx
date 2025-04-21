import { Icons } from '@/components/icons';
import { Event } from '@/types/events';
import { format, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
interface EventAnalyticsProps {
  event: Event;
}
export function EventAnalytics({ event }: EventAnalyticsProps) {
  const startDate = parseISO(event.startDate);
  const isVirtual = event.location.virtual;
  const capacityPercentage = (event.participantsCount / event.capacity) * 100;
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Icons.ChartBarIcon className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Event Analytics</h3>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Attendance */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <Icons.UserGroupIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Attendance</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {event.participantsCount} / {event.capacity}
            </span>
          </div>
          <Progress value={capacityPercentage} className="h-2" />
        </div>
        {/* Event Details */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Icons.ClockIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{format(startDate, 'EEEE, MMMM d, yyyy')}</span>
          </div>
          {!isVirtual && event.location.address && (
            <div className="flex items-center gap-2">
              <Icons.MapPinIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{event.location.address}</span>
            </div>
          )}
          {isVirtual && event.location.meetingUrl && (
            <div className="flex items-center gap-2">
              <Icons.VideoCameraIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Virtual Event</span>
            </div>
          )}
        </div>
        {/* Event Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Registration Rate</p>
            <p className="text-lg font-semibold">
              {Math.round((event.participantsCount / event.capacity) * 100)}%
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Time Until Event</p>
            <p className="text-lg font-semibold">{format(startDate, 'MMM d')}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
