import { describe, it, expect, beforeEach } from 'vitest';
import { vi } from 'vitest';

import { WebAuthnService } from '@/lib/auth/webauthn';
import { TwoFactorService } from '@/lib/auth/two-factor';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn()
    }
  }
}));

describe('Authentication Flow Tests', () => {
  let webAuthnService: WebAuthnService;
  let twoFactorService: TwoFactorService;
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com'
  };

  beforeEach(() => {
    webAuthnService = new WebAuthnService();
    twoFactorService = new TwoFactorService();
    vi.clearAllMocks();
  });

  describe('WebAuthn Flow', () => {
    it('should start registration process', async () => {
      (prisma.user.findUnique as any).mockResolvedValue(mockUser);
      
      const registrationResponse = await webAuthnService.startRegistration({
        ...mockUser,
        credentials: []
      });

      expect(registrationResponse).toBeDefined();
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUser.id }
      });
    });

    it('should verify registration', async () => {
      const mockResponse = {
        id: 'credential-id',
        rawId: 'raw-id',
        response: {},
        type: 'public-key'
      };

      const result = await webAuthnService.verifyRegistration(mockResponse);
      expect(result).toBeDefined();
    });
  });

  describe('2FA Flow', () => {
    it('should set up 2FA', async () => {
      const setup = await twoFactorService.setupTwoFactor(mockUser.id, mockUser.email);
      
      expect(setup.secret).toBeDefined();
      expect(setup.qrCodeUrl).toContain('otpauth://');
      expect(prisma.user.update).toHaveBeenCalled();
    });

    it('should verify 2FA token', async () => {
      (prisma.user.findUnique as any).mockResolvedValue({
        ...mockUser,
        twoFactorSecret: 'test-secret',
        twoFactorEnabled: true
      });

      const result = await twoFactorService.validateLogin(mockUser.id, '123456');
      expect(result).toBeDefined();
    });
  });
});
