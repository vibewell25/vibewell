import { PrismaClient } from '@prisma/client';

declare global {
  // Allow global `prisma` in development
  var prisma: PrismaClient | undefined;
}

declare module 'uuid' {
  export function v4(): string;
}
