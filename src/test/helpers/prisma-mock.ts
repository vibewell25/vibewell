/**
 * Prisma Mock Helper
 * 
 * This utility provides standardized mocking for Prisma models to use in tests.
 * It creates mock implementations for all standard Prisma operations.
 */

import { PrismaClient } from '@prisma/client';

/**
 * Creates a mock implementation for a Prisma model
 */
export function createMockPrismaModel() {
  return {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    upsert: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    updateMany: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
    groupBy: jest.fn()
  };
}

/**
 * Creates a complete mock Prisma client with all models
 */
export const mockPrismaClient = {
  user: createMockPrismaModel(),
  profile: createMockPrismaModel(),
  booking: createMockPrismaModel(),
  service: createMockPrismaModel(),
  serviceProvider: createMockPrismaModel(),
  payment: createMockPrismaModel(),
  refund: createMockPrismaModel(),
  conversation: createMockPrismaModel(),
  message: createMockPrismaModel(),
  notification: createMockPrismaModel(),
  aRSetting: createMockPrismaModel(),
  preference: createMockPrismaModel(),
  product: createMockPrismaModel(),
  review: createMockPrismaModel(),
  availability: createMockPrismaModel(),
  subscription: createMockPrismaModel(),
  $transaction: jest.fn((operations) => Promise.all(operations)),
  $connect: jest.fn(),
  $disconnect: jest.fn(),
  $use: jest.fn(),
  $on: jest.fn()
};

/**
 * Mock Prisma for tests
 * @param customMocks - Optional custom implementations for specific models/methods
 * @returns A mock Prisma client instance
 */
export function mockPrisma(customMocks = {}) {
  // Create a deep clone of the mock client to avoid test interference
  const prismaClone = JSON.parse(JSON.stringify(mockPrismaClient));
  
  // Apply custom mocks
  Object.entries(customMocks).forEach(([model, methods]) => {
    if (!prismaClone[model]) {
      prismaClone[model] = createMockPrismaModel();
    }
    
    Object.entries(methods).forEach(([method, implementation]) => {
      prismaClone[model][method] = implementation;
    });
  });
  
  return prismaClone as jest.Mocked<PrismaClient>;
}

/**
 * Reset all mock implementations
 */
export function resetPrismaMocks() {
  Object.values(mockPrismaClient).forEach((model) => {
    if (typeof model === 'object' && model !== null) {
      Object.values(model).forEach((method) => {
        if (typeof method === 'function' && 'mockReset' in method) {
          method.mockReset();
        }
      });
    }
  });
}

/**
 * Helper to mock a successful database transaction
 * @param results The results to return from the transaction
 */
export function mockSuccessfulTransaction(results: any[]) {
  mockPrismaClient.$transaction.mockImplementation(async () => results);
}

/**
 * Helper to mock a failed database transaction
 * @param error The error to throw
 */
export function mockFailedTransaction(error: Error) {
  mockPrismaClient.$transaction.mockImplementation(() => {
    throw error;
  });
} 