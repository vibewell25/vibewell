import { TwoFactorService } from '../twoFactorService';
import RedisService from '../redisService';
import { User } from '../../models/User';
import speakeasy from 'speakeasy';

jest.mock('../redisService');
jest.mock('../../models/User');
jest.mock('speakeasy');
jest.mock('qrcode');

describe('TwoFactorService', () => {
  let twoFactorService: TwoFactorService;
  const mockUserId = 'test-user-id';
  const mockEmail = 'test@example.com';
  const mockSecret = 'TEST123456';
  const mockQrCode = 'data:image/png;base64,mockQrCode';

  beforeEach(() => {
    jest.clearAllMocks();
    twoFactorService = TwoFactorService.getInstance();
  });

  describe('generateSecretKey', () => {
    it('should generate a secret key and QR code', async () => {
      (speakeasy.generateSecret as jest.Mock).mockReturnValue({
        base32: mockSecret,
        otpauth_url: 'otpauth://totp/test'
      });

      const result = await twoFactorService.generateSecretKey(mockUserId, mockEmail);

      expect(result).toEqual({
        secretKey: mockSecret,
        qrCodeUrl: expect.any(String)
      });
      expect(RedisService.getInstance().setTemporarySecret).toHaveBeenCalledWith(
        mockUserId,
        mockSecret
      );
    });
  });

  describe('verifyCode', () => {
    it('should verify a valid code', async () => {
      const mockCode = '123456';
      (RedisService.getInstance().getTemporarySecret as jest.Mock).mockResolvedValue(mockSecret);
      (speakeasy.totp.verify as jest.Mock).mockReturnValue(true);

      const result = await twoFactorService.verifyCode(mockUserId, mockCode);

      expect(result).toBe(true);
      expect(speakeasy.totp.verify).toHaveBeenCalledWith({
        secret: mockSecret,
        encoding: 'base32',
        token: mockCode,
        window: 1
      });
    });

    it('should throw error if no secret found', async () => {
      (RedisService.getInstance().getTemporarySecret as jest.Mock).mockResolvedValue(null);

      await expect(twoFactorService.verifyCode(mockUserId, '123456')).rejects.toThrow(
        'No secret found for user'
      );
    });
  });

  describe('generateBackupCodes', () => {
    it('should generate 8 unique backup codes', () => {
      const codes = twoFactorService.generateBackupCodes();

      expect(codes).toHaveLength(8);
      expect(new Set(codes).size).toBe(8); // All codes should be unique
      codes.forEach(code => {
        expect(code).toMatch(/^[A-Z0-9]{8}$/);
      });
    });
  });

  describe('enable2FA', () => {
    it('should enable 2FA for user', async () => {
      (RedisService.getInstance().getTemporarySecret as jest.Mock).mockResolvedValue(mockSecret);
      const mockBackupCodes = ['CODE1', 'CODE2'];
      jest.spyOn(twoFactorService, 'generateBackupCodes').mockReturnValue(mockBackupCodes);

      await twoFactorService.enable2FA(mockUserId);

      expect(User.updateOne).toHaveBeenCalledWith(
        { _id: mockUserId },
        {
          $set: {
            'twoFactor.enabled': true,
            'twoFactor.secret': mockSecret,
            'twoFactor.backupCodes': mockBackupCodes
          }
        }
      );
      expect(RedisService.getInstance().deleteTemporarySecret).toHaveBeenCalledWith(mockUserId);
    });

    it('should throw error if no secret found', async () => {
      (RedisService.getInstance().getTemporarySecret as jest.Mock).mockResolvedValue(null);

      await expect(twoFactorService.enable2FA(mockUserId)).rejects.toThrow(
        'No secret found for user'
      );
    });
  });
}); 