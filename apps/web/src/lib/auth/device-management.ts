
import { prisma } from '@/lib/prisma';

import { WebAuthnAuditLogger } from './audit-log';

import type { Authenticator } from '@prisma/client';

export interface DeviceInfo {
  id: string;
  credentialID: string;
  lastUsed: Date;
  createdAt: Date;
  transports: string[];
}

export class DeviceManagementService {
  static async listDevices(userId: string): Promise<DeviceInfo[]> {
    const devices = await prisma.authenticator.findMany({
      where: { userId },
      orderBy: { lastUsed: 'desc' },
      select: {
        id: true,
        credentialID: true,
        lastUsed: true,
        createdAt: true,
        transports: true
      }
    });

    return devices.map(device => ({
      id: device.id,
      credentialID: device.credentialID,
      lastUsed: device.lastUsed,
      createdAt: device.createdAt,
      transports: device.transports
    }));
  }

  static async renameDevice(userId: string, deviceId: string, newName: string): Promise<void> {
    await prisma.authenticator.updateMany({
      where: {
        id: deviceId,
        userId // Ensure user owns the device
      },
      data: { 
        credentialID: newName // Using credentialID as the "name" field
      }
    });
  }

  static async revokeDevice(
    userId: string,
    deviceId: string,
    requestInfo: { ipAddress: string; userAgent: string }
  ): Promise<void> {
    // First verify the user owns the device
    const device = await prisma.authenticator.findFirst({
      where: {
        id: deviceId,
        userId
      }
    });

    if (!device) {
      throw new Error('Device not found or unauthorized');
    }

    // Delete the device
    await prisma.authenticator.delete({
      where: { id: deviceId }
    });

    // Log the revocation
    await WebAuthnAuditLogger.log({
      userId,
      action: 'revoke',
      deviceId,
      success: true,
      ipAddress: requestInfo.ipAddress,
      userAgent: requestInfo.userAgent
    });
  }

  static async revokeAllDevices(
    userId: string,
    requestInfo: { ipAddress: string; userAgent: string }
  ): Promise<void> {
    // Get all devices first for logging
    const devices = await prisma.authenticator.findMany({
      where: { userId },
      select: { id: true }
    });

    // Delete all devices
    await prisma.authenticator.deleteMany({
      where: { userId }
    });

    // Log each revocation
    await Promise.all(
      devices.map(device =>
        WebAuthnAuditLogger.log({
          userId,
          action: 'revoke',
          deviceId: device.id,
          success: true,
          ipAddress: requestInfo.ipAddress,
          userAgent: requestInfo.userAgent
        })
      )
    );
  }

  static async updateDeviceLastUsed(deviceId: string): Promise<void> {
    await prisma.authenticator.update({
      where: { id: deviceId },
      data: { lastUsed: new Date() }
    });
  }

  static async getDeviceCount(userId: string): Promise<number> {
    return await prisma.authenticator.count({
      where: { userId }
    });
  }
} 