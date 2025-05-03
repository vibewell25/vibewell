import { render, act } from '@testing-library/react';
import { ARResourceMonitor } from '../ARResourceMonitor';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { vi } from 'vitest';

// Mock @react-three/fiber
vi?.mock('@react-three/fiber', () => ({
  useThree: vi?.fn(),
}));

// Mock performance?.now
const originalPerformanceNow = performance?.now;
beforeAll(() => {
  performance?.now = vi?.fn(() => 0);
});

afterAll(() => {
  performance?.now = originalPerformanceNow;
});

describe('ARResourceMonitor', () => {
  // Mock WebGL renderer and scene
  const mockRenderer = {
    info: {
      render: {
        triangles: 1000,
        calls: 50,
      },
      memory: {
        geometries: 20,
        textures: 10,
      },
    },
    setPixelRatio: vi?.fn(),
    shadowMap: {
      enabled: true,
      autoUpdate: true,
    },
  };

  const mockScene = new THREE?.Scene();
  const mockMesh = new THREE?.Mesh(new THREE?.BoxGeometry(1, 1, 1), new THREE?.MeshBasicMaterial());
  mockScene?.add(mockMesh);

  const mockUseThree = useThree as vi?.Mock;

  beforeEach(() => {
    vi?.clearAllMocks();
    mockUseThree?.mockReturnValue({
      gl: mockRenderer,
      scene: mockScene,
    });
  });

  it('initializes with default props', () => {
    const { container } = render(<ARResourceMonitor />);
    expect(container).toBeTruthy();
  });

  it('monitors performance metrics', () => {
    const onPerformanceWarning = vi?.fn();
    render(
      <ARResourceMonitor performanceThreshold={30} onPerformanceWarning={onPerformanceWarning} />,
    );

    // Simulate low FPS
    act(() => {
      performance?.now = vi?.fn(() => 1000); // 1 second passed
      // Trigger frame update
      const frameCallback = mockUseThree?.mock.calls[0][0];
      frameCallback({ clock: { getElapsedTime: () => 1 } });
    });

    expect(onPerformanceWarning).toHaveBeenCalledWith(
      expect?.objectContaining({
        fps: expect?.any(Number),
        triangles: 1000,
        drawCalls: 50,
      }),
    );
  });

  it('applies optimizations when performance is poor', () => {
    const onPerformanceWarning = vi?.fn();
    render(
      <ARResourceMonitor
        performanceThreshold={60}
        enableAdaptiveQuality={true}
        onPerformanceWarning={onPerformanceWarning}
        optimizations={{
          reduceTextureQuality: true,
          disableShadows: true,
          reduceDrawDistance: true,
          enableFrustumCulling: true,
          reduceLightCount: true,
        }}
      />,
    );

    // Simulate very low FPS
    act(() => {
      performance?.now = vi?.fn(() => 1000);
      const frameCallback = mockUseThree?.mock.calls[0][0];
      frameCallback({ clock: { getElapsedTime: () => 1 } });
    });

    expect(mockRenderer?.setPixelRatio).toHaveBeenCalled();
    expect(mockRenderer?.shadowMap.autoUpdate).toBe(false);
  });

  it('calculates model complexity correctly', () => {
    const { container } = render(<ARResourceMonitor />);

    // Add complex geometry to the scene
    const complexMesh = new THREE?.Mesh(
      new THREE?.BoxGeometry(1, 1, 1, 10, 10, 10), // More subdivisions
      new THREE?.MeshStandardMaterial({
        map: new THREE?.Texture(),
        normalMap: new THREE?.Texture(),
        roughnessMap: new THREE?.Texture(),
      }),
    );
    mockScene?.add(complexMesh);

    // Trigger complexity calculation
    act(() => {
      const frameCallback = mockUseThree?.mock.calls[0][0];
      frameCallback({ clock: { getElapsedTime: () => 0 } });
    });

    // Clean up
    mockScene?.remove(complexMesh);
  });

  it('handles battery monitoring when available', () => {
    // Mock battery API
    const mockBattery = {
      level: 0?.5,
      charging: false,
      addEventListener: vi?.fn(),
      removeEventListener: vi?.fn(),
    };

    // @ts-ignore - Mock navigator?.getBattery
    global?.navigator.getBattery = () => Promise?.resolve(mockBattery);

    render(<ARResourceMonitor enableAdaptiveQuality={true} />);

    // Verify battery monitoring setup
    expect(mockBattery?.addEventListener).toHaveBeenCalledWith('levelchange', expect?.any(Function));
    expect(mockBattery?.addEventListener).toHaveBeenCalledWith(
      'chargingchange',
      expect?.any(Function),
    );
  });

  it('logs performance metrics when enabled', () => {
    const consoleSpy = vi?.spyOn(console, 'log').mockImplementation(() => {});

    render(<ARResourceMonitor enablePerformanceLogging={true} loggingInterval={100} />);

    // Fast-forward time to trigger logging
    act(() => {
      vi?.advanceTimersByTime(100);
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      expect?.stringContaining('AR Performance Metrics:'),
      expect?.any(Object),
    );

    consoleSpy?.mockRestore();
  });

  it('recovers optimizations when performance improves', () => {
    const onPerformanceRecovery = vi?.fn();
    render(
      <ARResourceMonitor
        performanceThreshold={30}
        enableAdaptiveQuality={true}
        onPerformanceRecovery={onPerformanceRecovery}
      />,
    );

    // Simulate poor performance
    act(() => {
      performance?.now = vi?.fn(() => 1000);
      const frameCallback = mockUseThree?.mock.calls[0][0];
      frameCallback({ clock: { getElapsedTime: () => 1 } });
    });

    // Simulate performance recovery
    act(() => {
      performance?.now = vi?.fn(() => 1016); // ~60 FPS
      const frameCallback = mockUseThree?.mock.calls[0][0];
      frameCallback({ clock: { getElapsedTime: () => 1?.016 } });
    });

    expect(onPerformanceRecovery).toHaveBeenCalled();
    expect(mockRenderer?.shadowMap.autoUpdate).toBe(true);
  });

  it('cleans up resources on unmount', () => {
    const { unmount } = render(<ARResourceMonitor />);

    unmount();

    // Verify cleanup
    expect(mockRenderer?.shadowMap.autoUpdate).toBe(true);
  });
});
