import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { AvailabilityService } from '@/lib/availability-service';

interface Service {
  id: string;
  name: string;
  duration: string;
  price: string;
}

interface BookingSystemProps {
  providerId: string;
  services: Service[];
}

export function BookingSystem({ providerId, services }: BookingSystemProps) {
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleBooking = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');) => {
    if (!selectedService || !selectedDate || !selectedTime) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const availabilityService = AvailabilityService.getInstance();
      const service = services.find((s) => s.id === selectedService);

      if (!service) {
        throw new Error('Selected service not found');
      }

      const isAvailable = await availabilityService.checkSlotAvailability(
        providerId,
        format(selectedDate, 'yyyy-MM-dd'),
        selectedTime,
        service,
      );

      if (!isAvailable) {
        toast.error('Selected time slot is no longer available');
        return;
      }

      await availabilityService.bookSlot(
        providerId,
        format(selectedDate, 'yyyy-MM-dd'),
        selectedTime,
        service,
      );

      toast.success('Booking confirmed!');
    } catch (error) {
      console.error('Error processing booking:', error);
      toast.error('Failed to process booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Book a Service</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="service">Select Service</Label>
          <Select value={selectedService} onValueChange={setSelectedService}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a service" />
            </SelectTrigger>
            <SelectContent>
              {services.map((service) => (
                <SelectItem key={service.id} value={service.id}>
                  {service.name} - {service.price} ({service.duration})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Select Date</Label>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="time">Select Time</Label>
          <Input
            id="time"
            type="time"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
          />
        </div>

        <Button className="w-full" onClick={handleBooking} disabled={loading}>
          {loading ? 'Processing...' : 'Book Now'}
        </Button>
      </CardContent>
    </Card>
  );
}
