import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AuthService } from '../auth-service';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    session: {
      create: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
    passwordResetToken: {
      create: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
  }
}));

vi.mock('bcryptjs', () => ({
  hash: vi.fn().mockImplementation((password) => Promise.resolve(`hashed_${password}`)),
  compare: vi.fn().mockImplementation((password, hashedPassword) => {
    const passwordWithoutHash = hashedPassword.replace('hashed_', '');
    return Promise.resolve(password === passwordWithoutHash);
  }),
}));

vi.mock('jsonwebtoken', () => ({
  sign: vi.fn().mockImplementation(() => 'mock-jwt-token'),
  verify: vi.fn().mockImplementation((token, secret) => {
    if (token === 'valid-token') {
      return { userId: 'user-id', role: 'user' };
    }
    throw new Error('Invalid token');
  }),
}));

// Mock environment variables
const originalEnv = process.env;
beforeEach(() => {
  process.env = {
    ...originalEnv,
    JWT_SECRET: 'test-secret',
    JWT_EXPIRES_IN: '1h',
  };
});

afterEach(() => {
  process.env = originalEnv;
  vi.clearAllMocks();
});

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
  });

  describe('registerUser', () => {
    it('should register a new user successfully', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
      };

      const mockCreatedUser = {
        id: 'user-id',
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: 'user',
        createdAt: new Date(),
      };

      prisma.user.findFirst.mockResolvedValue(null); // No existing user
      prisma.user.create.mockResolvedValue(mockCreatedUser);

      // Act
      const result = await authService.registerUser(userData);

      // Assert
      expect(result).toEqual({
        user: {
          id: 'user-id',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'user',
        },
        token: 'mock-jwt-token',
      });

      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: userData.email },
      });

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: userData.email,
          password: 'hashed_Password123!',
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: 'user',
        },
      });

      expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, expect.any(Number));
      expect(jwt.sign).toHaveBeenCalled();
    });

    it('should throw error if user already exists', async () => {
      // Arrange
      const userData = {
        email: 'existing@example.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
      };

      prisma.user.findFirst.mockResolvedValue({
        id: 'existing-user-id',
        email: userData.email,
      });

      // Act & Assert
      await expect(authService.registerUser(userData)).rejects.toThrow(
        'User with this email already exists'
      );

      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('should validate password requirements', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        password: 'weak', // Too short
        firstName: 'Test',
        lastName: 'User',
      };

      // Act & Assert
      await expect(authService.registerUser(userData)).rejects.toThrow(
        'Password must be at least 8 characters'
      );

      expect(prisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should login user with correct credentials', async () => {
      // Arrange
      const credentials = {
        email: 'user@example.com',
        password: 'correctPassword',
      };

      const mockUser = {
        id: 'user-id',
        email: credentials.email,
        password: 'hashed_correctPassword',
        firstName: 'Test',
        lastName: 'User',
        role: 'user',
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);

      // Act
      const result = await authService.login(credentials.email, credentials.password);

      // Assert
      expect(result).toEqual({
        user: {
          id: 'user-id',
          email: 'user@example.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'user',
        },
        token: 'mock-jwt-token',
      });

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: credentials.email },
      });

      expect(bcrypt.compare).toHaveBeenCalledWith(credentials.password, mockUser.password);
      expect(jwt.sign).toHaveBeenCalled();
    });

    it('should throw error if user does not exist', async () => {
      // Arrange
      prisma.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.login('nonexistent@example.com', 'any-password')).rejects.toThrow(
        'Invalid credentials'
      );

      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw error if password is incorrect', async () => {
      // Arrange
      const mockUser = {
        id: 'user-id',
        email: 'user@example.com',
        password: 'hashed_correctPassword',
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(authService.login('user@example.com', 'wrongPassword')).rejects.toThrow(
        'Invalid credentials'
      );

      expect(bcrypt.compare).toHaveBeenCalled();
    });
  });

  describe('verifyToken', () => {
    it('should verify valid token', () => {
      // Arrange
      const token = 'valid-token';

      // Act
      const result = authService.verifyToken(token);

      // Assert
      expect(result).toEqual({
        userId: 'user-id',
        role: 'user',
      });

      expect(jwt.verify).toHaveBeenCalledWith(token, 'test-secret');
    });

    it('should throw error if token is invalid', () => {
      // Arrange
      const token = 'invalid-token';

      // Act & Assert
      expect(() => authService.verifyToken(token)).toThrow('Invalid token');
    });
  });

  describe('requestPasswordReset', () => {
    it('should generate reset token for existing user', async () => {
      // Arrange
      const email = 'user@example.com';
      const mockUser = {
        id: 'user-id',
        email,
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.passwordResetToken.create.mockResolvedValue({
        id: 'token-id',
        token: 'reset-token',
        userId: 'user-id',
        expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
      });

      // Act
      const result = await authService.requestPasswordReset(email);

      // Assert
      expect(result).toEqual({
        success: true,
        message: 'Password reset link sent to email',
      });

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email },
      });

      expect(prisma.passwordResetToken.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-id',
          token: expect.any(String),
          expiresAt: expect.any(Date),
        },
      });
    });

    it('should handle non-existent user gracefully', async () => {
      // Arrange
      prisma.user.findUnique.mockResolvedValue(null);

      // Act
      const result = await authService.requestPasswordReset('nonexistent@example.com');

      // Assert
      expect(result).toEqual({
        success: true,
        message: 'If a user with that email exists, a password reset link was sent',
      });

      expect(prisma.passwordResetToken.create).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('should reset password with valid token', async () => {
      // Arrange
      const resetToken = 'valid-reset-token';
      const newPassword = 'NewPassword123!';

      const mockResetTokenRecord = {
        id: 'token-id',
        token: resetToken,
        userId: 'user-id',
        expiresAt: new Date(Date.now() + 60000), // Valid - 1 minute in future
      };

      prisma.passwordResetToken.findUnique.mockResolvedValue(mockResetTokenRecord);
      prisma.user.update.mockResolvedValue({
        id: 'user-id',
        email: 'user@example.com',
      });

      // Act
      const result = await authService.resetPassword(resetToken, newPassword);

      // Assert
      expect(result).toEqual({
        success: true,
        message: 'Password reset successful',
      });

      expect(prisma.passwordResetToken.findUnique).toHaveBeenCalledWith({
        where: { token: resetToken },
      });

      expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, expect.any(Number));

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-id' },
        data: { password: expect.stringContaining('hashed_') },
      });

      expect(prisma.passwordResetToken.delete).toHaveBeenCalledWith({
        where: { id: 'token-id' },
      });
    });

    it('should throw error if token is invalid', async () => {
      // Arrange
      prisma.passwordResetToken.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.resetPassword('invalid-token', 'NewPassword123!')).rejects.toThrow(
        'Invalid or expired reset token'
      );

      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('should throw error if token is expired', async () => {
      // Arrange
      const mockResetTokenRecord = {
        id: 'token-id',
        token: 'expired-token',
        userId: 'user-id',
        expiresAt: new Date(Date.now() - 60000), // Expired - 1 minute in past
      };

      prisma.passwordResetToken.findUnique.mockResolvedValue(mockResetTokenRecord);

      // Act & Assert
      await expect(authService.resetPassword('expired-token', 'NewPassword123!')).rejects.toThrow(
        'Invalid or expired reset token'
      );

      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('should validate password requirements', async () => {
      // Arrange
      const mockResetTokenRecord = {
        id: 'token-id',
        token: 'valid-reset-token',
        userId: 'user-id',
        expiresAt: new Date(Date.now() + 60000), // Valid - 1 minute in future
      };

      prisma.passwordResetToken.findUnique.mockResolvedValue(mockResetTokenRecord);

      // Act & Assert
      await expect(authService.resetPassword('valid-reset-token', 'weak')).rejects.toThrow(
        'Password must be at least 8 characters'
      );

      expect(prisma.user.update).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should invalidate user session', async () => {
      // Arrange
      const userId = 'user-id';
      const sessionId = 'session-id';

      // Act
      await authService.logout(userId, sessionId);

      // Assert
      expect(prisma.session.delete).toHaveBeenCalledWith({
        where: {
          id: sessionId,
          userId,
        },
      });
    });

    it('should logout from all sessions when requested', async () => {
      // Arrange
      const userId = 'user-id';

      // Act
      await authService.logoutAll(userId);

      // Assert
      expect(prisma.session.deleteMany).toHaveBeenCalledWith({
        where: { userId },
      });
    });
  });

  describe('changePassword', () => {
    it('should change password when current password is correct', async () => {
      // Arrange
      const userId = 'user-id';
      const currentPassword = 'CurrentPassword123!';
      const newPassword = 'NewPassword123!';

      const mockUser = {
        id: userId,
        password: 'hashed_CurrentPassword123!',
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.user.update.mockResolvedValue({ id: userId });

      // Act
      const result = await authService.changePassword(userId, currentPassword, newPassword);

      // Assert
      expect(result).toEqual({
        success: true,
        message: 'Password changed successfully',
      });

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });

      expect(bcrypt.compare).toHaveBeenCalledWith(currentPassword, mockUser.password);
      expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, expect.any(Number));

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { password: expect.stringContaining('hashed_') },
      });
    });

    it('should throw error if current password is incorrect', async () => {
      // Arrange
      const mockUser = {
        id: 'user-id',
        password: 'hashed_CurrentPassword123!',
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(
        authService.changePassword('user-id', 'WrongCurrentPassword', 'NewPassword123!')
      ).rejects.toThrow('Current password is incorrect');

      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('should validate password requirements', async () => {
      // Arrange
      const mockUser = {
        id: 'user-id',
        password: 'hashed_CurrentPassword123!',
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(
        authService.changePassword('user-id', 'CurrentPassword123!', 'weak')
      ).rejects.toThrow('Password must be at least 8 characters');

      expect(prisma.user.update).not.toHaveBeenCalled();
    });
  });
}); 