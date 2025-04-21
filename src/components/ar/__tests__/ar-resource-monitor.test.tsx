import { render, screen } from '@testing-library/react';
import { ARResourceMonitor } from '../ARResourceMonitor';
import { useThree } from '@react-three/fiber';
import { errorTrackingService } from '@/lib/error-tracking';

// Mock @react-three/fiber
jest.mock('@react-three/fiber', () => ({
  useThree: jest.fn(),
  useFrame: jest.fn(cb => cb()),
}));

// Mock error tracking service
jest.mock('@/lib/error-tracking', () => ({
  errorTrackingService: {
    captureError: jest.fn(),
  },
}));

describe('ARResourceMonitor', () => {
  const mockGL = {
    info: {
      render: {
        triangles: 1000,
        calls: 50,
      },
      memory: {
        geometries: 10,
        textures: 5,
      },
    },
    domElement: document.createElement('canvas'),
    setPixelRatio: jest.fn(),
    shadowMap: {
      enabled: true,
      autoUpdate: true,
      needsUpdate: false,
    },
  };

  const mockScene = {
    traverse: jest.fn(),
    getObjectByProperty: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useThree as jest.Mock).mockReturnValue({
      gl: mockGL,
      scene: mockScene,
    });
  });

  it('renders performance metrics', () => {
    render(
      <ARResourceMonitor
        enableAdaptiveQuality={true}
        performanceThreshold={30}
        devModeOnly={false}
      />
    );

    expect(screen.getByText(/FPS:/)).toBeInTheDocument();
    expect(screen.getByText(/Triangles:/)).toBeInTheDocument();
    expect(screen.getByText(/Draw calls:/)).toBeInTheDocument();
    expect(screen.getByText(/Memory:/)).toBeInTheDocument();
  });

  it('applies optimizations when performance is poor', () => {
    const onPerformanceWarning = jest.fn();

    render(
      <ARResourceMonitor
        enableAdaptiveQuality={true}
        performanceThreshold={60}
        onPerformanceWarning={onPerformanceWarning}
      />
    );

    // Simulate poor performance
    jest.advanceTimersByTime(1000);

    expect(mockGL.setPixelRatio).toHaveBeenCalled();
    expect(onPerformanceWarning).toHaveBeenCalled();
    expect(errorTrackingService.captureError).toHaveBeenCalled();
  });

  it('does not render in production when devModeOnly is true', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    render(
      <ARResourceMonitor
        enableAdaptiveQuality={true}
        performanceThreshold={30}
        devModeOnly={true}
      />
    );

    expect(screen.queryByText(/FPS:/)).not.toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it('tracks performance metrics over time', () => {
    const mockLoggingInterval = 1000;

    render(
      <ARResourceMonitor enablePerformanceLogging={true} loggingInterval={mockLoggingInterval} />
    );

    // Simulate time passing
    jest.advanceTimersByTime(mockLoggingInterval * 2);

    // Verify metrics are being logged
    expect(mockScene.traverse).toHaveBeenCalled();
  });

  it('handles battery information when available', () => {
    const mockBattery = {
      level: 0.75,
      charging: true,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };

    // Mock battery API
    (global.navigator as any).getBattery = jest.fn().mockResolvedValue(mockBattery);

    render(<ARResourceMonitor enableAdaptiveQuality={true} />);

    // Wait for battery info to be processed
    expect(mockBattery.addEventListener).toHaveBeenCalledWith('levelchange', expect.any(Function));
    expect(mockBattery.addEventListener).toHaveBeenCalledWith(
      'chargingchange',
      expect.any(Function)
    );
  });
});
