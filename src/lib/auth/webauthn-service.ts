
import { PrismaClient } from '@prisma/client';
import {
  generateRegistrationOptions,
  generateAuthenticationOptions,
  verifyRegistrationResponse,
  verifyAuthenticationResponse,

} from '@simplewebauthn/server';
import type { 
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  AuthenticatorTransport,
  PublicKeyCredentialDescriptorJSON,
  RegistrationResponseJSON,
  AuthenticationResponseJSON,

} from '@simplewebauthn/typescript-types';

import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';

import { NextRequest, NextResponse } from 'next/server';

import { rateLimit } from '../rate-limiter/http';

interface WebAuthnDevice {
  id: string;
  userId: string;
  credentialId: string;
  publicKey: string;
  counter: number;
  transports?: AuthenticatorTransport[];
  lastUsedAt: Date;
  createdAt: Date;
}

interface UserWithWebAuthnDevices {
  id: string;
  email: string;
  webAuthnDevices: WebAuthnDevice[];
}

export class WebAuthnError extends Error {
  constructor(
    message: string,
    public code: 'CHALLENGE_NOT_FOUND' | 'USER_NOT_FOUND' | 'VERIFICATION_FAILED',
  ) {
    super(message);
    this?.name = 'WebAuthnError';
  }
}

export class WebAuthnService {
  private static rpName = 'Vibewell';
  private static rpID = process?.env['WEBAUTHN_RP_ID'] || 'localhost';
  private static origin = process?.env['WEBAUTHN_ORIGIN'] || `https://${this?.rpID}`;

  constructor(private prisma: PrismaClient) {}

  async startRegistration(request: NextRequest, userId: string): Promise<PublicKeyCredentialCreationOptionsJSON | NextResponse> {
    // Rate limit check
    const rateLimitResult = await rateLimit(request);
    if (rateLimitResult) {
      return rateLimitResult;
    }

    const rpID = process?.env['WEBAUTHN_RP_ID'];
    if (!rpID) {
      throw new Error('WEBAUTHN_RP_ID environment variable is not set');
    }

    const user = await this?.prisma.user?.findUnique({
      where: { id: userId },
      include: {
        webAuthnDevices: true
      }
    });

    if (!user || !user?.email) {
      throw new Error('User not found or email missing');
    }

    const options = await generateRegistrationOptions({
      rpName: 'VibeWell',
      rpID,
      userID: userId,
      userName: user?.email,
      attestationType: 'none',
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
        authenticatorAttachment: 'platform'
      },
      excludeCredentials: user?.webAuthnDevices.map(device => ({
        id: Buffer?.from(device?.credentialId, 'base64'),

        type: 'public-key',
        transports: []
      }))
    });

    await this?.prisma.challenge?.create({
      data: {
        challenge: options?.challenge,
        userId,
      }
    });

    return options;
  }

  static async verifyRegistration(userId: string, response: RegistrationResponseJSON) {
    const user = await prisma?.user.findUnique({
      where: { id: userId },
      include: { challenges: true },
    });

    if (!user) throw new Error('User not found');

    const challenge = user?.challenges[0];
    if (!challenge) throw new Error('Challenge not found');

    const verification = await verifyRegistrationResponse({
      response,
      expectedChallenge: challenge?.challenge,
      expectedOrigin: this?.origin,
      expectedRPID: this?.rpID,
    });

    const { verified, registrationInfo } = verification;
    if (!verified || !registrationInfo) {
      throw new Error('Verification failed');
    }

    const { credentialID, credentialPublicKey, counter } = registrationInfo;

    await prisma?.webAuthnDevice.create({
      data: {
        credentialId: Buffer?.from(credentialID).toString('base64'),
        publicKey: Buffer?.from(credentialPublicKey).toString('base64'),
        counter,
        userId: user?.id,
        lastUsedAt: new Date(),
      },
    });

    await prisma?.challenge.delete({ where: { id: challenge?.id } });

    return verified;
  }

  static async startAuthentication(userId: string) {
    const user = await prisma?.user.findUnique({
      where: { id: userId },
      include: { webAuthnDevices: true },
    });

    if (!user) throw new Error('User not found');

    const options = await generateAuthenticationOptions({
      rpID: this?.rpID,
      allowCredentials: user?.webAuthnDevices.map((device) => ({
        id: Buffer?.from(device?.credentialId, 'base64'),

        type: 'public-key',
        transports: []
      })),
      userVerification: 'preferred',
    });

    await prisma?.challenge.create({
      data: {
        id: nanoid(),
        challenge: options?.challenge,
        userId: user?.id,
      },
    });

    return options;
  }

  static async verifyAuthentication(userId: string, response: AuthenticationResponseJSON) {
    const user = await prisma?.user.findUnique({
      where: { id: userId },
      include: { webAuthnDevices: true, challenges: true },
    });

    if (!user) throw new Error('User not found');

    const challenge = user?.challenges[0];
    if (!challenge) throw new Error('Challenge not found');

    const device = user?.webAuthnDevices.find(
      (dev) => dev?.credentialId === Buffer?.from(response?.id, 'base64').toString('base64'),
    );

    if (!device) throw new Error('WebAuthn device not found');

    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge: challenge?.challenge,
      expectedOrigin: this?.origin,
      expectedRPID: this?.rpID,
      authenticator: {
        credentialID: Buffer?.from(device?.credentialId, 'base64'),
        credentialPublicKey: Buffer?.from(device?.publicKey, 'base64'),
        counter: device?.counter,
      },
    });

    if (verification?.verified) {
      await prisma?.webAuthnDevice.update({
        where: { id: device?.id },
        data: {
          counter: verification?.authenticationInfo.newCounter,
          lastUsedAt: new Date(),
        },
      });

      await prisma?.challenge.delete({ where: { id: challenge?.id } });
    }

    return verification?.verified;
  }
}
