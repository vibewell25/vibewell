import { Analytics } from 'analytics';
import googleAnalytics from '@analytics/google-analytics';
import mixpanel from '@analytics/mixpanel';
import segment from '@analytics/segment';
import amplitude from '@analytics/amplitude';
import AnalyticsService from '../analytics/AnalyticsService';

// Mock dependencies
jest.mock('analytics');
jest.mock('@analytics/google-analytics');
jest.mock('@analytics/mixpanel');
jest.mock('@analytics/segment');
jest.mock('@analytics/amplitude');

describe('AnalyticsService', () => {
  let analyticsService: typeof AnalyticsService;
  const mockConfig = {
    google: {
      trackingId: 'UA-123456789-1'
    },
    mixpanel: {
      token: 'mixpanel-token'
    },
    segment: {
      writeKey: 'segment-key'
    },
    amplitude: {
      apiKey: 'amplitude-key'
    }
  };

  const mockEventData = {
    event: 'test_event',
    properties: {
      property1: 'value1',
      property2: 'value2'
    },
    userId: 'test-user-id',
    timestamp: new Date('2024-01-01T10:00:00Z')
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (Analytics as jest.Mock).mockReturnValue({
      track: jest.fn().mockResolvedValue(undefined),
      identify: jest.fn().mockResolvedValue(undefined),
      page: jest.fn().mockResolvedValue(undefined),
      group: jest.fn().mockResolvedValue(undefined),
      reset: jest.fn().mockResolvedValue(undefined),
      getState: jest.fn().mockReturnValue({}),
      flush: jest.fn().mockResolvedValue(undefined)
    });
    analyticsService = AnalyticsService.getInstance(mockConfig);
  });

  describe('getInstance', () => {
    it('should create a new instance with config', () => {
      const instance = AnalyticsService.getInstance(mockConfig);
      expect(instance).toBeDefined();
      expect(Analytics).toHaveBeenCalledWith(expect.any(Object));
    });

    it('should return existing instance without config', () => {
      const instance1 = AnalyticsService.getInstance(mockConfig);
      const instance2 = AnalyticsService.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should initialize with correct analytics providers', () => {
      AnalyticsService.getInstance(mockConfig);
      expect(googleAnalytics).toHaveBeenCalledWith({ trackingId: mockConfig.google.trackingId });
      expect(mixpanel).toHaveBeenCalledWith({ token: mockConfig.mixpanel.token });
      expect(segment).toHaveBeenCalledWith({ writeKey: mockConfig.segment.writeKey });
      expect(amplitude).toHaveBeenCalledWith({ apiKey: mockConfig.amplitude.apiKey });
    });
  });

  describe('trackEvent', () => {
    it('should track an event successfully', async () => {
      await analyticsService.trackEvent(mockEventData);
      expect(Analytics().track).toHaveBeenCalledWith(mockEventData.event, {
        ...mockEventData.properties,
        userId: mockEventData.userId,
        timestamp: mockEventData.timestamp
      });
    });

    it('should handle tracking errors gracefully', async () => {
      const error = new Error('Tracking failed');
      (Analytics().track as jest.Mock).mockRejectedValue(error);
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await analyticsService.trackEvent(mockEventData);
      expect(consoleSpy).toHaveBeenCalledWith('Analytics tracking error:', error);
      consoleSpy.mockRestore();
    });

    it('should not track when analytics is disabled', async () => {
      analyticsService.disable();
      await analyticsService.trackEvent(mockEventData);
      expect(Analytics().track).not.toHaveBeenCalled();
    });
  });

  describe('identifyUser', () => {
    const mockTraits = { name: 'Test User', email: 'test@example.com' };

    it('should identify a user successfully', async () => {
      await analyticsService.identifyUser('test-user-id', mockTraits);
      expect(Analytics().identify).toHaveBeenCalledWith('test-user-id', mockTraits);
    });

    it('should handle identify errors gracefully', async () => {
      const error = new Error('Identify failed');
      (Analytics().identify as jest.Mock).mockRejectedValue(error);
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await analyticsService.identifyUser('test-user-id', mockTraits);
      expect(consoleSpy).toHaveBeenCalledWith('Analytics identify error:', error);
      consoleSpy.mockRestore();
    });
  });

  describe('page', () => {
    const mockPageData = {
      name: 'Test Page',
      properties: { path: '/test' }
    };

    it('should track page view successfully', async () => {
      await analyticsService.page(mockPageData.name, mockPageData.properties);
      expect(Analytics().page).toHaveBeenCalledWith({
        name: mockPageData.name,
        properties: mockPageData.properties
      });
    });

    it('should handle page tracking errors gracefully', async () => {
      const error = new Error('Page tracking failed');
      (Analytics().page as jest.Mock).mockRejectedValue(error);
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await analyticsService.page(mockPageData.name, mockPageData.properties);
      expect(consoleSpy).toHaveBeenCalledWith('Analytics page tracking error:', error);
      consoleSpy.mockRestore();
    });
  });

  describe('group', () => {
    const mockGroupData = {
      groupId: 'test-group',
      traits: { name: 'Test Group', type: 'team' }
    };

    it('should track group successfully', async () => {
      await analyticsService.group(mockGroupData.groupId, mockGroupData.traits);
      expect(Analytics().group).toHaveBeenCalledWith(mockGroupData.groupId, mockGroupData.traits);
    });

    it('should handle group tracking errors gracefully', async () => {
      const error = new Error('Group tracking failed');
      (Analytics().group as jest.Mock).mockRejectedValue(error);
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await analyticsService.group(mockGroupData.groupId, mockGroupData.traits);
      expect(consoleSpy).toHaveBeenCalledWith('Analytics group error:', error);
      consoleSpy.mockRestore();
    });
  });

  describe('enable/disable', () => {
    it('should enable analytics tracking', async () => {
      analyticsService.disable();
      analyticsService.enable();
      await analyticsService.trackEvent(mockEventData);
      expect(Analytics().track).toHaveBeenCalled();
    });

    it('should disable analytics tracking', async () => {
      analyticsService.disable();
      await analyticsService.trackEvent(mockEventData);
      expect(Analytics().track).not.toHaveBeenCalled();
    });
  });

  describe('reset', () => {
    it('should reset analytics data successfully', async () => {
      await analyticsService.reset();
      expect(Analytics().reset).toHaveBeenCalled();
    });

    it('should handle reset errors gracefully', async () => {
      const error = new Error('Reset failed');
      (Analytics().reset as jest.Mock).mockRejectedValue(error);
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await analyticsService.reset();
      expect(consoleSpy).toHaveBeenCalledWith('Analytics reset error:', error);
      consoleSpy.mockRestore();
    });
  });

  describe('getState', () => {
    it('should return analytics state', () => {
      const mockState = { someState: 'value' };
      (Analytics().getState as jest.Mock).mockReturnValue(mockState);
      
      const state = analyticsService.getState();
      expect(state).toEqual(mockState);
    });
  });

  describe('flush', () => {
    it('should flush analytics data successfully', async () => {
      await analyticsService.flush();
      expect(Analytics().flush).toHaveBeenCalled();
    });

    it('should handle flush errors gracefully', async () => {
      const error = new Error('Flush failed');
      (Analytics().flush as jest.Mock).mockRejectedValue(error);
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await analyticsService.flush();
      expect(consoleSpy).toHaveBeenCalledWith('Analytics flush error:', error);
      consoleSpy.mockRestore();
    });
  });
}); 