// Mock implementation for testing
import { PrismaClient } from '@prisma/client';

// Create a type that extends PrismaClient but ensures notification exists
type ExtendedPrismaClient = PrismaClient & {
  notification: {
    findMany: (args: any) => Promise<any[]>;
    count: (args: any) => Promise<number>;
    updateMany: (args: any) => Promise<any>;
  };
};

// Initialize Prisma client
const prismaBase = new PrismaClient();

// Create the extended client
const prisma = prismaBase as ExtendedPrismaClient;

// Export the client
export { prisma };
export default prisma; 