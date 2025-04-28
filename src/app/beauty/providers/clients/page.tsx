'use client';
import { useState } from 'react';
import { Layout } from '@/components/layout';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Icons } from '@/components/icons';
import {
  CalendarIcon,
  StarIcon,
  ChatBubbleLeftIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  lastVisit: string;
  totalVisits: number;
  totalSpent: number;
  favoriteServices: string[];
  notes: string[];
  preferences: {
    communication: string[];
    allergies: string[];
    concerns: string[];
  };
  status: 'active' | 'inactive';
}

interface Appointment {
  id: string;
  date: string;
  time: string;
  service: string;
  status: 'completed' | 'cancelled' | 'no-show';
  amount: number;
  notes?: string;
}

const mockClients: Client[] = [
  {
    id: '1',
    name: 'Emily Johnson',
    email: 'emily@example.com',
    phone: '+1 (555) 123-4567',
    avatar: '/users/emily.jpg',
    lastVisit: '2024-03-15',
    totalVisits: 12,
    totalSpent: 850,
    favoriteServices: ['Haircut', 'Highlights', 'Blowout'],
    notes: [
      'Prefers natural-looking highlights',
      'Allergic to certain hair products',
      'Likes to book appointments 2 weeks in advance',
    ],
    preferences: {
      communication: ['Email', 'SMS'],
      allergies: ['Certain hair dyes'],
      concerns: ['Dry scalp'],
    },
    status: 'active',
  },
  // Add more mock clients here
];

const mockAppointments: Appointment[] = [
  {
    id: '1',
    date: '2024-03-15',
    time: '14:00',
    service: 'Haircut & Highlights',
    status: 'completed',
    amount: 180,
    notes: 'Client requested natural-looking highlights',
  },
];

export default function ClientsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clients, setClients] = useState<Client[]>(mockClients);

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone.includes(searchQuery),
  );

  return (
    <Layout>
      <div className="container-app py-12">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold">Client Management</h1>
          <p className="text-xl text-muted-foreground">Manage your clients and their preferences</p>
        </div>
        <div className="grid gap-6">
          {/* Search and Filter */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Icons.MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search clients..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline">
                  <Icons.FunnelIcon className="mr-2 h-5 w-5" />
                  Filter
                </Button>
                <Button>
                  <Icons.PlusIcon className="mr-2 h-5 w-5" />
                  Add Client
                </Button>
              </div>
            </CardContent>
          </Card>
          {/* Client List */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* Client List Sidebar */}
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Clients</CardTitle>
                  <CardDescription>{clients.length} total clients</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredClients.map((client) => (
                      <div
                        key={client.id}
                        className={`cursor-pointer rounded-lg p-4 transition-colors ${
                          selectedClient?.id === client.id ? 'bg-primary/10' : 'hover:bg-muted'
                        }`}
                        onClick={() => setSelectedClient(client)}
                      >
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarImage src={client.avatar} />
                            <AvatarFallback>{client.name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">{client.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              Last visit: {client.lastVisit}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* Client Details */}
            <div className="md:col-span-2">
              {selectedClient ? (
                <div className="space-y-6">
                  {/* Client Profile */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={selectedClient.avatar} />
                            <AvatarFallback>{selectedClient.name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle>{selectedClient.name}</CardTitle>
                            <CardDescription>
                              {selectedClient.totalVisits} visits • ${selectedClient.totalSpent}{' '}
                              spent
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="icon">
                            <Icons.PencilIcon className="h-5 w-5" />
                          </Button>
                          <Button variant="outline" size="icon">
                            <Icons.TrashIcon className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <Label>Email</Label>
                          <p>{selectedClient.email}</p>
                        </div>
                        <div>
                          <Label>Phone</Label>
                          <p>{selectedClient.phone}</p>
                        </div>
                        <div>
                          <Label>Last Visit</Label>
                          <p>{selectedClient.lastVisit}</p>
                        </div>
                        <div>
                          <Label>Total Visits</Label>
                          <p>{selectedClient.totalVisits}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  {/* Client Details Tabs */}
                  <Tabs defaultValue="appointments">
                    <TabsList>
                      <TabsTrigger value="appointments">
                        <Icons.CalendarIcon className="mr-2 h-5 w-5" />
                        Appointments
                      </TabsTrigger>
                      <TabsTrigger value="preferences">
                        <Icons.StarIcon className="mr-2 h-5 w-5" />
                        Preferences
                      </TabsTrigger>
                      <TabsTrigger value="notes">
                        <Icons.ChatBubbleLeftIcon className="mr-2 h-5 w-5" />
                        Notes
                      </TabsTrigger>
                    </TabsList>
                    {/* Appointments Tab */}
                    <TabsContent value="appointments" className="mt-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Appointment History</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {mockAppointments.map((appointment) => (
                              <div
                                key={appointment.id}
                                className="flex items-center justify-between rounded-lg border p-4"
                              >
                                <div>
                                  <h3 className="font-medium">{appointment.service}</h3>
                                  <p className="text-sm text-muted-foreground">
                                    {appointment.date} at {appointment.time}
                                  </p>
                                  {appointment.notes && (
                                    <p className="mt-2 text-sm">{appointment.notes}</p>
                                  )}
                                </div>
                                <div className="text-right">
                                  <Badge
                                    variant={
                                      appointment.status === 'completed'
                                        ? 'success'
                                        : appointment.status === 'cancelled'
                                          ? 'destructive'
                                          : 'warning'
                                    }
                                  >
                                    {appointment.status}
                                  </Badge>
                                  <p className="mt-2 font-medium">${appointment.amount}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    {/* Preferences Tab */}
                    <TabsContent value="preferences" className="mt-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Client Preferences</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-6">
                            <div>
                              <Label>Favorite Services</Label>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {selectedClient.favoriteServices.map((service) => (
                                  <Badge key={service} variant="outline">
                                    {service}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <Label>Communication Preferences</Label>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {selectedClient.preferences.communication.map((pref) => (
                                  <Badge key={pref} variant="outline">
                                    {pref}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <Label>Allergies</Label>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {selectedClient.preferences.allergies.map((allergy) => (
                                  <Badge key={allergy} variant="destructive">
                                    {allergy}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <Label>Concerns</Label>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {selectedClient.preferences.concerns.map((concern) => (
                                  <Badge key={concern} variant="warning">
                                    {concern}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    {/* Notes Tab */}
                    <TabsContent value="notes" className="mt-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Client Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {selectedClient.notes.map((note, index) => (
                              <div key={index} className="rounded-lg border p-4">
                                <p>{note}</p>
                              </div>
                            ))}
                            <Button variant="outline" className="w-full">
                              <Icons.PlusIcon className="mr-2 h-5 w-5" />
                              Add Note
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              ) : (
                <Card>
                  <CardContent className="flex h-64 items-center justify-center">
                    <p className="text-muted-foreground">Select a client to view details</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
