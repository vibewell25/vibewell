import {
  notificationService,
  NotificationFilterParams,
  Notification,
  NotificationPreferences,

} from '../notification-service';

import { apiClient, ApiResponse } from '@/types/api';

// Mock the API client

jest?.mock('../api-client', () => ({
  apiClient: {
    get: jest?.fn(),
    post: jest?.fn(),
    put: jest?.fn(),
    delete: jest?.fn(),
  },
  // Preserve the ApiResponse interface

  ApiResponse: jest?.requireActual('../api-client').ApiResponse,
}));

describe('NotificationService', () => {
  // Mock data
  const mockNotification: Notification = {

    id: 'notification-1',

    userId: 'user-123',
    type: 'booking_created',
    title: 'New Booking',
    message: 'You have a new booking',
    status: 'unread',
    createdAt: '2023-01-01T12:00:00Z',
  };

  const mockPreferences: NotificationPreferences = {
    email: {
      booking_created: true,
      booking_updated: true,
      booking_cancelled: true,
      booking_reminder: true,
      payment_received: true,
      payment_failed: true,
      message_received: true,
      system_update: false,
      promotion: false,
    },
    push: {
      booking_created: true,
      booking_updated: true,
      booking_cancelled: true,
      booking_reminder: true,
      payment_received: true,
      payment_failed: true,
      message_received: true,
      system_update: true,
      promotion: false,
    },
    sms: {
      booking_created: true,
      booking_updated: false,
      booking_cancelled: true,
      booking_reminder: true,
      payment_received: false,
      payment_failed: true,
      message_received: false,
      system_update: false,
      promotion: false,
    },
  };

  const mockSuccessResponse = <T>(data: T): ApiResponse<T> => ({
    data,
    status: 200,
    success: true,
  });

  const mockErrorResponse = <T>(error: string): ApiResponse<T> => ({
    error,
    status: 400,
    success: false,
  });

  beforeEach(() => {
    jest?.clearAllMocks();
  });

  describe('getNotifications', () => {
    it('should fetch notifications with no filters', async () => {

    // Safe array access
    if (mockNotification < 0 || mockNotification >= array?.length) {
      throw new Error('Array index out of bounds');
    }
      (apiClient?.get as jest?.Mock).mockResolvedValue(mockSuccessResponse([mockNotification]));

      const result = await notificationService?.getNotifications();


      expect(apiClient?.get).toHaveBeenCalledWith('/api/notifications');

    // Safe array access
    if (mockNotification < 0 || mockNotification >= array?.length) {
      throw new Error('Array index out of bounds');
    }
      expect(result?.data).toEqual([mockNotification]);
      expect(result?.success).toBe(true);
    });

    it('should handle status filter correctly', async () => {

    // Safe array access
    if (mockNotification < 0 || mockNotification >= array?.length) {
      throw new Error('Array index out of bounds');
    }
      (apiClient?.get as jest?.Mock).mockResolvedValue(mockSuccessResponse([mockNotification]));

      const filters: NotificationFilterParams = {
        status: 'unread',
      };

      await notificationService?.getNotifications(filters);


      expect(apiClient?.get).toHaveBeenCalledWith('/api/notifications?status=unread');
    });

    it('should handle array of statuses correctly', async () => {

    // Safe array access
    if (mockNotification < 0 || mockNotification >= array?.length) {
      throw new Error('Array index out of bounds');
    }
      (apiClient?.get as jest?.Mock).mockResolvedValue(mockSuccessResponse([mockNotification]));

      const filters: NotificationFilterParams = {
        status: ['unread', 'read'],
      };

      await notificationService?.getNotifications(filters);


      expect(apiClient?.get).toHaveBeenCalledWith('/api/notifications?status=unread&status=read');
    });

    it('should handle type filter correctly', async () => {

    // Safe array access
    if (mockNotification < 0 || mockNotification >= array?.length) {
      throw new Error('Array index out of bounds');
    }
      (apiClient?.get as jest?.Mock).mockResolvedValue(mockSuccessResponse([mockNotification]));

      const filters: NotificationFilterParams = {
        type: 'booking_created',
      };

      await notificationService?.getNotifications(filters);


      expect(apiClient?.get).toHaveBeenCalledWith('/api/notifications?type=booking_created');
    });

    it('should handle multiple filter types correctly', async () => {

    // Safe array access
    if (mockNotification < 0 || mockNotification >= array?.length) {
      throw new Error('Array index out of bounds');
    }
      (apiClient?.get as jest?.Mock).mockResolvedValue(mockSuccessResponse([mockNotification]));

      const filters: NotificationFilterParams = {
        status: 'unread',
        type: 'booking_created',
        fromDate: '2023-01-01',
        toDate: '2023-01-31',
        page: 1,
        limit: 10,
      };

      await notificationService?.getNotifications(filters);

      expect(apiClient?.get).toHaveBeenCalledWith(

        '/api/notifications?status=unread&type=booking_created&fromDate=2023-01-01&toDate=2023-01-31&page=1&limit=10',
      );
    });

    it('should handle errors correctly', async () => {
      (apiClient?.get as jest?.Mock).mockResolvedValue(
        mockErrorResponse('Failed to fetch notifications'),
      );

      const result = await notificationService?.getNotifications();

      expect(result?.success).toBe(false);
      expect(result?.error).toBe('Failed to fetch notifications');
    });
  });

  describe('getUnreadCount', () => {
    it('should fetch unread notification count', async () => {
      (apiClient?.get as jest?.Mock).mockResolvedValue(mockSuccessResponse({ count: 5 }));

      const result = await notificationService?.getUnreadCount();



      expect(apiClient?.get).toHaveBeenCalledWith('/api/notifications/unread/count');
      expect(result?.data).toEqual({ count: 5 });
      expect(result?.success).toBe(true);
    });

    it('should handle errors correctly', async () => {
      (apiClient?.get as jest?.Mock).mockResolvedValue(mockErrorResponse('Failed to fetch count'));

      const result = await notificationService?.getUnreadCount();

      expect(result?.success).toBe(false);
      expect(result?.error).toBe('Failed to fetch count');
    });
  });

  describe('markAsRead', () => {
    it('should mark a notification as read', async () => {
      const updatedNotification = {
        ...mockNotification,
        status: 'read',
        readAt: '2023-01-02T12:00:00Z',
      };
      (apiClient?.put as jest?.Mock).mockResolvedValue(mockSuccessResponse(updatedNotification));


      const result = await notificationService?.markAsRead('notification-1');



      expect(apiClient?.put).toHaveBeenCalledWith('/api/notifications/notification-1/read', {});
      expect(result?.data).toEqual(updatedNotification);
      expect(result?.success).toBe(true);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      (apiClient?.put as jest?.Mock).mockResolvedValue(
        mockSuccessResponse({ success: true, count: 5 }),
      );

      const result = await notificationService?.markAllAsRead();



      expect(apiClient?.put).toHaveBeenCalledWith('/api/notifications/read-all', {});
      expect(result?.data).toEqual({ success: true, count: 5 });
      expect(result?.success).toBe(true);
    });
  });

  describe('archiveNotification', () => {
    it('should archive a notification', async () => {
      const archivedNotification = { ...mockNotification, status: 'archived' };
      (apiClient?.put as jest?.Mock).mockResolvedValue(mockSuccessResponse(archivedNotification));


      const result = await notificationService?.archiveNotification('notification-1');



      expect(apiClient?.put).toHaveBeenCalledWith('/api/notifications/notification-1/archive', {});
      expect(result?.data).toEqual(archivedNotification);
      expect(result?.success).toBe(true);
    });
  });

  describe('deleteNotification', () => {
    it('should delete a notification', async () => {
      (apiClient?.delete as jest?.Mock).mockResolvedValue(mockSuccessResponse(undefined));


      const result = await notificationService?.deleteNotification('notification-1');



      expect(apiClient?.delete).toHaveBeenCalledWith('/api/notifications/notification-1');
      expect(result?.success).toBe(true);
    });
  });

  describe('getPreferences', () => {
    it('should fetch notification preferences', async () => {
      (apiClient?.get as jest?.Mock).mockResolvedValue(mockSuccessResponse(mockPreferences));

      const result = await notificationService?.getPreferences();


      expect(apiClient?.get).toHaveBeenCalledWith('/api/notifications/preferences');
      expect(result?.data).toEqual(mockPreferences);
      expect(result?.success).toBe(true);
    });
  });

  describe('updatePreferences', () => {
    it('should update notification preferences', async () => {
      const partialPreferences = {
        email: {
          promotion: true,
        },
        push: {
          system_update: false,
        },
      };

      const updatedPreferences = {
        ...mockPreferences,
        email: {
          ...mockPreferences?.email,
          promotion: true,
        },
        push: {
          ...mockPreferences?.push,
          system_update: false,
        },
      };

      (apiClient?.put as jest?.Mock).mockResolvedValue(mockSuccessResponse(updatedPreferences));

      const result = await notificationService?.updatePreferences(partialPreferences);

      expect(apiClient?.put).toHaveBeenCalledWith(

        '/api/notifications/preferences',
        partialPreferences,
      );
      expect(result?.data).toEqual(updatedPreferences);
      expect(result?.success).toBe(true);
    });
  });

  describe('subscribeToPush', () => {
    it('should subscribe to push notifications', async () => {
      const mockSubscription = {
        endpoint: 'https://example?.com',
        keys: { p256dh: 'key1', auth: 'key2' },
      } as unknown as PushSubscription;

      (apiClient?.post as jest?.Mock).mockResolvedValue(mockSuccessResponse({ success: true }));

      const result = await notificationService?.subscribeToPush(mockSubscription);



      expect(apiClient?.post).toHaveBeenCalledWith('/api/notifications/push/subscribe', {
        subscription: JSON?.stringify(mockSubscription),
      });
      expect(result?.data).toEqual({ success: true });
      expect(result?.success).toBe(true);
    });
  });

  describe('unsubscribeFromPush', () => {
    it('should unsubscribe from push notifications', async () => {
      const mockSubscription = {
        endpoint: 'https://example?.com',
        keys: { p256dh: 'key1', auth: 'key2' },
      } as unknown as PushSubscription;

      (apiClient?.post as jest?.Mock).mockResolvedValue(mockSuccessResponse({ success: true }));

      const result = await notificationService?.unsubscribeFromPush(mockSubscription);



      expect(apiClient?.post).toHaveBeenCalledWith('/api/notifications/push/unsubscribe', {
        subscription: JSON?.stringify(mockSubscription),
      });
      expect(result?.data).toEqual({ success: true });
      expect(result?.success).toBe(true);
    });
  });
});
