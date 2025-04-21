import { uniqueId } from '@/lib/utils';
import { Event, EventCategory, EventComment, EventParticipant } from '@/types/events';
import { PaymentService } from '../payment/payment-service';

// Storage keys for browser storage
const EVENTS_STORAGE_KEY = 'vibewell_events';
const USER_EVENTS_KEY = 'vibewell_user_events';

// Sample events data for initial state
const initialEvents: Event[] = [
  {
    id: 'evt_1',
    title: 'Mindfulness Meditation Workshop',
    description: `<p>Join us for a transformative 2-hour workshop on mindfulness meditation practices.</p>
    <p>This workshop will cover:</p>
    <ul>
      <li>Fundamentals of mindfulness meditation</li>
      <li>Breathing techniques</li>
      <li>Body scan meditation</li>
      <li>Mindful movement practices</li>
      <li>Integrating mindfulness into daily life</li>
    </ul>
    <p>All levels are welcome, from beginners to experienced practitioners.</p>`,
    shortDescription: 'Learn essential mindfulness techniques in this hands-on workshop.',
    imageUrl: '/images/events/meditation-workshop.jpg',
    category: 'Meditation',
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(), // 2 hours later
    location: {
      address: '123 Wellness Street',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94103',
      country: 'USA',
      virtual: false,
    },
    organizer: {
      id: 'user123',
      name: 'Sarah Johnson',
      avatar: '/images/avatars/sarah.jpg',
      isVerified: true,
    },
    capacity: 20,
    participantsCount: 12,
    isFeatured: true,
    tags: ['meditation', 'mindfulness', 'wellness', 'stress-relief'],
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    checkInEnabled: true,
    checkInCode: 'WELLNESS2023',
  },
  {
    id: 'evt_2',
    title: 'Virtual Yoga for Beginners',
    description: `<p>Start your yoga journey with this beginner-friendly virtual class.</p>
    <p>In this session, you will learn:</p>
    <ul>
      <li>Basic yoga poses and proper alignment</li>
      <li>Yogic breathing techniques</li>
      <li>How to create a home practice space</li>
      <li>Modifications for different body types</li>
    </ul>
    <p>No equipment needed except for a yoga mat and comfortable clothes.</p>`,
    shortDescription: 'A beginner-friendly introduction to yoga practices you can do from home.',
    imageUrl: '/images/events/yoga-beginners.jpg',
    category: 'Yoga',
    startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000).toISOString(), // 1 hour later
    location: {
      virtual: true,
      meetingUrl: 'https://zoom.us/j/example',
    },
    organizer: {
      id: 'user456',
      name: 'Michael Chen',
      avatar: '/images/avatars/michael.jpg',
      isVerified: true,
    },
    capacity: 50,
    participantsCount: 28,
    isFeatured: true,
    tags: ['yoga', 'beginners', 'virtual', 'wellness'],
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'evt_3',
    title: 'Community Wellness Fair',
    description: `<p>Join us for a day of wellness exploration and community connection.</p>
    <p>Activities include:</p>
    <ul>
      <li>Free health screenings</li>
      <li>Wellness vendor booths</li>
      <li>Fitness demonstrations</li>
      <li>Nutrition workshops</li>
      <li>Community resource fair</li>
      <li>Healthy food samples</li>
    </ul>
    <p>This is a family-friendly event open to all community members.</p>`,
    shortDescription: 'A day of wellness activities, demonstrations, and community connection.',
    imageUrl: '/images/events/community-fair.jpg',
    category: 'Community',
    startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks from now
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000).toISOString(), // 6 hours later
    location: {
      address: '789 Community Park',
      city: 'Portland',
      state: 'OR',
      zipCode: '97201',
      country: 'USA',
      virtual: false,
    },
    organizer: {
      id: 'org123',
      name: 'Portland Wellness Collective',
      avatar: '/images/avatars/pwc.jpg',
      isVerified: true,
    },
    participantsCount: 56,
    tags: ['community', 'wellness', 'fair', 'family', 'nutrition'],
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    capacity: 100,
    isFeatured: true,
  },
];

/**
 * Get all events
 */
