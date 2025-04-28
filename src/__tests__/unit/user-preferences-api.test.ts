/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type, @typescript-eslint/no-namespace, @typescript-eslint/no-require-imports, react/no-unescaped-entities, import/no-anonymous-default-export, no-unused-vars, security/detect-object-injection, unicorn/no-null, unicorn/consistent-function-scoping */import { NextRequest } from 'next/server';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import * as authHooks from '@/hooks/use-unified-auth';
import {
  GET as getUserPreferencesRoute,
  PUT as updateUserPreferencesRoute,
} from '@/app/api/user/preferences/route';

// Import the UserRole from the correct location
import { UserRole } from '@/contexts/unified-auth-context';

// Mock the auth hooks
vi.mock('@/hooks/use-unified-auth', () => ({
  isAuthenticated: vi.fn(),
  getAuthState: vi.fn(),
}));

// Mock the prisma client
vi.mock('@/lib/prisma', () => ({
  prisma: {
    userPreference: {
      findMany: vi.fn(),
      deleteMany: vi.fn(),
      createMany: vi.fn(),
    },
  },
}));

// Mock the logger
vi.mock('@/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

describe('User Preferences API endpoints', () => {
  const mockUser = { id: 'user-1', email: 'user@example.com' };

  beforeEach(() => {
    vi.resetAllMocks();

    // Mock authentication to succeed by default with all required properties
    vi.mocked(authHooks.isAuthenticated).mockResolvedValue(true);
    vi.mocked(authHooks.getAuthState).mockResolvedValue({
      user: mockUser,
      isAuthenticated: true,
      session: {},
      userRole: UserRole.USER,
    });
  });

  describe('GET /api/user/preferences', () => {
    it('returns 401 when not authenticated', async () => {
      vi.mocked(authHooks.isAuthenticated).mockResolvedValue(false);

      const request = new NextRequest('http://localhost/api/user/preferences');
      const response = await getUserPreferencesRoute(request);

      expect(response.status).toBe(401);
      expect(await response.json()).toHaveProperty('error', 'Unauthorized');
    });

    it('returns 404 when user not found', async () => {
      vi.mocked(authHooks.getAuthState).mockResolvedValue({
        user: null,
        isAuthenticated: true,
        session: {},
        userRole: UserRole.USER,
      });

      const request = new NextRequest('http://localhost/api/user/preferences');
      const response = await getUserPreferencesRoute(request);

      expect(response.status).toBe(404);
      expect(await response.json()).toHaveProperty('error', 'User not found');
    });

    it('returns empty preferences when none exist', async () => {
      vi.mocked(vi.mocked(authHooks.getAuthState).mock.results[0].value.user.id);

      const request = new NextRequest('http://localhost/api/user/preferences');
      const response = await getUserPreferencesRoute(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData).toHaveProperty('preferences', {});
    });

    it('returns formatted preferences from database', async () => {
      const mockPreferences = [
        { category: 'theme', weight: 1.0 },
        { category: 'fontSize', weight: 0.5 },
        { category: 'emailNotifications', weight: 1.0 },
      ];

      // Use function form to access the mocked module
      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.userPreference.findMany).mockResolvedValue(mockPreferences);

      const request = new NextRequest('http://localhost/api/user/preferences');
      const response = await getUserPreferencesRoute(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData).toHaveProperty('preferences');
      expect(responseData.preferences).toHaveProperty('theme', 1.0);
      expect(responseData.preferences).toHaveProperty('fontSize', 0.5);
      expect(responseData.preferences).toHaveProperty('emailNotifications', 1.0);
    });
  });

  describe('PUT /api/user/preferences', () => {
    it('validates input data', async () => {
      const request = new NextRequest('http://localhost/api/user/preferences', {
        method: 'PUT',
        body: JSON.stringify({
          preferences: {
            theme: 'invalid-theme', // Should be light, dark, or system
          },
        }),
      });

      const response = await updateUserPreferencesRoute(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData).toHaveProperty('error', 'Invalid preferences data');
    });

    it('updates preferences in database', async () => {
      const mockPreferencesData = {
        theme: 'dark',
        fontSize: 'large',
        emailNotifications: true,
      };

      const request = new NextRequest('http://localhost/api/user/preferences', {
        method: 'PUT',
        body: JSON.stringify({
          preferences: mockPreferencesData,
        }),
      });

      // Use function form to access the mocked module
      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.userPreference.deleteMany).mockResolvedValue({ count: 3 });
      vi.mocked(prisma.userPreference.createMany).mockResolvedValue({ count: 3 });

      const response = await updateUserPreferencesRoute(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData).toHaveProperty('success', true);

      // Should delete existing preferences first
      expect(prisma.userPreference.deleteMany).toHaveBeenCalledWith({
        where: { userId: mockUser.id },
      });

      // Should create new preferences
      expect(prisma.userPreference.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({ userId: mockUser.id, category: 'theme' }),
          expect.objectContaining({ userId: mockUser.id, category: 'fontSize' }),
          expect.objectContaining({ userId: mockUser.id, category: 'emailNotifications' }),
        ]),
      });
    });

    it('handles boolean preferences correctly', async () => {
      const mockPreferencesData = {
        reducedMotion: true,
        highContrast: false,
      };

      const request = new NextRequest('http://localhost/api/user/preferences', {
        method: 'PUT',
        body: JSON.stringify({
          preferences: mockPreferencesData,
        }),
      });

      // Use function form to access the mocked module
      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.userPreference.deleteMany).mockResolvedValue({ count: 2 });
      vi.mocked(prisma.userPreference.createMany).mockResolvedValue({ count: 2 });

      await updateUserPreferencesRoute(request);

      // Check createMany was called with correct boolean weights
      expect(prisma.userPreference.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({
            userId: mockUser.id,
            category: 'reducedMotion',
            weight: 1.0, // true = 1.0
          }),
          expect.objectContaining({
            userId: mockUser.id,
            category: 'highContrast',
            weight: 0.0, // false = 0.0
          }),
        ]),
      });
    });

    it('handles arrays in preferences', async () => {
      const mockPreferencesData = {
        contentCategories: ['yoga', 'wellness'],
      };

      const request = new NextRequest('http://localhost/api/user/preferences', {
        method: 'PUT',
        body: JSON.stringify({
          preferences: mockPreferencesData,
        }),
      });

      // Use function form to access the mocked module
      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.userPreference.deleteMany).mockResolvedValue({ count: 1 });
      vi.mocked(prisma.userPreference.createMany).mockResolvedValue({ count: 1 });

      await updateUserPreferencesRoute(request);

      // Array preferences are stored with default weight
      expect(prisma.userPreference.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({
            userId: mockUser.id,
            category: 'contentCategories',
            weight: 0.5,
          }),
        ]),
      });
    });
  });
});
