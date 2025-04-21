import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useSession } from 'next-auth/react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface BookingFormData {
  serviceId: string;
  providerId: string;
  date: string;
  time: string;
  phone: string;
  specialRequests: string;
}

export const BookingPage: React.FC = () => {
  const { data: session } = useSession();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<BookingFormData>({
    serviceId: '',
    providerId: '',
    date: '',
    time: '',
    phone: '',
    specialRequests: '',
  });

  const {
    data: servicesData,
    error: servicesError,
    refetch: refetchServices,
  } = useQuery(['services'], () => fetch('/api/services').then(res => res.json()));

  const { data: providersData, error: providersError } = useQuery(
    ['providers'],
    () => fetch('/api/providers').then(res => res.json()),
    { enabled: !!formData.serviceId }
  );

  const handleServiceSelect = (serviceId: string) => {
    setFormData(prev => ({ ...prev, serviceId }));
  };

  const handleProviderSelect = (providerId: string) => {
    setFormData(prev => ({ ...prev, providerId }));
  };

  const handleDateSelect = (date: string) => {
    setFormData(prev => ({ ...prev, date }));
  };

  const handleTimeSelect = (time: string) => {
    setFormData(prev => ({ ...prev, time }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    // Validate current step
    if (step === 1 && !formData.serviceId) {
      alert('Please select a service');
      return;
    }
    if (step === 2 && !formData.providerId) {
      alert('Please select a provider');
      return;
    }
    if (step === 3 && (!formData.date || !formData.time)) {
      alert('Please select date and time');
      return;
    }
    if (step === 4 && !formData.phone) {
      alert('Please enter your phone number');
      return;
    }

    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleConfirm = async () => {
    try {
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe failed to load');

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const { sessionId } = await response.json();
      const result = await stripe.redirectToCheckout({ sessionId });

      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to process payment. Please try again.');
    }
  };

  if (servicesError) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl text-red-600">Error loading services</h2>
        <Button onClick={() => refetchServices()}>Retry</Button>
      </div>
    );
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Select a Service</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {servicesData?.services.map((service: any) => (
                <Card
                  key={service.id}
                  data-testid={`service-card-${service.id}`}
                  clickable
                  className={formData.serviceId === service.id ? 'selected' : ''}
                  onClick={() => handleServiceSelect(service.id)}
                >
                  <Card.Image src={service.image} alt={service.name} />
                  <Card.Body>
                    <h3 className="text-xl font-semibold">{service.name}</h3>
                    <p className="text-gray-600">{service.description}</p>
                    <p className="text-lg font-bold mt-2">${service.price}</p>
                  </Card.Body>
                </Card>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Select a Provider</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {providersData?.providers.map((provider: any) => (
                <Card
                  key={provider.id}
                  data-testid={`provider-card-${provider.id}`}
                  clickable
                  className={formData.providerId === provider.id ? 'selected' : ''}
                  onClick={() => handleProviderSelect(provider.id)}
                >
                  <Card.Image src={provider.image} alt={provider.name} />
                  <Card.Body>
                    <h3 className="text-xl font-semibold">{provider.name}</h3>
                    <p className="text-gray-600">{provider.specialization}</p>
                    <div className="flex items-center mt-2">
                      <span className="text-yellow-500">★</span>
                      <span className="ml-1">{provider.rating}</span>
                      <span className="ml-2 text-gray-500">({provider.reviews} reviews)</span>
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Select Date & Time</h2>
            <div className="grid grid-cols-7 gap-2 mb-6">
              {/* Calendar cells */}
              <div
                data-testid="date-cell-2023-12-25"
                className={`p-4 border rounded cursor-pointer ${
                  formData.date === '2023-12-25' ? 'selected bg-primary-100' : ''
                }`}
                onClick={() => handleDateSelect('2023-12-25')}
              >
                25
              </div>
              {/* More date cells... */}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {/* Time slots */}
              <div
                data-testid="time-slot-10-00"
                className={`p-4 border rounded cursor-pointer ${
                  formData.time === '10:00' ? 'selected bg-primary-100' : ''
                }`}
                onClick={() => handleTimeSelect('10:00')}
              >
                10:00 AM
              </div>
              {/* More time slots... */}
            </div>
          </div>
        );

      case 4:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Contact Details</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="specialRequests"
                  className="block text-sm font-medium text-gray-700"
                >
                  Special Requests
                </label>
                <textarea
                  id="specialRequests"
                  name="specialRequests"
                  value={formData.specialRequests}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Review Booking</h2>
            <Card>
              <Card.Body>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold">Service</h3>
                    <p>
                      {servicesData?.services.find((s: any) => s.id === formData.serviceId)?.name}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Provider</h3>
                    <p>
                      {
                        providersData?.providers.find((p: any) => p.id === formData.providerId)
                          ?.name
                      }
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Date & Time</h3>
                    <p>December 25, 2023</p>
                    <p>10:00 AM</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Contact</h3>
                    <p>{session?.user?.email}</p>
                    <p>{formData.phone}</p>
                  </div>
                  {formData.specialRequests && (
                    <div>
                      <h3 className="font-semibold">Special Requests</h3>
                      <p>{formData.specialRequests}</p>
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {renderStep()}
      <div className="mt-6 flex justify-between">
        {step > 1 && <Button onClick={handleBack}>Back</Button>}
        {step < 5 ? (
          <Button onClick={handleNext}>Next</Button>
        ) : (
          <Button onClick={handleConfirm}>Confirm & Pay</Button>
        )}
      </div>
    </div>
  );
};
