'use client';;
import { useState } from 'react';
import { Layout } from '@/components/layout';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Calendar, { TileArgs } from 'react-calendar';
interface Appointment {
  id: string;
  client: {
    id: string;
    name: string;
    avatar?: string;
    email: string;
    phone: string;
  };
  service: {
    id: string;
    name: string;
    duration: number;
    price: number;
  };
  date: string;
  time: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  payment: {
    status: 'pending' | 'paid' | 'refunded';
    amount: number;
    method?: string;
  };
}
const dummyAppointments: Appointment[] = [
  {
    id: '1',
    client: {
      id: '1',
      name: 'Sarah Johnson',
      avatar: '/users/sarah.jpg',
      email: 'sarah@example.com',
      phone: '+1 (555) 123-4567',
    },
    service: {
      id: '1',
      name: 'Haircut & Highlights',
      duration: 120,
      price: 180,
    },
    date: '2024-03-20',
    time: '14:00',
    status: 'scheduled',
    notes: 'Client requested natural-looking highlights',
    payment: {
      status: 'pending',
      amount: 180,
      method: 'Credit Card',
    },
  },
];
// Add new interface for calendar events
interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  client: {
    name: string;
    avatar?: string;
  };
  service: {
    name: string;
  };
  status: Appointment['status'];
}
export default function AppointmentsPage() {
  const [activeTab, setActiveTab] = useState('calendar');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());
  const handleStatusChange = (appointmentId: string, newStatus: Appointment['status']) => {
    import { Icons } from '@/components/icons';
    console.log(`Changing status for appointment ${appointmentId} to ${newStatus}`);
  };
  // Add function to convert appointments to calendar events
  const getCalendarEvents = (appointments: Appointment[]): CalendarEvent[] => {
    return appointments.map((appointment) => ({
      id: appointment.id,
      title: `${appointment.client.name} - ${appointment.service.name}`,
      start: new Date(`${appointment.date}T${appointment.time}`),
      end: new Date(
        new Date(`${appointment.date}T${appointment.time}`).getTime() +
          appointment.service.duration * 60000,
      ),
      client: {
        name: appointment.client.name,
        avatar: appointment.client.avatar,
      },
      service: {
        name: appointment.service.name,
      },
      status: appointment.status,
    }));
  };
  // Add calendar view component
  const CalendarView = () => {
    const events = getCalendarEvents(dummyAppointments);
    return (
      <div className="space-y-4">
        <Calendar
          onChange={setCalendarDate}
          value={calendarDate}
          className="w-full rounded-lg border"
          tileClassName={({ date }: TileArgs) => {
            const hasAppointments = events.some(
              (event) => date.toDateString() === event.start.toDateString(),
            );
            return hasAppointments ? 'bg-primary/10' : '';
          }}
          tileContent={({ date }: TileArgs) => {
            const dayAppointments = events.filter(
              (event) => date.toDateString() === event.start.toDateString(),
            );
            return dayAppointments.length > 0 ? (
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 transform">
                <div className="bg-primary h-1.5 w-1.5 rounded-full" />
              </div>
            ) : null;
          }}
        />
        <Card>
          <CardHeader>
            <CardTitle>Appointments for {calendarDate.toLocaleDateString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {events
                .filter((event) => event.start.toDateString() === calendarDate.toDateString())
                .map((event) => (
                  <div
                    key={event.id}
                    className="cursor-pointer rounded-lg border p-4 hover:bg-muted"
                    onClick={() =>
                      setSelectedAppointment(
                        dummyAppointments.find((a) => a.id === event.id) || null,
                      )
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={event.client.avatar} />
                          <AvatarFallback>{event.client.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{event.client.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {event.start.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}{' '}
                            -{' '}
                            {event.end.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          event.status === 'completed'
                            ? 'success'
                            : event.status === 'cancelled'
                              ? 'destructive'
                              : event.status === 'no-show'
                                ? 'warning'
                                : 'outline'
                        }
                      >
                        {event.status}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm">{event.service.name}</p>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };
  return (
    <Layout>
      <div className="container-app py-12">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold">Appointment Management</h1>
          <p className="text-xl text-muted-foreground">Manage and track your appointments</p>
        </div>
        <div className="grid gap-6">
          {/* View Toggle */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant={view === 'list' ? 'default' : 'outline'}
                    onClick={() => setView('list')}
                  >
                    <Icons.ListBulletIcon className="mr-2 h-5 w-5" />
                    List View
                  </Button>
                  <Button
                    variant={view === 'calendar' ? 'default' : 'outline'}
                    onClick={() => setView('calendar')}
                  >
                    <Icons.CalendarIcon className="mr-2 h-5 w-5" />
                    Calendar View
                  </Button>
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Icons.MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder="Search appointments..."
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
                    New Appointment
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          {view === 'calendar' ? (
            <CalendarView />
          ) : (
            <>
              {/* Appointment List */}
              <div className="grid gap-6 md:grid-cols-3">
                {/* Appointment List Sidebar */}
                <div className="md:col-span-1">
                  <Card>
                    <CardHeader>
                      <CardTitle>Today's Appointments</CardTitle>
                      <CardDescription>{dummyAppointments.length} appointments</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {dummyAppointments.map((appointment) => (
                          <div
                            key={appointment.id}
                            className={`cursor-pointer rounded-lg p-4 transition-colors ${
                              selectedAppointment.id === appointment.id
                                ? 'bg-primary/10'
                                : 'hover:bg-muted'
                            }`}
                            onClick={() => setSelectedAppointment(appointment)}
                          >
                            <div className="flex items-center gap-4">
                              <Avatar>
                                <AvatarImage src={appointment.client.avatar} />
                                <AvatarFallback>{appointment.client.name[0]}</AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-medium">{appointment.client.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {appointment.time} • {appointment.service.name}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                {/* Appointment Details */}
                <div className="md:col-span-2">
                  {selectedAppointment ? (
                    <div className="space-y-6">
                      {/* Appointment Header */}
                      <Card>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <Avatar className="h-16 w-16">
                                <AvatarImage src={selectedAppointment.client.avatar} />
                                <AvatarFallback>
                                  {selectedAppointment.client.name[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <CardTitle>{selectedAppointment.client.name}</CardTitle>
                                <CardDescription>
                                  {selectedAppointment.date} at {selectedAppointment.time}
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
                              <Label>Service</Label>
                              <p>{selectedAppointment.service.name}</p>
                            </div>
                            <div>
                              <Label>Duration</Label>
                              <p>{selectedAppointment.service.duration} minutes</p>
                            </div>
                            <div>
                              <Label>Status</Label>
                              <Badge
                                variant={
                                  selectedAppointment.status === 'completed'
                                    ? 'success'
                                    : selectedAppointment.status === 'cancelled'
                                      ? 'destructive'
                                      : selectedAppointment.status === 'no-show'
                                        ? 'warning'
                                        : 'outline'
                                }
                              >
                                {selectedAppointment.status}
                              </Badge>
                            </div>
                            <div>
                              <Label>Payment</Label>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant={
                                    selectedAppointment.payment.status === 'paid'
                                      ? 'success'
                                      : selectedAppointment.payment.status === 'refunded'
                                        ? 'destructive'
                                        : 'warning'
                                  }
                                >
                                  {selectedAppointment.payment.status}
                                </Badge>
                                <span>${selectedAppointment.payment.amount}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      {/* Quick Actions */}
                      <div className="grid gap-4 md:grid-cols-3">
                        <Button
                          variant="outline"
                          className="flex items-center justify-center gap-2"
                          onClick={() => handleStatusChange(selectedAppointment.id, 'confirmed')}
                        >
                          <Icons.CheckCircleIcon className="h-5 w-5" />
                          Confirm
                        </Button>
                        <Button
                          variant="outline"
                          className="flex items-center justify-center gap-2"
                          onClick={() => handleStatusChange(selectedAppointment.id, 'completed')}
                        >
                          <Icons.ArrowPathIcon className="h-5 w-5" />
                          Complete
                        </Button>
                        <Button
                          variant="outline"
                          className="flex items-center justify-center gap-2"
                          onClick={() => handleStatusChange(selectedAppointment.id, 'cancelled')}
                        >
                          <Icons.XCircleIcon className="h-5 w-5" />
                          Cancel
                        </Button>
                      </div>
                      {/* Notes */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {selectedAppointment.notes ? (
                              <p>{selectedAppointment.notes}</p>
                            ) : (
                              <p className="text-muted-foreground">No notes available</p>
                            )}
                            <Button variant="outline" className="w-full">
                              <Icons.PlusIcon className="mr-2 h-5 w-5" />
                              Add Note
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                      {/* Client Details */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Client Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <Label>Email</Label>
                              <p>{selectedAppointment.client.email}</p>
                            </div>
                            <div>
                              <Label>Phone</Label>
                              <p>{selectedAppointment.client.phone}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="flex h-64 items-center justify-center">
                        <p className="text-muted-foreground">
                          Select an appointment to view details
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
