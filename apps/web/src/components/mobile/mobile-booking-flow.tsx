import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Steps } from '@/components/ui/steps';
import { BookingCalendar } from '../booking/BookingCalendar';
import { BookingForm } from '../booking/booking-form';
import { OfflineService } from '@/services/offline-service';
import { useNetwork } from '@/hooks/useNetwork';

interface MobileBookingFlowProps {
  services: Array<{
    id: string;
    name: string;
    duration: number;
    price: number;
    description?: string;
  }>;
  practitionerId: string;
  practitionerName: string;
}

type BookingStep = 'service' | 'datetime' | 'details' | 'payment' | 'confirmation';

export function MobileBookingFlow({
  services,
  practitionerId,
  practitionerName,
}: MobileBookingFlowProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { isOnline } = useNetwork();
  const offlineService = new OfflineService();

  const [currentStep, setCurrentStep] = useState<BookingStep>('service');
  const [selectedService, setSelectedService] = useState<(typeof services)[0] | null>(null);
  const [selectedDateTime, setSelectedDateTime] = useState<{ date: Date; time: string } | null>(
    null,
  );
  const [bookingDetails, setBookingDetails] = useState<{
    notes?: string;
    contactPreference?: string;
    sendReminders: boolean;
  } | null>(null);

  useEffect(() => {
    // Store mobile device data
    const storeMobileData = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');) => {
      try {
        await offlineService.storeMobileData({
          deviceType: navigator.platform,
          deviceModel: navigator.userAgent,
          osVersion: navigator.appVersion,
          appVersion: '1.0.0', // Replace with actual app version
          locationData: null, // Add location data if available and permitted
        });
      } catch (error) {
        console.error('Failed to store mobile data:', error);
      }
    };

    storeMobileData();
  }, []);

  const handleServiceSelect = (service: (typeof services)[0]) => {
    setSelectedService(service);
    setCurrentStep('datetime');
  };

  const handleDateTimeSelect = (date: Date, time: string) => {
    setSelectedDateTime({ date, time });
    setCurrentStep('details');
  };

  const handleDetailsSubmit = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');details: typeof bookingDetails) => {
    setBookingDetails(details);

    if (!isOnline) {
      // Store booking for later sync
      await offlineService.storeOfflineBooking({
        serviceId: selectedService!.id,
        practitionerId,
        date: selectedDateTime!.date,
        time: selectedDateTime!.time,
        notes: details.notes,
        duration: selectedService!.duration,
        status: 'PENDING',
      });

      toast({
        title: 'Booking Saved Offline',
        description: "Your booking will be synced when you're back online.",
      });

      setCurrentStep('confirmation');
      return;
    }

    // Online booking flow
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: selectedService!.id,
          practitionerId,
          date: selectedDateTime!.date.toISOString().split('T')[0],
          time: selectedDateTime!.time,
          notes: details.notes,
          duration: selectedService!.duration,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create booking');
      }

      setCurrentStep('payment');
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: 'Error',
        description: 'Failed to create booking. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="mx-auto max-w-full px-4">
      <Steps
        steps={[
          { id: 'service', title: 'Service' },
          { id: 'datetime', title: 'Date & Time' },
          { id: 'details', title: 'Details' },
          { id: 'payment', title: 'Payment' },
          { id: 'confirmation', title: 'Done' },
        ]}
        currentStep={['service', 'datetime', 'details', 'payment', 'confirmation'].indexOf(
          currentStep,
        )}
        className="mb-6"
      />

      {currentStep === 'service' && (
        <div className="grid gap-3">
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

      {currentStep === 'confirmation' && (
        <div className="text-center">
          <h2 className="mb-4 text-xl font-semibold">
            {isOnline ? 'Booking Confirmed!' : 'Booking Saved Offline'}
          </h2>
          <p className="mb-6">
            {isOnline
              ? `Your appointment has been scheduled for ${selectedDateTime.date.toLocaleDateString()} at ${selectedDateTime.time}`
              : "Your booking will be synced when you're back online."}
          </p>
          <Button onClick={() => router.push('/bookings')} className="w-full">
            View My Bookings
          </Button>
        </div>
      )}
    </div>
  );
}
