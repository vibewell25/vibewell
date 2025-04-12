'use client';

import { useState } from 'react';
import { Layout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { 
  CalendarIcon,
  ClockIcon,
  UserIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CogIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface Service {
  id: string;
  name: string;
  category: 'hair' | 'makeup' | 'nails' | 'spa';
  duration: number;
  price: number;
  description: string;
}

interface Appointment {
  id: string;
  client: {
    name: string;
    email: string;
  };
  service: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  price: number;
}

interface Revenue {
  total: number;
  services: {
    name: string;
    amount: number;
  }[];
  period: 'day' | 'week' | 'month';
}

const services: Service[] = [
  {
    id: 'hair1',
    name: 'Haircut & Styling',
    category: 'hair',
    duration: 60,
    price: 75,
    description: 'Professional haircut and styling service'
  }
];

const appointments: Appointment[] = [
  {
    id: 'app1',
    client: {
      name: 'Emily Smith',
      email: 'emily@example.com'
    },
    service: 'Haircut & Styling',
    date: '2024-03-20',
    time: '10:00 AM',
    status: 'scheduled',
    price: 75
  }
];

const revenue: Revenue = {
  total: 1500,
  services: [
    { name: 'Haircut & Styling', amount: 900 },
    { name: 'Makeup', amount: 600 }
  ],
  period: 'week'
};

export default function ProviderDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isAddingService, setIsAddingService] = useState(false);

  return (
    <Layout>
      <div className="container-app py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Provider Dashboard</h1>
          <p className="text-xl text-muted-foreground">
            Manage your beauty services and appointments
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="clients">Clients</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Today's Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">3</div>
                  <p className="text-sm text-muted-foreground">
                    Next appointment at 10:00 AM
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Weekly Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    ${revenue.total}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Last 7 days
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Client Satisfaction</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">4.8</div>
                  <p className="text-sm text-muted-foreground">
                    Based on 128 reviews
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 mt-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Service</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {revenue.services.map((service) => (
                      <div key={service.name} className="flex items-center justify-between">
                        <span>{service.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">${service.amount}</span>
                          <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary"
                              style={{
                                width: `${(service.amount / revenue.total) * 100}%`
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {appointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <h3 className="font-medium">{appointment.client.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {appointment.service}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{appointment.time}</p>
                          <p className="text-sm text-muted-foreground">
                            {appointment.date}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Services</CardTitle>
                  <Button onClick={() => setIsAddingService(true)}>
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add Service
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {services.map((service) => (
                    <Card key={service.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium">{service.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {service.description}
                            </p>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="outline">
                                {service.duration} min
                              </Badge>
                              <Badge variant="outline">
                                ${service.price}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="icon">
                              <PencilIcon className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon">
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Calendar</CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {appointments.map((appointment) => (
                      <Card key={appointment.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-medium">
                                {appointment.client.name}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {appointment.service}
                              </p>
                              <div className="flex gap-2 mt-2">
                                <Badge variant="outline">
                                  {appointment.time}
                                </Badge>
                                <Badge variant="outline">
                                  ${appointment.price}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="icon">
                                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                              </Button>
                              <Button variant="outline" size="icon">
                                <XCircleIcon className="h-5 w-5 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Clients Tab */}
          <TabsContent value="clients" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Client Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <Card key={appointment.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium">
                              {appointment.client.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {appointment.client.email}
                            </p>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="outline">
                                {appointments.filter(
                                  (a) => a.client.email === appointment.client.email
                                ).length}{' '}
                                appointments
                              </Badge>
                            </div>
                          </div>
                          <Button variant="outline">
                            <UserIcon className="h-4 w-4 mr-2" />
                            View Profile
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
} 