export async function getEvents(): Promise<Event[]> {
  // In a real app, this would be a server API call
  if (typeof window === 'undefined') {
    return initialEvents;
  }

  try {
    const storedEvents = localStorage.getItem(EVENTS_STORAGE_KEY);
    const events = storedEvents ? JSON.parse(storedEvents) : [];

    // If no events are stored yet, initialize with sample data
    if (events.length === 0) {
      localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(initialEvents));
      return initialEvents;
    }

    return events;
  } catch (error) {
    console.error('Error retrieving events:', error);
    return initialEvents;
  }
}

/**
 * Get featured events
 */
export async function getFeaturedEvents(limit = 3): Promise<Event[]> {
  const events = await getEvents();
  return events
    .filter(event => event.isFeatured)
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, limit);
}

/**
 * Get upcoming events
 */
export async function getUpcomingEvents(limit?: number): Promise<Event[]> {
  const events = await getEvents();
  const now = new Date().toISOString();

  const upcomingEvents = events
    .filter(event => event.startDate > now)
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  return limit ? upcomingEvents.slice(0, limit) : upcomingEvents;
}

/**
 * Get events by category
 */
export async function getEventsByCategory(category: EventCategory): Promise<Event[]> {
  const events = await getEvents();
  return events.filter(event => event.category === category);
}

/**
 * Get event by ID
 */
export async function getEventById(id: string): Promise<Event | null> {
  const events = await getEvents();
  return events.find(event => event.id === id) || null;
}

/**
 * Create a new event
 */
export async function createEvent(
  eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'participantsCount'>
): Promise<Event> {
  if (typeof window === 'undefined') {
    throw new Error('Cannot create event in server context');
  }

  try {
    const events = await getEvents();
    const timestamp = new Date().toISOString();

    const newEvent: Event = {
      ...eventData,
      id: uniqueId('evt_'),
      participantsCount: 0,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    events.push(newEvent);
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));

    return newEvent;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
}

/**
 * Update an event
 */
export async function updateEvent(
  id: string,
  updates: Partial<Omit<Event, 'id' | 'createdAt' | 'participantsCount'>>
): Promise<Event | null> {
  if (typeof window === 'undefined') {
    throw new Error('Cannot update event in server context');
  }

  try {
    const events = await getEvents();
    const index = events.findIndex(e => e.id === id);

    if (index === -1) {
      return null;
    }

    const updatedEvent = {
      ...events[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    events[index] = updatedEvent;
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));

    return updatedEvent;
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
}

/**
 * Delete an event
 */
export async function deleteEvent(id: string): Promise<boolean> {
  if (typeof window === 'undefined') {
    throw new Error('Cannot delete event in server context');
  }

  try {
    const events = await getEvents();
    const filteredEvents = events.filter(e => e.id !== id);

    if (filteredEvents.length === events.length) {
      return false; // Event not found
    }

    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(filteredEvents));

    // Also remove this event from user registrations
    const userEvents = getUserEvents();
    if (userEvents[id]) {
      delete userEvents[id];
      localStorage.setItem(USER_EVENTS_KEY, JSON.stringify(userEvents));
    }

    return true;
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
}

/**
 * Register user for an event
 */
export async function registerForEvent(
  eventId: string,
  userId: string,
  userName: string,
  userAvatar?: string
): Promise<boolean> {
  if (typeof window === 'undefined') {
    throw new Error('Cannot register for event in server context');
  }

  try {
    // Get the event to update participant count
    const events = await getEvents();
    const eventIndex = events.findIndex(e => e.id === eventId);

    if (eventIndex === -1) {
      return false; // Event not found
    }

    // Add user to participants and increment count
    const event = events[eventIndex];
    if (!event) {
      return false; // Event not found
    }
    
    event.participantsCount += 1;

    if (!event.participants) {
      event.participants = [];
    }
    
    const existingParticipant = event.participants.find(p => p.id === userId);
    if (existingParticipant) {
      existingParticipant.status = 'registered';
    } else {
      event.participants.push({
        id: userId,
        name: userName,
        avatar: userAvatar,
        registeredAt: new Date().toISOString(),
        status: 'registered',
      });
    }

    events[eventIndex] = event;
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));

    // Add to user events
    const userEvents = getUserEvents();
    userEvents[eventId] = {
      eventId,
      status: 'registered',
      registeredAt: new Date().toISOString(),
    };
    localStorage.setItem(USER_EVENTS_KEY, JSON.stringify(userEvents));

    return true;
  } catch (error) {
    console.error('Error registering for event:', error);
    throw error;
  }
}

