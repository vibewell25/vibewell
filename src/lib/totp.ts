/**
 * TOTP (Time-based One-Time Password) implementation
 * Used for Multi-Factor Authentication
 */

import * as crypto from 'crypto';
import { authenticator } from 'otplib';

/**
 * Generate a secure random secret for TOTP
 * @returns The generated secret in base32 format
 */
export function generateTOTPSecret(): string {
  // Generate 20 bytes of random data
  const buffer = crypto.randomBytes(20);
  // Convert to base32 for compatibility with authenticator apps
  return authenticator.encode(buffer.toString('hex'));
}

/**
 * Generate a TOTP token based on the secret
 * @param secret The TOTP secret
 * @returns The 6-digit TOTP token
 */
export function generateTOTP(secret: string): string {
  return authenticator.generate(secret);
}

/**
 * Verify a TOTP token against a secret
 * @param token The token to verify
 * @param secret The TOTP secret
 * @returns True if the token is valid, false otherwise
 */
export function verifyTOTP(token: string, secret: string): boolean {
  try {
    return authenticator.verify({ token, secret });
  } catch (error) {
    console.error('Error verifying TOTP:', error);
    return false;
  }
}

/**
 * Generate a QR code URL for setting up authenticator apps
 * @param secret The TOTP secret
 * @param account The user account/email
 * @param issuer The name of the service
 * @returns URL for QR code
 */
export function generateTOTPQRCodeURL(
  secret: string,
  account: string,
  issuer: string = 'Vibewell',
): string {
  return authenticator.keyuri(account, issuer, secret);
}

/**
 * Generate new TOTP credentials
 * @param account The user account/email
 * @param issuer The name of the service
 * @returns Object containing secret, URL for QR code, and current token
 */
export function generateTOTPCredentials(
  account: string,
  issuer: string = 'Vibewell',
): {
  secret: string;
  qrCodeUrl: string;
  currentToken: string;
} {
  const secret = generateTOTPSecret();
  const qrCodeUrl = generateTOTPQRCodeURL(secret, account, issuer);
  const currentToken = generateTOTP(secret);

  return {
    secret,
    qrCodeUrl,
    currentToken,
  };
}

/**
 * Check if a TOTP setup is valid by verifying a token
 * This is used during MFA enrollment to ensure the user has set up their
 * authenticator app correctly
 *
 * @param token The token to verify
 * @param secret The TOTP secret
 * @returns True if the setup is valid, false otherwise
 */
export function verifyTOTPSetup(token: string, secret: string): boolean {
  return verifyTOTP(token, secret);
}
