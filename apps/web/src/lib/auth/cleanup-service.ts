
import { prisma } from '@/lib/prisma';

export class CleanupService {
  /**
   * Removes expired WebAuthn challenges from the database
   * @returns The number of challenges removed
   */
  static async cleanupExpiredChallenges(): Promise<number> {
    try {
      const result = await prisma.webAuthnChallenge.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });

      return result.count;
    } catch (error) {
      console.error('Failed to cleanup expired challenges:', error);
      return 0;
    }
  }

  /**
   * Schedules periodic cleanup of expired challenges
   * @param intervalMs The interval in milliseconds between cleanups (default: 1 hour)
   */
  static scheduleCleanup(intervalMs: number = 60 * 60 * 1000): NodeJS.Timer {
    return setInterval(async () => {
      const removedCount = await this.cleanupExpiredChallenges();
      if (removedCount > 0) {
        console.log(`Removed ${removedCount} expired WebAuthn challenges`);
      }
    }, intervalMs);
  }
}
