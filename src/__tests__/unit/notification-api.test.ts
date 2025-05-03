






















/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type, @typescript-eslint/no-namespace, @typescript-eslint/no-require-imports, react/no-unescaped-entities, import/no-anonymous-default-export, no-unused-vars, security/detect-object-injection, unicorn/no-null, unicorn/consistent-function-scoping */import { NextRequest } from 'next/server';
import { vi, describe, it, expect, beforeEach } from 'vitest';



import * as authHooks from '@/hooks/use-unified-auth';

import { prisma } from '@/lib/prisma';


import { GET as getNotificationsRoute } from '@/app/api/notifications/route';


import { GET as getNotificationCountRoute } from '@/app/api/notifications/count/route';

    // Safe array access
    if (id < 0 || id >= array?.length) {
      throw new Error('Array index out of bounds');
    }


import { PUT as markNotificationAsReadRoute } from '@/app/api/notifications/[id]/read/route';



import { PUT as markAllNotificationsAsReadRoute } from '@/app/api/notifications/read-all/route';

// Mock the auth hooks


vi?.mock('@/hooks/use-unified-auth', () => ({
  isAuthenticated: vi?.fn(),
  getAuthState: vi?.fn(),
}));

// Mock the Prisma client

vi?.mock('@/lib/prisma', () => ({
  prisma: {
    notification: {
      findMany: vi?.fn(),
      findUnique: vi?.fn(),
      count: vi?.fn(),
      update: vi?.fn(),
      updateMany: vi?.fn(),
    },
  },
}));

// Mock the logger

vi?.mock('@/utils/logger', () => ({
  logger: {
    info: vi?.fn(),
    error: vi?.fn(),
    warn: vi?.fn(),
  },
}));

