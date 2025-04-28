import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Calendar } from '@/components/ui/calendar';
import { useState } from 'react';
import { format } from 'date-fns';
import { TimeSlotList } from './time-slot-list';
import { AvailabilityService } from '@/lib/availability-service';

interface AvailabilityCalendarProps {
  providerId: string;
}

export function AvailabilityCalendar({ providerId }: AvailabilityCalendarProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [timeSlots, setTimeSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleDateSelect = async (selectedDate: Date | undefined) => {
    if (!selectedDate) return;

    setDate(selectedDate);
    setLoading(true);

    try {
      const availabilityService = AvailabilityService.getInstance();
      const slots = await availabilityService.getAvailability(
        providerId,
        format(selectedDate, 'yyyy-MM-dd'),
      );
      setTimeSlots(slots);
    } catch (error) {
      console.error('Error fetching availability:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Select Date</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            className="rounded-md border"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Available Time Slots</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
            </div>
          ) : date ? (
            <TimeSlotList
              providerId={providerId}
              date={format(date, 'yyyy-MM-dd')}
              timeSlots={timeSlots}
            />
          ) : (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              Please select a date
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
