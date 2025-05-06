/**
 * Prisma client singleton for database access
 */

// Mock User model
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

// Mock Business model
export interface Business {
  id: string;
  name: string;
  ownerId: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Mock Booking model
export interface Booking {
  id: string;
  userId: string;
  businessId: string;
  serviceId: string;
  startTime: Date;
  endTime: Date;
  status: 'pending' | 'confirmed' | 'canceled' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

// Mock Service model
export interface Service {
  id: string;
  businessId: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}

// Mock PrismaClient with basic CRUD operations
export const prisma = {
  user: {
    findUnique: async ({ where }: { where: { id?: string; email?: string } }) => {
      console.log(`Finding user with criteria: ${JSON.stringify(where)}`);
      return {
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
        createdAt: new Date(),
        updatedAt: new Date()
      };
    },
    findMany: async () => {
      return [
        {
          id: 'user-1',
          name: 'Test User',
          email: 'test@example.com',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
    },
    create: async ({ data }: { data: Partial<User> }) => {
      return {
        id: 'user-2',
        name: data.name || 'New User',
        email: data.email || 'new@example.com',
        createdAt: new Date(),
        updatedAt: new Date()
      };
    },
    update: async ({ where, data }: { where: { id: string }; data: Partial<User> }) => {
      return {
        id: where.id,
        name: data.name || 'Updated User',
        email: data.email || 'updated@example.com',
        createdAt: new Date(),
        updatedAt: new Date()
      };
    },
    delete: async ({ where }: { where: { id: string } }) => {
      return {
        id: where.id,
        name: 'Deleted User',
        email: 'deleted@example.com',
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
  },
  business: {
    findUnique: async ({ where }: { where: { id?: string; ownerId?: string } }) => {
      console.log(`Finding business with criteria: ${JSON.stringify(where)}`);
      return {
        id: 'business-1',
        name: 'Test Business',
        ownerId: 'user-1',
        address: '123 Test St',
        phone: '123-456-7890',
        email: 'business@example.com',
        website: 'https://example.com',
        createdAt: new Date(),
        updatedAt: new Date()
      };
    },
    findMany: async () => {
      return [
        {
          id: 'business-1',
          name: 'Test Business',
          ownerId: 'user-1',
          address: '123 Test St',
          phone: '123-456-7890',
          email: 'business@example.com',
          website: 'https://example.com',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
    },
    create: async ({ data }: { data: Partial<Business> }) => {
      return {
        id: 'business-2',
        name: data.name || 'New Business',
        ownerId: data.ownerId || 'user-1',
        address: data.address || '456 New St',
        phone: data.phone || '555-555-5555',
        email: data.email || 'new-business@example.com',
        website: data.website,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
  },
  booking: {
    findUnique: async ({ where }: { where: { id?: string } }) => {
      console.log(`Finding booking with criteria: ${JSON.stringify(where)}`);
      return {
        id: 'booking-1',
        userId: 'user-1',
        businessId: 'business-1',
        serviceId: 'service-1',
        startTime: new Date(),
        endTime: new Date(Date.now() + 3600000),
        status: 'confirmed',
        createdAt: new Date(),
        updatedAt: new Date()
      };
    },
    findMany: async ({ where }: { where?: { userId?: string; businessId?: string } } = {}) => {
      if (where) {
        console.log(`Finding bookings with criteria: ${JSON.stringify(where)}`);
      }
      
      return [
        {
          id: 'booking-1',
          userId: 'user-1',
          businessId: 'business-1',
          serviceId: 'service-1',
          startTime: new Date(),
          endTime: new Date(Date.now() + 3600000),
          status: 'confirmed',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
    },
    create: async ({ data }: { data: Partial<Booking> }) => {
      return {
        id: 'booking-2',
        userId: data.userId || 'user-1',
        businessId: data.businessId || 'business-1',
        serviceId: data.serviceId || 'service-1',
        startTime: data.startTime || new Date(),
        endTime: data.endTime || new Date(Date.now() + 3600000),
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };
    },
    update: async ({ where, data }: { where: { id: string }; data: Partial<Booking> }) => {
      return {
        id: where.id,
        userId: 'user-1',
        businessId: 'business-1',
        serviceId: 'service-1',
        startTime: data.startTime || new Date(),
        endTime: data.endTime || new Date(Date.now() + 3600000),
        status: data.status || 'confirmed',
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
  },
  service: {
    findMany: async ({ where }: { where?: { businessId?: string } } = {}) => {
      if (where) {
        console.log(`Finding services with criteria: ${JSON.stringify(where)}`);
      }
      
      return [
        {
          id: 'service-1',
          businessId: 'business-1',
          name: 'Test Service',
          description: 'A test service',
          duration: 60,
          price: 100,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
    }
  }
};

export default prisma; 