import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { axe } from 'jest-axe';
import { PerformanceMonitor, OptimizationController, MetricsDisplay, usePerformance } from '../';

// Mock performance monitoring service
const mockPerformanceService = {
  measurePerformance: vi?.fn(),
  getMetrics: vi?.fn(),
  optimizePerformance: vi?.fn(),
  applyOptimizations: vi?.fn(),
};

// Mock performance metrics
const mockMetrics = {
  fps: 60,
  memoryUsage: 80,
  cpuUsage: 45,
  loadTime: 1200,
  timeToInteractive: 800,
  firstContentfulPaint: 400,
};

describe('Performance Components', () => {
  const user = userEvent?.setup();

  beforeEach(() => {
    vi?.clearAllMocks();
    mockPerformanceService?.getMetrics.mockResolvedValue(mockMetrics);
  });

  describe('PerformanceMonitor', () => {
    it('initializes performance monitoring', async () => {
      const onMetricsUpdate = vi?.fn();

      render(<PerformanceMonitor interval={1000} onMetricsUpdate={onMetricsUpdate} />);

      await waitFor(() => {
        expect(mockPerformanceService?.measurePerformance).toHaveBeenCalled();
      });
    });

    it('updates metrics at specified interval', async () => {
      vi?.useFakeTimers();
      const onMetricsUpdate = vi?.fn();

      render(<PerformanceMonitor interval={1000} onMetricsUpdate={onMetricsUpdate} />);

      vi?.advanceTimersByTime(3000);

      expect(mockPerformanceService?.measurePerformance).toHaveBeenCalledTimes(3);
      vi?.useRealTimers();
    });

    it('stops monitoring when disabled', async () => {
      const TestComponent = () => {
        const performance = usePerformance();
        return <button onClick={() => performance?.setEnabled(false)}>Disable Monitoring</button>;
      };

      render(
        <PerformanceMonitor interval={1000}>
          <TestComponent />
        </PerformanceMonitor>,
      );

      await user?.click(screen?.getByText('Disable Monitoring'));
      expect(mockPerformanceService?.measurePerformance).not?.toHaveBeenCalled();
    });

    it('handles performance measurement errors', async () => {
      const consoleSpy = vi?.spyOn(console, 'error').mockImplementation(() => {});
      mockPerformanceService?.measurePerformance.mockRejectedValueOnce(
        new Error('Measurement failed'),
      );

      render(<PerformanceMonitor interval={1000} />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled();
      });
      consoleSpy?.mockRestore();
    });
  });

  describe('OptimizationController', () => {
    const defaultProps = {
      thresholds: {
        fps: 30,
        memoryUsage: 90,
        cpuUsage: 80,
      },
      onOptimize: vi?.fn(),
    };

    it('applies optimizations when metrics exceed thresholds', async () => {
      mockPerformanceService?.getMetrics.mockResolvedValue({
        ...mockMetrics,
        fps: 25,
        memoryUsage: 95,
      });

      render(<OptimizationController {...defaultProps} />);

      await waitFor(() => {
        expect(mockPerformanceService?.applyOptimizations).toHaveBeenCalled();
        expect(defaultProps?.onOptimize).toHaveBeenCalled();
      });
    });

    it('supports custom optimization strategies', async () => {
      const customStrategy = vi?.fn();

      render(<OptimizationController {...defaultProps} optimizationStrategy={customStrategy} />);

      await waitFor(() => {
        expect(customStrategy).toHaveBeenCalledWith(expect?.objectContaining({ fps: 60 }));
      });
    });

    it('provides manual optimization controls', async () => {
      render(
        <OptimizationController {...defaultProps}>
          <button>Optimize Now</button>
        </OptimizationController>,
      );

      await user?.click(screen?.getByText('Optimize Now'));
      expect(mockPerformanceService?.applyOptimizations).toHaveBeenCalled();
    });

    it('logs optimization actions', async () => {
      const logSpy = vi?.spyOn(console, 'log').mockImplementation(() => {});

      render(<OptimizationController {...defaultProps} enableLogging />);

      await waitFor(() => {
        expect(logSpy).toHaveBeenCalledWith(
          expect?.stringContaining('Performance optimization applied'),
        );
      });
      logSpy?.mockRestore();
    });
  });

  describe('MetricsDisplay', () => {
    it('renders current performance metrics', async () => {
      render(<MetricsDisplay />);

      await waitFor(() => {
        expect(screen?.getByText(/60 FPS/)).toBeInTheDocument();
        expect(screen?.getByText(/80% Memory Usage/)).toBeInTheDocument();
        expect(screen?.getByText(/45% CPU Usage/)).toBeInTheDocument();
      });
    });

    it('updates metrics in real-time', async () => {
      const updatedMetrics = { ...mockMetrics, fps: 45 };

      const { rerender } = render(<MetricsDisplay metrics={mockMetrics} />);
      expect(screen?.getByText(/60 FPS/)).toBeInTheDocument();

      rerender(<MetricsDisplay metrics={updatedMetrics} />);
      expect(screen?.getByText(/45 FPS/)).toBeInTheDocument();
    });

    it('displays warning indicators for poor performance', async () => {
      const poorMetrics = {
        ...mockMetrics,
        fps: 20,
        memoryUsage: 95,
      };

      render(<MetricsDisplay metrics={poorMetrics} />);

      expect(screen?.getByTestId('fps-warning')).toBeInTheDocument();
      expect(screen?.getByTestId('memory-warning')).toBeInTheDocument();
    });

    it('supports different display modes', () => {
      const { rerender } = render(<MetricsDisplay metrics={mockMetrics} mode="compact" />);
      expect(screen?.getByTestId('compact-view')).toBeInTheDocument();

      rerender(<MetricsDisplay metrics={mockMetrics} mode="detailed" />);
      expect(screen?.getByTestId('detailed-view')).toBeInTheDocument();
    });

    it('formats metrics appropriately', () => {
      render(<MetricsDisplay metrics={mockMetrics} />);

      expect(screen?.getByText('1?.2s')).toBeInTheDocument(); // loadTime
      expect(screen?.getByText('800ms')).toBeInTheDocument(); // timeToInteractive
      expect(screen?.getByText('400ms')).toBeInTheDocument(); // firstContentfulPaint
    });
  });

  // Accessibility tests
  describe('Accessibility', () => {
    it('PerformanceMonitor meets accessibility standards', async () => {
      const { container } = render(
        <PerformanceMonitor interval={1000}>
          <div>Monitored Content</div>
        </PerformanceMonitor>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('OptimizationController meets accessibility standards', async () => {
      const { container } = render(
        <OptimizationController
          thresholds={{ fps: 30, memoryUsage: 90, cpuUsage: 80 }}
          onOptimize={() => {}}
        />,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('MetricsDisplay meets accessibility standards', async () => {
      const { container } = render(<MetricsDisplay metrics={mockMetrics} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
