'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BookingService } from '@/services/booking-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const bookingSchema = z.object({
  serviceId: z.string().min(1, 'Please select a service'),
  date: z.date({
    required_error: 'Please select a date',
  }),
  time: z.string().min(1, 'Please select a time'),
  notes: z.string().optional(),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

interface BookingFormProps {
  providerId: string;
  services: Array<{
    id: string;
    name: string;
    duration: number;
    price: number;
  }>;
  onSuccess?: () => void;
}

export function BookingForm({ providerId, services, onSuccess }: BookingFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const bookingService = new BookingService();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      notes: '',
    },
  });

  const selectedDate = watch('date');

  const onSubmit = async (data: BookingFormValues) => {
    setIsLoading(true);
    try {
      const startTime = new Date(data.date);
      const [hours, minutes] = data.time.split(':').map(Number);
      startTime.setHours(hours, minutes);

      const service = services.find((s) => s.id === data.serviceId);
      if (!service) throw new Error('Service not found');

      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + service.duration);

      const isAvailable = await bookingService.checkAvailability(
        providerId,
        startTime.toISOString(),
        endTime.toISOString()
      );

      if (!isAvailable) {
        toast({
          title: 'Error',
          description: 'This time slot is no longer available. Please select another time.',
          variant: 'destructive',
        });
        return;
      }

      await bookingService.createBooking({
        service_id: data.serviceId,
        provider_id: providerId,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        status: 'pending',
        notes: data.notes,
      });

      toast({
        title: 'Success',
        description: 'Booking created successfully',
      });

      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/bookings');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create booking. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="service">Service</Label>
        <select
          id="service"
          className="w-full rounded-md border border-input bg-background px-3 py-2"
          {...register('serviceId')}
          onChange={(e) => {
            setSelectedService(e.target.value);
            register('serviceId').onChange(e);
          }}
        >
          <option value="">Select a service</option>
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name} - ${service.price} ({service.duration} min)
            </option>
          ))}
        </select>
        {errors.serviceId && (
          <p className="text-sm text-red-500">{errors.serviceId.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-full justify-start text-left font-normal',
                !selectedDate && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => setValue('date', date!)}
              disabled={(date) => date < new Date()}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {errors.date && (
          <p className="text-sm text-red-500">{errors.date.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="time">Time</Label>
        <Input
          id="time"
          type="time"
          {...register('time')}
          disabled={!selectedDate}
        />
        {errors.time && (
          <p className="text-sm text-red-500">{errors.time.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          placeholder="Any special requests or notes for the provider"
          {...register('notes')}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Booking...' : 'Book Now'}
      </Button>
    </form>
  );
} 