import { createHash, randomBytes } from 'crypto';

import { EmailService } from '../../lib/email';

import { logger } from '../../lib/logger';

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

  static async generateToken(email: string, options: MagicLinkOptions = {}): Promise<string> {
    const { expiresIn = this.DEFAULT_EXPIRES_IN, tokenLength = this.DEFAULT_TOKEN_LENGTH } =
      options;

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
    if (storedToken.expiresAt < new Date() || storedToken.email !== email) {
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

    // In development, log the link for easy testing
    if (process.env['NODE_ENV'] !== 'production') {
      console.log(`Magic link for ${email}:`, magicLink);
    }

    try {
      // Send the magic link via email
      await EmailService.send({
        to: email,
        subject: 'VibeWell: Your Login Link',
        html: this.generateEmailHtml(email, magicLink),
        text: this.generateEmailText(email, magicLink),
      });
      logger.info(`Magic link sent to ${email}`);
    } catch (error) {
      logger.error(
        `Failed to send magic link to ${email}:`,
        error instanceof Error ? error.message : String(error),
      );
      throw new Error('Failed to send magic link email');
    }
  }

  private static createMagicLink(token: string, email: string): string {
    const baseUrl = process.env['NEXT_PUBLIC_APP_URL'] || 'http://localhost:3000';
    const params = new URLSearchParams({
      token,
      email,
    });


    return `${baseUrl}/api/auth/verify-magic-link?${params}`;
  }

  private static generateEmailHtml(email: string, magicLink: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>

          <meta charset="utf-8">
          <title>Login to VibeWell</title>
          <style>




            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }

            .container { border: 1px solid #eee; border-radius: 10px; padding: 20px; }





            .button { display: inline-block; padding: 12px 24px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }


            .footer { margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Welcome to VibeWell</h1>
            <p>Hello,</p>
            <p>You requested a magic link to sign in to your VibeWell account. Click the button below to sign in:</p>
            <p><a href="${magicLink}" class="button">Sign In to VibeWell</a></p>
            <p>Or copy and paste this URL into your browser:</p>


            <p style="word-break: break-all;">${magicLink}</p>
            <p>This link will expire in 1 hour and can only be used once.</p>
            <p>If you didn't request this email, you can safely ignore it.</p>
            <div class="footer">


              <p>VibeWell - Your well-being journey starts here</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private static generateEmailText(email: string, magicLink: string): string {
    return `
Hello,

You requested a magic link to sign in to your VibeWell account. 
Click the link below to sign in:

${magicLink}

This link will expire in 1 hour and can only be used once.

If you didn't request this email, you can safely ignore it.



VibeWell - Your well-being journey starts here
    `;
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
setInterval(
  () => {
    MagicLinkService.cleanupExpiredTokens();
  },
  60 * 60 * 1000,
); // Run every hour
