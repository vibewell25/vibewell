'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/components/ui/use-toast';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { Fallback } from '@/components/ui/fallback';
import { useAuth } from '@/contexts/clerk-auth-context';

// Available time slots for booking
const TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM'
];

// Available services for booking
const SERVICES = [
  { id: 'service1', name: 'Wellness Consultation', duration: 30, price: 50 },
  { id: 'service2', name: 'Therapy Session', duration: 60, price: 100 },
  { id: 'service3', name: 'Health Assessment', duration: 45, price: 75 },
  { id: 'service4', name: 'Nutrition Coaching', duration: 60, price: 90 },
  { id: 'service5', name: 'Fitness Evaluation', duration: 45, price: 80 }
];

interface BookingFormProps {
  providerId: string;
  providerName: string;
  onSuccess?: () => void;
  className?: string;
}

export function BookingForm({ 
  providerId, 
  providerName, 
  onSuccess,
  className = '' 
}: BookingFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [timeSlot, setTimeSlot] = useState<string>('');
  const [serviceId, setServiceId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [contactPreference, setContactPreference] = useState<string>('email');
  const [agreeToTerms, setAgreeToTerms] = useState<boolean>(false);
  const [sendReminders, setSendReminders] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>(TIME_SLOTS);

  // Simulate fetching available time slots for selected date
  useEffect(() => {
    if (!date) return;

    setIsLoading(true);
    
    // Simulating API call to fetch available time slots
    setTimeout(() => {
      // Randomly remove some time slots to simulate availability
      const unavailableCount = Math.floor(Math.random() * 8);
      const unavailableIndices = new Set();
      
      while (unavailableIndices.size < unavailableCount) {
        unavailableIndices.add(Math.floor(Math.random() * TIME_SLOTS.length));
      }
      
      const available = TIME_SLOTS.filter((_, index) => !unavailableIndices.has(index));
      setAvailableTimeSlots(available);
      setIsLoading(false);
    }, 500);
  }, [date]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !timeSlot || !serviceId) {
      toast({
        title: 'Missing information',
        description: 'Please select a date, time slot, and service',
        variant: 'destructive',
      });
      return;
    }
    
    if (!agreeToTerms) {
      toast({
        title: 'Terms and conditions',
        description: 'Please agree to the terms and conditions',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Format data for API request
      const selectedService = SERVICES.find(s => s.id === serviceId);
      const bookingData = {
        providerId,
        clientId: user?.id,
        serviceId,
        serviceName: selectedService?.name,
        date: format(date, 'yyyy-MM-dd'),
        timeSlot,
        notes,
        contactPreference,
        sendReminders,
        price: selectedService?.price,
        duration: selectedService?.duration,
      };
      
      // API call to create booking
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create booking');
      }
      
      const result = await response.json();
      
      toast({
        title: 'Booking confirmed',
        description: `Your appointment with ${providerName} is scheduled for ${format(date, 'EEEE, MMMM d')} at ${timeSlot}`,
      });
      
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(`/bookings?id=${result.id}`);
      }
    } catch (error) {
      console.error('Booking error:', error);
      toast({
        title: 'Booking failed',
        description: 'There was an error creating your booking. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ErrorBoundary>
      <div className={`p-6 bg-white rounded-lg shadow-md ${className}`}>
        <h2 className="text-xl font-bold mb-6">Book an Appointment with {providerName}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date Selection */}
          <div>
            <Label htmlFor="date" className="block mb-2">Select Date</Label>
            <div className="border rounded-md p-4">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(date) => {
                  // Disable dates in the past and weekends
                  const now = new Date();
                  now.setHours(0, 0, 0, 0);
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                  return date < now || isWeekend;
                }}
                className="rounded-md border"
              />
            </div>
          </div>
          
          {/* Time Slot Selection */}
          <div>
            <Label htmlFor="timeSlot" className="block mb-2">Select Time</Label>
            {date ? (
              isLoading ? (
                <Fallback className="h-20" message="Loading available time slots..." />
              ) : (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                  {availableTimeSlots.length > 0 ? (
                    availableTimeSlots.map((slot) => (
                      <Button
                        key={slot}
                        type="button"
                        variant={timeSlot === slot ? 'default' : 'outline'}
                        onClick={() => setTimeSlot(slot)}
                        className="justify-center"
                      >
                        {slot}
                      </Button>
                    ))
                  ) : (
                    <p className="col-span-full text-center py-3 text-red-500">
                      No available time slots for this date
                    </p>
                  )}
                </div>
              )
            ) : (
              <p className="text-muted-foreground italic py-3">
                Please select a date to see available time slots
              </p>
            )}
          </div>
          
          {/* Service Selection */}
          <div>
            <Label htmlFor="service" className="block mb-2">Select Service</Label>
            <Select value={serviceId} onValueChange={setServiceId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a service" />
              </SelectTrigger>
              <SelectContent>
                {SERVICES.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.name} - ${service.price} ({service.duration} min)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Notes */}
          <div>
            <Label htmlFor="notes" className="block mb-2">Additional Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any special requirements or information for your provider"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
          
          {/* Contact Preference */}
          <div>
            <Label className="block mb-2">Preferred Contact Method</Label>
            <RadioGroup 
              value={contactPreference} 
              onValueChange={setContactPreference}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="email" id="email" />
                <Label htmlFor="email">Email</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="phone" id="phone" />
                <Label htmlFor="phone">Phone</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="text" id="text" />
                <Label htmlFor="text">Text Message</Label>
              </div>
            </RadioGroup>
          </div>
          
          {/* Reminders */}
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="reminders" 
              checked={sendReminders}
              onCheckedChange={(checked) => setSendReminders(checked as boolean)}
            />
            <Label htmlFor="reminders">Send me appointment reminders</Label>
          </div>
          
          {/* Terms and Conditions */}
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="terms" 
              checked={agreeToTerms}
              onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
              required
            />
            <Label htmlFor="terms" className="text-sm">
              I agree to the <a href="/terms" className="text-blue-600 hover:underline">terms and conditions</a>
              , including the cancellation policy
            </Label>
          </div>
          
          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || !date || !timeSlot || !serviceId || !agreeToTerms}
          >
            {isLoading ? 'Processing...' : 'Confirm Booking'}
          </Button>
        </form>
      </div>
    </ErrorBoundary>
  );
} 