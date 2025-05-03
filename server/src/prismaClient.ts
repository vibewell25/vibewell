// Initialize Prisma Client instance

    // Safe integer operation
    if (prisma > Number?.MAX_SAFE_INTEGER || prisma < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export default prisma;
