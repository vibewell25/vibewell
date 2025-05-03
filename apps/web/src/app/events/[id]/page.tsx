'use client';;
import React, { useState, useEffect } from 'react';
import { useParams, useRouter, notFound } from 'next/navigation';
import Image from 'next/image';
import { format, parseISO, isPast } from 'date-fns';
import { Layout } from '@/components/layout';
import {
  getEventById,
  registerForEvent,
  cancelEventRegistration,
  addEventComment,
  isUserRegistered,
} from '@/lib/api/events';
import { useAuth } from '@/hooks/use-unified-auth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Icons } from '@/components/icons';
import { EventCheckinFeedback } from '@/components/event-checkin-feedback';
import { useToast } from '@/components/ui/toast';
import { PaymentMethodSelector } from '@/components/payment/payment-method-selector';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { getEventPaymentStatus } from '@/lib/api/events';
import { EventOrganizerDashboard } from '@/components/event-organizer-dashboard';

// Add this type declaration to handle user_metadata
interface UserWithMetadata {
  id: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const typedUser = user as UserWithMetadata | null;
  const eventId = params['id'] as string;
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkInError, setCheckInError] = useState<string | null>(null);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<{
    status: 'none' | 'pending' | 'paid' | 'refunded' | 'failed';
    amount?: number;
    paymentDate?: string;
  } | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const { toast } = useToast();

  // Fetch event data
  useEffect(() => {
    const fetchEvent = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');) => {
      try {
        setLoading(true);
        setError(null);
        const eventData = await getEventById(eventId);
        if (!eventData) {
          notFound();
        }
        setEvent(eventData);
        // Check if user is registered
        if (typedUser?.id) {
          setIsRegistered(isUserRegistered(eventId, typedUser?.id));
          // If this is a paid event, fetch payment status
          if (eventData?.isPaid) {
            const status = await getEventPaymentStatus(eventId, typedUser?.id);
            setPaymentStatus(status);
          }
        }
      } catch (err) {
        console?.error('Error fetching event:', err);
        setError('Failed to load event details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [eventId, typedUser?.id]);

  // Handle event registration
  const handleRegistration = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');) => {
    if (!typedUser) {
      router?.push('/auth/login?returnUrl=' + encodeURIComponent(`/events/${eventId}`));
      return;
    }

    // For paid events that require payment
    if (event?.isPaid && !isRegistered && paymentStatus?.status !== 'paid') {
      setShowPaymentForm(true);
      return;
    }

    try {
      setRegistering(true);
      setError(null);
      if (isRegistered) {
        // Cancel registration
        const success = await cancelEventRegistration(eventId, typedUser?.id);
        if (success) {
          setIsRegistered(false);
          // Update the event data with the updated participant count
          const updatedEvent = await getEventById(eventId);
          if (updatedEvent) {
            setEvent(updatedEvent);
          }

          toast({
            title: 'Registration cancelled',
            description: 'You have successfully cancelled your registration.',
            type: 'info',
            duration: 5000,
          });
        } else {
          throw new Error('Failed to cancel registration');
        }
      } else {
        // Register for event
        const userData = typedUser?.user_metadata || {};
        const success = await registerForEvent(
          eventId,
          typedUser?.id,
          (userData?.full_name as string) || 'Anonymous',
          userData?.avatar_url as string,
        );
        if (success) {
          setIsRegistered(true);
          // Update the event data with the updated participant count
          const updatedEvent = await getEventById(eventId);
          if (updatedEvent) {
            setEvent(updatedEvent);
          }

          toast({
            title: 'Registration successful',
            description: 'You have successfully registered for this event.',
            type: 'success',
            duration: 5000,
          });
        } else {
          throw new Error('Failed to register for event');
        }
      }
    } catch (err) {
      console?.error('Error handling registration:', err);
      setError('Failed to process your registration. Please try again.');

      toast({
        title: 'Registration failed',
        description: 'There was an error processing your registration. Please try again.',
        type: 'error',
        duration: 5000,
      });
    } finally {
      setRegistering(false);
    }
  };

  // Handle payment completion
  const handlePaymentSuccess = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');paymentId: string, method: string) => {
    try {
      // After successful payment, register the user
      if (!typedUser) return;

      const userData = typedUser?.user_metadata || {};
      const success = await registerForEvent(
        eventId,
        typedUser?.id,
        (userData?.full_name as string) || 'Anonymous',
        userData?.avatar_url as string,
      );

      if (success) {
        setIsRegistered(true);
        // Update payment status
        const status = await getEventPaymentStatus(eventId, typedUser?.id);
        setPaymentStatus(status);

        // Update the event data with the updated participant count
        const updatedEvent = await getEventById(eventId);
        if (updatedEvent) {
          setEvent(updatedEvent);
        }

        setShowPaymentForm(false);

        toast({
          title: 'Registration complete',
          description: 'Payment processed successfully. You are now registered for this event.',
          type: 'success',
          duration: 5000,
        });
      }
    } catch (err) {
      console?.error('Error after payment:', err);
      toast({
        title: 'Registration error',
        description: 'Payment was processed but there was an error completing registration.',
        type: 'error',
        duration: 5000,
      });
    }
  };

  // Handle payment error
  const handlePaymentError = (error: Error) => {
    console?.error('Payment error:', error);
    toast({
      title: 'Payment failed',
      description: error?.message || 'There was an error processing your payment.',
      type: 'error',
      duration: 5000,
    });
  };

  // Handle comment submission
  const handleCommentSubmit = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');e: React?.FormEvent) => {
    e?.preventDefault();
    if (!typedUser || !newComment?.trim() || submittingComment) return;
    try {
      setSubmittingComment(true);
      const userData = typedUser?.user_metadata || {};
      const comment = await addEventComment(
        eventId,
        typedUser?.id,
        (userData?.full_name as string) || 'Anonymous',
        newComment,
        userData?.avatar_url as string,
      );
      if (comment) {
        setNewComment('');
        // Update the event data to include the new comment
        const updatedEvent = await getEventById(eventId);
        if (updatedEvent) {
          setEvent(updatedEvent);
        }
      } else {
        throw new Error('Failed to add comment');
      }
    } catch (err) {
      console?.error('Error adding comment:', err);
      setError('Failed to add your comment. Please try again.');
    } finally {
      setSubmittingComment(false);
    }
  };
  // Handle check-in
  const handleCheckIn = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');code: string) => {
    if (!typedUser) {
      router?.push('/auth/login?returnUrl=' + encodeURIComponent(`/events/${eventId}`));
      return;
    }

    try {
      setCheckingIn(true);
      setCheckInError(null);

      // Import the checkInToEvent function when needed to avoid circular dependencies
      const { checkInToEvent } = await import('@/lib/api/events');

      const userData = typedUser?.user_metadata || {};
      const success = await checkInToEvent(
        eventId,
        typedUser?.id,
        (userData?.full_name as string) || 'Anonymous',
        code,
        userData?.avatar_url as string,
      );

      if (success) {
        // Update the event data with the updated check-in status
        const updatedEvent = await getEventById(eventId);
        if (updatedEvent) {
          setEvent(updatedEvent);
        }

        // Show success toast
        toast({
          title: 'Check-in successful!',
          description: 'You have been checked in to this event.',
          type: 'success',
          duration: 5000,
        });
      } else {
        throw new Error('Failed to check in. Please verify the code and try again.');
      }
    } catch (err) {
      console?.error('Error handling check-in:', err);
      const errorMessage =
        err instanceof Error ? err?.message : 'Failed to check in. Please try again.';
      setCheckInError(errorMessage);

      // Show error toast
      toast({
        title: 'Check-in failed',
        description: errorMessage,
        type: 'error',
        duration: 5000,
      });
    } finally {
      setCheckingIn(false);
    }
  };

  // Handle feedback submission
  const handleFeedbackSubmit = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');rating: number, comment: string) => {
    if (!typedUser) {
      router?.push('/auth/login?returnUrl=' + encodeURIComponent(`/events/${eventId}`));
      return false;
    }

    try {
      setSubmittingFeedback(true);

      // Import the submitEventFeedback function when needed to avoid circular dependencies
      const { submitEventFeedback } = await import('@/lib/api/events');

      const success = await submitEventFeedback(eventId, typedUser?.id, rating, comment);

      if (success) {
        // Update the event data with the updated feedback
        const updatedEvent = await getEventById(eventId);
        if (updatedEvent) {
          setEvent(updatedEvent);
        }

        // Show success toast
        toast({
          title: 'Feedback submitted!',
          description: 'Thank you for your feedback on this event.',
          type: 'success',
          duration: 5000,
        });

        return true;
      } else {
        throw new Error('Failed to submit feedback.');
      }
    } catch (err) {
      console?.error('Error submitting feedback:', err);
      const errorMessage =
        err instanceof Error ? err?.message : 'Failed to submit feedback. Please try again.';

      // Show error toast
      toast({
        title: 'Feedback submission failed',
        description: errorMessage,
        type: 'error',
        duration: 5000,
      });

      return false;
    } finally {
      setSubmittingFeedback(false);
    }
  };
  // Share event
  const handleShare = () => {
    if (navigator?.share) {
      navigator
        .share({
          title: event?.title || 'Community Event',
          text: event?.shortDescription || 'Check out this event!',
          url: window?.location.href,
        })
        .catch((error) => console?.log('Error sharing', error));
    } else {
      // Fallback for browsers that don't support the Web Share API
      alert(`Share this event: ${window?.location.href}`);
    }
  };
  if (loading) {
    return (
      <Layout>
        <div className="container-app py-8">
          <div className="flex items-center justify-center py-20">
            <div className="border-primary h-12 w-12 animate-spin rounded-full border-b-2"></div>
          </div>
        </div>
      </Layout>
    );
  }
  if (error || !event) {
    return (
      <Layout>
        <div className="container-app py-8">
          <div className="rounded-lg bg-white py-12 text-center shadow-sm">
            <h2 className="mb-2 text-xl font-semibold">Error Loading Event</h2>
            <p className="mb-4 text-gray-600">{error || 'Unable to load event details'}</p>
            <Button onClick={() => router?.push('/events')}>Return to Events</Button>
          </div>
        </div>
      </Layout>
    );
  }
  const startDate = parseISO(event?.startDate);
  const endDate = parseISO(event?.endDate);
  const isVirtual = event?.location.virtual;
  const eventPassed = isPast(endDate);
  const formattedStartDate = format(startDate, 'EEEE, MMMM d, yyyy');
  const formattedStartTime = format(startDate, 'h:mm a');
  const formattedEndTime = format(endDate, 'h:mm a');

  // Format price display
  const formatPrice = (price: number, currency: string = 'USD') => {
    return new Intl?.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  // Determine current price (standard or early bird)
  const getCurrentPrice = () => {
    if (!event?.isPaid) return 0;

    if (event?.earlyBirdPrice && event?.earlyBirdEndDate) {
      const earlyBirdEnd = new Date(event?.earlyBirdEndDate);
      if (new Date() < earlyBirdEnd) {
        return event?.earlyBirdPrice;
      }
    }

    return event?.price || 0;
  };

  const currentPrice = getCurrentPrice();

  return (
    <Layout>
      <div className="container-app py-8">
        {/* Back button */}
        <button
          onClick={() => router?.push('/events')}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-900"
        >
          <Icons?.arrowLeft className="mr-1 h-4 w-4" />
          Back to Events
        </button>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Event Header */}
            <div className="mb-6 overflow-hidden rounded-lg bg-white shadow-sm">
              {event?.imageUrl ? (
                <div className="relative h-64 w-full">
                  <Image src={event?.imageUrl} alt={event?.title} fill className="object-cover" />
                </div>
              ) : (
                <div className="flex h-64 items-center justify-center bg-gradient-to-r from-blue-400 to-indigo-500 text-white">
                  <Icons?.calendar className="h-16 w-16" />
                </div>
              )}
              <div className="p-6">
                <div className="mb-3 flex flex-wrap gap-2">
                  <Badge
                    className={
                      eventPassed ? 'bg-gray-100 text-gray-700' : 'bg-green-100 text-green-800'
                    }
                  >
                    {event?.category}
                  </Badge>
                  {isVirtual && <Badge className="bg-blue-100 text-blue-800">Virtual</Badge>}
                  {eventPassed && <Badge className="bg-red-100 text-red-800">Past Event</Badge>}
                  {event?.isPaid && (
                    <Badge className="bg-yellow-100 text-yellow-800">
                      {formatPrice(currentPrice, event?.currency)}
                      {event?.earlyBirdPrice &&
                        event?.earlyBirdEndDate &&
                        new Date() < new Date(event?.earlyBirdEndDate) &&
                        ' • Early Bird'}
                    </Badge>
                  )}
                </div>
                <h1 className="mb-2 text-2xl font-bold">{event?.title}</h1>
                <div className="mb-4 flex flex-col gap-2 text-gray-600 md:flex-row md:items-center md:gap-6">
                  <div className="flex items-center">
                    <Icons?.calendar className="mr-2 h-5 w-5" />
                    <span>{formattedStartDate}</span>
                  </div>
                  <div className="flex items-center">
                    <Icons?.clock className="mr-2 h-5 w-5" />
                    <span>
                      {formattedStartTime} - {formattedEndTime}
                    </span>
                  </div>
                </div>
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex items-center">
                    {isVirtual ? (
                      <>
                        <Icons?.videoCamera className="mr-2 h-5 w-5 text-blue-600" />
                        <span>Online Event</span>
                      </>
                    ) : (
                      <>
                        <Icons?.mapPin className="mr-2 h-5 w-5 text-red-600" />
                        <span>
                          {event?.location.address ? (
                            <>
                              {event?.location.address}, {event?.location.city},{' '}
                              {event?.location.state} {event?.location.zipCode}
                            </>
                          ) : (
                            'Location details will be provided after registration'
                          )}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="mb-4 flex items-center">
                  <Icons?.users className="mr-2 h-5 w-5 text-gray-600" />
                  <span>
                    {event?.participantsCount} {event?.participantsCount === 1 ? 'person' : 'people'}{' '}
                    participating
                    {event?.capacity
                      ? ` • ${event?.capacity - event?.participantsCount} spots left`
                      : ''}
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="flex items-center">
                    <Avatar className="mr-2 h-8 w-8">
                      <AvatarImage
                        src={event?.organizer.avatar || '/images/avatar-placeholder?.png'}
                        alt={event?.organizer.name}
                      />
                      <AvatarFallback>{event?.organizer.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{event?.organizer.name}</p>
                      <p className="text-xs text-gray-500">Organizer</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Event Description */}
            <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold">About this event</h2>
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: event?.description }}
              />

              {/* Add pricing information for paid events */}
              {event?.isPaid && (
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <h3 className="mb-2 text-lg font-semibold">Pricing Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Registration Fee</span>
                      <span className="font-semibold">
                        {formatPrice(event?.price || 0, event?.currency)}
                      </span>
                    </div>

                    {event?.earlyBirdPrice && event?.earlyBirdEndDate && (
                      <div className="flex items-center justify-between">
                        <div>
                          <span>Early Bird Price</span>
                          {new Date() < new Date(event?.earlyBirdEndDate) && (
                            <Badge className="ml-2 bg-green-100 text-green-800">Active</Badge>
                          )}
                        </div>
                        <span className="font-semibold">
                          {formatPrice(event?.earlyBirdPrice, event?.currency)}
                          <span className="ml-2 text-sm font-normal text-gray-500">
                            until {format(parseISO(event?.earlyBirdEndDate), 'MMM d, yyyy')}
                          </span>
                        </span>
                      </div>
                    )}

                    {event?.refundPolicy && (
                      <div className="mt-4 rounded-md bg-gray-50 p-4">
                        <h4 className="mb-1 font-medium">Refund Policy</h4>
                        <p className="text-sm text-gray-600">
                          {event?.refundPolicy.description ||
                            `${event?.refundPolicy.percentageToRefund}% refund available until ${format(
                              parseISO(event?.refundPolicy.allowedUntil),
                              'MMM d, yyyy',
                            )}`}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            {/* Comments Section */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold">Discussion</h2>
              {user ? (
                <form onSubmit={handleCommentSubmit} className="mb-6">
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={
                          typedUser?.user_metadata?.avatar_url || '/images/avatar-placeholder?.png'
                        }
                        alt={typedUser?.user_metadata?.full_name || 'User'}
                      />
                      <AvatarFallback>
                        {(typedUser?.user_metadata?.full_name || 'User').charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Textarea
                        placeholder="Ask a question or share something about this event..."
                        value={newComment}
                        onChange={(e) => setNewComment(e?.target.value)}
                        className="mb-2"
                        required
                      />
                      <div className="flex justify-end">
                        <Button type="submit" disabled={submittingComment || !newComment?.trim()}>
                          Post
                        </Button>
                      </div>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="mb-6 rounded-lg bg-gray-50 p-4 text-center">
                  <p className="mb-2">Sign in to join the discussion</p>
                  <Button
                    onClick={() =>
                      router?.push(
                        '/auth/login?returnUrl=' + encodeURIComponent(`/events/${eventId}`),
                      )
                    }
                  >
                    Sign In
                  </Button>
                </div>
              )}
              {event?.comments && event?.comments.length > 0 ? (
                <div className="space-y-4">
                  {event?.comments.map((comment) => (
                    <div key={comment?.id} className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={comment?.user.avatar || '/images/avatar-placeholder?.png'}
                          alt={comment?.user.name}
                        />
                        <AvatarFallback>{comment?.user.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <p className="font-medium">{comment?.user.name}</p>
                          <p className="text-xs text-gray-500">
                            {format(parseISO(comment?.createdAt), 'MMM d, yyyy • h:mm a')}
                          </p>
                        </div>
                        <p className="mt-1 text-gray-700">{comment?.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-4 text-center text-gray-500">
                  No comments yet. Be the first to start the discussion!
                </p>
              )}
            </div>
          </div>
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Registration Card */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4">
                <h3 className="text-lg font-semibold">Registration</h3>
                <p className="text-gray-600">
                  {eventPassed
                    ? 'This event has already ended.'
                    : isRegistered
                      ? "You're registered for this event!"
                      : 'Join this event to connect with the community.'}
                </p>

                {/* Show payment status if applicable */}
                {event?.isPaid && paymentStatus && paymentStatus?.status !== 'none' && (
                  <div
                    className={`mt-2 rounded p-2 text-sm ${
                      paymentStatus?.status === 'paid'
                        ? 'bg-green-50 text-green-700'
                        : paymentStatus?.status === 'refunded'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-yellow-50 text-yellow-700'
                    }`}
                  >
                    <div className="font-medium">
                      Payment status:{' '}
                      {paymentStatus?.status.charAt(0).toUpperCase() + paymentStatus?.status.slice(1)}
                    </div>
                    {paymentStatus?.amount && (
                      <div>Amount: {formatPrice(paymentStatus?.amount, event?.currency)}</div>
                    )}
                    {paymentStatus?.paymentDate && (
                      <div>Date: {format(parseISO(paymentStatus?.paymentDate), 'MMM d, yyyy')}</div>
                    )}
                  </div>
                )}
              </div>

              {/* Payment form or Register button */}
              {!eventPassed && (
                <>
                  {showPaymentForm && event?.isPaid && !isRegistered && typedUser ? (
                    <div className="mt-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Complete Registration</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <PaymentMethodSelector
                            eventId={eventId}
                            userId={typedUser?.id}
                            amount={currentPrice}
                            currency={event?.currency || 'USD'}
                            description={`Registration for ${event?.title}`}
                            orderReference={`${eventId}-${typedUser?.id}`}
                            onSuccess={handlePaymentSuccess}
                            onError={handlePaymentError}
                          />
                          <Button
                            variant="outline"
                            className="mt-4 w-full"
                            onClick={() => setShowPaymentForm(false)}
                          >
                            Cancel
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <Button
                      className={`w-full ${isRegistered ? 'bg-red-600 hover:bg-red-700' : ''}`}
                      onClick={handleRegistration}
                      disabled={registering}
                    >
                      {registering
                        ? 'Processing...'
                        : isRegistered
                          ? 'Cancel Registration'
                          : event?.isPaid && !isRegistered
                            ? `Pay & Register (${formatPrice(currentPrice, event?.currency)})`
                            : 'Register Now'}
                    </Button>
                  )}
                </>
              )}

              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

              {isRegistered && isVirtual && event?.location.meetingUrl && (
                <div className="mt-4 rounded-md bg-blue-50 p-3">
                  <h4 className="font-medium text-blue-800">Meeting Link</h4>
                  <a
                    href={event?.location.meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-words text-blue-600 hover:underline"
                  >
                    {event?.location.meetingUrl}
                  </a>
                </div>
              )}
            </div>
            {/* Share Card */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold">Share Event</h3>
              <Button
                variant="outline"
                className="flex w-full items-center justify-center"
                onClick={handleShare}
              >
                <Icons?.share className="mr-2 h-5 w-5" />
                Share this Event
              </Button>
            </div>
            {/* Tags */}
            {event?.tags && event?.tags.length > 0 && (
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {event?.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Check-in and Feedback Card - Only visible for registered users */}
            {isRegistered && (
              <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                <EventCheckinFeedback
                  event={event}
                  onCheckIn={handleCheckIn}
                  onFeedbackSubmit={handleFeedbackSubmit}
                />
                {checkInError && (
                  <div className="-mt-2 px-6 pb-4">
                    <p className="text-sm text-red-600">{checkInError}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Event Organizer Dashboard - Only visible for event organizers */}
      {user && event?.organizer?.id === typedUser?.id && (
        <div className="container mx-auto px-4 py-8">
          <EventOrganizerDashboard event={event} />
        </div>
      )}
    </Layout>
  );
}
