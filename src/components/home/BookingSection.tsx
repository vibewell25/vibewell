import React from 'react';
import Link from 'next/link';

export default function BookingSection() {
  return (
    <section className="booking-section py-16 bg-gray-50">
      <h2 className="text-3xl font-bold text-center mb-6">Book Your Appointment</h2>
      <p className="text-center text-gray-700 mb-8">
        Choose from our wide range of services and schedule your session today.
      </p>
      <div className="flex justify-center">
        <Link href="/bookings">
          <button className="px-6 py-3 bg-primary text-white rounded-md hover:bg-primary/90">
            Start Booking
          </button>
        </Link>
      </div>
    </section>
  );
}
