/**
 * Mock Prisma Client for testing
 */
export const prisma = {
  user: {
    findUnique: async (args: any) => {
      // Mock user data for testing
      if (args.where?.id === 'test-user-id') {
        return {
          id: 'test-user-id',
          email: 'test@example.com',
          name: 'Test User',
          twoFactorSecret: 'test-secret',
          twoFactorEnabled: true,
          credentials: []
        };
      }
      return null;
    },
    update: async (args: any) => {
      // Return the data that would be updated
      return {
        ...args.where,
        ...args.data
      };
    },
    create: async (args: any) => {
      return {
        id: 'new-user-id',
        ...args.data
      };
    }
  },
  booking: {
    findFirst: async (args: any) => {
      if (args.where?.id === 'test-booking-id' && args.where?.userId === 'test-user-id') {
        return {
          id: 'test-booking-id',
          userId: 'test-user-id',
          businessId: 'test-business-id',
          status: 'CONFIRMED',
          startTime: new Date('2024-03-20T10:00:00Z'),
          endTime: new Date('2024-03-20T11:00:00Z')
        };
      }
      return null;
    },
    findUnique: async (args: any) => {
      if (args.where?.id === 'test-booking-id') {
        return {
          id: 'test-booking-id',
          userId: 'test-user-id',
          businessId: 'test-business-id',
          status: 'CONFIRMED',
          startTime: new Date('2024-03-20T10:00:00Z'),
          endTime: new Date('2024-03-20T11:00:00Z')
        };
      }
      return null;
    },
    update: async (args: any) => {
      return {
        ...args.where,
        ...args.data
      };
    },
    create: async (args: any) => {
      return {
        id: 'new-booking-id',
        ...args.data
      };
    }
  },
  serviceBooking: {
    updateMany: async (args: any) => {
      return { count: 1 };
    }
  },
  payment: {
    findFirst: async (args: any) => {
      if (args.where?.idempotencyKey === 'test-key') {
        return {
          id: 'test-payment-id',
          amount: 100,
          currency: 'USD',
          status: 'COMPLETED',
          bookingId: 'test-booking-id',
          businessId: 'test-business-id'
        };
      }
      return null;
    },
    findUnique: async (args: any) => {
      if (args.where?.id === 'test-payment-id') {
        return {
          id: 'test-payment-id',
          amount: 100,
          currency: 'USD',
          status: 'COMPLETED',
          bookingId: 'test-booking-id',
          businessId: 'test-business-id'
        };
      }
      return null;
    },
    create: async (args: any) => {
      return {
        id: 'new-payment-id',
        ...args.data
      };
    },
    update: async (args: any) => {
      return {
        ...args.where,
        ...args.data
      };
    }
  },
  $transaction: async (callback: any) => {
    return callback(prisma);
  }
}; 