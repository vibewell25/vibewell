






















/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type, @typescript-eslint/no-namespace, @typescript-eslint/no-require-imports, react/no-unescaped-entities, import/no-anonymous-default-export, no-unused-vars, security/detect-object-injection, unicorn/no-null, unicorn/consistent-function-scoping */import { NextRequest } from 'next/server';

import { createMocks } from 'node-mocks-http';


import { getUserPreferences, updateUserPreferences } from '@/app/api/user-preferences/route';

// Mock the database client

jest.mock('@/lib/database/client', () => ({
  prisma: {
    userPreferences: {
      findUnique: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
  },
}));

// Mock auth service

jest.mock('@/services/auth-service', () => ({
  getCurrentUser: jest.fn(),
}));


import { prisma } from '@/lib/database/client';

import { getCurrentUser } from '@/services/auth-service';

describe('User Preferences API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });



  describe('GET /api/user-preferences', () => {
    it('returns 401 if user is not authenticated', async () => {
      // Mock user as not authenticated
      (getCurrentUser as jest.Mock).mockResolvedValue(null);

      // Create a mock request
      const { req } = createMocks({
        method: 'GET',
      });

      // Call the API handler
      const response = await getUserPreferences(req as unknown as NextRequest);
      const responseBody = await response.json();

      // Assert response
      expect(response.status).toBe(401);
      expect(responseBody).toEqual({ error: 'Unauthorized' });
    });

    it('returns 404 if user preferences not found', async () => {
      // Mock user as authenticated

      (getCurrentUser as jest.Mock).mockResolvedValue({ id: 'user-123' });

      // Mock database response
      (prisma.userPreferences.findUnique as jest.Mock).mockResolvedValue(null);

      // Create a mock request
      const { req } = createMocks({
        method: 'GET',
      });

      // Call the API handler
      const response = await getUserPreferences(req as unknown as NextRequest);
      const responseBody = await response.json();

      // Assert response
      expect(response.status).toBe(404);
      expect(responseBody).toEqual({ error: 'User preferences not found' });
      expect(prisma.userPreferences.findUnique).toHaveBeenCalledWith({

        where: { userId: 'user-123' },
      });
    });

    it('returns user preferences successfully', async () => {
      // Mock user as authenticated

      (getCurrentUser as jest.Mock).mockResolvedValue({ id: 'user-123' });

      // Mock database response
      const mockPreferences = {

        id: 'pref-123',

        userId: 'user-123',
        theme: 'dark',
        language: 'en',
        notifications: {
          email: true,
          push: false,
          sms: true,
        },
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-02-01'),
      };
      (prisma.userPreferences.findUnique as jest.Mock).mockResolvedValue(mockPreferences);

      // Create a mock request
      const { req } = createMocks({
        method: 'GET',
      });

      // Call the API handler
      const response = await getUserPreferences(req as unknown as NextRequest);
      const responseBody = await response.json();

      // Assert response
      expect(response.status).toBe(200);
      expect(responseBody).toEqual(mockPreferences);
      expect(prisma.userPreferences.findUnique).toHaveBeenCalledWith({

        where: { userId: 'user-123' },
      });
    });
  });



  describe('PUT /api/user-preferences', () => {
    it('returns 401 if user is not authenticated', async () => {
      // Mock user as not authenticated
      (getCurrentUser as jest.Mock).mockResolvedValue(null);

      // Create a mock request
      const { req } = createMocks({
        method: 'PUT',
        body: {
          theme: 'light',
          language: 'fr',
          notifications: {
            email: true,
            push: true,
            sms: false,
          },
        },
      });

      // Call the API handler
      const response = await updateUserPreferences(req as unknown as NextRequest);
      const responseBody = await response.json();

      // Assert response
      expect(response.status).toBe(401);
      expect(responseBody).toEqual({ error: 'Unauthorized' });
    });

    it('creates new preferences if they do not exist', async () => {
      // Mock user as authenticated

      (getCurrentUser as jest.Mock).mockResolvedValue({ id: 'user-123' });

      // Mock database response for findUnique
      (prisma.userPreferences.findUnique as jest.Mock).mockResolvedValue(null);

      // Mock database response for create
      const newPreferences = {

        id: 'pref-123',

        userId: 'user-123',
        theme: 'light',
        language: 'fr',
        notifications: {
          email: true,
          push: true,
          sms: false,
        },
        createdAt: new Date('2023-03-01'),
        updatedAt: new Date('2023-03-01'),
      };
      (prisma.userPreferences.create as jest.Mock).mockResolvedValue(newPreferences);

      // Create a mock request with the update data
      const updateData = {
        theme: 'light',
        language: 'fr',
        notifications: {
          email: true,
          push: true,
          sms: false,
        },
      };
      const { req } = createMocks({
        method: 'PUT',
        body: updateData,
      });

      // Call the API handler
      const response = await updateUserPreferences(req as unknown as NextRequest);
      const responseBody = await response.json();

      // Assert response
      expect(response.status).toBe(200);
      expect(responseBody).toEqual(newPreferences);
      expect(prisma.userPreferences.create).toHaveBeenCalledWith({
        data: {

          userId: 'user-123',
          ...updateData,
        },
      });
    });

    it('updates existing preferences', async () => {
      // Mock user as authenticated

      (getCurrentUser as jest.Mock).mockResolvedValue({ id: 'user-123' });

      // Mock existing preferences
      const existingPreferences = {

        id: 'pref-123',

        userId: 'user-123',
        theme: 'dark',
        language: 'en',
        notifications: {
          email: true,
          push: false,
          sms: true,
        },
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-02-01'),
      };
      (prisma.userPreferences.findUnique as jest.Mock).mockResolvedValue(existingPreferences);

      // Mock updated preferences
      const updatedPreferences = {
        ...existingPreferences,
        theme: 'light',
        language: 'fr',
        notifications: {
          email: true,
          push: true,
          sms: false,
        },
        updatedAt: new Date('2023-03-01'),
      };
      (prisma.userPreferences.update as jest.Mock).mockResolvedValue(updatedPreferences);

      // Create a mock request with the update data
      const updateData = {
        theme: 'light',
        language: 'fr',
        notifications: {
          email: true,
          push: true,
          sms: false,
        },
      };
      const { req } = createMocks({
        method: 'PUT',
        body: updateData,
      });

      // Call the API handler
      const response = await updateUserPreferences(req as unknown as NextRequest);
      const responseBody = await response.json();

      // Assert response
      expect(response.status).toBe(200);
      expect(responseBody).toEqual(updatedPreferences);
      expect(prisma.userPreferences.update).toHaveBeenCalledWith({

        where: { userId: 'user-123' },
        data: updateData,
      });
    });

    it('handles database errors gracefully', async () => {
      // Mock user as authenticated

      (getCurrentUser as jest.Mock).mockResolvedValue({ id: 'user-123' });

      // Mock finding existing preferences
      (prisma.userPreferences.findUnique as jest.Mock).mockResolvedValue({

        id: 'pref-123',

        userId: 'user-123',
      });

      // Mock database error
      (prisma.userPreferences.update as jest.Mock).mockRejectedValue(new Error('Database error'));

      // Create a mock request
      const { req } = createMocks({
        method: 'PUT',
        body: {
          theme: 'light',
        },
      });

      // Call the API handler
      const response = await updateUserPreferences(req as unknown as NextRequest);
      const responseBody = await response.json();

      // Assert response
      expect(response.status).toBe(500);
      expect(responseBody).toEqual({ error: 'Failed to update user preferences' });
    });
  });
});
