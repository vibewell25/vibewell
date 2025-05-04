import { Icons } from '@/components/icons';
('use client');
import { format } from 'date-fns';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
interface Appointment {
  id: string;
  service: string;
  provider: string;
  date: string;
  time: string;
}
interface UpcomingAppointmentsProps {
  appointments: Appointment[];
}
export function UpcomingAppointments({ appointments }: UpcomingAppointmentsProps) {
  const router = useRouter();
  if (appointments.length === 0) {
    return (
      <div className="rounded-lg bg-muted/20 p-6 text-center">
        <p className="mb-4 text-muted-foreground">No upcoming appointments</p>
        <Button onClick={() => router.push('/beauty/services')}>Book a Service</Button>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {appointments.map((appointment) => (
        <div key={appointment.id} className="flex items-start gap-4 rounded-lg border p-4">
          <div className="mt-1">
            <Icons.CalendarIcon className="h-5 w-5 text-blue-500" />
          </div>
          <div className="flex-1 space-y-1">
            <p className="font-medium">{appointment.service}</p>
            <p className="text-sm text-muted-foreground">with {appointment.provider}</p>
            <p className="text-xs text-muted-foreground">
              {format(new Date(appointment.date), 'EEEE, MMMM d, yyyy')} at {appointment.time}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/beauty/appointments/${appointment.id}`)}
          >
            View Details
          </Button>
        </div>
      ))}
    </div>
  );
}
