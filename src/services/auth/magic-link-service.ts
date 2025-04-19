import { createHash, randomBytes } from 'crypto';

interface MagicLinkOptions {
  expiresIn?: number; // in seconds, default 1 hour
  tokenLength?: number; // default 32 bytes
}

interface MagicLinkToken {
  token: string;
  email: string;
  expiresAt: Date;
}

export class MagicLinkService {
  private static readonly DEFAULT_EXPIRES_IN = 3600; // 1 hour
  private static readonly DEFAULT_TOKEN_LENGTH = 32;
  private static tokens = new Map<string, MagicLinkToken>();

  static async generateToken(
    email: string,
    options: MagicLinkOptions = {}
  ): Promise<string> {
    const {
      expiresIn = this.DEFAULT_EXPIRES_IN,
      tokenLength = this.DEFAULT_TOKEN_LENGTH,
    } = options;

    // Generate a secure random token
    const token = randomBytes(tokenLength).toString('hex');
    const hashedToken = this.hashToken(token);

    // Store the token with expiration
    this.tokens.set(hashedToken, {
      token: hashedToken,
      email,
      expiresAt: new Date(Date.now() + expiresIn * 1000),
    });

    // Return the original token (not hashed) to be sent via email
    return token;
  }

  static async verifyToken(token: string, email: string): Promise<boolean> {
    const hashedToken = this.hashToken(token);
    const storedToken = this.tokens.get(hashedToken);

    if (!storedToken) {
      return false;
    }

    // Check if token is expired or email doesn't match
    if (
      storedToken.expiresAt < new Date() ||
      storedToken.email !== email
    ) {
      this.tokens.delete(hashedToken);
      return false;
    }

    // Token is valid - remove it so it can't be used again
    this.tokens.delete(hashedToken);
    return true;
  }

  static async sendMagicLink(email: string): Promise<void> {
    const token = await this.generateToken(email);
    const magicLink = this.createMagicLink(token, email);

    // In a real application, you would send this via email
    // For now, we'll just log it
    console.log(`Magic link for ${email}:`, magicLink);

    // TODO: Implement email sending logic
    // await sendEmail({
    //   to: email,
    //   subject: 'Your login link',
    //   html: `Click here to login: ${magicLink}`,
    // });
  }

  private static createMagicLink(token: string, email: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const params = new URLSearchParams({
      token,
      email,
    });
    return `${baseUrl}/api/auth/verify-magic-link?${params}`;
  }

  private static hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  // Clean up expired tokens periodically
  static cleanupExpiredTokens(): void {
    const now = new Date();
    for (const [key, value] of this.tokens.entries()) {
      if (value.expiresAt < now) {
        this.tokens.delete(key);
      }
    }
  }
}

// Set up periodic cleanup of expired tokens
setInterval(() => {
  MagicLinkService.cleanupExpiredTokens();
}, 60 * 60 * 1000); // Run every hour 