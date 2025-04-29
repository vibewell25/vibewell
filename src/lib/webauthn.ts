import { env } from '@/config/env';
import { 
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
  type VerifiedAuthenticationResponse,
  type VerifiedRegistrationResponse
} from '@simplewebauthn/server';
import type { 
  AuthenticationResponseJSON,
  RegistrationResponseJSON,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON
} from '@simplewebauthn/typescript-types';
import { prisma } from '@/lib/prisma';

export class WebAuthnError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'WebAuthnError';
  }
}

export async function generateRegistration(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { authenticators: true }
  });

  if (!user) {
    throw new WebAuthnError('User not found', 'USER_NOT_FOUND');
  }

  const options = await generateRegistrationOptions({
    rpName: 'Vibewell',
    rpID: env.WEBAUTHN_RP_ID,
    userID: userId,
    userName: user.email ?? userId,
    attestationType: 'none',
    authenticatorSelection: {
      residentKey: 'preferred',
      userVerification: 'preferred',
      authenticatorAttachment: 'platform'
    },
    excludeCredentials: user.authenticators.map(authenticator => ({
      id: Buffer.from(authenticator.credentialID, 'base64'),
      type: 'public-key',
      transports: authenticator.transports as AuthenticatorTransport[]
    }))
  });

  // Save challenge
  await prisma.challenge.create({
    data: {
      userId,
      challenge: options.challenge
    }
  });

  return options;
}

export async function verifyRegistration(
  userId: string,
  response: RegistrationResponseJSON
): Promise<VerifiedRegistrationResponse> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { challenges: true }
  });

  if (!user) {
    throw new WebAuthnError('User not found', 'USER_NOT_FOUND');
  }

  const challenge = user.challenges[0];
  if (!challenge) {
    throw new WebAuthnError('Challenge not found', 'CHALLENGE_NOT_FOUND');
  }

  let verification: VerifiedRegistrationResponse;
  try {
    verification = await verifyRegistrationResponse({
      response,
      expectedChallenge: challenge.challenge,
      expectedOrigin: env.WEBAUTHN_ORIGIN,
      expectedRPID: env.WEBAUTHN_RP_ID
    });
  } catch (error) {
    throw new WebAuthnError('Verification failed', 'VERIFICATION_FAILED');
  }

  const { verified, registrationInfo } = verification;
  if (!verified || !registrationInfo) {
    throw new WebAuthnError('Registration failed', 'REGISTRATION_FAILED');
  }

  // Create new authenticator
  await prisma.authenticator.create({
    data: {
      userId,
      credentialID: Buffer.from(registrationInfo.credentialID).toString('base64'),
      credentialPublicKey: Buffer.from(registrationInfo.credentialPublicKey).toString('base64'),
      counter: registrationInfo.counter,
      transports: response.response.transports || []
    }
  });

  // Delete challenge
  await prisma.challenge.delete({
    where: { id: challenge.id }
  });

  return verification;
}

export async function generateAuthentication(userId: string): Promise<PublicKeyCredentialRequestOptionsJSON> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { authenticators: true }
  });

  if (!user) {
    throw new WebAuthnError('User not found', 'USER_NOT_FOUND');
  }

  const options = await generateAuthenticationOptions({
    rpID: env.WEBAUTHN_RP_ID,
    allowCredentials: user.authenticators.map(authenticator => ({
      id: Buffer.from(authenticator.credentialID, 'base64'),
      type: 'public-key',
      transports: authenticator.transports as AuthenticatorTransport[]
    })),
    userVerification: 'preferred'
  });

  // Save challenge
  await prisma.challenge.create({
    data: {
      userId,
      challenge: options.challenge
    }
  });

  return options;
}

export async function verifyAuthentication(
  userId: string,
  response: AuthenticationResponseJSON
): Promise<VerifiedAuthenticationResponse> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { 
      authenticators: true,
      challenges: true
    }
  });

  if (!user) {
    throw new WebAuthnError('User not found', 'USER_NOT_FOUND');
  }

  const challenge = user.challenges[0];
  if (!challenge) {
    throw new WebAuthnError('Challenge not found', 'CHALLENGE_NOT_FOUND');
  }

  const authenticator = user.authenticators.find(
    auth => auth.credentialID === Buffer.from(response.id, 'base64url').toString('base64')
  );

  if (!authenticator) {
    throw new WebAuthnError('Authenticator not found', 'AUTHENTICATOR_NOT_FOUND');
  }

  let verification: VerifiedAuthenticationResponse;
  try {
    verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge: challenge.challenge,
      expectedOrigin: env.WEBAUTHN_ORIGIN,
      expectedRPID: env.WEBAUTHN_RP_ID,
      authenticator: {
        credentialID: Buffer.from(authenticator.credentialID, 'base64'),
        credentialPublicKey: Buffer.from(authenticator.credentialPublicKey, 'base64'),
        counter: authenticator.counter
      }
    });
  } catch (error) {
    throw new WebAuthnError('Verification failed', 'VERIFICATION_FAILED');
  }

  if (verification.verified) {
    // Update authenticator counter
    await prisma.authenticator.update({
      where: { id: authenticator.id },
      data: { 
        counter: verification.authenticationInfo.newCounter,
        lastUsed: new Date()
      }
    });

    // Create audit log
    await prisma.authenticationLog.create({
      data: {
        userId,
        action: 'WEBAUTHN_AUTHENTICATION',
        deviceId: authenticator.id,
        success: true,
        ipAddress: '', // Add from request
        userAgent: '' // Add from request
      }
    });

    // Delete challenge
    await prisma.challenge.delete({
      where: { id: challenge.id }
    });
  }

  return verification;
} 