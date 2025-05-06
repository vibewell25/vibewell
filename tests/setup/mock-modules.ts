import { vi } from 'vitest';
import path from 'path';

// Dynamically mock required modules
vi.mock('@/lib/auth/webauthn', async () => {
  return {
    WebAuthnService: class {
      async startRegistration(user: any) {
        return {
          challenge: 'mock-challenge',
          rp: { id: 'localhost', name: 'Test App' },
          user: {
            id: user.id,
            name: user.email,
            displayName: user.email
          },
          pubKeyCredParams: [],
          timeout: 60000,
          attestation: 'direct'
        };
      }

      async verifyRegistration(response: any) {
        return {
          verified: true,
          credentialId: 'mock-credential-id',
          publicKey: 'mock-public-key'
        };
      }
    }
  };
});

vi.mock('@/lib/auth/two-factor', async () => {
  return {
    TwoFactorService: class {
      async setupTwoFactor(userId: string, email: string) {
        return {
          secret: 'MOCK2FASECRETKEY',
          qrCodeUrl: `otpauth://totp/TestApp:${email}?secret=MOCK2FASECRETKEY&issuer=TestApp`
        };
      }

      async validateLogin(userId: string, token: string) {
        return { valid: token === '123456' };
      }
    }
  };
});

vi.mock('@/lib/prisma', async () => {
  return {
    prisma: {
      user: {
        findUnique: vi.fn().mockImplementation((args: any) => {
          if (args.where?.id === 'test-user-id') {
            return {
              id: 'test-user-id',
              email: 'test@example.com',
              name: 'Test User',
              twoFactorSecret: 'test-secret',
              twoFactorEnabled: true,
              credentials: []
            };
          }
          return null;
        }),
        update: vi.fn().mockImplementation((args: any) => {
          return {
            ...args.where,
            ...args.data
          };
        })
      }
    }
  };
}); 