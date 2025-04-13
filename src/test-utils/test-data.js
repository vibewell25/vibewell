/**
 * Test data utilities
 * 
 * This file contains test data for various components and features.
 * Use these fixtures in tests to ensure consistent test data.
 */

/**
 * Test user data
 */
export const testUsers = {
  standard: {
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
    preferences: {
      theme: 'light',
      notifications: true,
      language: 'en',
    },
    createdAt: '2023-01-01T00:00:00.000Z',
  },
  admin: {
    id: 'admin-1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    preferences: {
      theme: 'dark',
      notifications: true,
      language: 'en',
    },
    createdAt: '2023-01-01T00:00:00.000Z',
  },
  provider: {
    id: 'provider-1',
    name: 'Provider User',
    email: 'provider@example.com',
    role: 'provider',
    preferences: {
      theme: 'light',
      notifications: true,
      language: 'en',
    },
    specialties: ['yoga', 'meditation'],
    createdAt: '2023-01-01T00:00:00.000Z',
  },
};

/**
 * Test booking data
 */
export const testBookings = {
  upcoming: {
    id: 'booking-1',
    userId: 'user-1',
    providerId: 'provider-1',
    serviceId: 'service-1',
    status: 'confirmed',
    startTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    endTime: new Date(Date.now() + 86400000 + 3600000).toISOString(), // Tomorrow + 1 hour
    createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
  },
  past: {
    id: 'booking-2',
    userId: 'user-1',
    providerId: 'provider-1',
    serviceId: 'service-1',
    status: 'completed',
    startTime: new Date(Date.now() - 86400000 * 7).toISOString(), // 7 days ago
    endTime: new Date(Date.now() - 86400000 * 7 + 3600000).toISOString(), // 7 days ago + 1 hour
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(), // 10 days ago
  },
  cancelled: {
    id: 'booking-3',
    userId: 'user-1',
    providerId: 'provider-1',
    serviceId: 'service-1',
    status: 'cancelled',
    startTime: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days from now
    endTime: new Date(Date.now() + 86400000 * 3 + 3600000).toISOString(), // 3 days from now + 1 hour
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    cancelledAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  },
};

/**
 * Test service data
 */
export const testServices = {
  yoga: {
    id: 'service-1',
    providerId: 'provider-1',
    name: 'Yoga Session',
    description: 'A relaxing yoga session for all levels',
    price: 50,
    duration: 60, // minutes
    category: 'wellness',
    tags: ['yoga', 'relaxation', 'wellness'],
    availabilitySchedule: {
      monday: [{ start: '09:00', end: '17:00' }],
      tuesday: [{ start: '09:00', end: '17:00' }],
      wednesday: [{ start: '09:00', end: '17:00' }],
      thursday: [{ start: '09:00', end: '17:00' }],
      friday: [{ start: '09:00', end: '17:00' }],
      saturday: [],
      sunday: [],
    },
  },
  massage: {
    id: 'service-2',
    providerId: 'provider-1',
    name: 'Massage Therapy',
    description: 'Professional massage therapy for relaxation and recovery',
    price: 80,
    duration: 90, // minutes
    category: 'wellness',
    tags: ['massage', 'therapy', 'relaxation'],
    availabilitySchedule: {
      monday: [{ start: '10:00', end: '18:00' }],
      tuesday: [{ start: '10:00', end: '18:00' }],
      wednesday: [{ start: '10:00', end: '18:00' }],
      thursday: [{ start: '10:00', end: '18:00' }],
      friday: [{ start: '10:00', end: '18:00' }],
      saturday: [{ start: '10:00', end: '14:00' }],
      sunday: [],
    },
  },
};

/**
 * Test notification data
 */
