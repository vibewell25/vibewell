export type EventCategory =
  | 'Wellness'
  | 'Fitness'
  | 'Meditation'
  | 'Nutrition'
  | 'Yoga'
  | 'Mental Health'
  | 'Community'
  | 'Workshop'
  | 'Webinar'
  | 'Other';

export interface EventLocation {
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  virtual: boolean;
  meetingUrl?: string;
}

export interface EventOrganizer {
  id: string;
  name: string;
  avatar?: string;
  isVerified?: boolean;
}

export interface EventParticipant {
  id: string;
  name: string;
  avatar?: string | undefined;
  registeredAt: string;
  status: 'registered' | 'attended' | 'cancelled';
}

export interface EventComment {
  id: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  createdAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  imageUrl: string;
  category: EventCategory;
  startDate: string;
  endDate: string;
  location: {
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    virtual: boolean;
    meetingUrl?: string;
  };
  organizer: {
    id: string;
    name: string;
    avatar: string;
    isVerified: boolean;
  };
  capacity: number;
  participantsCount: number;
  isFeatured: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  // Participants list
  participants?: EventParticipant[];
  // Comments 
  comments?: EventComment[];
  // New fields for recurring events
  isRecurring?: boolean;
  recurrencePattern?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    daysOfWeek?: number[]; // For weekly recurrence
    dayOfMonth?: number; // For monthly recurrence
    monthOfYear?: number; // For yearly recurrence
    endDate?: string; // Optional end date for recurrence
    occurrences?: number; // Optional number of occurrences
  };
  // New fields for waitlist
  waitlistEnabled?: boolean;
  waitlistCapacity?: number;
  waitlistCount?: number;
  waitlistParticipants?: {
    userId: string;
    name: string;
    avatar: string;
    joinedAt: string;
    status: 'pending' | 'notified' | 'confirmed';
  }[];
  // New fields for event series
  seriesId?: string;
  seriesTitle?: string;
  seriesOrder?: number;
  // New fields for event materials
  materials?: {
    id: string;
    title: string;
    type: 'document' | 'video' | 'link' | 'image';
    url: string;
    description?: string;
    createdAt: string;
  }[];
  // New fields for event agenda
  agenda?: {
    id: string;
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
    speaker?: {
      name: string;
      title?: string;
      avatar?: string;
    };
  }[];
  // New fields for event feedback
  feedbackEnabled?: boolean;
  averageRating?: number;
  ratingCount?: number;
  feedback?: {
    userId: string;
    rating: number;
    comment: string;
    submittedAt: string;
  }[];
  // New fields for event check-in
  checkInEnabled?: boolean;
  checkInCode?: string;
  checkedInParticipants?: {
    userId: string;
    name: string;
    avatar: string;
    checkedInAt: string;
  }[];
  // New fields for event groups
  groupId?: string;
  groupName?: string;
  // New fields for event chat
  chatEnabled?: boolean;
  chatId?: string;
  // New fields for event photos
  photoGalleryEnabled?: boolean;
  photos?: {
    id: string;
    url: string;
    uploadedBy: {
      userId: string;
      name: string;
      avatar: string;
    };
    uploadedAt: string;
    caption?: string;
  }[];
  // New fields for event networking
  networkingEnabled?: boolean;
  networkingPreferences?: {
    matchBy: ('interests' | 'skills' | 'location')[];
    maxMatches?: number;
  };
  // New fields for event badges
  badges?: {
    id: string;
    name: string;
    description: string;
    image: string;
    criteria: string;
    awardedTo: string[];
  }[];
  // New fields for event analytics
  analytics?: {
    views: number;
    uniqueViews: number;
    shares: number;
    registrations: number;
    checkIns: number;
    engagementScore: number;
    revenue?: number;
    averageRating?: number;
    feedbackCount?: number;
  };
  // New fields for event integrations
  integrations?: {
    calendar?: {
      googleCalendarId?: string;
      outlookCalendarId?: string;
      appleCalendarId?: string;
    };
    video?: {
      provider: 'zoom' | 'teams' | 'google-meet';
      meetingId?: string;
      password?: string;
    };
    payment?: {
      provider: 'stripe' | 'paypal';
      productId?: string;
      priceId?: string;
    };
    email?: {
      templateId?: string;
      campaignId?: string;
    };
    social?: {
      facebookEventId?: string;
      linkedinEventId?: string;
      twitterEventId?: string;
    };
  };
  // New fields for event payment
  isPaid?: boolean;
  price?: number;
  currency?: string;
  earlyBirdPrice?: number;
  earlyBirdEndDate?: string;
  refundPolicy?: {
    allowedUntil: string; // ISO date string
    percentageToRefund: number; // e.g., 100 for full refund, 50 for 50% refund
    description?: string;
  };
  paymentStatuses?: {
    userId: string;
    status: 'pending' | 'paid' | 'refunded' | 'failed';
    amount: number;
    paymentIntentId?: string;
    paymentDate?: string;
    refundDate?: string;
  }[];
}
