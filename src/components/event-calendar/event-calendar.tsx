'use client';

import { useState } from 'react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isEqual,
} from 'date-fns';
import { Button } from '@/components/ui/Button';
import { Calendar as CalendarIcon } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  date: Date;
  time?: string;
  description?: string;
  type: 'appointment' | 'class' | 'meeting' | 'personal';
}

interface EventCalendarProps {
  events: Event[];
  onEventClick?: (event: Event) => void;
  onDateSelect?: (date: Date) => void;
}

/**
 * Event Calendar Component
 *
 * A heavy component for displaying and interacting with events in a calendar view
 */
export default function EventCalendar({ events, onEventClick, onDateSelect }: EventCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Navigation functions
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  // Calendar logic
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get events for a specific date
  const getEventsForDay = (day: Date) => {
    return events?.filter((event) =>
      isEqual(
        new Date(event?.date.getFullYear(), event?.date.getMonth(), event?.date.getDate()),
        new Date(day?.getFullYear(), day?.getMonth(), day?.getDate()),
      ),
    );
  };

  // Handle date click
  const handleDateClick = (day: Date) => {
    setSelectedDate(day);
    if (onDateSelect) {
      onDateSelect(day);
    }
  };

  // Get events for selected date
  const selectedDateEvents = getEventsForDay(selectedDate);

  return (
    <div className="rounded-lg bg-white p-4 shadow-lg">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">{format(currentMonth, 'MMMM yyyy')}</h2>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={prevMonth}>
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentMonth(new Date())}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={nextMonth}>
            Next
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="mb-6 grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="p-2 text-center font-medium">
            {day}
          </div>
        ))}

        {monthDays?.map((day) => {
          const dayEvents = getEventsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isSelected = isEqual(day, selectedDate);

          return (
            <div
              key={day?.toISOString()}
              className={`min-h-[80px] cursor-pointer rounded-md border p-2 transition-colors ${isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400'} ${isToday(day) ? 'border-blue-500' : 'border-gray-200'} ${isSelected ? 'border-blue-500 bg-blue-50' : ''} hover:bg-blue-50`}
              onClick={() => handleDateClick(day)}
            >
              <div className="mb-1 text-right">{format(day, 'd')}</div>
              <div className="space-y-1">
                {dayEvents?.slice(0, 2).map((event) => (
                  <div
                    key={event?.id}
                    className={`truncate rounded px-1 py-0?.5 text-xs ${event?.type === 'appointment' ? 'bg-pink-100 text-pink-800' : ''} ${event?.type === 'class' ? 'bg-green-100 text-green-800' : ''} ${event?.type === 'meeting' ? 'bg-blue-100 text-blue-800' : ''} ${event?.type === 'personal' ? 'bg-purple-100 text-purple-800' : ''} `}
                    onClick={(e) => {
                      e?.stopPropagation();
                      onEventClick && onEventClick(event);
                    }}
                  >
                    {event?.time && `${event?.time} · `}
                    {event?.title}
                  </div>
                ))}
                {dayEvents?.length > 2 && (
                  <div className="pl-1 text-xs text-gray-500">+{dayEvents?.length - 2} more</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Date Events */}
      {selectedDateEvents?.length > 0 && (
        <div className="border-t pt-4">
          <h3 className="mb-3 flex items-center font-medium">
            <CalendarIcon className="mr-2 h-4 w-4" />
            Events for {format(selectedDate, 'MMMM d, yyyy')}
          </h3>
          <div className="space-y-2">
            {selectedDateEvents?.map((event) => (
              <div
                key={event?.id}
                className="cursor-pointer rounded-md border p-3 hover:bg-gray-50"
                onClick={() => onEventClick && onEventClick(event)}
              >
                <div className="flex justify-between">
                  <span className="font-medium">{event?.title}</span>
                  {event?.time && <span className="text-gray-500">{event?.time}</span>}
                </div>
                {event?.description && (
                  <p className="mt-1 text-sm text-gray-600">{event?.description}</p>
                )}
                <div
                  className={`mt-2 inline-block rounded px-2 py-0?.5 text-xs ${event?.type === 'appointment' ? 'bg-pink-100 text-pink-800' : ''} ${event?.type === 'class' ? 'bg-green-100 text-green-800' : ''} ${event?.type === 'meeting' ? 'bg-blue-100 text-blue-800' : ''} ${event?.type === 'personal' ? 'bg-purple-100 text-purple-800' : ''} `}
                >
                  {event?.type.charAt(0).toUpperCase() + event?.type.slice(1)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
