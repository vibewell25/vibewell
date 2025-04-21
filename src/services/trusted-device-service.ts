import { createHash } from 'crypto';
import { prisma } from '@/lib/database/client';
import { logger } from '@/lib/logger';
import UAParser from 'ua-parser-js';

interface DeviceInfo {
  userAgent: string;
  ip: string;
  additionalData?: Record<string, any>;
}

export class TrustedDeviceService {
  private readonly DEVICE_TRUST_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days

  /**
   * Generate a unique device ID based on device characteristics
   */
  private generateDeviceId(info: DeviceInfo): string {
    const parser = new UAParser(info.userAgent);
    const ua = parser.getResult();

    // Combine multiple factors to create a unique device fingerprint
    const factors = [
      ua.browser.name,
      ua.browser.version,
      ua.os.name,
      ua.os.version,
      ua.device.vendor,
      ua.device.model,
      info.ip,
      // Add any additional identifying data
      ...Object.values(info.additionalData || {}),
    ].filter(Boolean);

    // Create a hash of the combined factors
    return createHash('sha256').update(factors.join('|')).digest('hex');
  }

  /**
   * Register a new trusted device
   */
  async registerDevice(userId: string, deviceInfo: DeviceInfo): Promise<string> {
    try {
      const deviceId = this.generateDeviceId(deviceInfo);
      const parser = new UAParser(deviceInfo.userAgent);
      const ua = parser.getResult();

      const deviceName =
        [ua.browser.name, ua.os.name, ua.device.vendor, ua.device.model]
          .filter(Boolean)
          .join(' - ') || 'Unknown Device';

      const expiresAt = new Date(Date.now() + this.DEVICE_TRUST_DURATION);

      await prisma.trustedDevice.upsert({
        where: { deviceId },
        create: {
          userId,
          deviceId,
          deviceName,
          browserInfo: `${ua.browser.name} ${ua.browser.version}`,
          osInfo: `${ua.os.name} ${ua.os.version}`,
          ipAddress: deviceInfo.ip,
          expiresAt,
        },
        update: {
          lastUsed: new Date(),
          expiresAt,
          isRevoked: false,
          revokedAt: null,
        },
      });

      logger.info('Registered trusted device', 'security', {
        userId,
        deviceId,
        deviceName,
      });

      return deviceId;
    } catch (error) {
      logger.error('Failed to register trusted device', 'security', {
        error,
        userId,
      });
      throw new Error('Failed to register trusted device');
    }
  }

  /**
   * Verify if a device is trusted and not expired
   */
  async verifyDevice(userId: string, deviceInfo: DeviceInfo): Promise<boolean> {
    try {
      const deviceId = this.generateDeviceId(deviceInfo);

      const device = await prisma.trustedDevice.findUnique({
        where: { deviceId },
      });

      if (!device) return false;

      // Check if device belongs to user
      if (device.userId !== userId) return false;

      // Check if device is revoked
      if (device.isRevoked) return false;

      // Check if device trust has expired
      if (device.expiresAt && device.expiresAt < new Date()) {
        await this.revokeDevice(deviceId);
        return false;
      }

      // Update last used timestamp
      await prisma.trustedDevice.update({
        where: { deviceId },
        data: { lastUsed: new Date() },
      });

      return true;
    } catch (error) {
      logger.error('Failed to verify trusted device', 'security', {
        error,
        userId,
      });
      return false;
    }
  }

  /**
   * Revoke a trusted device
   */
  async revokeDevice(deviceId: string): Promise<void> {
    try {
      await prisma.trustedDevice.update({
        where: { deviceId },
        data: {
          isRevoked: true,
          revokedAt: new Date(),
        },
      });

      logger.info('Revoked trusted device', 'security', { deviceId });
    } catch (error) {
      logger.error('Failed to revoke trusted device', 'security', {
        error,
        deviceId,
      });
      throw new Error('Failed to revoke trusted device');
    }
  }

  /**
   * Get all trusted devices for a user
   */
  async getUserDevices(userId: string): Promise<any[]> {
    try {
      const devices = await prisma.trustedDevice.findMany({
        where: {
          userId,
          isRevoked: false,
          expiresAt: {
            gt: new Date(),
          },
        },
        orderBy: {
          lastUsed: 'desc',
        },
      });

      return devices.map(device => ({
        id: device.deviceId,
        name: device.deviceName,
        browser: device.browserInfo,
        os: device.osInfo,
        lastUsed: device.lastUsed,
        createdAt: device.createdAt,
      }));
    } catch (error) {
      logger.error('Failed to get user devices', 'security', {
        error,
        userId,
      });
      throw new Error('Failed to get user devices');
    }
  }

  /**
   * Clean up expired and revoked devices
   */
  async cleanupDevices(): Promise<void> {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      await prisma.trustedDevice.deleteMany({
        where: {
          OR: [
            { expiresAt: { lt: new Date() } },
            {
              AND: [{ isRevoked: true }, { revokedAt: { lt: thirtyDaysAgo } }],
            },
          ],
        },
      });

      logger.info('Cleaned up expired and revoked devices', 'security');
    } catch (error) {
      logger.error('Failed to cleanup devices', 'security', { error });
      throw new Error('Failed to cleanup devices');
    }
  }
}
