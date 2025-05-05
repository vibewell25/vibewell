import { Button } from '@/components/ui/Button';
import { format } from 'date-fns';
import { Clock } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { AvailabilityService } from '@/lib/availability-service';

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
  serviceId?: string;
interface TimeSlotListProps {
  providerId: string;
  date: string;
  timeSlots: TimeSlot[];
export function TimeSlotList({ providerId, date, timeSlots }: TimeSlotListProps) {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSlotSelect = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');slotId: string) => {
    setSelectedSlot(slotId);
    setLoading(true);

    try {
      const availabilityService = AvailabilityService.getInstance();
      const slot = timeSlots.find((s) => s.id === slotId);

      if (!slot) {
        throw new Error('Selected slot not found');
await availabilityService.bookSlot(providerId, date, slot.time, {
        id: slot.serviceId || '',
        name: 'Service',
        duration: '1 hour',
        price: '$50',
toast.success('Appointment booked successfully!');
catch (error) {
      console.error('Error booking slot:', error);
      toast.error('Failed to book appointment. Please try again.');
finally {
      setLoading(false);
if (timeSlots.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        No available time slots for this date
      </div>
return (
    <div className="grid gap-2">
      {timeSlots.map((slot) => (
        <Button
          key={slot.id}
          variant={selectedSlot === slot.id ? 'default' : 'outline'}
          className="justify-start"
          disabled={!slot.available || loading}
          onClick={() => handleSlotSelect(slot.id)}
        >
          <Clock className="mr-2 h-4 w-4" />
          {format(new Date(`2000-01-01T${slot.time}`), 'h:mm a')}
          {!slot.available && <span className="ml-2 text-xs text-muted-foreground">(Booked)</span>}
        </Button>
      ))}
    </div>
