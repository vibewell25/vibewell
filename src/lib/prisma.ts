/**
 * Prisma client singleton
 * This ensures we only create one instance of PrismaClient
 */

import { PrismaClient, Prisma } from '@prisma/client';

// Define Prisma model types based on the schema
type PrismaModels = {
  user: any;
  account: any;
  session: any;
  content: any;
  contentProgress: any;
  beautyService: any;
  serviceBooking: any;
  serviceReview: any;
  booking: any;
  tip: any;
  business: any;
  loyaltyTransaction: any;
  notification: any;
  userPreference: any;
};

// Add prisma to the global type
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Create a singleton PrismaClient instance
// In development, this prevents multiple instances during hot-reloading
export const prisma =
  global.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

// Store prisma in global object in development to prevent multiple instances
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// Export as default
export default prisma;
