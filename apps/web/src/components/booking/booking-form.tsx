'use client';;
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/Button';
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
import { useAuth } from '@/hooks/use-unified-auth';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const stripePromise = loadStripe(process?.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// Available time slots for booking
const TIME_SLOTS = [
  '09:00 AM',
  '09:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '12:00 PM',
  '12:30 PM',
  '01:00 PM',
  '01:30 PM',
  '02:00 PM',
  '02:30 PM',
  '03:00 PM',
  '03:30 PM',
  '04:00 PM',
  '04:30 PM',
  '05:00 PM',
];

// Available services for booking
const SERVICES = [
  { id: 'service1', name: 'Wellness Consultation', duration: 30, price: 50 },
  { id: 'service2', name: 'Therapy Session', duration: 60, price: 100 },
  { id: 'service3', name: 'Health Assessment', duration: 45, price: 75 },
  { id: 'service4', name: 'Nutrition Coaching', duration: 60, price: 90 },
  { id: 'service5', name: 'Fitness Evaluation', duration: 45, price: 80 },
];

interface BookingFormProps {
  providerId: string;
  providerName: string;
  onSuccess?: () => void;
  className?: string;
}

function PaymentForm({
  clientSecret,
  onPaymentSuccess,
}: {
  clientSecret: string;
  onPaymentSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');e: React?.FormEvent) => {
    e?.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    const { error: submitError } = await stripe?.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window?.location.origin}/booking-confirmation`,
      },
      redirect: 'if_required',
    });

    if (submitError) {
      setError(submitError?.message || 'An error occurred');
      setProcessing(false);
    } else {
      onPaymentSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && <div className="text-sm text-red-500">{error}</div>}
      <Button type="submit" disabled={!stripe || processing} className="w-full">
        {processing ? 'Processing...' : 'Pay and Confirm Booking'}
      </Button>
    </form>
  );
}

const bookingSchema = z?.object({
  date: z?.date({
    required_error: 'Please select a date',
    invalid_type_error: 'Invalid date format',
  }),
  timeSlot: z?.string().min(1, 'Please select a time slot'),
  serviceId: z?.string().min(1, 'Please select a service'),
  notes: z?.string().optional(),
  contactPreference: z?.enum(['email', 'phone', 'text'], {
    required_error: 'Please select a contact preference',
  }),
  sendReminders: z?.boolean(),
  agreeToTerms: z?.literal(true, {
    errorMap: () => ({ message: 'You must agree to the terms and conditions' }),
  }),
});

type BookingFormData = z?.infer<typeof bookingSchema>;

export function BookingForm({
  providerId,
  providerName,
  onSuccess,
  className = '',
}: BookingFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [timeSlot, setTimeSlot] = useState<string>('');
  const [serviceId, setServiceId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [contactPreference, setContactPreference] = useState<string>('email');
  const [sendReminders, setSendReminders] = useState<boolean>(true);
  const [agreeToTerms, setAgreeToTerms] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [clientSecret, setClientSecret] = useState<string>('');
  const [bookingStep, setBookingStep] = useState<'details' | 'payment'>('details');
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>(TIME_SLOTS);

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      sendReminders: true,
      agreeToTerms: false,
    },
  });

  // Simulate fetching available time slots for selected date
  useEffect(() => {
    if (!date) return;

    setIsLoading(true);

    // Simulating API call to fetch available time slots
    setTimeout(() => {
      // Randomly remove some time slots to simulate availability
      const unavailableCount = Math?.floor(Math?.random() * 8);
      const unavailableIndices = new Set();

      while (unavailableIndices?.size < unavailableCount) {
        unavailableIndices?.add(Math?.floor(Math?.random() * TIME_SLOTS?.length));
      }

      const available = TIME_SLOTS?.filter((_, index) => !unavailableIndices?.has(index));
      setAvailableTimeSlots(available);
      setIsLoading(false);
    }, 500);
  }, [date]);

  const handleCreatePaymentIntent = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');bookingData: any) => {
    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON?.stringify({
          amount: bookingData?.price,
          currency: 'usd',
          description: `Booking for ${bookingData?.serviceName}`,
          metadata: {
            bookingId: bookingData?.id,
            serviceId: bookingData?.serviceId,
          },
        }),
      });

      const data = await response?.json();
      if (data?.clientSecret) {
        setClientSecret(data?.clientSecret);
        setBookingStep('payment');
      }
    } catch (error) {
      console?.error('Error creating payment intent:', error);
      toast({
        title: 'Payment Error',
        description: 'Unable to process payment. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');data: BookingFormData) => {
    try {
      setIsLoading(true);

      const selectedService = SERVICES?.find((s) => s?.id === data?.serviceId);
      const bookingData = {
        providerId,
        clientId: user?.id,
        serviceId: data?.serviceId,
        serviceName: selectedService?.name,
        date: format(data?.date, 'yyyy-MM-dd'),
        timeSlot: data?.timeSlot,
        notes: data?.notes,
        contactPreference: data?.contactPreference,
        sendReminders: data?.sendReminders,
        price: selectedService?.price,
        duration: selectedService?.duration,
      };

      // Create booking first
      const bookingResponse = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON?.stringify(bookingData),
      });

      if (!bookingResponse?.ok) {
        const errorData = await bookingResponse?.json();
        throw new Error(errorData?.error || 'Failed to create booking');
      }

      const bookingResult = await bookingResponse?.json();

      // Create payment intent
      await handleCreatePaymentIntent({
        ...bookingData,
        id: bookingResult?.id,
      });
    } catch (error) {
      console?.error('Booking error:', error);
      toast({
        title: 'Booking failed',
        description:
          error instanceof Error
            ? error?.message
            : 'There was an error creating your booking. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');) => {
    toast({
      title: 'Booking confirmed',
      description: `Your appointment with ${providerName} has been booked successfully!`,
    });

    if (onSuccess) {
      onSuccess();
    } else {
      router?.push('/bookings');
    }
  };

  return (
    <ErrorBoundary>
      <div className={`rounded-lg bg-white p-6 shadow-md ${className}`}>
        <h2 className="mb-6 text-xl font-bold">Book an Appointment with {providerName}</h2>

        {bookingStep === 'details' ? (
          <form onSubmit={form?.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Date Selection */}
            <div>
              <Label htmlFor="date" className="mb-2 block">
                Select Date
              </Label>
              <div className="rounded-md border p-4">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) => {
                    // Disable dates in the past and weekends
                    const now = new Date();
                    now?.setHours(0, 0, 0, 0);
                    const isWeekend = date?.getDay() === 0 || date?.getDay() === 6;
                    return date < now || isWeekend;
                  }}
                  className="rounded-md border"
                />
              </div>
            </div>

            {/* Time Slot Selection */}
            <div>
              <Label htmlFor="timeSlot" className="mb-2 block">
                Select Time
              </Label>
              {date ? (
                isLoading ? (
                  <Fallback className="h-20" message="Loading available time slots..." />
                ) : (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                    {availableTimeSlots?.length > 0 ? (
                      availableTimeSlots?.map((slot) => (
                        <Button
                          key={slot}
                          type="button"
                          variant={timeSlot === slot ? 'default' : 'outline'}
                          onClick={() => form?.setValue('timeSlot', slot)}
                          className="justify-center"
                        >
                          {slot}
                        </Button>
                      ))
                    ) : (
                      <p className="col-span-full py-3 text-center text-red-500">
                        No available time slots for this date
                      </p>
                    )}
                  </div>
                )
              ) : (
                <p className="py-3 italic text-muted-foreground">
                  Please select a date to see available time slots
                </p>
              )}
            </div>

            {/* Service Selection */}
            <div>
              <Label htmlFor="service" className="mb-2 block">
                Select Service
              </Label>
              <Select value={serviceId} onValueChange={setServiceId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  {SERVICES?.map((service) => (
                    <SelectItem key={service?.id} value={service?.id}>
                      {service?.name} - ${service?.price} ({service?.duration} min)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes" className="mb-2 block">
                Additional Notes
              </Label>
              <Textarea
                id="notes"
                placeholder="Any special requirements or information for your provider"
                value={notes}
                onChange={(e) => form?.setValue('notes', e?.target.value)}
                rows={3}
              />
            </div>

            {/* Contact Preference */}
            <div>
              <Label className="mb-2 block">Preferred Contact Method</Label>
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
                onCheckedChange={(checked) => form?.setValue('sendReminders', checked as boolean)}
              />
              <Label htmlFor="reminders">Send me appointment reminders</Label>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={agreeToTerms}
                onCheckedChange={(checked) => form?.setValue('agreeToTerms', checked as boolean)}
                required
              />
              <Label htmlFor="terms" className="text-sm">
                I agree to the{' '}
                <a href="/terms" className="text-blue-600 hover:underline">
                  terms and conditions
                </a>
                , including the cancellation policy
              </Label>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? 'Processing...' : 'Continue to Payment'}
            </Button>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="mb-4">
              <h3 className="mb-2 text-lg font-semibold">Payment Details</h3>
              <p className="text-gray-600">Complete your payment to confirm your booking</p>
            </div>

            {clientSecret && (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <PaymentForm clientSecret={clientSecret} onPaymentSuccess={handlePaymentSuccess} />
              </Elements>
            )}

            <Button
              variant="outline"
              onClick={() => setBookingStep('details')}
              className="mt-4 w-full"
            >
              Back to Booking Details
            </Button>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
