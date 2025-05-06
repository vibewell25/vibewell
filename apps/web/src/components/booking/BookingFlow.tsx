import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Steps } from '@/components/ui/steps';
import { BookingCalendar } from './BookingCalendar';
import { BookingForm } from './booking-form';
import { PaymentForm } from '@/components/payment/PaymentForm';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface BookingFlowProps {
  services: Array<{
    id: string;
    name: string;
    duration: number;
    price: number;
    description?: string;
>;
  practitionerId: string;
  practitionerName: string;
type BookingStep = 'service' | 'datetime' | 'details' | 'payment' | 'confirmation';

export function BookingFlow({ services, practitionerId, practitionerName }: BookingFlowProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<BookingStep>('service');
  const [selectedService, setSelectedService] = useState<(typeof services)[0] | null>(null);
  const [selectedDateTime, setSelectedDateTime] = useState<{ date: Date; time: string } | null>(
    null,
const [bookingDetails, setBookingDetails] = useState<{
    notes?: string;
    contactPreference?: string;
    sendReminders: boolean;
| null>(null);
  const [clientSecret, setClientSecret] = useState<string>('');
  const [bookingId, setBookingId] = useState<string>('');

  const steps = [
    { id: 'service', title: 'Select Service' },
    { id: 'datetime', title: 'Choose Date & Time' },
    { id: 'details', title: 'Enter Details' },
    { id: 'payment', title: 'Payment' },
    { id: 'confirmation', title: 'Confirmation' },
  ];

  const handleServiceSelect = (service: (typeof services)[0]) => {
    setSelectedService(service);
    setCurrentStep('datetime');
const handleDateTimeSelect = (date: Date, time: string) => {
    setSelectedDateTime({ date, time });
    setCurrentStep('details');
const handleDetailsSubmit = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');details: typeof bookingDetails) => {
    setBookingDetails(details);

    try {
      // Create initial booking
      const bookingResponse = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: selectedService!.id,
          practitionerId,
          date: selectedDateTime!.date.toISOString().split('T')[0],
          time: selectedDateTime!.time,
          notes: details.notes,
          duration: selectedService!.duration,
),
if (!bookingResponse.ok) {
        throw new Error('Failed to create booking');
const booking = await bookingResponse.json();
      setBookingId(booking.id);

      // Create payment intent
      const paymentResponse = await fetch('/api/payments/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: selectedService!.price,
          currency: 'usd',
          bookingId: booking.id,
),
if (!paymentResponse.ok) {
        throw new Error('Failed to create payment intent');
const { clientSecret } = await paymentResponse.json();
      setClientSecret(clientSecret);
      setCurrentStep('payment');
catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: 'Error',
        description: 'Failed to create booking. Please try again.',
        variant: 'destructive',
const handlePaymentSuccess = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');paymentIntentId: string) => {
    try {
      // Update booking status
      const response = await fetch(`/api/bookings/${bookingId}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentIntentId }),
if (!response.ok) {
        throw new Error('Failed to confirm booking');
setCurrentStep('confirmation');
catch (error) {
      console.error('Error confirming booking:', error);
      toast({
        title: 'Error',
        description: 'Failed to confirm booking. Please contact support.',
        variant: 'destructive',
const handlePaymentError = (error: any) => {
    console.error('Payment error:', error);
    toast({
      title: 'Payment Failed',
      description: error.message || 'Failed to process payment. Please try again.',
      variant: 'destructive',
return (
    <div className="mx-auto max-w-3xl">
      <Steps
        steps={steps}
        currentStep={steps.findIndex((step) => step.id === currentStep)}
        className="mb-8"
      />

      {currentStep === 'service' && (
        <div className="grid gap-4 md:grid-cols-2">
          {services.map((service) => (
            <Card
              key={service.id}
              className="cursor-pointer p-4 transition-colors hover:bg-muted"
              onClick={() => handleServiceSelect(service)}
            >
              <h3 className="font-semibold">{service.name}</h3>
              <p className="text-sm text-muted-foreground">{service.description}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="font-medium">${service.price}</span>
                <span className="text-sm text-muted-foreground">{service.duration} min</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {currentStep === 'datetime' && selectedService && (
        <BookingCalendar
          practitionerId={practitionerId}
          serviceId={selectedService.id}
          serviceDuration={selectedService.duration}
          onSelectSlot={handleDateTimeSelect}
        />
      )}

      {currentStep === 'details' && (
        <BookingForm
          providerId={practitionerId}
          providerName={practitionerName}
          onSuccess={handleDetailsSubmit}
        />
      )}

      {currentStep === 'payment' && clientSecret && (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <PaymentForm
            amount={selectedService!.price}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentError={handlePaymentError}
          />
        </Elements>
      )}

      {currentStep === 'confirmation' && (
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-semibold">Booking Confirmed!</h2>
          <p className="mb-6">
            Your appointment has been scheduled for {selectedDateTime.date.toLocaleDateString()} at{' '}
            {selectedDateTime.time}
          </p>
          <Button onClick={() => router.push('/bookings')}>View My Bookings</Button>
        </div>
      )}
    </div>
