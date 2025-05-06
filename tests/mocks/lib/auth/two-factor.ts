/**
 * Mock TwoFactorService for testing
 */
export class TwoFactorService {
  /**
   * Setup two-factor authentication for a user
   */
  async setupTwoFactor(userId: string, email: string) {
    return {
      secret: 'MOCK2FASECRETKEY',
      qrCodeUrl: `otpauth://totp/TestApp:${email}?secret=MOCK2FASECRETKEY&issuer=TestApp`
    };
  }

  /**
   * Validate a login attempt with 2FA
   */
  async validateLogin(userId: string, token: string) {
    // For testing, we'll consider 123456 as a valid token
    if (token === '123456') {
      return { valid: true };
    }
    return { valid: false, reason: 'Invalid token' };
  }

  /**
   * Verify a 2FA token
   */
  async verifyToken(secret: string, token: string) {
    // For testing, we'll consider 123456 as a valid token
    return token === '123456';
  }
  
  /**
   * Generate recovery codes
   */
  async generateRecoveryCodes(userId: string) {
    return [
      'MOCK-RECOVERY-1',
      'MOCK-RECOVERY-2',
      'MOCK-RECOVERY-3',
      'MOCK-RECOVERY-4',
      'MOCK-RECOVERY-5'
    ];
  }
} 