/**
 * Cancel registration for an event
 */
export async function cancelEventRegistration(eventId: string, userId: string): Promise<boolean> {
  if (typeof window === 'undefined') {
    throw new Error('Cannot cancel registration in server context');
  }

  try {
    // Get the event to update participant count
    const events = await getEvents();
    const eventIndex = events.findIndex(e => e.id === eventId);

    if (eventIndex === -1) {
      return false; // Event not found
    }

    // Update participant status
    const event = events[eventIndex];
    if (!event) {
      return false; // Event not found
    }

    if (!event.participants) {
      event.participants = [];
    }
    
    const participantIndex = event.participants.findIndex(p => p.id === userId);
    if (participantIndex !== -1) {
      event.participants[participantIndex].status = 'cancelled';
      event.participantsCount = Math.max(0, event.participantsCount - 1);
    }

    events[eventIndex] = event;
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));

    // Update user events
    const userEvents = getUserEvents();
    if (userEvents[eventId]) {
      userEvents[eventId].status = 'cancelled';
      localStorage.setItem(USER_EVENTS_KEY, JSON.stringify(userEvents));
    }

    return true;
  } catch (error) {
    console.error('Error cancelling registration:', error);
    throw error;
  }
}

/**
 * Add comment to an event
 */
export async function addEventComment(
  eventId: string,
  userId: string,
  userName: string,
  content: string,
  userAvatar?: string
): Promise<EventComment | null> {
  if (typeof window === 'undefined') {
    throw new Error('Cannot add comment in server context');
  }

  try {
    const events = await getEvents();
    const eventIndex = events.findIndex(e => e.id === eventId);

    if (eventIndex === -1) {
      return null; // Event not found
    }

    const event = events[eventIndex];
    if (!event) {
      return null; // Event not found
    }
    
    const newComment: EventComment = {
      id: uniqueId('cmt_'),
      user: {
        id: userId,
        name: userName,
        avatar: userAvatar,
      },
      content,
      createdAt: new Date().toISOString(),
    };

    if (!event.comments) {
      event.comments = [];
    }
    
    event.comments.push(newComment);

    events[eventIndex] = event;
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));

    return newComment;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
}

/**
 * Get user's registered events
 */
export async function getUserRegisteredEvents(userId: string): Promise<Event[]> {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const events = await getEvents();

    // Filter events where user is a participant with 'registered' status
    return events.filter(event =>
      event.participants?.some(p => p.id === userId && p.status === 'registered')
    );
  } catch (error) {
    console.error('Error getting user registered events:', error);
    return [];
  }
}

/**
 * Check if user is registered for an event
 */
export function isUserRegistered(eventId: string, userId: string): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const userEvents = getUserEvents();
    return !!(userEvents[eventId] && userEvents[eventId].status === 'registered');
  } catch (error) {
    console.error('Error checking registration status:', error);
    return false;
  }
}

/**
 * Helper: Get user events from local storage
 */
function getUserEvents(): Record<
  string,
  { eventId: string; status: string; registeredAt: string }
> {
  try {
    const storedEvents = localStorage.getItem(USER_EVENTS_KEY);
    return storedEvents ? JSON.parse(storedEvents) : {};
  } catch (error) {
    console.error('Error retrieving user events:', error);
    return {};
  }
}

/**
 * Check in to an event using a check-in code
 */
export async function checkInToEvent(
  eventId: string,
  userId: string,
  userName: string,
  checkInCode: string,
  userAvatar?: string
): Promise<boolean> {
  if (typeof window === 'undefined') {
    throw new Error('Cannot check in to event in server context');
  }

  try {
    // Get the event to update check-in status
    const events = await getEvents();
    const eventIndex = events.findIndex(e => e.id === eventId);

    if (eventIndex === -1) {
      return false; // Event not found
    }

    const event = events[eventIndex];
    if (!event) {
      return false; // Event not found
    }
    
    // Verify the check-in code
    if (!event.checkInEnabled || event.checkInCode !== checkInCode) {
      return false; // Check-in not enabled or code doesn't match
    }

    // Add user to checked-in participants
    if (!event.checkedInParticipants) {
      event.checkedInParticipants = [];
    }

    // Check if user is already checked in
    const alreadyCheckedIn = event.checkedInParticipants.some(p => p.userId === userId);
    if (alreadyCheckedIn) {
      return true; // User already checked in
    }

    // Add user to checked-in participants
    event.checkedInParticipants.push({
      userId,
      name: userName,
      avatar: userAvatar || '/images/avatar-placeholder.png',
      checkedInAt: new Date().toISOString(),
    });

    // Update analytics if they exist
    if (event.analytics) {
      event.analytics.checkIns = (event.analytics.checkIns || 0) + 1;
    }

    // Save updated event
    events[eventIndex] = event;
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));

    return true;
  } catch (error) {
    console.error('Error checking in to event:', error);
    throw error;
  }
}

