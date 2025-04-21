import { createHash, randomBytes } from 'crypto';
import { prisma } from '@/lib/database/client';
import { logger } from '@/lib/logger';
import { EncryptionService } from './encryption';

export class RecoveryCodeService {
  private encryption: EncryptionService;

  constructor() {
    this.encryption = new EncryptionService();
  }

  /**
   * Generate a set of recovery codes for a user
   * @param userId The user's ID
   * @param count Number of recovery codes to generate (default: 8)
   */
  async generateRecoveryCodes(userId: string, count: number = 8): Promise<string[]> {
    try {
      // Generate random recovery codes
      const codes = Array.from({ length: count }, () => {
        // Generate 4 groups of 4 characters each (e.g., XXXX-XXXX-XXXX-XXXX)
        const groups = Array.from({ length: 4 }, () =>
          randomBytes(2).toString('hex').toUpperCase()
        );
        return groups.join('-');
      });

      // Hash the codes before storing
      const hashedCodes = await Promise.all(codes.map(code => this.encryption.hash(code)));

      // Store the hashed codes in the database
      await prisma.recoveryCode.deleteMany({
        where: { userId },
      });

      await prisma.recoveryCode.createMany({
        data: hashedCodes.map(hash => ({
          userId,
          code: hash,
          used: false,
          createdAt: new Date(),
        })),
      });

      // Log the generation event (without the actual codes)
      logger.info('Generated new recovery codes', 'security', {
        userId,
        count,
      });

      return codes;
    } catch (error) {
      logger.error('Failed to generate recovery codes', 'security', {
        error,
        userId,
      });
      throw new Error('Failed to generate recovery codes');
    }
  }

  /**
   * Verify a recovery code and mark it as used if valid
   * @param userId The user's ID
   * @param code The recovery code to verify
   */
  async verifyRecoveryCode(userId: string, code: string): Promise<boolean> {
    try {
      // Get all unused recovery codes for the user
      const recoveryCodes = await prisma.recoveryCode.findMany({
        where: {
          userId,
          used: false,
        },
      });

      // Check each code
      for (const storedCode of recoveryCodes) {
        const isValid = await this.encryption.verify(code, storedCode.code);

        if (isValid) {
          // Mark the code as used
          await prisma.recoveryCode.update({
            where: { id: storedCode.id },
            data: {
              used: true,
              usedAt: new Date(),
            },
          });

          // Log the usage
          logger.info('Recovery code used successfully', 'security', {
            userId,
            codeId: storedCode.id,
          });

          return true;
        }
      }

      // Log failed attempt
      logger.warn('Invalid recovery code attempt', 'security', {
        userId,
      });

      return false;
    } catch (error) {
      logger.error('Failed to verify recovery code', 'security', {
        error,
        userId,
      });
      throw new Error('Failed to verify recovery code');
    }
  }

  /**
   * Get the number of remaining (unused) recovery codes for a user
   * @param userId The user's ID
   */
  async getRemainingCodeCount(userId: string): Promise<number> {
    try {
      return await prisma.recoveryCode.count({
        where: {
          userId,
          used: false,
        },
      });
    } catch (error) {
      logger.error('Failed to get remaining recovery code count', 'security', {
        error,
        userId,
      });
      throw new Error('Failed to get remaining recovery code count');
    }
  }
}
