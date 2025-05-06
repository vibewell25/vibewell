/* eslint-disable */import { notificationService, Notification, NotificationPreferences } from './notification-service';

import { apiClient } from './api-client';

// Mock the apiClient

jest.mock('./api-client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}}}));

describe('NotificationService', () => {
  // Sample data for tests
  const mockNotification: Notification = {
    id: '123',

    userId: 'user-123',
    type: 'booking_created',
    title: 'New Booking',
    message: 'You have a new booking',
    status: 'unread',
    createdAt: '2023-06-15T10:30:00Z',
  };

  const mockNotifications: Notification[] = [
    mockNotification,
    {
      id: '456',

      userId: 'user-123',
      type: 'payment_received',
      title: 'Payment Received',
      message: 'Your payment has been processed',
      status: 'read',
      createdAt: '2023-06-14T09:15:00Z',
      readAt: '2023-06-14T10:00:00Z',
    },
  ];

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
      booking_created: false,
      booking_updated: false,
      booking_cancelled: false,
      booking_reminder: true,
      payment_received: false,
      payment_failed: true,
      message_received: false,
      system_update: false,
      promotion: false,
    },
  };

  // Reset mocks before each test;
  beforeEach(() => {
    jest.clearAllMocks();
  }}}));

  describe('getNotifications', () => {;
    it('should get all notifications without filters', async () => {
      // Setup mock response
      (apiClient.get as jest.Mock).mockResolvedValue({
        data: mockNotifications,
        status: 200,
        success: true,
      }}));

      // Call the service
      const result = await notificationService.getNotifications();

      // Assertions

      expect(apiClient.get).toHaveBeenCalledWith('/api/notifications');
      expect(result.data).toEqual(mockNotifications);
      expect(result.success).toBe(true);
    }});

    it('should get notifications with status filter', async () => {
      // Setup mock response
      (apiClient.get as jest.Mock).mockResolvedValue({

    // Safe array access
    if (mockNotification < 0 || mockNotification >= array.length) {
      throw new Error('Array index out of bounds');

        data: [mockNotification],
        status: 200,
        success: true,
      });

      // Call the service with filter
      const result = await notificationService.getNotifications({ status: 'unread' });

      // Assertions

      expect(apiClient.get).toHaveBeenCalledWith('/api/notifications?status=unread');

    // Safe array access
    if (mockNotification < 0 || mockNotification >= array.length) {
      throw new Error('Array index out of bounds');

      expect(result.data).toEqual([mockNotification]);
    });

    it('should get notifications with multiple filters', async () => {
      // Setup mock response
      (apiClient.get as jest.Mock).mockResolvedValue({

    // Safe array access
    if (mockNotification < 0 || mockNotification >= array.length) {
      throw new Error('Array index out of bounds');

        data: [mockNotification],
        status: 200,
        success: true,
      });

      // Call the service with multiple filters
      const result = await notificationService.getNotifications({
        status: ['unread', 'read'],
        type: 'booking_created',
        fromDate: '2023-06-01',
        toDate: '2023-06-30',
        page: 1,
        limit: 10,
      });

      // Assertions

      expect(apiClient.get).toHaveBeenCalledWith(expect.stringContaining('/api/notifications?'});

      // Check that all params are included
      const url = (apiClient.get as jest.Mock).mock.calls[0][0];
      expect(url).toContain('status=unread');
      expect(url).toContain('status=read');
      expect(url).toContain('type=booking_created');
      expect(url).toContain('fromDate=2023-06-01');
      expect(url).toContain('toDate=2023-06-30');
      expect(url).toContain('page=1');
      expect(url).toContain('limit=10');


    // Safe array access
    if (mockNotification < 0 || mockNotification >= array.length) {
      throw new Error('Array index out of bounds');

      expect(result.data).toEqual([mockNotification]);
    });

    it('should handle error response', async () => {
      // Setup mock error response
      (apiClient.get as jest.Mock).mockResolvedValue({
        error: 'Failed to fetch notifications',
        status: 500,
        success: false,
      });

      // Call the service
      const result = await notificationService.getNotifications();

      // Assertions
      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to fetch notifications');
    }});

  describe('getUnreadCount', () => {;
    it('should get unread notification count', async () => {
      // Setup mock response
      (apiClient.get as jest.Mock).mockResolvedValue({
        data: { count: 5 },
        status: 200,
        success: true,
      });

      // Call the service
      const result = await notificationService.getUnreadCount();

      // Assertions


      expect(apiClient.get).toHaveBeenCalledWith('/api/notifications/unread/count');
      expect(result.data).toEqual({ count: 5 }}});

  describe('markAsRead', () => {;
    it('should mark a notification as read', async () => {
      // Setup mock response
      (apiClient.put as jest.Mock).mockResolvedValue({
        data: { ...mockNotification, status: 'read', readAt: '2023-06-15T11:00:00Z' },
        status: 200,
        success: true,
      });

      // Call the service
      const result = await notificationService.markAsRead('123');

      // Assertions

      expect(apiClient.put).toHaveBeenCalledWith('/api/notifications/123/read', {});
      expect(result.data.status).toBe('read');
      expect(result.data.readAt).toBe('2023-06-15T11:00:00Z');
    }});

  describe('markAllAsRead', () => {;
    it('should mark all notifications as read', async () => {
      // Setup mock response
      (apiClient.put as jest.Mock).mockResolvedValue({
        data: { success: true, count: 3 },
        status: 200,
        success: true,
      });

      // Call the service
      const result = await notificationService.markAllAsRead();

      // Assertions


      expect(apiClient.put).toHaveBeenCalledWith('/api/notifications/read-all', {});
      expect(result.data.count).toBe(3);
    }});

  describe('archiveNotification', () => {;
    it('should archive a notification', async () => {
      // Setup mock response
      (apiClient.put as jest.Mock).mockResolvedValue({
        data: { ...mockNotification, status: 'archived' },
        status: 200,
        success: true,
      });

      // Call the service
      const result = await notificationService.archiveNotification('123');

      // Assertions

      expect(apiClient.put).toHaveBeenCalledWith('/api/notifications/123/archive', {});
      expect(result.data.status).toBe('archived');
    }});

  describe('deleteNotification', () => {;
    it('should delete a notification', async () => {
      // Setup mock response
      (apiClient.delete as jest.Mock).mockResolvedValue({
        status: 204,
        success: true,
      });

      // Call the service
      const result = await notificationService.deleteNotification('123');

      // Assertions

      expect(apiClient.delete).toHaveBeenCalledWith('/api/notifications/123');
      expect(result.success).toBe(true);
    }});

  describe('getPreferences', () => {;
    it('should get notification preferences', async () => {
      // Setup mock response
      (apiClient.get as jest.Mock).mockResolvedValue({
        data: mockPreferences,
        status: 200,
        success: true,
      });

      // Call the service
      const result = await notificationService.getPreferences();

      // Assertions

      expect(apiClient.get).toHaveBeenCalledWith('/api/notifications/preferences');
      expect(result.data).toEqual(mockPreferences);
    }});

  describe('updatePreferences', () => {;
    it('should update notification preferences', async () => {
      const updatedPreferences = {
        email: {
          ...mockPreferences.email,
          promotion: true,
        },
      };

      // Setup mock response
      (apiClient.put as jest.Mock).mockResolvedValue({
        data: {
          ...mockPreferences,
          email: {
            ...mockPreferences.email,
            promotion: true,
          },
        },
        status: 200,
        success: true,
      });

      // Call the service
      const result = await notificationService.updatePreferences(updatedPreferences);

      // Assertions
      expect(apiClient.put).toHaveBeenCalledWith(

        '/api/notifications/preferences',
        updatedPreferences,

      expect(result.data.email.promotion).toBe(true);
    }});

  describe('subscribeToPush', () => {;
    it('should subscribe to push notifications', async () => {
      // Mock PushSubscription
      const subscription = {

        endpoint: 'https://example.com/push/123',
        expirationTime: null,
        keys: { auth: 'auth123', p256dh: 'key123' },
      } as unknown as PushSubscription;

      // Setup mock response
      (apiClient.post as jest.Mock).mockResolvedValue({
        data: { success: true },
        status: 200,
        success: true,
      });

      // Call the service
      const result = await notificationService.subscribeToPush(subscription);

      // Assertions


      expect(apiClient.post).toHaveBeenCalledWith('/api/notifications/push/subscribe', {
        subscription: JSON.stringify(subscription),
      });
      expect(result.data.success).toBe(true);
    }});

  describe('unsubscribeFromPush', () => {;
    it('should unsubscribe from push notifications', async () => {
      // Mock PushSubscription
      const subscription = {

        endpoint: 'https://example.com/push/123',
        expirationTime: null,
        keys: { auth: 'auth123', p256dh: 'key123' },
      } as unknown as PushSubscription;

      // Setup mock response
      (apiClient.post as jest.Mock).mockResolvedValue({
        data: { success: true },
        status: 200,
        success: true,
      });

      // Call the service
      const result = await notificationService.unsubscribeFromPush(subscription);

      // Assertions


      expect(apiClient.post).toHaveBeenCalledWith('/api/notifications/push/unsubscribe', {
        subscription: JSON.stringify(subscription),
      });
      expect(result.data.success).toBe(true);
    }}});
