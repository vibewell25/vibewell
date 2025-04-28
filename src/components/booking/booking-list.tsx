'use client';;
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { BookingService } from '@/services/booking-service';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

interface Booking {
  id: string;
  service: {
    name: string;
    duration: number;
    price: number;
  };
  provider: {
    name: string;
    email: string;
  };
  customer: {
    name: string;
    email: string;
  };
  start_time: string;
  end_time: string;
  status: string;
  notes?: string;
}

interface BookingListProps {
  userId: string;
  role: 'customer' | 'provider';
}

export function BookingList({ userId, role }: BookingListProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    loadBookings();
  }, [userId, role]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const bookingService = new BookingService();
      const data = await bookingService.getBookings(userId, role);
      setBookings(data);
    } catch (err) {
      setError('Failed to load bookings');
      toast({
        title: 'Error',
        description: 'Failed to load bookings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<
      string,
      { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
    > = {
      pending: { label: 'Pending', variant: 'secondary' },
      confirmed: { label: 'Confirmed', variant: 'default' },
      completed: { label: 'Completed', variant: 'outline' },
      cancelled_by_customer: { label: 'Cancelled by Customer', variant: 'destructive' },
      cancelled_by_provider: { label: 'Cancelled by Provider', variant: 'destructive' },
    };

    const statusInfo = statusMap[status] || { label: status, variant: 'secondary' };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const filteredBookings = bookings.filter((booking) => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });

  if (loading) {
    return <div className="flex h-64 items-center justify-center">Loading...</div>;
  }

  if (error) {
    return (
      <div className="flex h-64 flex-col items-center justify-center">
        <p className="mb-4 text-red-500">{error}</p>
        <Button onClick={loadBookings}>Retry</Button>
      </div>
    );
  }

  if (filteredBookings.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center">
        <p className="mb-4 text-gray-500">No bookings found</p>
        {filter !== 'all' && (
          <Button variant="outline" onClick={() => setFilter('all')}>
            Show All Bookings
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-4 flex gap-2">
        <Button variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>
          All
        </Button>
        <Button
          variant={filter === 'pending' ? 'default' : 'outline'}
          onClick={() => setFilter('pending')}
        >
          Pending
        </Button>
        <Button
          variant={filter === 'confirmed' ? 'default' : 'outline'}
          onClick={() => setFilter('confirmed')}
        >
          Confirmed
        </Button>
        <Button
          variant={filter === 'completed' ? 'default' : 'outline'}
          onClick={() => setFilter('completed')}
        >
          Completed
        </Button>
      </div>

      <div className="grid gap-4">
        {filteredBookings.map((booking) => (
          <Card
            key={booking.id}
            className="cursor-pointer p-4 transition-colors hover:bg-gray-50"
            onClick={() => router.push(`/bookings?id=${booking.id}`)}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">{booking.service.name}</h3>
                <p className="text-sm text-gray-500">
                  {format(new Date(booking.start_time), 'PPP p')}
                </p>
                <p className="text-sm text-gray-500">
                  Duration: {booking.service.duration} minutes
                </p>
                <p className="text-sm text-gray-500">Price: ${booking.service.price}</p>
                {role === 'customer' ? (
                  <p className="text-sm text-gray-500">Provider: {booking.provider.name}</p>
                ) : (
                  <p className="text-sm text-gray-500">Customer: {booking.customer.name}</p>
                )}
              </div>
              <div className="flex flex-col items-end gap-2">
                {getStatusBadge(booking.status)}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/bookings?id=${booking.id}`);
                  }}
                >
                  View Details
                </Button>
              </div>
            </div>
            {booking.notes && (
              <div className="mt-2">
                <p className="text-sm text-gray-500">Notes: {booking.notes}</p>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