/**
 * Submit feedback for an event
 */
export async function submitEventFeedback(
  eventId: string,
  userId: string,
  rating: number,
  comment: string
): Promise<boolean> {
  if (typeof window === 'undefined') {
    throw new Error('Cannot submit feedback in server context');
  }

  try {
    // Get the event to update feedback
    const events = await getEvents();
    const eventIndex = events.findIndex(e => e.id === eventId);

    if (eventIndex === -1) {
      return false; // Event not found
    }

    const event = events[eventIndex];
    if (!event) {
      return false; // Event not found
    }
    
    // Initialize feedback array if it doesn't exist
    if (!event.feedback) {
      event.feedback = [];
    }

    // Add feedback
    event.feedback.push({
      userId,
      rating,
      comment,
      submittedAt: new Date().toISOString(),
    });

    // Update average rating
    const totalRating = event.feedback.reduce((sum, item) => sum + item.rating, 0);
    const averageRating = totalRating / event.feedback.length;
    
    // Update analytics if they exist
    if (!event.analytics) {
      event.analytics = {
        views: 0,
        uniqueViews: 0,
        shares: 0,
        registrations: 0,
        checkIns: 0,
        engagementScore: 0,
        averageRating,
        feedbackCount: event.feedback.length,
      };
    } else {
      event.analytics.averageRating = averageRating;
      event.analytics.feedbackCount = event.feedback.length;
    }

    // Add averageRating and ratingCount directly to the event for easy access
    event.averageRating = averageRating;
    event.ratingCount = event.feedback.length;

    // Save updated event
    events[eventIndex] = event;
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));

    return true;
  } catch (error) {
    console.error('Error submitting event feedback:', error);
    throw error;
  }
}

/**
 * Processes payment for an event registration
 * @param eventId ID of the event to register for
 * @param userId ID of the user making the payment
 * @param paymentDetails Payment details including method
 * @returns Payment result with status and message
 */
export async function processEventPayment(
  eventId: string,
  userId: string,
  paymentDetails: {
    paymentMethodId: string;
    amount: number;
    metadata?: Record<string, any>;
  }
): Promise<{ success: boolean; message: string; paymentIntentId?: string }> {
  try {
    // Get event
    const event = await getEventById(eventId);
    if (!event) {
      return { success: false, message: 'Event not found' };
    }

    if (!event.isPaid) {
      return { success: false, message: 'This event does not require payment' };
    }

    // Calculate payment amount (consider early bird)
    const currentDate = new Date();
    let amount = event.price || 0;
    
    if (event.earlyBirdPrice && event.earlyBirdEndDate) {
      const earlyBirdEnd = new Date(event.earlyBirdEndDate);
      if (currentDate < earlyBirdEnd) {
        amount = event.earlyBirdPrice;
      }
    }

    // If amount doesn't match expected amount, reject payment
    if (amount !== paymentDetails.amount) {
      return { 
        success: false, 
        message: `Invalid payment amount. Expected: ${amount}, received: ${paymentDetails.amount}` 
      };
    }

    // Initialize payment service
    const paymentService = PaymentService.getInstance();
    await paymentService.initialize();

    // Process the payment
    const paymentResult = await paymentService.processPayment({
      customerId: userId,
      paymentMethodId: paymentDetails.paymentMethodId,
      amount: amount,
      currency: event.currency || 'USD',
      metadata: {
        eventId,
        userId,
        eventName: event.title,
        ...paymentDetails.metadata
      }
    });

    if (!paymentResult.success) {
      return {
        success: false,
        message: paymentResult.message || 'Payment processing failed'
      };
    }

    // Update event with payment status
    const updatedEvent = { ...event };
    if (!updatedEvent.paymentStatuses) {
      updatedEvent.paymentStatuses = [];
    }

    updatedEvent.paymentStatuses.push({
      userId,
      status: 'paid',
      amount,
      paymentIntentId: paymentResult.paymentIntentId,
      paymentDate: new Date().toISOString()
    });

    // Save the updated event
    await updateEvent(eventId, updatedEvent);

    return {
      success: true,
      message: 'Payment processed successfully',
      paymentIntentId: paymentResult.paymentIntentId
    };
  } catch (error) {
    console.error('Error processing event payment:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'An unexpected error occurred during payment'
    };
  }
}

