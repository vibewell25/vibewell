import { EmailVerificationService } from '../email-verification';
import { prisma } from '@/lib/database/client';

// Mock Supabase
jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      resend: jest.fn(),
    },
    from: jest.fn(),
  },
}));

describe('EmailVerificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set up mocks for supabase
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    });
  });

  describe('sendVerificationEmail', () => {
    it('should send a verification email successfully', async () => {
      // Mock successful response
      (supabase.auth.resend as jest.Mock).mockResolvedValue({
        data: {},
        error: null,
      });

      const result = await EmailVerificationService.sendVerificationEmail('test@example.com');

      expect(supabase.auth.resend).toHaveBeenCalledWith({
        type: 'signup',
        email: 'test@example.com',
      });
      expect(result).toEqual({
        success: true,
        message: 'Verification email sent successfully',
      });
    });

    it('should handle errors when sending verification email', async () => {
      // Mock error response
      (supabase.auth.resend as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Test error' },
      });

      const result = await EmailVerificationService.sendVerificationEmail('test@example.com');

      expect(result).toEqual({
        success: false,
        message: 'Test error',
      });
    });
  });

  describe('isEmailVerified', () => {
    it('should return true if email is verified', async () => {
      // Mock verified email
      const singleMock = jest.fn().mockResolvedValue({
        data: { email_verified: true },
        error: null,
      });

      (supabase.from as jest.Mock)().select().eq().single = singleMock;

      const result = await EmailVerificationService.isEmailVerified('user-123');

      expect(supabase.from).toHaveBeenCalledWith('profiles');
      expect(result).toBe(true);
    });

    it('should return false if email is not verified', async () => {
      // Mock unverified email
      const singleMock = jest.fn().mockResolvedValue({
        data: { email_verified: false },
        error: null,
      });

      (supabase.from as jest.Mock)().select().eq().single = singleMock;

      const result = await EmailVerificationService.isEmailVerified('user-123');

      expect(result).toBe(false);
    });

    it('should handle errors and return false', async () => {
      // Mock error response
      const singleMock = jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Test error' },
      });

      (supabase.from as jest.Mock)().select().eq().single = singleMock;

      const result = await EmailVerificationService.isEmailVerified('user-123');

      expect(result).toBe(false);
    });
  });

  describe('updateEmailVerificationStatus', () => {
    it('should update email verification status successfully', async () => {
      // Mock successful update
      (supabase.from as jest.Mock)().update().eq = jest.fn().mockResolvedValue({
        data: {},
        error: null,
      });

      const result = await EmailVerificationService.updateEmailVerificationStatus('user-123', true);

      expect(supabase.from).toHaveBeenCalledWith('profiles');
      expect(result).toEqual({ success: true });
    });

    it('should handle errors when updating email verification status', async () => {
      // Mock error response
      (supabase.from as jest.Mock)().update().eq = jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Test error' },
      });

      const result = await EmailVerificationService.updateEmailVerificationStatus('user-123', true);

      expect(result).toEqual({ success: false });
    });
  });
});
