import { PrismaClient } from '@prisma/client';
import {
  generateRegistrationOptions,
  generateAuthenticationOptions,
  verifyRegistrationResponse,
  verifyAuthenticationResponse,
  type PublicKeyCredentialCreationOptionsJSON,
  type PublicKeyCredentialRequestOptionsJSON,
  type RegistrationResponseJSON,
  type AuthenticationResponseJSON,
  type AuthenticatorTransportFuture,
  type VerifiedRegistrationResponse,
  type VerifiedAuthenticationResponse,
} from '@simplewebauthn/server';
import { isoBase64URL } from '@simplewebauthn/server/helpers';
import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';

interface WebAuthnAuthenticator {
  id: string;
  userId: string;
  credentialId: string;
  credentialPublicKey: string;
  counter: number;
  transports: AuthenticatorTransportFuture[];
}

interface UserWithAuthenticators {
  id: string;
  email: string;
  authenticators: WebAuthnAuthenticator[];
}

export class WebAuthnError extends Error {
  constructor(
    message: string,
    public code: 'CHALLENGE_NOT_FOUND' | 'USER_NOT_FOUND' | 'VERIFICATION_FAILED'
  ) {
    super(message);
    this.name = 'WebAuthnError';
  }
}

export class WebAuthnService {
  private static rpName = 'Vibewell';
  private static rpID = process.env.WEBAUTHN_RP_ID || 'localhost';
  private static origin = process.env.WEBAUTHN_ORIGIN || `https://${this.rpID}`;

  constructor(
    private prisma: PrismaClient,
  ) {}

  static async startRegistration(userId: string) {
    const user = await prisma.user.findUnique({ 
      where: { id: userId },
      include: { authenticators: true }
    });

    if (!user) throw new Error('User not found');

    const options = await generateRegistrationOptions({
      rpName: this.rpName,
      rpID: this.rpID,
      userID: user.id,
      userName: user.email,
      attestationType: 'none',
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'preferred',
        residentKey: 'preferred',
      },
      excludeCredentials: user.authenticators.map(authenticator => ({
        id: Buffer.from(authenticator.credentialID, 'base64'),
        type: 'public-key',
        transports: authenticator.transports as AuthenticatorTransport[],
      })),
    });

    await prisma.challenge.create({
      data: {
        id: nanoid(),
        challenge: options.challenge,
        userId: user.id,
      },
    });

    return options;
  }

  static async verifyRegistration(
    userId: string,
    response: RegistrationResponseJSON,
  ) {
    const user = await prisma.user.findUnique({ 
      where: { id: userId },
      include: { challenges: true }
    });

    if (!user) throw new Error('User not found');

    const challenge = user.challenges[0];
    if (!challenge) throw new Error('Challenge not found');

    const verification = await verifyRegistrationResponse({
      response,
      expectedChallenge: challenge.challenge,
      expectedOrigin: this.origin,
      expectedRPID: this.rpID,
    });

    const { verified, registrationInfo } = verification;
    if (!verified || !registrationInfo) {
      throw new Error('Verification failed');
    }

    const { credentialID, credentialPublicKey, counter } = registrationInfo;

    await prisma.authenticator.create({
      data: {
        credentialID: Buffer.from(credentialID).toString('base64'),
        credentialPublicKey: Buffer.from(credentialPublicKey).toString('base64'),
        counter,
        userId: user.id,
      },
    });

    await prisma.challenge.delete({ where: { id: challenge.id } });

    return verified;
  }

  static async startAuthentication(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { authenticators: true },
    });

    if (!user) throw new Error('User not found');

    const options = await generateAuthenticationOptions({
      rpID: this.rpID,
      allowCredentials: user.authenticators.map(authenticator => ({
        id: Buffer.from(authenticator.credentialID, 'base64'),
        type: 'public-key',
        transports: authenticator.transports as AuthenticatorTransport[],
      })),
      userVerification: 'preferred',
    });

    await prisma.challenge.create({
      data: {
        id: nanoid(),
        challenge: options.challenge,
        userId: user.id,
      },
    });

    return options;
  }

  static async verifyAuthentication(
    userId: string,
    response: AuthenticationResponseJSON,
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { authenticators: true, challenges: true },
    });

    if (!user) throw new Error('User not found');

    const challenge = user.challenges[0];
    if (!challenge) throw new Error('Challenge not found');

    const authenticator = user.authenticators.find(
      auth => auth.credentialID === Buffer.from(response.id, 'base64').toString('base64'),
    );

    if (!authenticator) throw new Error('Authenticator not found');

    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge: challenge.challenge,
      expectedOrigin: this.origin,
      expectedRPID: this.rpID,
      authenticator: {
        credentialID: Buffer.from(authenticator.credentialID, 'base64'),
        credentialPublicKey: Buffer.from(authenticator.credentialPublicKey, 'base64'),
        counter: authenticator.counter,
      },
    });

    const { verified, authenticationInfo } = verification;
    if (!verified) throw new Error('Verification failed');

    await prisma.authenticator.update({
      where: { id: authenticator.id },
      data: { counter: authenticationInfo.newCounter },
    });

    await prisma.challenge.delete({ where: { id: challenge.id } });

    return verified;
  }
}