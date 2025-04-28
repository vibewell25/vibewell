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
export {};

// Create a mock service
export {};

// Create a mock booking
export {};

// Create a mock review
export {};

// Create a mock payment intent
export {};

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
