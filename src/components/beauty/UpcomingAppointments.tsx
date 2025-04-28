import { Icons } from '@/components/icons';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { format } from 'date-fns';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
interface Appointment {
  id: string;
  serviceName: string;
  date: string;
  time: string;
  providerName: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}
export function UpcomingAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch('/api/beauty/appointments/upcoming');
        if (!response.ok) {
          throw new Error('Failed to fetch appointments');
        }
        const data = await response.json();
        setAppointments(data.appointments || []);
      } catch (error) {
        console.error('Error fetching appointments:', error);
        toast.error('Failed to load appointments');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAppointments();
  }, []);
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="mb-2 h-4 w-3/4 rounded bg-gray-200"></div>
              <div className="h-3 w-1/2 rounded bg-gray-200"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  if (appointments.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="mb-4 text-muted-foreground">No upcoming appointments</p>
          <Button onClick={() => router.push('/beauty/book')}>Book a Service</Button>
        </CardContent>
      </Card>
    );
  }
  return (
    <div className="space-y-4">
      {appointments.map((appointment) => (
        <Card key={appointment.id}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{appointment.serviceName}</h3>
                <p className="text-sm text-muted-foreground">with {appointment.providerName}</p>
              </div>
              <span
                className={`rounded-full px-2 py-1 text-xs ${
                  appointment.status === 'confirmed'
                    ? 'bg-green-100 text-green-800'
                    : appointment.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                }`}
              >
                {appointment.status}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Icons.CalendarIcon className="h-4 w-4" />
              <span>{format(new Date(appointment.date), 'MMM d, yyyy')}</span>
              <Icons.ClockIcon className="ml-2 h-4 w-4" />
              <span>{appointment.time}</span>
            </div>
          </CardContent>
        </Card>
      ))}
      <Button
        variant="outline"
        className="w-full"
        onClick={() => router.push('/beauty/appointments')}
      >
        View All Appointments
      </Button>
    </div>
  );
}
