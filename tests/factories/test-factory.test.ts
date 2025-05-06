import { TestFactory } from './test-factory';

describe('TestFactory', () => {
  beforeEach(() => {
    TestFactory.reset();
  });

  describe('User Creation', () => {
    it('should create a user with default values', () => {
      const user = TestFactory.createUser();
      
      expect(user).toEqual(expect.objectContaining({
        id: 'user_1',
        email: 'test2@example.com',
        name: 'Test User 2',
        role: 'client',
        preferences: expect.objectContaining({
          notifications: true,
          language: 'en'
        })
      }));
    });

    it('should create a user with custom overrides', () => {
      const user = TestFactory.createUser({
        role: 'provider',
        preferences: { notifications: false, language: 'es' }
      });

      expect(user.role).toBe('provider');
      expect(user.preferences.notifications).toBe(false);
      expect(user.preferences.language).toBe('es');
    });

    it('should create multiple users', () => {
      const users = TestFactory.createManyUsers(3);

      expect(users).toHaveLength(3);
      expect(users[0].id).toBe('user_1');
      expect(users[1].id).toBe('user_2');
      expect(users[2].id).toBe('user_3');
    });
  });

  describe('Service Creation', () => {
    it('should create a service with default values', () => {
      const service = TestFactory.createService();

      expect(service).toEqual(expect.objectContaining({
        id: 1,
        name: expect.any(String),
        duration: expect.any(Number),
        price: expect.any(Number),
        description: expect.any(String),
        category: expect.any(String),
        available: true
      }));
    });

    it('should create a service with custom overrides', () => {
      const service = TestFactory.createService({
        name: 'Custom Service',
        price: 75.00,
        category: 'premium'
      });

      expect(service.name).toBe('Custom Service');
      expect(service.price).toBe(75.00);
      expect(service.category).toBe('premium');
    });
  });

  describe('Booking Creation', () => {
    it('should create a booking with default values', () => {
      const booking = TestFactory.createBooking();

      expect(booking).toEqual(expect.objectContaining({
        id: expect.stringMatching(/^booking_/),
        serviceId: expect.any(Number),
        userId: expect.any(String),
        date: expect.any(String),
        status: expect.stringMatching(/^(confirmed|pending|cancelled)$/)
      }));
    });

    it('should create a booking with custom overrides', () => {
      const customDate = '2024-12-25T10:00:00Z';
      const booking = TestFactory.createBooking({
        status: 'confirmed',
        date: customDate,
        notes: 'Special holiday booking'
      });

      expect(booking.status).toBe('confirmed');
      expect(booking.date).toBe(customDate);
      expect(booking.notes).toBe('Special holiday booking');
    });
  });

  describe('Complex Scenarios', () => {
    it('should create a provider with services', () => {
      const { provider, services } = TestFactory.createProviderWithServices(2);

      expect(provider.role).toBe('provider');
      expect(services).toHaveLength(2);
      services.forEach(service => {
        expect(service.available).toBe(true);
      });
    });

    it('should create a client with bookings', () => {
      const { client, bookings } = TestFactory.createClientWithBookings(3);

      expect(client.role).toBe('client');
      expect(bookings).toHaveLength(3);
      bookings.forEach(booking => {
        expect(booking.userId).toBe(client.id);
      });
    });
  });

  describe('Counter Reset', () => {
    it('should reset counters correctly', () => {
      TestFactory.createUser();
      TestFactory.createService();
      TestFactory.createBooking();
      TestFactory.reset();

      const user = TestFactory.createUser();
      const service = TestFactory.createService();
      const booking = TestFactory.createBooking();

      expect(user.id).toBe('user_1');
      expect(service.id).toBe(1);
      expect(booking.id).toBe('booking_1');
    });
  });
});
