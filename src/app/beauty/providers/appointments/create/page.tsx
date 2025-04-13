'use client';

import { useState } from 'react';
import { Layout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { 
  CalendarIcon,
  ClockIcon,
  UserIcon,
  ScissorsIcon,
  PlusIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
  category: string;
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
}

const dummyServices: Service[] = [
  {
    id: '1',
    name: 'Haircut',
    duration: 30,
    price: 50,
    category: 'Hair'
  },
  {
    id: '2',
    name: 'Highlights',
    duration: 120,
    price: 150,
    category: 'Hair'
  },
  {
    id: '3',
    name: 'Manicure',
    duration: 45,
    price: 35,
    category: 'Nails'
  }
];

const dummyClients: Client[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    phone: '+1 (555) 123-4567',
    avatar: '/users/sarah.jpg'
  },
  {
    id: '2',
    name: 'Michael Brown',
    email: 'michael@example.com',
    phone: '+1 (555) 987-6543',
    avatar: '/users/michael.jpg'
  }
];

export default function CreateAppointmentPage() {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isNewClient, setIsNewClient] = useState(false);

  const totalDuration = selectedServices.reduce((sum, service) => sum + service.duration, 0);
  const totalPrice = selectedServices.reduce((sum, service) => sum + service.price, 0);

  const handleServiceSelect = (serviceId: string) => {
    const service = dummyServices.find(s => s.id === serviceId);
    if (service && !selectedServices.find(s => s.id === serviceId)) {
      setSelectedServices([...selectedServices, service]);
    }
  };

  const handleServiceRemove = (serviceId: string) => {
    setSelectedServices(selectedServices.filter(s => s.id !== serviceId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    import { createAppointment } from "../../../../../implementation-files/appointments-create-logic";
    console.log({
      client: selectedClient,
      services: selectedServices,
      date,
      time,
      notes,
      totalDuration,
      totalPrice
    });
  };

  return (
    <Layout>
      <div className="container-app py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Create New Appointment</h1>
          <p className="text-xl text-muted-foreground">
            Schedule a new appointment for your client
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6">
            {/* Client Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Client</CardTitle>
                <CardDescription>
                  Select an existing client or add a new one
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      variant={!isNewClient ? 'default' : 'outline'}
                      onClick={() => setIsNewClient(false)}
                    >
                      Existing Client
                    </Button>
                    <Button
                      type="button"
                      variant={isNewClient ? 'default' : 'outline'}
                      onClick={() => setIsNewClient(true)}
                    >
                      New Client
                    </Button>
                  </div>

                  {isNewClient ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label>Name</Label>
                        <Input placeholder="Client name" />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input type="email" placeholder="client@example.com" />
                      </div>
                      <div>
                        <Label>Phone</Label>
                        <Input type="tel" placeholder="+1 (555) 000-0000" />
                      </div>
                    </div>
                  ) : (
                    <Select 
                      value={selectedClient?.id || ''}
                      onValueChange={(value) => {
                        const client = dummyClients.find(c => c.id === value);
                        setSelectedClient(client || null);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>
                      <SelectContent>
                        {dummyClients.map(client => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Service Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Services</CardTitle>
                <CardDescription>
                  Select services for the appointment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Select 
                    value={selectedServices.length > 0 ? selectedServices[0].id : ''}
                    onValueChange={handleServiceSelect}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                      {dummyServices.map(service => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name} (${service.price})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="space-y-2">
                    {selectedServices.map(service => (
                      <div
                        key={service.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <h3 className="font-medium">{service.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {service.duration} minutes • ${service.price}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleServiceRemove(service.id)}
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {selectedServices.length > 0 && (
                    <div className="pt-4 border-t">
                      <div className="flex justify-between">
                        <span>Total Duration:</span>
                        <span>{totalDuration} minutes</span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span>Total Price:</span>
                        <span>${totalPrice}</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Date and Time */}
            <Card>
              <CardHeader>
                <CardTitle>Date & Time</CardTitle>
                <CardDescription>
                  Select the appointment date and time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, 'PPP') : 'Pick a date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label>Time</Label>
                    <Input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
                <CardDescription>
                  Add any additional notes for this appointment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Add notes about the appointment..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button type="submit">
                Create Appointment
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
} 