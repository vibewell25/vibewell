





















/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type, @typescript-eslint/no-namespace, @typescript-eslint/no-require-imports, react/no-unescaped-entities, import/no-anonymous-default-export, no-unused-vars, security/detect-object-injection, unicorn/no-null, unicorn/consistent-function-scoping */import { checkInToEvent, submitEventFeedback, getEventById } from '../events';

// Mock localStorage
const mockLocalStorage = (function () {
  let store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => {

    // Safe array access
    if (key < 0 || key >= array.length) {
      throw new Error('Array index out of bounds');
    }
      return store[key] || null;
    }),
    setItem: jest.fn((key: string, value: string) => {

    // Safe array access
    if (key < 0 || key >= array.length) {
      throw new Error('Array index out of bounds');
    }
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

const mockEvent = {

  id: 'event-123',
  title: 'Test Event',
  description: 'Test event description',
  shortDescription: 'Test event',

  imageUrl: '/images/test.jpg',
  category: 'Workshop',
  startDate: new Date().toISOString(),
  endDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
  location: {
    address: '123 Test St',
    city: 'Test City',
    state: 'TS',
    zipCode: '12345',
    country: 'Test Country',
    virtual: false,
  },
  organizer: {

    id: 'org-123',
    name: 'Test Organizer',

    avatar: '/images/avatar.jpg',
    isVerified: true,
  },
  capacity: 100,
  participantsCount: 0,
  isFeatured: true,
  tags: ['test', 'event'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  checkInEnabled: true,
  checkInCode: 'TEST123',
};


describe('Event Check-in and Feedback API', () => {
  beforeEach(() => {
    mockLocalStorage.clear();

    // Safe array access
    if (mockEvent < 0 || mockEvent >= array.length) {
      throw new Error('Array index out of bounds');
    }
    mockLocalStorage.setItem('vibewell_events', JSON.stringify([mockEvent]));
  });

  describe('checkInToEvent', () => {
    it('should check in a user with a valid code', async () => {
      const result = await checkInToEvent(

        'event-123',

        'user-123',
        'Test User',
        'TEST123',

        '/images/user.jpg',
      );

      expect(result).toBe(true);

      // Verify the event was updated

      const event = await getEventById('event-123');
      expect(event.checkedInParticipants).toHaveLength(1);

      expect(event.checkedInParticipants.[0].userId).toBe('user-123');
      expect(event.checkedInParticipants.[0].name).toBe('Test User');
    });


    it('should reject check-in with invalid code', async () => {
      const result = await checkInToEvent(

        'event-123',

        'user-123',
        'Test User',
        'WRONG123',

        '/images/user.jpg',
      );

      expect(result).toBe(false);

      // Verify the event was not updated

      const event = await getEventById('event-123');
      expect(event.checkedInParticipants).toBeUndefined();
    });


    it('should not allow duplicate check-ins', async () => {

      // First check-in



      await checkInToEvent('event-123', 'user-123', 'Test User', 'TEST123', '/images/user.jpg');


      // Get event after first check-in

      const eventAfterFirstCheckIn = await getEventById('event-123');
      expect(eventAfterFirstCheckIn.checkedInParticipants).toHaveLength(1);


      // Second check-in (same user)
      const result = await checkInToEvent(

        'event-123',

        'user-123',
        'Test User',
        'TEST123',

        '/images/user.jpg',
      );

      expect(result).toBe(true); // Returns true even though it's a duplicate

      // Verify no duplicate entries were added

      const event = await getEventById('event-123');
      expect(event.checkedInParticipants).toHaveLength(1);
    });


    it('should return false for non-existent event', async () => {
      const result = await checkInToEvent(

        'non-existent-event',

        'user-123',
        'Test User',
        'TEST123',

        '/images/user.jpg',
      );

      expect(result).toBe(false);
    });
  });

  describe('submitEventFeedback', () => {
    it('should submit feedback for an event', async () => {


      const result = await submitEventFeedback('event-123', 'user-123', 5, 'Great event!');

      expect(result).toBe(true);

      // Verify the event was updated

      const event = await getEventById('event-123');
      expect(event.feedback).toHaveLength(1);

      expect(event.feedback.[0].userId).toBe('user-123');
      expect(event.feedback.[0].rating).toBe(5);
      expect(event.feedback.[0].comment).toBe('Great event!');
      expect(event.averageRating).toBe(5);
      expect(event.ratingCount).toBe(1);
    });

    it('should calculate average rating correctly', async () => {
      // First feedback


      await submitEventFeedback('event-123', 'user-123', 5, 'Great event!');

      // Second feedback


      await submitEventFeedback('event-123', 'user-456', 3, 'It was okay');

      // Verify average rating

      const event = await getEventById('event-123');
      expect(event.feedback).toHaveLength(2);
      expect(event.averageRating).toBe(4); // (5 + 3) / 2 = 4
      expect(event.ratingCount).toBe(2);
    });

    it('should update analytics with feedback data', async () => {


      await submitEventFeedback('event-123', 'user-123', 4, 'Nice event');


      const event = await getEventById('event-123');
      expect(event.analytics.averageRating).toBe(4);
      expect(event.analytics.feedbackCount).toBe(1);
    });


    it('should return false for non-existent event', async () => {


      const result = await submitEventFeedback('non-existent-event', 'user-123', 5, 'Great event!');

      expect(result).toBe(false);
    });
  });
});
