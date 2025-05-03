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
  PublicKeyCredentialRequestOptionsJSON,
  AuthenticatorTransportFuture as AuthenticatorTransport
} from '@simplewebauthn/typescript-types';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export class WebAuthnError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'WebAuthnError';
  }
}

/**
 * Generate registration options for WebAuthn
 * @param userId - The unique identifier for the user
 * @returns Registration options to be sent to the client
 */
export async function generateRegistration(userId: string): Promise<PublicKeyCredentialCreationOptionsJSON> {
  try {
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
        // Allow both platform and cross-platform authenticators 
        // to support both biometrics and security keys
        authenticatorAttachment: 'platform'
      },
      excludeCredentials: user.authenticators.map(authenticator => ({
        id: Buffer.from(authenticator.credentialID, 'base64'),
        type: 'public-key',
        transports: authenticator.transports as AuthenticatorTransport[]
      })),
      timeout: 60000, // 1 minute timeout for registration
    });

    // Save challenge in database with expiry
    await prisma.challenge.create({
      data: {
        userId,
        challenge: options.challenge,
        expires: new Date(Date.now() + 5 * 60 * 1000) // 5 minute expiry
      }
    });

    logger.info('WebAuthn registration options generated', {
      userId,
      timestamp: new Date().toISOString()
    });

    return options;
  } catch (error) {
    logger.error('Error generating WebAuthn registration options', {
      userId,
      error: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }
}

/**
 * Verify registration response from WebAuthn client
 * @param userId - The unique identifier for the user
 * @param response - The response from the client
 * @returns Verification result
 */
export async function verifyRegistration(
  userId: string,
  response: RegistrationResponseJSON
): Promise<VerifiedRegistrationResponse> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { challenges: {
        where: {
          expires: {
            gt: new Date() // Only get non-expired challenges
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 1
      }}
    });

    if (!user) {
      throw new WebAuthnError('User not found', 'USER_NOT_FOUND');
    }

    const challenge = user.challenges[0];
    if (!challenge) {
      throw new WebAuthnError('Challenge not found or expired', 'CHALLENGE_NOT_FOUND');
    }

    let verification: VerifiedRegistrationResponse;
    try {
      verification = await verifyRegistrationResponse({
        response,
        expectedChallenge: challenge.challenge,
        expectedOrigin: env.WEBAUTHN_ORIGIN,
        expectedRPID: env.WEBAUTHN_RP_ID,
        requireUserVerification: true
      });
    } catch (error) {
      logger.warn('WebAuthn verification failed', {
        userId,
        error: error instanceof Error ? error.message : String(error)
      });
      throw new WebAuthnError('Verification failed: ' + (error instanceof Error ? error.message : String(error)), 'VERIFICATION_FAILED');
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
        transports: response.response.transports || [],
        // Add new metadata fields for better security tracking
        lastUsed: new Date(),
        deviceType: response.response.authenticatorAttachment || 'unknown',
        aaguid: registrationInfo.aaguid || null
      }
    });

    // Delete challenge
    await prisma.challenge.delete({
      where: { id: challenge.id }
    });

    // Update user's MFA status
    await prisma.user.update({
      where: { id: userId },
      data: { 
        mfaEnabled: true,
        updatedAt: new Date()
      }
    });

    logger.info('WebAuthn registration verified successfully', {
      userId,
      timestamp: new Date().toISOString()
    });

    return verification;
  } catch (error) {
    logger.error('Error verifying WebAuthn registration', {
      userId,
      error: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }
}

/**
 * Generate authentication options for WebAuthn login
 * @param userId - The unique identifier for the user
 * @returns Authentication options to be sent to the client
 */
export async function generateAuthentication(userId: string): Promise<PublicKeyCredentialRequestOptionsJSON> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { authenticators: true }
    });

    if (!user) {
      throw new WebAuthnError('User not found', 'USER_NOT_FOUND');
    }

    // Check if user has registered authenticators
    if (user.authenticators.length === 0) {
      throw new WebAuthnError('No authenticators registered for this user', 'NO_AUTHENTICATORS');
    }

    const options = await generateAuthenticationOptions({
      rpID: env.WEBAUTHN_RP_ID,
      allowCredentials: user.authenticators.map(authenticator => ({
        id: Buffer.from(authenticator.credentialID, 'base64'),
        type: 'public-key',
        transports: authenticator.transports as AuthenticatorTransport[]
      })),
      userVerification: 'preferred',
      timeout: 60000  // 1 minute timeout
    });

    // Save challenge
    await prisma.challenge.create({
      data: {
        userId,
        challenge: options.challenge,
        expires: new Date(Date.now() + 5 * 60 * 1000) // 5 minute expiry
      }
    });

    logger.info('WebAuthn authentication options generated', {
      userId,
      timestamp: new Date().toISOString()
    });

    return options;
  } catch (error) {
    logger.error('Error generating WebAuthn authentication options', {
      userId,
      error: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }
}

/**
 * Verify authentication response from WebAuthn client
 * @param userId - The unique identifier for the user
 * @param response - The response from the client
 * @returns Verification result
 */
export async function verifyAuthentication(
  userId: string,
  response: AuthenticationResponseJSON
): Promise<VerifiedAuthenticationResponse> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { 
        authenticators: true,
        challenges: {
          where: {
            expires: {
              gt: new Date() // Only get non-expired challenges
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    });

    if (!user) {
      throw new WebAuthnError('User not found', 'USER_NOT_FOUND');
    }

    const challenge = user.challenges[0];
    if (!challenge) {
      throw new WebAuthnError('Challenge not found or expired', 'CHALLENGE_NOT_FOUND');
    }

    // Find the authenticator being used
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
          counter: authenticator.counter,
        },
        requireUserVerification: true
      });
    } catch (error) {
      logger.warn('WebAuthn authentication verification failed', {
        userId,
        error: error instanceof Error ? error.message : String(error)
      });
      throw new WebAuthnError('Verification failed: ' + (error instanceof Error ? error.message : String(error)), 'VERIFICATION_FAILED');
    }

    if (!verification.verified) {
      throw new WebAuthnError('Authentication failed', 'AUTHENTICATION_FAILED');
    }

    // Update authenticator counter and last used timestamp
    await prisma.authenticator.update({
      where: { id: authenticator.id },
      data: {
        counter: verification.authenticationInfo.newCounter,
        lastUsed: new Date()
      }
    });

    // Delete challenge
    await prisma.challenge.delete({
      where: { id: challenge.id }
    });

    logger.info('WebAuthn authentication verified successfully', {
      userId,
      authenticatorId: authenticator.id,
      timestamp: new Date().toISOString()
    });

    return verification;
  } catch (error) {
    logger.error('Error verifying WebAuthn authentication', {
      userId,
      error: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }
} 