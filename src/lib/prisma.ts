import { PrismaClient } from '@prisma/client';

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

declare global {
  var prisma: PrismaClient | undefined;
}

const prismaGlobal = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prismaGlobal;
}

export const prisma = prismaGlobal;
export default prisma; 