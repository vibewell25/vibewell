'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter, notFound } from 'next/navigation';
import Image from 'next/image';
import { format, parseISO, isPast } from 'date-fns';
import { Layout } from '@/components/layout';
import { Event, EventComment } from '@/types/events';
import { getEventById, registerForEvent, cancelEventRegistration, addEventComment, isUserRegistered } from '@/lib/api/events';
import { useAuth } from '@/contexts/clerk-auth-context';
;
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Icons } from '@/components/icons';
export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const eventId = params.id as string;
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  // Fetch event data
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError(null);
        const eventData = await getEventById(eventId);
        if (!eventData) {
          notFound();
        }
        setEvent(eventData);
        // Check if user is registered
        if (user?.id) {
          setIsRegistered(isUserRegistered(eventId, user.id));
        }
      } catch (err) {
        console.error('Error fetching event:', err);
        setError('Failed to load event details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [eventId, user?.id]);
  // Handle event registration
  const handleRegistration = async () => {
    if (!user) {
      router.push('/auth/login?returnUrl=' + encodeURIComponent(`/events/${eventId}`));
      return;
    }
    try {
      setRegistering(true);
      setError(null);
      if (isRegistered) {
        // Cancel registration
        const success = await cancelEventRegistration(eventId, user.id);
        if (success) {
          setIsRegistered(false);
          // Update the event data with the updated participant count
          const updatedEvent = await getEventById(eventId);
          if (updatedEvent) {
            setEvent(updatedEvent);
          }
        } else {
          throw new Error('Failed to cancel registration');
        }
      } else {
        // Register for event
        const success = await registerForEvent(
          eventId, 
          user.id, 
          user.user_metadata?.full_name || 'Anonymous', 
          user.user_metadata?.avatar_url
        );
        if (success) {
          setIsRegistered(true);
          // Update the event data with the updated participant count
          const updatedEvent = await getEventById(eventId);
          if (updatedEvent) {
            setEvent(updatedEvent);
          }
        } else {
          throw new Error('Failed to register for event');
        }
      }
    } catch (err) {
      console.error('Error handling registration:', err);
      setError('Failed to process your registration. Please try again.');
    } finally {
      setRegistering(false);
    }
  };
  // Handle comment submission
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim() || submittingComment) return;
    try {
      setSubmittingComment(true);
      const comment = await addEventComment(
        eventId,
        user.id,
        user.user_metadata?.full_name || 'Anonymous',
        newComment,
        user.user_metadata?.avatar_url
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
      console.error('Error adding comment:', err);
      setError('Failed to add your comment. Please try again.');
    } finally {
      setSubmittingComment(false);
    }
  };
  // Share event
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event?.title || 'Community Event',
        text: event?.shortDescription || 'Check out this event!',
        url: window.location.href
      })
      .catch((error) => console.log('Error sharing', error));
    } else {
      // Fallback for browsers that don't support the Web Share API
      alert(`Share this event: ${window.location.href}`);
    }
  };
  if (loading) {
    return (
      <Layout>
        <div className="container-app py-8">
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </Layout>
    );
  }
  if (error || !event) {
    return (
      <Layout>
        <div className="container-app py-8">
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-2">Error Loading Event</h2>
            <p className="text-gray-600 mb-4">{error || 'Unable to load event details'}</p>
            <Button onClick={() => router.push('/events')}>
              Return to Events
            </Button>
          </div>
        </div>
      </Layout>
    );
  }
  const startDate = parseISO(event.startDate);
  const endDate = parseISO(event.endDate);
  const isVirtual = event.location.virtual;
  const eventPassed = isPast(endDate);
  const formattedStartDate = format(startDate, 'EEEE, MMMM d, yyyy');
  const formattedStartTime = format(startDate, 'h:mm a');
  const formattedEndTime = format(endDate, 'h:mm a');
  return (
    <Layout>
      <div className="container-app py-8">
        {/* Back button */}
        <button 
          onClick={() => router.push('/events')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <Icons.ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Events
        </button>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Event Header */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
              {event.imageUrl ? (
                <div className="relative h-64 w-full">
                  <Image
                    src={event.imageUrl}
                    alt={event.title}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="h-64 bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center text-white">
                  <Icons.CalendarIcon className="h-16 w-16" />
                </div>
              )}
              <div className="p-6">
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge className={eventPassed ? 'bg-gray-100 text-gray-700' : 'bg-green-100 text-green-800'}>
                    {event.category}
                  </Badge>
                  {isVirtual && (
                    <Badge className="bg-blue-100 text-blue-800">
                      Virtual
                    </Badge>
                  )}
                  {eventPassed && (
                    <Badge className="bg-red-100 text-red-800">
                      Past Event
                    </Badge>
                  )}
                </div>
                <h1 className="text-2xl font-bold mb-2">{event.title}</h1>
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 text-gray-600 mb-4">
                  <div className="flex items-center">
                    <Icons.CalendarIcon className="h-5 w-5 mr-2" />
                    <span>{formattedStartDate}</span>
                  </div>
                  <div className="flex items-center">
                    <Icons.ClockIcon className="h-5 w-5 mr-2" />
                    <span>{formattedStartTime} - {formattedEndTime}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center">
                    {isVirtual ? (
                      <>
                        <Icons.VideoCameraIcon className="h-5 w-5 mr-2 text-blue-600" />
                        <span>Online Event</span>
                      </>
                    ) : (
                      <>
                        <Icons.MapPinIcon className="h-5 w-5 mr-2 text-red-600" />
                        <span>
                          {event.location.address ? (
                            <>
                              {event.location.address}, {event.location.city}, {event.location.state} {event.location.zipCode}
                            </>
                          ) : (
                            'Location details will be provided after registration'
                          )}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center mb-4">
                  <Icons.UsersIcon className="h-5 w-5 mr-2 text-gray-600" />
                  <span>
                    {event.participantsCount} {event.participantsCount === 1 ? 'person' : 'people'} participating
                    {event.capacity ? ` • ${event.capacity - event.participantsCount} spots left` : ''}
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarImage 
                        src={event.organizer.avatar || '/images/avatar-placeholder.png'} 
                        alt={event.organizer.name} 
                      />
                      <AvatarFallback>{event.organizer.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{event.organizer.name}</p>
                      <p className="text-xs text-gray-500">Organizer</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Event Description */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">About this event</h2>
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: event.description }}
              />
            </div>
            {/* Comments Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Discussion</h2>
              {user ? (
                <form onSubmit={handleCommentSubmit} className="mb-6">
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage 
                        src={user.user_metadata?.avatar_url || '/images/avatar-placeholder.png'} 
                        alt={user.user_metadata?.full_name || 'User'} 
                      />
                      <AvatarFallback>{(user.user_metadata?.full_name || 'User').charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Textarea
                        placeholder="Ask a question or share something about this event..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="mb-2"
                        required
                      />
                      <div className="flex justify-end">
                        <Button type="submit" disabled={submittingComment || !newComment.trim()}>
                          Post
                        </Button>
                      </div>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg mb-6 text-center">
                  <p className="mb-2">Sign in to join the discussion</p>
                  <Button onClick={() => router.push('/auth/login?returnUrl=' + encodeURIComponent(`/events/${eventId}`))}>
                    Sign In
                  </Button>
                </div>
              )}
              {event.comments && event.comments.length > 0 ? (
                <div className="space-y-4">
                  {event.comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage 
                          src={comment.user.avatar || '/images/avatar-placeholder.png'} 
                          alt={comment.user.name} 
                        />
                        <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <p className="font-medium">{comment.user.name}</p>
                          <p className="text-xs text-gray-500">
                            {format(parseISO(comment.createdAt), 'MMM d, yyyy • h:mm a')}
                          </p>
                        </div>
                        <p className="text-gray-700 mt-1">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No comments yet. Be the first to start the discussion!
                </p>
              )}
            </div>
          </div>
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Registration Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="mb-4">
                <h3 className="text-lg font-semibold">Registration</h3>
                <p className="text-gray-600">
                  {eventPassed 
                    ? 'This event has already ended.' 
                    : isRegistered 
                      ? 'You\'re registered for this event!' 
                      : 'Join this event to connect with the community.'}
                </p>
              </div>
              {!eventPassed && (
                <Button
                  className={`w-full ${isRegistered ? 'bg-red-600 hover:bg-red-700' : ''}`}
                  onClick={handleRegistration}
                  disabled={registering}
                >
                  {registering 
                    ? 'Processing...' 
                    : isRegistered 
                      ? 'Cancel Registration' 
                      : 'Register Now'}
                </Button>
              )}
              {error && (
                <p className="text-red-600 text-sm mt-2">{error}</p>
              )}
              {isRegistered && isVirtual && event.location.meetingUrl && (
                <div className="mt-4 p-3 bg-blue-50 rounded-md">
                  <h4 className="font-medium text-blue-800">Meeting Link</h4>
                  <a 
                    href={event.location.meetingUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-words"
                  >
                    {event.location.meetingUrl}
                  </a>
                </div>
              )}
            </div>
            {/* Share Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Share Event</h3>
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center"
                onClick={handleShare}
              >
                <Icons.ShareIcon className="h-5 w-5 mr-2" />
                Share this Event
              </Button>
            </div>
            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-semibold mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
} 