import Link from 'next/link';
import React from 'react';

export default function NewAppointmentButton() {
  return (
    <Link href="/dashboard/appointments/new">
      <button className="bg-indigo-600 text-white font-medium px-4 py-2 rounded hover:bg-indigo-700">
        New Appointment
      </button>
    </Link>
  );
}
