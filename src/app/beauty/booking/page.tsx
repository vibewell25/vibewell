'use client';
import { useState } from 'react';
import { Layout } from '@/components/layout';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Icons } from '@/components/icons';
import { CreditCardIcon, CheckCircleIcon, ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

interface Service {
  id: string;
  name: string;
  category: 'hair' | 'makeup' | 'nails' | 'spa';
  duration: number;
  price: number;
  description: string;
}
interface Provider {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  specialties: string[];
  availableSlots: string[];
}
const services: Service[] = [
  {
    id: 'hair1',
    name: 'Haircut & Styling',
    category: 'hair',
    duration: 60,
    price: 75,
    description: 'Professional haircut and styling service',
  },
  {
    id: 'makeup1',
    name: 'Full Face Makeup',
    category: 'makeup',
    duration: 90,
    price: 120,
    description: 'Complete makeup application for any occasion',
  },
  // Add more services...
];
const providers: Provider[] = [
  {
    id: 'provider1',
    name: 'Sarah Johnson',
    avatar: '/providers/sarah.jpg',
    rating: 4.8,
    specialties: ['Hair Styling', 'Color'],
    availableSlots: ['10:00 AM', '11:30 AM', '2:00 PM', '3:30 PM'],
  },
  // Add more providers...
];
export default function BookingPage() {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    }
  };
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };
  return (
    <Layout>
      <div className="container-app py-12">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold">Book Your Appointment</h1>
          <p className="text-xl text-muted-foreground">
            Choose your service and schedule with our expert providers
          </p>
        </div>
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    s <= step ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}
                >
                  {s}
                </div>
                {s < 4 && (
                  <div className={`mx-2 h-1 w-16 ${s < step ? 'bg-primary' : 'bg-muted'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-sm text-muted-foreground">
            <span>Service</span>
            <span>Provider</span>
            <span>Time</span>
            <span>Payment</span>
          </div>
        </div>
        {/* Booking Steps */}
        <div className="space-y-8">
          {/* Step 1: Service Selection */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Select a Service</CardTitle>
                <CardDescription>Choose from our range of beauty services</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="hair">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="hair">Hair</TabsTrigger>
                    <TabsTrigger value="makeup">Makeup</TabsTrigger>
                    <TabsTrigger value="nails">Nails</TabsTrigger>
                    <TabsTrigger value="spa">Spa</TabsTrigger>
                  </TabsList>
                  <TabsContent value="hair" className="mt-4">
                    <div className="grid gap-4">
                      {services
                        .filter((service) => service.category === 'hair')
                        .map((service) => (
                          <Card
                            key={service.id}
                            className={`cursor-pointer transition-all ${
                              selectedService?.id === service.id ? 'border-primary' : ''
                            }`}
                            onClick={() => setSelectedService(service)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="font-medium">{service.name}</h3>
                                  <p className="text-sm text-muted-foreground">
                                    {service.description}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium">${service.price}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {service.duration} min
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  </TabsContent>
                  {/* Add other category tabs... */}
                </Tabs>
              </CardContent>
            </Card>
          )}
          {/* Step 2: Provider Selection */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Choose Your Provider</CardTitle>
                <CardDescription>Select from our expert beauty professionals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {providers.map((provider) => (
                    <Card
                      key={provider.id}
                      className={`cursor-pointer transition-all ${
                        selectedProvider?.id === provider.id ? 'border-primary' : ''
                      }`}
                      onClick={() => setSelectedProvider(provider)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="h-16 w-16 rounded-full bg-muted" />
                          <div className="flex-1">
                            <h3 className="font-medium">{provider.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {provider.specialties.join(', ')}
                            </p>
                            <div className="mt-1 flex items-center gap-1">
                              <span className="text-yellow-500">★</span>
                              <span>{provider.rating}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          {/* Step 3: Time Selection */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Select Date & Time</CardTitle>
                <CardDescription>Choose a convenient time for your appointment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <Label>Select Date</Label>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="mt-2 rounded-md border"
                    />
                  </div>
                  <div>
                    <Label>Available Times</Label>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {selectedProvider?.availableSlots.map((time) => (
                        <Button
                          key={time}
                          variant={selectedTime === time ? 'default' : 'outline'}
                          onClick={() => setSelectedTime(time)}
                        >
                          {time}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          {/* Step 4: Payment */}
          {step === 4 && (
            <Card>
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
                <CardDescription>Complete your booking with secure payment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <Label>Payment Method</Label>
                    <RadioGroup
                      value={paymentMethod}
                      onValueChange={setPaymentMethod}
                      className="mt-2 grid gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="card" id="card" />
                        <Label htmlFor="card" className="flex items-center gap-2">
                          <Icons.CreditCardIcon className="h-5 w-5" />
                          Credit/Debit Card
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="paypal" id="paypal" />
                        <Label htmlFor="paypal">PayPal</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  {paymentMethod === 'card' && (
                    <div className="space-y-4">
                      <div>
                        <Label>Card Number</Label>
                        <Input placeholder="1234 5678 9012 3456" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Expiry Date</Label>
                          <Input placeholder="MM/YY" />
                        </div>
                        <div>
                          <Label>CVV</Label>
                          <Input placeholder="123" />
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="border-t pt-4">
                    <div className="mb-2 flex justify-between">
                      <span>Service</span>
                      <span>${selectedService?.price}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Total</span>
                      <span>${selectedService?.price}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={handleBack} disabled={step === 1}>
              <Icons.ArrowLeftIcon className="mr-2 h-5 w-5" />
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={
                (step === 1 && !selectedService) ||
                (step === 2 && !selectedProvider) ||
                (step === 3 && (!selectedDate || !selectedTime))
              }
            >
              {step === 4 ? (
                <>
                  <Icons.CheckCircleIcon className="mr-2 h-5 w-5" />
                  Confirm Booking
                </>
              ) : (
                <>
                  Next
                  <Icons.ArrowRightIcon className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
