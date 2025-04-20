import { User } from '@prisma/client';
import { AuthenticatorTransport } from '@simplewebauthn/types';

export interface WebAuthnAuthenticator {
  id: string;
  userId: string;
  credentialId: string;
  credentialPublicKey: string;
  counter: number;
  transports: AuthenticatorTransport[];
}

export interface UserWithAuthenticators {
  id: string;
  email: string;
  authenticators: WebAuthnAuthenticator[];
}

export interface WebAuthnRegistrationInfo {
  fmt: string;
  aaguid: string;
  credentialID: Uint8Array;
  credentialPublicKey: Uint8Array;
  counter: number;
}

export interface WebAuthnAuthenticationInfo {
  credentialID: Uint8Array;
  newCounter: number;
}

export class WebAuthnError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'WebAuthnError';
  }

  static userNotFound(userId: string): WebAuthnError {
    return new WebAuthnError(
      `User not found: ${userId}`,
      'USER_NOT_FOUND'
    );
  }

  static noAuthenticators(userId: string): WebAuthnError {
    return new WebAuthnError(
      `No authenticators found for user: ${userId}`,
      'NO_AUTHENTICATORS'
    );
  }

  static challengeExpired(): WebAuthnError {
    return new WebAuthnError(
      'Challenge expired or not found',
      'CHALLENGE_EXPIRED'
    );
  }

  static verificationFailed(details: Record<string, unknown>): WebAuthnError {
    return new WebAuthnError(
      'Verification failed',
      'VERIFICATION_FAILED',
      details
    );
  }
}

export const webAuthnUtils = {
  bufferToBase64URL(buffer: ArrayBuffer): string {
    return Buffer.from(buffer)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  },

  base64URLToBuffer(base64url: string): Uint8Array {
    const base64 = base64url
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    const padding = '='.repeat((4 - base64.length % 4) % 4);
    const base64String = base64 + padding;
    return new Uint8Array(Buffer.from(base64String, 'base64'));
  }
};