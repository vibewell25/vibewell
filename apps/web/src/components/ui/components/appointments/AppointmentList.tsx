import { format } from 'date-fns';
import { CalendarIcon, ClockIcon, UserIcon } from '@heroicons/react/24/outline';
import { ServiceBooking, User, BeautyService } from '@prisma/client';

type AppointmentWithRelations = ServiceBooking & {
  user: User;
  service: BeautyService;
interface AppointmentListProps {
  appointments: AppointmentWithRelations[];
export default function AppointmentList({ appointments }: AppointmentListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
return (
    <div className="overflow-hidden">
      <div className="p-4 sm:px-6 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Upcoming Appointments</h2>
      </div>
      <ul role="list" className="divide-y divide-gray-200 overflow-y-auto max-h-[600px]">
        {appointments.length === 0 ? (
          <li className="p-4 text-center text-gray-500">No appointments scheduled</li>
        ) : (
          appointments.map((appointment) => (
            <li key={appointment.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
                    <UserIcon className="h-6 w-6 text-indigo-600" aria-hidden="true" />
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {appointment.user.name}
                  </p>
                  <p className="truncate text-sm text-gray-500">
                    {appointment.service.name}
                  </p>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <CalendarIcon className="mr-1.5 h-4 w-4 flex-shrink-0" />
                    {format(new Date(appointment.startTime), 'MMM d, yyyy')}
                    <ClockIcon className="ml-4 mr-1.5 h-4 w-4 flex-shrink-0" />
                    {format(new Date(appointment.startTime), 'h:mm a')}
                  </div>
                </div>
                <div>
                  <span
                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusColor(
                      appointment.status
                    )}`}
                  >
                    {appointment.status.toLowerCase()}
                  </span>
                </div>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