/**
 * Processes a refund for an event registration
 * @param eventId ID of the event
 * @param userId ID of the user requesting refund
 * @returns Refund result with status and message
 */
export async function refundEventPayment(
  eventId: string,
  userId: string
): Promise<{ success: boolean; message: string; refundId?: string }> {
  try {
    // Get event
    const event = await getEventById(eventId);
    if (!event) {
      return { success: false, message: 'Event not found' };
    }

    if (!event.isPaid) {
      return { success: false, message: 'This event does not require payment' };
    }

    // Find the payment status for this user
    const paymentStatus = event.paymentStatuses?.find(
      status => status.userId === userId && status.status === 'paid'
    );

    if (!paymentStatus) {
      return { success: false, message: 'No payment found for this user' };
    }

    // Check refund policy
    if (event.refundPolicy) {
      const currentDate = new Date();
      const refundCutoffDate = new Date(event.refundPolicy.allowedUntil);
      
      if (currentDate > refundCutoffDate) {
        return { 
          success: false, 
          message: `Refunds are only allowed until ${new Date(event.refundPolicy.allowedUntil).toLocaleDateString()}` 
        };
      }
    }

    // Initialize payment service
    const paymentService = PaymentService.getInstance();
    await paymentService.initialize();

    // Calculate refund amount based on policy
    let refundAmount = paymentStatus.amount;
    if (event.refundPolicy && event.refundPolicy.percentageToRefund < 100) {
      refundAmount = Math.floor(paymentStatus.amount * (event.refundPolicy.percentageToRefund / 100));
    }

    // Process the refund
    const refundResult = await paymentService.createRefund({
      paymentIntentId: paymentStatus.paymentIntentId || '',
      amount: refundAmount,
      reason: 'requested_by_customer'
    });

    if (!refundResult.success) {
      return {
        success: false,
        message: refundResult.message || 'Refund processing failed'
      };
    }

    // Update event with refund status
    const updatedEvent = { ...event };
    const paymentStatusIndex = updatedEvent.paymentStatuses?.findIndex(
      status => status.userId === userId && status.status === 'paid'
    );

    if (paymentStatusIndex !== undefined && paymentStatusIndex >= 0 && updatedEvent.paymentStatuses) {
      updatedEvent.paymentStatuses[paymentStatusIndex].status = 'refunded';
      updatedEvent.paymentStatuses[paymentStatusIndex].refundDate = new Date().toISOString();
    }

    // Save the updated event
    await updateEvent(eventId, updatedEvent);

    return {
      success: true,
      message: 'Refund processed successfully',
      refundId: refundResult.refundId
    };
  } catch (error) {
    console.error('Error processing event refund:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'An unexpected error occurred during refund'
    };
  }
}

/**
 * Get payment status for a user's event registration
 * @param eventId ID of the event
 * @param userId ID of the user
 * @returns Payment status information or null if not found
 */
export async function getEventPaymentStatus(
  eventId: string,
  userId: string
): Promise<{ 
  status: 'none' | 'pending' | 'paid' | 'refunded' | 'failed';
  amount?: number;
  paymentDate?: string;
  refundDate?: string;
} | null> {
  try {
    // Get event
    const event = await getEventById(eventId);
    if (!event || !event.isPaid) {
      return { status: 'none' };
    }

    // Find payment status for this user
    const paymentStatus = event.paymentStatuses?.find(status => status.userId === userId);
    
    if (!paymentStatus) {
      return { status: 'none' };
    }

    return {
      status: paymentStatus.status,
      amount: paymentStatus.amount,
      paymentDate: paymentStatus.paymentDate,
      refundDate: paymentStatus.refundDate
    };
  } catch (error) {
    console.error('Error getting event payment status:', error);
    return null;
  }
}
