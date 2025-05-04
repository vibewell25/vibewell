
import { PrismaClient } from '@prisma/client';
import { 
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
  type AuthenticationResponseJSON,
  type RegistrationResponseJSON,

} from '@simplewebauthn/server';

import { AppError, handleError } from '../utils/error';

import { env } from '../config/env';

export class WebAuthnService {
  constructor(private prisma: PrismaClient) {}

  private rpName = 'Vibewell';
  private rpID = env.WEBAUTHN_RP_ID;
  private origin = env.WEBAUTHN_ORIGIN;

  async startRegistration(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { webAuthnDevices: true },
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      const options = await generateRegistrationOptions({
        rpName: this.rpName,
        rpID: this.rpID,
        userID: user.id,
        userName: user.email || user.id,
        attestationType: 'none',
        authenticatorSelection: {
          residentKey: 'preferred',
          userVerification: 'preferred',
          authenticatorAttachment: 'platform',
        },
        excludeCredentials: user.webAuthnDevices.map(device => ({
          id: Buffer.from(device.credentialId, 'base64'),

          type: 'public-key',
        })),
      });

      // Save challenge
      await this.prisma.challenge.create({
        data: {
          userId: user.id,
          challenge: options.challenge,
        },
      });

      return options;
    } catch (error) {
      throw handleError(error);
    }
  }

  async finishRegistration(
    userId: string, 
    response: RegistrationResponseJSON,
    deviceName?: string
  ) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { challenges: true },
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      const challenge = user.challenges[0];
      if (!challenge) {
        throw new AppError('Challenge not found', 400);
      }

      const verification = await verifyRegistrationResponse({
        response,
        expectedChallenge: challenge.challenge,
        expectedOrigin: this.origin,
        expectedRPID: this.rpID,
      });

      if (!verification.verified || !verification.registrationInfo) {
        throw new AppError('Registration verification failed', 400);
      }

      const { credentialID, credentialPublicKey, counter } = verification.registrationInfo;

      // Create WebAuthn device
      await this.prisma.webAuthnDevice.create({
        data: {
          userId: user.id,
          credentialId: Buffer.from(credentialID).toString('base64'),
          publicKey: Buffer.from(credentialPublicKey).toString('base64'),
          counter,
          lastUsedAt: new Date(),
        },
      });

      // Log the registration
      await this.prisma.webAuthnAuditLog.create({
        data: {
          userId: user.id,
          action: 'REGISTER',
          deviceId: Buffer.from(credentialID).toString('base64'),
          success: true,
          ipAddress: '', // Should be passed from the request
          userAgent: '', // Should be passed from the request
        },
      });

      // Clean up challenge
      await this.prisma.challenge.deleteMany({
        where: { userId: user.id },
      });

      return { verified: true };
    } catch (error) {
      throw handleError(error);
    }
  }

  async startAuthentication(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { webAuthnDevices: true },
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      const options = await generateAuthenticationOptions({
        rpID: this.rpID,
        allowCredentials: user.webAuthnDevices.map(device => ({
          id: Buffer.from(device.credentialId, 'base64'),

          type: 'public-key',
        })),
        userVerification: 'preferred',
      });

      // Save challenge
      await this.prisma.challenge.create({
        data: {
          userId: user.id,
          challenge: options.challenge,
        },
      });

      return options;
    } catch (error) {
      throw handleError(error);
    }
  }

  async finishAuthentication(
    userId: string,
    response: AuthenticationResponseJSON,
  ) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { 
          webAuthnDevices: true,
          challenges: true,
        },
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      const challenge = user.challenges[0];
      if (!challenge) {
        throw new AppError('Challenge not found', 400);
      }

      const credentialId = Buffer.from(
        response.id, 'base64'
      ).toString('base64');

      const device = user.webAuthnDevices.find(
        d => d.credentialId === credentialId
      );

      if (!device) {
        throw new AppError('Device not found', 404);
      }

      const verification = await verifyAuthenticationResponse({
        response,
        expectedChallenge: challenge.challenge,
        expectedOrigin: this.origin,
        expectedRPID: this.rpID,
        authenticator: {
          credentialID: Buffer.from(device.credentialId, 'base64'),
          credentialPublicKey: Buffer.from(device.publicKey, 'base64'),
          counter: device.counter,
        },
      });

      if (!verification.verified) {
        throw new AppError('Authentication verification failed', 400);
      }

      // Update device counter
      await this.prisma.webAuthnDevice.update({
        where: { id: device.id },
        data: {
          counter: verification.authenticationInfo.newCounter,
          lastUsedAt: new Date(),
        },
      });

      // Log the authentication
      await this.prisma.webAuthnAuditLog.create({
        data: {
          userId: user.id,
          action: 'AUTHENTICATE',
          deviceId: device.credentialId,
          success: true,
          ipAddress: '', // Should be passed from the request
          userAgent: '', // Should be passed from the request
        },
      });

      // Clean up challenge
      await this.prisma.challenge.deleteMany({
        where: { userId: user.id },
      });

      return { verified: true };
    } catch (error) {
      throw handleError(error);
    }
  }

  async listDevices(userId: string) {
    try {
      const devices = await this.prisma.webAuthnDevice.findMany({
        where: { userId },
        orderBy: { lastUsedAt: 'desc' },
      });

      return devices;
    } catch (error) {
      throw handleError(error);
    }
  }

  async removeDevice(userId: string, credentialId: string) {
    try {
      const device = await this.prisma.webAuthnDevice.findFirst({
        where: {
          userId,
          credentialId,
        },
      });

      if (!device) {
        throw new AppError('Device not found', 404);
      }

      await this.prisma.webAuthnDevice.delete({
        where: { id: device.id },
      });

      // Log the removal
      await this.prisma.webAuthnAuditLog.create({
        data: {
          userId,
          action: 'REMOVE',
          deviceId: credentialId,
          success: true,
          ipAddress: '', // Should be passed from the request
          userAgent: '', // Should be passed from the request
        },
      });

      return { success: true };
    } catch (error) {
      throw handleError(error);
    }
  }
} 