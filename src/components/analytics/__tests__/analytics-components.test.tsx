import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { axe } from 'jest-axe';
import { AnalyticsProvider, EventTracker, DataVisualization, useAnalytics } from '../';

// Mock analytics service
const mockAnalyticsService = {
  trackEvent: vi.fn(),
  trackPageView: vi.fn(),
  getEventData: vi.fn(),
  getMetrics: vi.fn(),
};

// Mock chart library
vi.mock('@nivo/line', () => ({
  ResponsiveLine: ({ data }) => <div data-testid="line-chart">{JSON.stringify(data)}</div>,
}));

describe('Analytics Components', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('AnalyticsProvider', () => {
    it('provides analytics context to children', () => {
      const TestComponent = () => {
        const analytics = useAnalytics();
        return <div>Analytics Enabled: {analytics.enabled.toString()}</div>;
      };

      render(
        <AnalyticsProvider>
          <TestComponent />
        </AnalyticsProvider>
      );

      expect(screen.getByText('Analytics Enabled: true')).toBeInTheDocument();
    });

    it('tracks page views automatically', async () => {
      render(
        <AnalyticsProvider>
          <div>Test Content</div>
        </AnalyticsProvider>
      );

      await waitFor(() => {
        expect(mockAnalyticsService.trackPageView).toHaveBeenCalled();
      });
    });

    it('respects user privacy settings', () => {
      const TestComponent = () => {
        const analytics = useAnalytics();
        return (
          <div>
            <span>Tracking: {analytics.enabled.toString()}</span>
            <button onClick={() => analytics.setEnabled(false)}>Disable</button>
          </div>
        );
      };

      render(
        <AnalyticsProvider>
          <TestComponent />
        </AnalyticsProvider>
      );

      expect(screen.getByText('Tracking: true')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Disable'));
      expect(screen.getByText('Tracking: false')).toBeInTheDocument();
    });
  });

  describe('EventTracker', () => {
    const defaultProps = {
      eventName: 'test_event',
      properties: { category: 'test' },
      onTrack: vi.fn(),
    };

    it('tracks events on trigger', async () => {
      render(
        <AnalyticsProvider>
          <EventTracker {...defaultProps}>
            <button>Trigger Event</button>
          </EventTracker>
        </AnalyticsProvider>
      );

      await user.click(screen.getByText('Trigger Event'));
      expect(mockAnalyticsService.trackEvent).toHaveBeenCalledWith('test_event', {
        category: 'test',
      });
      expect(defaultProps.onTrack).toHaveBeenCalled();
    });

    it('supports custom triggers', async () => {
      render(
        <AnalyticsProvider>
          <EventTracker {...defaultProps} trigger="hover">
            <button>Hover Event</button>
          </EventTracker>
        </AnalyticsProvider>
      );

      fireEvent.mouseEnter(screen.getByText('Hover Event'));
      expect(mockAnalyticsService.trackEvent).toHaveBeenCalled();
    });

    it('handles tracking errors gracefully', async () => {
      mockAnalyticsService.trackEvent.mockRejectedValueOnce(new Error('Tracking failed'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <AnalyticsProvider>
          <EventTracker {...defaultProps}>
            <button>Error Event</button>
          </EventTracker>
        </AnalyticsProvider>
      );

      await user.click(screen.getByText('Error Event'));
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('DataVisualization', () => {
    const mockData = {
      metrics: [
        { date: '2024-01-01', value: 10 },
        { date: '2024-01-02', value: 20 },
      ],
      loading: false,
      error: null,
    };

    beforeEach(() => {
      mockAnalyticsService.getMetrics.mockResolvedValue(mockData.metrics);
    });

    it('renders loading state', () => {
      render(<DataVisualization type="line" metric="users" loading={true} />);

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('renders error state', () => {
      render(<DataVisualization type="line" metric="users" error="Failed to load data" />);

      expect(screen.getByText('Failed to load data')).toBeInTheDocument();
    });

    it('renders chart with data', () => {
      render(<DataVisualization type="line" metric="users" data={mockData.metrics} />);

      const chart = screen.getByTestId('line-chart');
      expect(chart).toBeInTheDocument();
      expect(chart).toHaveTextContent(JSON.stringify(mockData.metrics));
    });

    it('updates when date range changes', async () => {
      render(<DataVisualization type="line" metric="users" data={mockData.metrics} />);

      const rangeSelect = screen.getByLabelText('Date Range');
      await user.selectOptions(rangeSelect, '7d');

      expect(mockAnalyticsService.getMetrics).toHaveBeenCalledWith(
        'users',
        expect.objectContaining({ range: '7d' })
      );
    });

    it('supports different chart types', () => {
      const { rerender } = render(
        <DataVisualization type="line" metric="users" data={mockData.metrics} />
      );

      expect(screen.getByTestId('line-chart')).toBeInTheDocument();

      rerender(<DataVisualization type="bar" metric="users" data={mockData.metrics} />);

      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });
  });

  // Accessibility tests
  describe('Accessibility', () => {
    it('AnalyticsProvider meets accessibility standards', async () => {
      const { container } = render(
        <AnalyticsProvider>
          <div>Test Content</div>
        </AnalyticsProvider>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('EventTracker meets accessibility standards', async () => {
      const { container } = render(
        <AnalyticsProvider>
          <EventTracker eventName="test" onTrack={() => {}}>
            <button>Track Event</button>
          </EventTracker>
        </AnalyticsProvider>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('DataVisualization meets accessibility standards', async () => {
      const { container } = render(
        <DataVisualization
          type="line"
          metric="users"
          data={[
            { date: '2024-01-01', value: 10 },
            { date: '2024-01-02', value: 20 },
          ]}
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
