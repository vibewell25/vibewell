'use client';

import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameMonth, isEqual } from 'date-fns';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { ServiceBooking, User, BeautyService } from '@prisma/client';

type AppointmentWithRelations = ServiceBooking & {
  user: User;
  service: BeautyService;
};

interface AppointmentCalendarProps {
  appointments: AppointmentWithRelations[];
}

export default function AppointmentCalendar({ appointments }: AppointmentCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const firstDayOfMonth = startOfMonth(currentMonth);
  const lastDayOfMonth = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: firstDayOfMonth, end: lastDayOfMonth });

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth?.getFullYear(), currentMonth?.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth?.getFullYear(), currentMonth?.getMonth() + 1, 1));
  };

  const getAppointmentsForDay = (day: Date) => {
    return appointments?.filter(appointment => {
      const appointmentDate = new Date(appointment?.startTime);
      return isEqual(
        new Date(appointmentDate?.getFullYear(), appointmentDate?.getMonth(), appointmentDate?.getDate()),
        new Date(day?.getFullYear(), day?.getMonth(), day?.getDate())
      );
    });
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={previousMonth}
            className="p-2 text-gray-400 hover:text-gray-500"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 text-gray-400 hover:text-gray-500"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-gray-200 text-center text-xs leading-6 text-gray-700">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="bg-white py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {days?.map((day, dayIdx) => {
          const dayAppointments = getAppointmentsForDay(day);
          return (
            <div
              key={day?.toString()}
              className={`bg-white min-h-[100px] p-2 ${
                !isSameMonth(day, currentMonth) ? 'text-gray-400' : ''
              }`}
            >
              <div className={`text-sm ${isToday(day) ? 'bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center mx-auto' : ''}`}>
                {format(day, 'd')}
              </div>
              <div className="mt-2">
                {dayAppointments?.map((appointment) => (
                  <div
                    key={appointment?.id}
                    className="text-xs mb-1 truncate text-indigo-600 hover:text-indigo-800"
                  >
                    {format(new Date(appointment?.startTime), 'h:mm a')} - {appointment?.user.name}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 