import { Icons } from '@/components/icons';
import { useState, useEffect } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  parseISO,
  differenceInCalendarDays,
  isAfter,
} from 'date-fns';
import Link from 'next/link';
import { Event } from '@/types/events';
import { Badge } from '@/components/ui/badge';
interface EventsCalendarProps {
  events: Event[];
  onDateSelect?: (date: Date) => void;
  className?: string;
}
export function EventsCalendar({ events, onDateSelect, className = '' }: EventsCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [calendarDays, setCalendarDays] = useState<Date[]>([]);
  const [displayEvents, setDisplayEvents] = useState<{ [dateString: string]: Event[] }>({});
  // Generate calendar days and map events to dates
  useEffect(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    // Map events to their dates for quick lookup
    const eventsByDate: { [dateString: string]: Event[] } = {};
    events.forEach((event) => {
      const eventDate = parseISO(event.startDate);
      const dateKey = format(eventDate, 'yyyy-MM-dd');
      if (!eventsByDate[dateKey]) {
        eventsByDate[dateKey] = [];
      }
      eventsByDate[dateKey].push(event);
    });
    setCalendarDays(daysInMonth);
    setDisplayEvents(eventsByDate);
  }, [currentDate, events]);
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    if (onDateSelect) {
      onDateSelect(date);
    }
  };
  const goToPreviousMonth = () => {
    setCurrentDate((prevDate) => subMonths(prevDate, 1));
    setSelectedDate(null);
  };
  const goToNextMonth = () => {
    setCurrentDate((prevDate) => addMonths(prevDate, 1));
    setSelectedDate(null);
  };
  // Get events for the selected date
  const getEventsForDate = (date: Date): Event[] => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return displayEvents[dateKey] || [];
  };
  // Check if a date has events
  const hasEvents = (date: Date): boolean => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return !!displayEvents[dateKey]?.length;
  };
  // Check if date is today
  const isToday = (date: Date): boolean => {
    return isSameDay(date, new Date());
  };
  // Check if date is in the past
  const isPastDate = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };
  // Get selected date events
  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];
  return (
    <div className={`overflow-hidden rounded-lg border ${className}`}>
      {/* Calendar Header */}
      <div className="border-b bg-white p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{format(currentDate, 'MMMM yyyy')}</h2>
          <div className="flex space-x-2">
            <button
              onClick={goToPreviousMonth}
              className="rounded-md p-1 hover:bg-gray-100"
              aria-label="Previous month"
            >
              <Icons.ChevronLeftIcon className="h-5 w-5" />
            </button>
            <button
              onClick={goToNextMonth}
              className="rounded-md p-1 hover:bg-gray-100"
              aria-label="Next month"
            >
              <Icons.ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      {/* Calendar Grid */}
      <div className="bg-white">
        {/* Day Names */}
        <div className="grid grid-cols-7 border-b text-center text-xs uppercase tracking-wide text-gray-500">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="py-2">
              {day}
            </div>
          ))}
        </div>
        {/* Calendar Days */}
        <div className="grid grid-cols-7 border-b">
          {calendarDays.map((day, i) => {
            const dateHasEvents = hasEvents(day);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isTodayDate = isToday(day);
            const isPast = isPastDate(day);
            return (
              <div
                key={i}
                className={`relative min-h-[100px] border-b border-r p-2 last:border-r-0 ${!isSameMonth(day, currentDate) ? 'bg-gray-50 text-gray-400' : ''} ${isSelected ? 'bg-blue-50' : ''} ${isTodayDate ? 'bg-yellow-50' : ''} `}
                onClick={() => !isPast && handleDateClick(day)}
              >
                <div
                  className={`mb-1 flex justify-between text-sm font-medium ${isTodayDate ? 'text-blue-600' : ''} ${isPast ? 'text-gray-400' : ''} `}
                >
                  <span>{format(day, 'd')}</span>
                  {dateHasEvents && (
                    <span className="rounded-full bg-green-100 px-1.5 text-xs font-medium text-green-800">
                      {getEventsForDate(day).length}
                    </span>
                  )}
                </div>
                {/* Event indicators */}
                {dateHasEvents &&
                  getEventsForDate(day)
                    .slice(0, 2)
                    .map((event, idx) => (
                      <div
                        key={event.id}
                        className={`truncate rounded px-1.5 py-0.5 text-xs ${isPast ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-800'} `}
                        title={event.title}
                      >
                        {event.title}
                      </div>
                    ))}
                {getEventsForDate(day).length > 2 && (
                  <div className="mt-1 text-xs text-gray-500">
                    +{getEventsForDate(day).length - 2} more
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {/* Selected Date Events */}
      {selectedDate && (
        <div className="border-t bg-white p-4">
          <h3 className="mb-3 font-medium">Events on {format(selectedDate, 'MMMM d, yyyy')}</h3>
          {selectedDateEvents.length === 0 ? (
            <p className="text-sm text-gray-500">No events scheduled for this date.</p>
          ) : (
            <div className="space-y-3">
              {selectedDateEvents.map((event) => {
                const startDate = parseISO(event.startDate);
                const endDate = parseISO(event.endDate);
                const durationDays = differenceInCalendarDays(endDate, startDate);
                const isFuture = isAfter(startDate, new Date());
                return (
                  <Link
                    href={`/events/${event.id}`}
                    key={event.id}
                    className="block rounded-md border p-3 transition-colors hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium">{event.title}</h4>
                      <Badge
                        className={
                          isFuture ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'
                        }
                      >
                        {event.category}
                      </Badge>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                      {event.shortDescription || event.description.substring(0, 120)}
                    </p>
                    <div className="mt-2 flex justify-between text-xs text-gray-500">
                      <span>
                        {format(startDate, 'h:mm a')} - {format(endDate, 'h:mm a')}
                        {durationDays > 0 && ` (${durationDays + 1} days)`}
                      </span>
                      <span>
                        {event.participantsCount}{' '}
                        {event.participantsCount === 1 ? 'participant' : 'participants'}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
