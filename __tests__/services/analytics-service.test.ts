import { AnalyticsService, TryOnSession, ShareAnalytics } from '@/services/analytics-service';
import { createClient } from '@supabase/supabase-js';

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: { id: 'test-id' }, error: null })),
        })),
      })),
      select: jest.fn(() => ({
        gte: jest.fn(() => ({
          lte: jest.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        eq: jest.fn(() => ({
          gte: jest.fn(() => ({
            lte: jest.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        })),
      })),
    })),
  })),
}));

describe('AnalyticsService', () => {
  let analyticsService: AnalyticsService;
  
  beforeEach(() => {
    jest.clearAllMocks();
    analyticsService = new AnalyticsService();
  });

  describe('trackTryOnSession', () => {
    it('should track a try-on session successfully', async () => {
      // Arrange
      const sessionData: Omit<TryOnSession, 'id' | 'createdAt'> = {
        userId: 'user-123',
        type: 'makeup',
        productId: 'product-456',
        productName: 'Sample Makeup',
        duration: 120,
        intensity: 7,
        success: true
      };

      // Act
      const result = await analyticsService.trackTryOnSession(sessionData);

      // Assert
      expect(result).toEqual({ id: 'test-id' });
      expect(createClient).toHaveBeenCalled();
      const mockSupabase = (createClient as jest.Mock).mock.results[0].value;
      expect(mockSupabase.from).toHaveBeenCalledWith('try_on_sessions');
      expect(mockSupabase.from().insert).toHaveBeenCalledWith([{
        ...sessionData,
        createdAt: expect.any(String),
      }]);
    });

    it('should handle tracking errors properly', async () => {
      // Arrange
      const mockError = new Error('Database error');
      const mockSupabase = (createClient as jest.Mock).mock.results[0].value;
      mockSupabase.from().insert().select().single.mockImplementationOnce(() => Promise.resolve({
        data: null,
        error: mockError
      }));

      const sessionData: Omit<TryOnSession, 'id' | 'createdAt'> = {
        userId: 'user-123',
        type: 'makeup',
        productId: 'product-456',
        productName: 'Sample Makeup',
        duration: 120,
        intensity: 7,
        success: true
      };

      // Act & Assert
      await expect(analyticsService.trackTryOnSession(sessionData)).rejects.toThrow('Database error');
    });
  });

  describe('trackShare', () => {
    it('should track a share successfully', async () => {
      // Arrange
      const shareData: Omit<ShareAnalytics, 'id' | 'createdAt'> = {
        sessionId: 'session-123',
        userId: 'user-123',
        platform: 'facebook',
        method: 'social',
        success: true
      };

      // Act
      const result = await analyticsService.trackShare(shareData);

      // Assert
      expect(result).toEqual({ id: 'test-id' });
      expect(createClient).toHaveBeenCalled();
      const mockSupabase = (createClient as jest.Mock).mock.results[0].value;
      expect(mockSupabase.from).toHaveBeenCalledWith('share_analytics');
      expect(mockSupabase.from().insert).toHaveBeenCalledWith([{
        ...shareData,
        createdAt: expect.any(String),
      }]);
    });

    it('should handle share tracking errors', async () => {
      // Arrange
      const mockError = new Error('Database error');
      const mockSupabase = (createClient as jest.Mock).mock.results[0].value;
      mockSupabase.from().insert().select().single.mockImplementationOnce(() => Promise.resolve({
        data: null,
        error: mockError
      }));

      const shareData: Omit<ShareAnalytics, 'id' | 'createdAt'> = {
        sessionId: 'session-123',
        userId: 'user-123',
        platform: 'facebook',
        method: 'social',
        success: true
      };

      // Act & Assert
      await expect(analyticsService.trackShare(shareData)).rejects.toThrow('Database error');
    });
  });

  describe('getEngagementMetrics', () => {
    it('should calculate engagement metrics correctly', async () => {
      // Arrange
      const timeRange = {
        start: '2023-01-01T00:00:00Z',
        end: '2023-01-31T23:59:59Z'
      };

      const mockSessionsData = [
        { type: 'makeup', duration: 60, success: true, user_id: 'user1' },
        { type: 'makeup', duration: 120, success: true, user_id: 'user2' },
        { type: 'hairstyle', duration: 90, success: false, user_id: 'user1' },
        { type: 'accessory', duration: 30, success: true, user_id: 'user3' }
      ];

      const mockSharesData = [
        { method: 'social', user_id: 'user1' },
        { method: 'social', user_id: 'user2' },
        { method: 'email', user_id: 'user1' },
        { method: 'download', user_id: 'user3' }
      ];

      const mockSupabase = (createClient as jest.Mock).mock.results[0].value;
      mockSupabase.from().select().gte().lte.mockImplementation((table) => {
        if (table === 'try_on_sessions') {
          return Promise.resolve({ data: mockSessionsData, error: null });
        } else {
          return Promise.resolve({ data: mockSharesData, error: null });
        }
      });

      // Act
      const result = await analyticsService.getEngagementMetrics(timeRange);

      // Assert
      expect(result).toEqual({
        totalSessions: 4,
        uniqueUsers: 3,
        averageDuration: 75,
        successRate: 75,
        makeupSessions: 2,
        hairstyleSessions: 1,
        accessorySessions: 1,
        socialShares: 2,
        emailShares: 1,
        downloadShares: 1,
        timeRange
      });
    });

    it('should handle empty data sets', async () => {
      // Arrange
      const timeRange = {
        start: '2023-01-01T00:00:00Z',
        end: '2023-01-31T23:59:59Z'
      };

      const mockSupabase = (createClient as jest.Mock).mock.results[0].value;
      mockSupabase.from().select().gte().lte.mockImplementation(() => {
        return Promise.resolve({ data: [], error: null });
      });

      // Act
      const result = await analyticsService.getEngagementMetrics(timeRange);

      // Assert
      expect(result).toEqual({
        totalSessions: 0,
        uniqueUsers: 0,
        averageDuration: 0,
        successRate: 0,
        makeupSessions: 0,
        hairstyleSessions: 0,
        accessorySessions: 0,
        socialShares: 0,
        emailShares: 0,
        downloadShares: 0,
        timeRange
      });
    });

    it('should handle database errors', async () => {
      // Arrange
      const timeRange = {
        start: '2023-01-01T00:00:00Z',
        end: '2023-01-31T23:59:59Z'
      };

      const mockError = new Error('Database error');
      const mockSupabase = (createClient as jest.Mock).mock.results[0].value;
      mockSupabase.from().select().gte().lte.mockImplementationOnce(() => Promise.resolve({
        data: null,
        error: mockError
      }));

      // Act & Assert
      await expect(analyticsService.getEngagementMetrics(timeRange)).rejects.toThrow('Database error');
    });
  });

  describe('getUserEngagement', () => {
    it('should return user engagement metrics correctly', async () => {
      // Arrange
      const userId = 'user-123';
      const timeRange = {
        start: '2023-01-01T00:00:00Z',
        end: '2023-01-31T23:59:59Z'
      };

      const mockSessionsData = [
        { duration: 60, success: true },
        { duration: 120, success: true },
        { duration: 90, success: false }
      ];

      const mockSharesData = [
        { method: 'social' },
        { method: 'email' }
      ];

      const mockSupabase = (createClient as jest.Mock).mock.results[0].value;
      mockSupabase.from().select().eq().gte().lte.mockImplementation((table) => {
        if (table === 'try_on_sessions') {
          return Promise.resolve({ data: mockSessionsData, error: null });
        } else {
          return Promise.resolve({ data: mockSharesData, error: null });
        }
      });

      // Act
      const result = await analyticsService.getUserEngagement(userId, timeRange);

      // Assert
      expect(result).toEqual({
        sessions: 3,
        shares: 2,
        averageSessionDuration: 90,
        successRate: 66.66666666666667
      });
    });

    it('should handle errors in user engagement metrics', async () => {
      // Arrange
      const userId = 'user-123';
      const timeRange = {
        start: '2023-01-01T00:00:00Z',
        end: '2023-01-31T23:59:59Z'
      };

      const mockError = new Error('Database error');
      const mockSupabase = (createClient as jest.Mock).mock.results[0].value;
      mockSupabase.from().select().eq().gte().lte.mockImplementationOnce(() => Promise.resolve({
        data: null,
        error: mockError
      }));

      // Act & Assert
      await expect(analyticsService.getUserEngagement(userId, timeRange)).rejects.toThrow('Database error');
    });
  });
}); 