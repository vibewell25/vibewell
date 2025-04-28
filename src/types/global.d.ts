import { PrismaClient } from '@prisma/client';

declare global {}

declare module 'uuid' {
  export function v4(): string;
}
