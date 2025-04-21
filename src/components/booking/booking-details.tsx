'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { BookingService } from '@/services/booking-service';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Booking {
  id: string;
  service: {
    name: string;
    duration: number;
    price: number;
    description: string;
  };
  provider: {
    name: string;
    email: string;
    phone?: string;
  };
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
  start_time: string;
  end_time: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface BookingDetailsProps {
  bookingId: string;
  userId: string;
  role: 'customer' | 'provider';
}

export function BookingDetails({ bookingId, userId, role }: BookingDetailsProps) {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    loadBooking();
  }, [bookingId]);

  const loadBooking = async () => {
    try {
      setLoading(true);
      const bookingService = new BookingService();
      const data = await bookingService.getBookingById(bookingId);
      setBooking(data);
    } catch (err) {
      setError('Failed to load booking details');
      toast({
        title: 'Error',
        description: 'Failed to load booking details. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!booking) return;

    try {
      const bookingService = new BookingService();
      await bookingService.updateBookingStatus(bookingId, newStatus);
      setBooking({ ...booking, status: newStatus });
      toast({
        title: 'Success',
        description: `Booking ${newStatus} successfully`,
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to update booking status. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = async () => {
    if (!booking) return;

    try {
      const bookingService = new BookingService();
      await bookingService.cancelBooking(bookingId);
      setBooking({
        ...booking,
        status: role === 'customer' ? 'cancelled_by_customer' : 'cancelled_by_provider',
      });
      setShowCancelDialog(false);
      toast({
        title: 'Success',
        description: 'Booking cancelled successfully',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to cancel booking. Please try again.',
        variant: 'destructive',
      });
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

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error || !booking) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-red-500 mb-4">{error || 'Booking not found'}</p>
        <Button onClick={loadBooking}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
        {getStatusBadge(booking.status)}
      </div>

      <Card className="p-6">
        <div className="grid gap-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">{booking.service.name}</h2>
            <p className="text-gray-500">{booking.service.description}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-semibold mb-2">Booking Details</h3>
              <div className="space-y-2">
                <p>
                  <span className="text-gray-500">Date:</span>{' '}
                  {format(new Date(booking.start_time), 'PPP')}
                </p>
                <p>
                  <span className="text-gray-500">Time:</span>{' '}
                  {format(new Date(booking.start_time), 'p')} -{' '}
                  {format(new Date(booking.end_time), 'p')}
                </p>
                <p>
                  <span className="text-gray-500">Duration:</span> {booking.service.duration}{' '}
                  minutes
                </p>
                <p>
                  <span className="text-gray-500">Price:</span> ${booking.service.price}
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">
                {role === 'customer' ? 'Provider Details' : 'Customer Details'}
              </h3>
              <div className="space-y-2">
                <p>
                  <span className="text-gray-500">Name:</span>{' '}
                  {role === 'customer' ? booking.provider.name : booking.customer.name}
                </p>
                <p>
                  <span className="text-gray-500">Email:</span>{' '}
                  {role === 'customer' ? booking.provider.email : booking.customer.email}
                </p>
                {role === 'customer' && booking.provider.phone && (
                  <p>
                    <span className="text-gray-500">Phone:</span> {booking.provider.phone}
                  </p>
                )}
                {role === 'provider' && booking.customer.phone && (
                  <p>
                    <span className="text-gray-500">Phone:</span> {booking.customer.phone}
                  </p>
                )}
              </div>
            </div>
          </div>

          {booking.notes && (
            <div>
              <h3 className="font-semibold mb-2">Notes</h3>
              <p className="text-gray-500">{booking.notes}</p>
            </div>
          )}

          <div className="flex gap-4">
            {booking.status === 'pending' && role === 'provider' && (
              <Button onClick={() => setShowConfirmDialog(true)}>Confirm Booking</Button>
            )}
            {booking.status === 'confirmed' && role === 'provider' && (
              <Button onClick={() => setShowCompleteDialog(true)}>Mark as Completed</Button>
            )}
            {['pending', 'confirmed'].includes(booking.status) && (
              <Button variant="destructive" onClick={() => setShowCancelDialog(true)}>
                Cancel Booking
              </Button>
            )}
          </div>
        </div>
      </Card>

      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              No, Keep Booking
            </Button>
            <Button variant="destructive" onClick={handleCancel}>
              Yes, Cancel Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Booking</DialogTitle>
            <DialogDescription>Are you sure you want to confirm this booking?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                handleStatusUpdate('confirmed');
                setShowConfirmDialog(false);
              }}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark as Completed</DialogTitle>
            <DialogDescription>
              Are you sure you want to mark this booking as completed?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompleteDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                handleStatusUpdate('completed');
                setShowCompleteDialog(false);
              }}
            >
              Mark as Completed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
