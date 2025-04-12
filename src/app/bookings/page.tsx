'use client';

import { useSearchParams } from 'next/navigation';
import { BookingList } from '@/components/booking/booking-list';
import { BookingDetails } from '@/components/booking/booking-details';
import { useAuth } from '@/hooks/useAuth';
import { Suspense } from 'react';

function BookingsContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const bookingId = searchParams.get('id');

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Please sign in to view your bookings</p>
      </div>
    );
  }

  if (bookingId) {
    return (
      <BookingDetails
        bookingId={bookingId}
        userId={user.id}
        role={user.role as 'customer' | 'provider'}
      />
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">My Bookings</h1>
      <BookingList
        userId={user.id}
        role={user.role as 'customer' | 'provider'}
      />
    </div>
  );
}

export default function BookingsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-64">Loading bookings...</div>}>
      <BookingsContent />
    </Suspense>
  );
} 