import React from 'react';
import { CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';

interface Appointment {
  id: string;
  client: string;
  service: string;
  date: Date;
  status: 'confirmed' | 'pending' | 'cancelled';
interface AppointmentsListProps {
  appointments: Appointment[];
const AppointmentsList: React.FC<AppointmentsListProps> = ({ appointments }) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
).format(date);
const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
).format(date);
const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
return (
    <div className="space-y-4">
      {appointments.length === 0 ? (
        <p className="text-center text-gray-500">No upcoming appointments</p>
      ) : (
        appointments.map((appointment) => (
          <div key={appointment.id} className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">{appointment.client}</h4>
                <p className="text-sm text-gray-500">{appointment.service}</p>
              </div>
              <div className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(appointment.status)}`}>
                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
              </div>
            </div>
            <div className="mt-3 flex items-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center">
                <CalendarIcon className="mr-1 h-4 w-4" />
                {formatDate(appointment.date)}
              </div>
              <div className="flex items-center">
                <ClockIcon className="mr-1 h-4 w-4" />
                {formatTime(appointment.date)}
              </div>
            </div>
          </div>
        ))
      )}

      <div className="pt-2 text-center">
        <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-800">
          View all appointments
        </a>
      </div>
    </div>
export default AppointmentsList; 