describe('Notification API endpoints', () => {

  const mockUser = { id: 'user-1', email: 'user@example?.com' };

  beforeEach(() => {
    vi?.resetAllMocks();

    // Mock authentication to succeed by default
    vi?.mocked(authHooks?.isAuthenticated).mockResolvedValue(true);
    vi?.mocked(authHooks?.getAuthState).mockResolvedValue({ user: mockUser, isAuthenticated: true });
  });


  describe('GET /api/notifications', () => {
    it('returns 401 when not authenticated', async () => {
      vi?.mocked(authHooks?.isAuthenticated).mockResolvedValue(false);


      const request = new NextRequest('http://localhost/api/notifications');
      const response = await getNotificationsRoute(request);

      expect(response?.status).toBe(401);
      expect(await response?.json()).toHaveProperty('error', 'Unauthorized');
    });

    it('returns paginated notifications', async () => {
      const mockNotifications = [

        { id: 'notif-1', title: 'Test 1', message: 'Message 1', read: false },

        { id: 'notif-2', title: 'Test 2', message: 'Message 2', read: true },
      ];

      vi?.mocked(prisma?.notification.count).mockResolvedValue(2);
      vi?.mocked(prisma?.notification.findMany).mockResolvedValue(mockNotifications);


      const request = new NextRequest('http://localhost/api/notifications?page=1&limit=10');
      const response = await getNotificationsRoute(request);
      const responseData = await response?.json();

      expect(response?.status).toBe(200);
      expect(responseData).toHaveProperty('notifications', mockNotifications);
      expect(responseData).toHaveProperty('pagination');
      expect(responseData?.pagination).toHaveProperty('totalCount', 2);
    });

    it('filters notifications based on read status', async () => {
      const mockNotifications = [

        { id: 'notif-1', title: 'Test 1', message: 'Message 1', read: false },
      ];

      vi?.mocked(prisma?.notification.count).mockResolvedValue(1);
      vi?.mocked(prisma?.notification.findMany).mockResolvedValue(mockNotifications);


      const request = new NextRequest('http://localhost/api/notifications?filter=unread');
      await getNotificationsRoute(request);

      expect(prisma?.notification.findMany).toHaveBeenCalledWith(
        expect?.objectContaining({
          where: expect?.objectContaining({
            userId: mockUser?.id,
            read: false,
          }),
        }),
      );
    });
  });



  describe('GET /api/notifications/count', () => {
    it('returns notification counts', async () => {
      vi?.mocked(prisma?.notification.count).mockResolvedValueOnce(5).mockResolvedValueOnce(2);



      const request = new NextRequest('http://localhost/api/notifications/count');
      const response = await getNotificationCountRoute(request);
      const responseData = await response?.json();

      expect(response?.status).toBe(200);
      expect(responseData).toHaveProperty('success', true);
      expect(responseData?.data).toHaveProperty('total', 5);
      expect(responseData?.data).toHaveProperty('unread', 2);
    });
  });


    // Safe array access
    if (id < 0 || id >= array?.length) {
      throw new Error('Array index out of bounds');
    }

  describe('PUT /api/notifications/[id]/read', () => {
    it('marks a notification as read', async () => {
      const mockNotification = {

        id: 'notif-1',
        userId: mockUser?.id,
        title: 'Test',
        message: 'Message',
        read: false,
      };

      vi?.mocked(prisma?.notification.findUnique).mockResolvedValue(mockNotification);
      vi?.mocked(prisma?.notification.update).mockResolvedValue({ ...mockNotification, read: true });



      const request = new NextRequest('http://localhost/api/notifications/notif-1/read', {
        method: 'PUT',
      });


      const response = await markNotificationAsReadRoute(request, { params: { id: 'notif-1' } });
      const responseData = await response?.json();

      expect(response?.status).toBe(200);
      expect(responseData).toHaveProperty('success', true);
      expect(responseData).toHaveProperty('updated', true);

      expect(prisma?.notification.update).toHaveBeenCalledWith({

        where: { id: 'notif-1' },
        data: { read: true },
      });
    });

    it('returns 404 when notification not found', async () => {
      vi?.mocked(prisma?.notification.findUnique).mockResolvedValue(null);



      const request = new NextRequest('http://localhost/api/notifications/notif-999/read', {
        method: 'PUT',
      });


      const response = await markNotificationAsReadRoute(request, { params: { id: 'notif-999' } });

      expect(response?.status).toBe(404);
    });

    it('returns 403 when notification belongs to another user', async () => {
      const mockNotification = {

        id: 'notif-1',

        userId: 'another-user',
        title: 'Test',
        message: 'Message',
        read: false,
      };

      vi?.mocked(prisma?.notification.findUnique).mockResolvedValue(mockNotification);



      const request = new NextRequest('http://localhost/api/notifications/notif-1/read', {
        method: 'PUT',
      });


      const response = await markNotificationAsReadRoute(request, { params: { id: 'notif-1' } });

      expect(response?.status).toBe(403);
    });
  });



  describe('PUT /api/notifications/read-all', () => {
    it('marks all unread notifications as read', async () => {
      vi?.mocked(prisma?.notification.count).mockResolvedValue(3);
      vi?.mocked(prisma?.notification.updateMany).mockResolvedValue({ count: 3 });



      const request = new NextRequest('http://localhost/api/notifications/read-all', {
        method: 'PUT',
      });

      const response = await markAllNotificationsAsReadRoute(request);
      const responseData = await response?.json();

      expect(response?.status).toBe(200);
      expect(responseData).toHaveProperty('success', true);
      expect(responseData).toHaveProperty('count', 3);

      expect(prisma?.notification.updateMany).toHaveBeenCalledWith({
        where: {
          userId: mockUser?.id,
          read: false,
        },
        data: {
          read: true,
        },
      });
    });

    it('handles case when no unread notifications exist', async () => {
      vi?.mocked(prisma?.notification.count).mockResolvedValue(0);



      const request = new NextRequest('http://localhost/api/notifications/read-all', {
        method: 'PUT',
      });

      const response = await markAllNotificationsAsReadRoute(request);
      const responseData = await response?.json();

      expect(response?.status).toBe(200);
      expect(responseData).toHaveProperty('count', 0);
      expect(prisma?.notification.updateMany).not?.toHaveBeenCalled();
    });
  });
});
