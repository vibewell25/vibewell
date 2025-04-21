import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

// Mock PrismaClient with jest-mock-extended
export const prisma = mockDeep<PrismaClient>();

// Re-export MockPrisma type
export type MockPrisma = DeepMockProxy<PrismaClient>;

// Reset all mocks between tests
beforeEach(() => {
  mockReset(prisma);
});

// Mock the Prisma module
jest.mock('@/lib/database/client', () => ({
  prisma,
}));

/**
 * Helper functions to create common mock data
 */

// Create a mock user
export const createMockUser = (overrides = {}) => ({
  id: 'user-id-123',
  email: 'test@example.com',
  name: 'Test User',
  role: 'USER',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

// Create a mock service
export const createMockService = (overrides = {}) => ({
  id: 'service-id-123',
  name: 'Test Service',
  description: 'A test service',
  price: 99.99,
  duration: 60,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

// Create a mock booking
export const createMockBooking = (overrides = {}) => ({
  id: 'booking-id-123',
  userId: 'user-id-123',
  providerId: 'provider-id-123',
  serviceId: 'service-id-123',
  date: new Date(),
  time: '14:00',
  status: 'PENDING',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

// Create a mock review
export const createMockReview = (overrides = {}) => ({
  id: 'review-id-123',
  userId: 'user-id-123',
  serviceId: 'service-id-123',
  bookingId: 'booking-id-123',
  rating: 5,
  comment: 'Great service!',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

// Create a mock payment intent
export const createMockPaymentIntent = (overrides = {}) => ({
  id: 'pi_123456789',
  userId: 'user-id-123',
  amount: 9999,
  currency: 'usd',
  status: 'succeeded',
  bookingId: 'booking-id-123',
  serviceId: 'service-id-123',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

/**
 * Example usage in tests:
 *
 * ```typescript
 * import { prisma, createMockUser } from '@/tests/setup/prisma-mock';
 *
 * describe('User service', () => {
 *   it('should get user by id', async () => {
 *     const mockUser = createMockUser();
 *     prisma.user.findUnique.mockResolvedValue(mockUser);
 *
 *     const userService = new UserService();
 *     const user = await userService.getUserById('user-id-123');
 *
 *     expect(user).toEqual(mockUser);
 *     expect(prisma.user.findUnique).toHaveBeenCalledWith({
 *       where: { id: 'user-id-123' }
 *     });
 *   });
 * });
 * ```
 */