export const testNotifications = {
  booking: {
    id: 'notification-1',
    userId: 'user-1',
    type: 'booking_confirmation',
    title: 'Booking Confirmed',
    message: 'Your booking for Yoga Session has been confirmed.',
    read: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
  },
  reminder: {
    id: 'notification-2',
    userId: 'user-1',
    type: 'booking_reminder',
    title: 'Upcoming Booking',
    message: 'Reminder: You have a Yoga Session tomorrow at 10:00 AM.',
    read: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  },
  system: {
    id: 'notification-3',
    userId: 'user-1',
    type: 'system',
    title: 'System Maintenance',
    message: 'The system will be undergoing maintenance on Saturday night.',
    read: false,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
  },
};

/**
 * Test review data
 */
export const testReviews = {
  positive: {
    id: 'review-1',
    userId: 'user-1',
    providerId: 'provider-1',
    serviceId: 'service-1',
    bookingId: 'booking-2',
    rating: 5,
    title: 'Excellent service',
    comment: 'I had a wonderful experience. The instructor was very knowledgeable and attentive.',
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(), // 6 days ago
  },
  neutral: {
    id: 'review-2',
    userId: 'user-2',
    providerId: 'provider-1',
    serviceId: 'service-1',
    bookingId: 'booking-4',
    rating: 3,
    title: 'Okay service',
    comment: 'The service was okay, but I expected more personalized attention.',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(), // 10 days ago
  },
  negative: {
    id: 'review-3',
    userId: 'user-3',
    providerId: 'provider-1',
    serviceId: 'service-1',
    bookingId: 'booking-5',
    rating: 1,
    title: 'Disappointing',
    comment: 'The session was not what I expected and the facilities were not clean.',
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(), // 15 days ago
  },
};

/**
 * Test payment data
 */
export const testPayments = {
  successful: {
    id: 'payment-1',
    userId: 'user-1',
    bookingId: 'booking-1',
    amount: 50,
    currency: 'USD',
    status: 'succeeded',
    paymentMethod: 'card',
    paymentMethodDetails: {
      card: {
        brand: 'visa',
        last4: '4242',
        expiryMonth: 12,
        expiryYear: 2024,
      },
    },
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  },
  failed: {
    id: 'payment-2',
    userId: 'user-1',
    bookingId: 'booking-3',
    amount: 80,
    currency: 'USD',
    status: 'failed',
    paymentMethod: 'card',
    paymentMethodDetails: {
      card: {
        brand: 'visa',
        last4: '0341',
        expiryMonth: 12,
        expiryYear: 2024,
      },
    },
    error: {
      code: 'card_declined',
      message: 'Your card was declined.',
    },
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
  },
};

/**
 * Test form data for validation testing
 */
export const testFormData = {
  login: {
    valid: {
      email: 'test@example.com',
      password: 'Password123!',
    },
    invalid: {
      email: 'notanemail',
      password: 'short',
    },
  },
  registration: {
    valid: {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'SecurePassword123!',
      confirmPassword: 'SecurePassword123!',
      agreeToTerms: true,
    },
    invalid: {
      name: 'Jo',
      email: 'notanemail',
      password: 'weak',
      confirmPassword: 'nomatch',
      agreeToTerms: false,
    },
  },
  booking: {
    valid: {
      date: '2023-12-25',
      time: '10:00',
      notes: 'Looking forward to the session!',
    },
    invalid: {
      date: '',
      time: '',
      notes: 'A'.repeat(1001), // Too long
    },
  },
};

/**
 * Test AR model data
 */
export const testArModels = {
  furniture: {
    id: 'model-1',
    name: 'Modern Sofa',
    category: 'furniture',
    modelUrl: '/models/sofa.glb',
    previewImageUrl: '/images/sofa-preview.jpg',
    scale: { x: 1, y: 1, z: 1 },
    rotation: { x: 0, y: 0, z: 0 },
    position: { x: 0, y: 0, z: 0 },
  },
  beauty: {
    id: 'model-2',
    name: 'Lipstick',
    category: 'beauty',
    modelUrl: '/models/lipstick.glb',
    previewImageUrl: '/images/lipstick-preview.jpg',
    scale: { x: 0.5, y: 0.5, z: 0.5 },
    rotation: { x: 0, y: 0, z: 0 },
    position: { x: 0, y: 0, z: 0 },
  },
}; 