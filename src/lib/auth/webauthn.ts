/**
 * WebAuthn authentication module
 * This provides WebAuthn (FIDO2) biometric/hardware authentication functionality
 */
import { 
  generateRegistrationOptions as fido2RegOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions as fido2AuthOptions,
  verifyAuthenticationResponse
} from '@simplewebauthn/server';
import type { 
  RegistrationCredentialJSON,
  AuthenticationCredentialJSON,
} from '@simplewebauthn/typescript-types';
import prisma from '../prisma';

const rpName = 'Vibewell';
const rpID = process.env.WEBAUTHN_RP_ID || 'vibewell.example.com';
const origin = process.env.WEBAUTHN_ORIGIN || 'https://vibewell.example.com';

/**
 * Represents WebAuthn credential data
 */
export interface WebAuthnCredential {
  id: string;
  publicKey: string;
  counter: number;
}

/**
 * WebAuthn registration options
 */
export interface RegistrationOptions {
  username: string;
  displayName: string;
  attestation?: 'direct' | 'indirect' | 'none';
}

/**
 * WebAuthn authentication options
 */
export interface AuthenticationOptions {
  username: string;
  userVerification?: 'required' | 'preferred' | 'discouraged';
}

/**
 * WebAuthn registration options return type
 */
export interface WebAuthnRegistrationOptions {
  challenge: string;
  rp: {
    name: string;
    id: string;
  };
  user: {
    id: string;
    name: string;
    displayName: string;
  };
  pubKeyCredParams: Array<{
    type: string;
    alg: number;
  }>;
  timeout: number;
  attestation: 'direct' | 'indirect' | 'none';
}

/**
 * WebAuthn authentication options return type
 */
export interface WebAuthnAuthenticationOptions {
  challenge: string;
  rpId: string;
  allowCredentials: Array<{
    type: string;
    id: string;
  }>;
  timeout: number;
  userVerification: 'required' | 'preferred' | 'discouraged';
}

/**
 * WebAuthn response interface
 */
export interface WebAuthnResponse {
  id: string;
  rawId: string;
  response: {
    clientDataJSON: string;
    attestationObject?: string;
    authenticatorData?: string;
    signature?: string;
    userHandle?: string;
  };
  type: string;
  clientExtensionResults: Record<string, unknown>;
}

/**
 * Generates registration options for WebAuthn
 */
export function generateRegistrationOptions(options: RegistrationOptions) {
  return fido2RegOptions({
    rpName,
    rpID,
    userID: Buffer.from(options.username).toString('base64'),
    userName: options.username,
    userDisplayName: options.displayName,
    attestationType: options.attestation,
    authenticatorSelection: {
      userVerification: 'preferred',
      residentKey: 'preferred',
    },
  });
}

/**
 * Verifies a WebAuthn registration response
 */
export async function verifyRegistration(
  response: RegistrationCredentialJSON,
  expectedChallenge: string
): Promise<WebAuthnCredential> {
  const verification = await verifyRegistrationResponse({
    credential: response,
    expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
  });

  if (!verification.verified) {
    throw new Error('WebAuthn registration verification failed');
  }

  return {
    id: response.id,
    publicKey: verification.registrationInfo?.credentialPublicKey.toString('base64') || '',
    counter: verification.registrationInfo?.counter || 0,
  };
}

/**
 * Generates authentication options for WebAuthn
 */
export async function generateAuthenticationOptions(options: AuthenticationOptions) {
  // Get user's credentials from database
  const user = await prisma.user.findFirst({
    where: { 
      // Using a case-insensitive search for the username/email
      OR: [
        { email: { equals: options.username, mode: 'insensitive' } },
        { username: { equals: options.username, mode: 'insensitive' } }
      ]
    },
    include: { webauthnCredentials: true }
  });

  const allowCredentials = user?.webauthnCredentials.map(credential => ({
    id: Buffer.from(credential.id, 'base64'),
    type: 'public-key',
  })) || [];

  return fido2AuthOptions({
    rpID,
    userVerification: options.userVerification || 'preferred',
    allowCredentials,
  });
}

/**
 * Verifies a WebAuthn authentication response
 */
export async function verifyAuthentication(
  response: AuthenticationCredentialJSON,
  expectedChallenge: string
): Promise<boolean> {
  try {
    // Find the credential in the database
    const credential = await prisma.webauthnCredential.findUnique({
      where: { id: response.id }
    });

    if (!credential) {
      throw new Error('WebAuthn credential not found');
    }

    const authenticator = {
      credentialID: Buffer.from(credential.id, 'base64'),
      credentialPublicKey: Buffer.from(credential.publicKey, 'base64'),
      counter: credential.counter,
    };

    const verification = await verifyAuthenticationResponse({
      credential: response,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      authenticator,
    });

    if (verification.verified) {
      // Update counter in database
      await prisma.webauthnCredential.update({
        where: { id: credential.id },
        data: { counter: verification.authenticationInfo.newCounter }
      });
      return true;
    }

    return false;
  } catch (error) {
    console.error('WebAuthn authentication verification error:', error);
    return false;
  }
} 