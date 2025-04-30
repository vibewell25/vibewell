/**
 * Prisma client singleton
 * This ensures we only create one instance of PrismaClient
 */

import { PrismaClient } from "@prisma/client";

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
  var prisma: PrismaClient | undefined;
}

// Create a singleton PrismaClient instance
// In development, this prevents multiple instances during hot-reloading
export const prisma = globalThis.prisma || new PrismaClient();

// Store prisma in global object in development to prevent multiple instances
if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}

// Export as default
export default prisma;
