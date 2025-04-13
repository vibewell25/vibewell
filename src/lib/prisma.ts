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
};

// Create a properly typed PrismaClient
const PrismaClientWithModels = PrismaClient as {
  new(options?: Prisma.PrismaClientOptions): PrismaClient & PrismaModels;
};

// Define a global variable for PrismaClient to avoid multiple instances in development
declare global {
  var prisma: (PrismaClient & PrismaModels) | undefined;
}

// Instantiate PrismaClient if it doesn't exist on the global object
// This is to prevent hot reloading from creating new clients
const prisma = global.prisma || new PrismaClientWithModels({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Save PrismaClient to the global object in development to prevent multiple instances
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export { prisma };
export default prisma; 