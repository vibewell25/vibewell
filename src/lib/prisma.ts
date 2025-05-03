/**
 * Prisma client singleton
 * This ensures we only create one instance of PrismaClient
 */
import { PrismaClient } from "@prisma/client";

// Add prisma to the global type
declare global {
  var prisma: PrismaClient | undefined;
}

// Create a singleton PrismaClient instance
// In development, this prevents multiple instances during hot-reloading
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
  });
};

// Store prisma in global object in development to prevent multiple instances
export const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}

export default prisma;
