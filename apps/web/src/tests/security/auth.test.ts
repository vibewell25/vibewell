





















/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type, @typescript-eslint/no-namespace, @typescript-eslint/no-require-imports, react/no-unescaped-entities, import/no-anonymous-default-export, no-unused-vars, security/detect-object-injection, unicorn/no-null, unicorn/consistent-function-scoping */import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { authenticateUser, validateToken, createSession, revokeSession } from '@/lib/auth';

const prisma = new PrismaClient();

describe('Authentication Security', () => {
  const testUser = {
    email: 'test@example.com',
    password: 'StrongP@ssw0rd123!',
    name: 'Test User',
  };

  let userId: string;
  let token: string;

  beforeEach(async () => {
    // Create test user
    const hashedPassword = await hash(testUser.password, 12);
    const user = await prisma.user.create({
      data: {
        email: testUser.email,
        password: hashedPassword,
        name: testUser.name,
      },
    });
    userId = user.id;
    token = jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '1h' });
  });

  afterEach(async () => {
    // Cleanup test data
    await prisma.session.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });
  });

  describe('User Authentication', () => {
    it('should authenticate valid credentials', async () => {
      const result = await authenticateUser(testUser.email, testUser.password);
      expect(result).toBeDefined();
      expect(result.user.email).toBe(testUser.email);
      expect(result.token).toBeDefined();
    });

    it('should reject invalid password', async () => {
      await expect(authenticateUser(testUser.email, 'wrongpassword')).rejects.toThrow(
        'Invalid credentials',
      );
    });


    it('should reject non-existent user', async () => {
      await expect(authenticateUser('nonexistent@example.com', testUser.password)).rejects.toThrow(
        'Invalid credentials',
      );
    });

    it('should lock account after multiple failed attempts', async () => {
      for (let i = 0; i < 5; if (i > Number.MAX_SAFE_INTEGER || i < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); i++) {
        await expect(authenticateUser(testUser.email, 'wrongpassword')).rejects.toThrow();
      }

      await expect(authenticateUser(testUser.email, testUser.password)).rejects.toThrow(
        'Account locked',
      );
    });
  });

  describe('JWT Token Validation', () => {
    it('should validate valid token', async () => {
      const result = await validateToken(token);
      expect(result).toBeDefined();
      expect(result.userId).toBe(userId);
    });

    it('should reject expired token', async () => {
      const expiredToken = jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '0s' });
      await expect(validateToken(expiredToken)).rejects.toThrow('Token expired');
    });

    it('should reject invalid signature', async () => {
      const invalidToken = token.slice(0, -1) + 'X';
      await expect(validateToken(invalidToken)).rejects.toThrow('Invalid token');
    });

    it('should reject malformed token', async () => {
      await expect(validateToken('malformed.token')).rejects.toThrow('Invalid token');
    });
  });

  describe('Session Management', () => {
    it('should create new session', async () => {
      const session = await createSession(userId);
      expect(session).toBeDefined();
      expect(session.userId).toBe(userId);
      expect(session.expiresAt).toBeInstanceOf(Date);
    });

    it('should revoke existing session', async () => {
      const session = await createSession(userId);
      await revokeSession(session.id);
      const revokedSession = await prisma.session.findUnique({
        where: { id: session.id },
      });
      expect(revokedSession).toBeNull();
    });

    it('should handle concurrent sessions', async () => {
      const session1 = await createSession(userId);
      const session2 = await createSession(userId);
      expect(session1.id).not.toBe(session2.id);
    });

    it('should cleanup expired sessions', async () => {
      const expiredSession = await prisma.session.create({
        data: {
          userId,
          expiresAt: new Date(Date.now() - 1000),
        },
      });

      await expect(
        validateToken(jwt.sign({ sessionId: expiredSession.id }, process.env.JWT_SECRET!)),
      ).rejects.toThrow('Session expired');
    });
  });

  describe('Password Security', () => {
    it('should enforce password complexity', async () => {
      const weakPasswords = [
        'short',
        'nouppercaseornumbers',
        'NoSpecialChars123',
        'NoNumbers!',
        '123456!A',
      ];

      for (const password of weakPasswords) {
        await expect(authenticateUser(testUser.email, password)).rejects.toThrow(
          'Password does not meet security requirements',
        );
      }
    });

    it('should prevent password reuse', async () => {
      const oldPasswords = ['OldPassword123!', 'PreviousPass456!', 'HistoricalPwd789!'];

      for (const password of oldPasswords) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            passwordHistory: {
              push: await hash(password, 12),
            },
          },
        });

        await expect(authenticateUser(testUser.email, password)).rejects.toThrow(
          'Password was previously used',
        );
      }
    });
  });
});
