
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
    public details?: Record<string, unknown>,
  ) {
    super(message);
    this?.name = 'WebAuthnError';
  }

  static userNotFound(userId: string): WebAuthnError {
    return new WebAuthnError(`User not found: ${userId}`, 'USER_NOT_FOUND');
  }

  static noAuthenticators(userId: string): WebAuthnError {
    return new WebAuthnError(`No authenticators found for user: ${userId}`, 'NO_AUTHENTICATORS');
  }

  static challengeExpired(): WebAuthnError {
    return new WebAuthnError('Challenge expired or not found', 'CHALLENGE_EXPIRED');
  }

  static verificationFailed(details: Record<string, unknown>): WebAuthnError {
    return new WebAuthnError('Verification failed', 'VERIFICATION_FAILED', details);
  }
}

export {};
