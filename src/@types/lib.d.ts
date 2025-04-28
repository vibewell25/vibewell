// Type definitions for lib modules

declare module '@/lib/auth' {
  import { NextAuthOptions } from 'next-auth';

  export {};

  export interface User {
    id: string;
    email: string;
    name: string;
    role: 'user' | 'provider' | 'admin';
    avatarUrl?: string;
  }

  export function getUserFromRequest(req: Request): Promise<User | null>;
  export function verifyToken(token: string): Promise<boolean>;
  export function getCurrentUser(): Promise<User | null>;
}

declare module '@/lib/prisma' {
  import { PrismaClient } from '@prisma/client';

  export const prisma: PrismaClient;
  export default prisma;
}
