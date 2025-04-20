export type WebAuthnErrorCode = 
  | 'USER_NOT_FOUND'
  | 'CHALLENGE_INVALID'
  | 'VERIFICATION_FAILED'
  | 'AUTHENTICATOR_EXISTS'
  | 'AUTHENTICATOR_NOT_FOUND'
  | 'NO_AUTHENTICATORS';

export class WebAuthnError extends Error {
  constructor(message: string, public code: WebAuthnErrorCode) {
    super(message);
    this.name = 'WebAuthnError';
  }
} 