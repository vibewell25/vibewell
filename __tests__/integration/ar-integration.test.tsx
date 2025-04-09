/**
 * AR Integration Tests
 * 
 * This file contains comprehensive integration tests for the AR functionality
 * focusing on model loading, rendering, and performance across different devices and browsers.
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { VirtualTryOn } from '@/components/ar/virtual-try-on';
import { 
  testARViewer, 
  testARModelCompatibility,
  measureARModelLoadTime,
  createARTestEnvironment,
  validateARModelRender
} from '@/utils/ar-testing';

// Mock necessary components and hooks
jest.mock('@/hooks/use-ar-cache', () => ({
  useARCache: () => ({
    getModel: jest.fn((url, type, progressCallback) => {
      // Simulate loading progress
      progressCallback(0);
      progressCallback(50);
      progressCallback(100);
      return Promise.resolve(new Uint8Array(new ArrayBuffer(1024)));
    }),
    prefetchModel: jest.fn(),
    clearCache: jest.fn(),
    isLoading: false,
    loadingProgress: 0,
    error: null,
    stats: {
      modelCount: 2,
      totalSize: 1024 * 1024,
      deviceQuota: 50 * 1024 * 1024,
      percentUsed: 2
    }
  })
}));

jest.mock('@/hooks/use-analytics', () => ({
  useAnalytics: () => ({
    trackEvent: jest.fn()
  })
}));

jest.mock('@/hooks/use-engagement', () => ({
  useEngagement: () => ({
    trackAchievement: jest.fn()
  })
}));

jest.mock('@/services/analytics-service', () => ({
  AnalyticsService: jest.fn().mockImplementation(() => ({
    trackTryOnSession: jest.fn(),
    trackShare: jest.fn()
  }))
}));

// Mock the three-ar-viewer component
jest.mock('@/components/ar/three-ar-viewer', () => {
  let rendererRef: React.MutableRefObject<any> = { current: null };
  
  const MockThreeARViewer: React.FC<{ 
    modelData: Uint8Array;
    type: string;
    intensity: number;
    onCapture: (dataUrl: string) => void;
  }> = ({ modelData, type, intensity, onCapture }) => {
    // Create a fake WebGL renderer for testing
    const renderer = {
      info: {
        memory: {
          geometries: 100,
          textures: 50
        }
      },
      capabilities: {
        isWebGL2: true
      },
      outputColorSpace: 'srgb',
      render: jest.fn()
    };
    
    // Assign to the ref for tests to access
    // @ts-ignore - for testing
    rendererRef.current = renderer;
    
    return (
      <div data-testid="three-ar-viewer" data-type={type} data-intensity={intensity}>
        <button 
          onClick={() => onCapture('mock-image-data')} 
          data-testid="capture-button"
        >
          Capture
        </button>
      </div>
    );
  };
  
  // @ts-ignore - for testing
  MockThreeARViewer.getRendererRef = () => rendererRef;
  
  return { ThreeARViewer: MockThreeARViewer };
});

// Set up test models
const testModels = [
  { 
    url: '/models/makeup/lipstick.glb', 
    type: 'makeup' as const, 
    name: 'Red Lipstick', 
    id: 'lipstick' 
  },
  { 
    url: '/models/makeup/foundation.glb', 
    type: 'makeup' as const, 
    name: 'Foundation', 
    id: 'foundation' 
  },
  { 
    url: '/models/hairstyle/bob.glb', 
    type: 'hairstyle' as const, 
    name: 'Bob Cut', 
    id: 'bob' 
  },
  { 
    url: '/models/accessory/glasses.glb', 
    type: 'accessory' as const, 
    name: 'Sunglasses', 
    id: 'glasses' 
  },
  { 
    url: '/models/accessory/earrings.glb', 
    type: 'accessory' as const, 
    name: 'Gold Earrings', 
    id: 'earrings' 
  }
];

describe('AR Integration Tests', () => {
  let consoleWarnSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  
  beforeAll(() => {
    // Suppress console warnings and errors during tests
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock navigator.userAgent for device testing
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Safari/605.1.15',
      configurable: true
    });
  });
  
  afterAll(() => {
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });
  
  it('renders all test models correctly', async () => {
    render(
      <VirtualTryOn 
        models={testModels} 
        userId="test-user-123"
      />
    );
    
    // Check that all model buttons are rendered
    for (const model of testModels) {
      expect(screen.getByText(model.name)).toBeInTheDocument();
    }
    
    // Wait for the first model to load
    await waitFor(() => {
      expect(screen.getByTestId('three-ar-viewer')).toBeInTheDocument();
    });
  });
  
  it('passes performance benchmarks for all test models', async () => {
    // Get the mock renderer ref from the ThreeARViewer component
    const ThreeARViewer = require('@/components/ar/three-ar-viewer').ThreeARViewer;
    const rendererRef = ThreeARViewer.getRendererRef();
    
    // Test each model against performance benchmarks
    for (const model of testModels) {
      const result = await testARViewer(rendererRef, {
        simulatedDevice: 'iOS',
        networkCondition: '4G',
        minFrameRate: 30,
        maxLoadTime: 3000,
        logPerformance: false
      });
      
      // Verify performance meets criteria
      expect(result.success).toBe(true);
      expect(result.performance.fps).toBeGreaterThanOrEqual(30);
      expect(result.performance.loadTime).toBeLessThanOrEqual(3000);
      
      // Verify visual quality
      expect(result.visualQuality.alignmentAccuracy).toBeLessThanOrEqual(2); // Within 2mm
      expect(result.errors).toHaveLength(0);
    }
  });
  
  it('verifies compatibility across different browsers and devices', async () => {
    // Test compatibility of each model
    for (const model of testModels) {
      const compatibility = await testARModelCompatibility(
        model.url,
        {
          browsers: ['Safari', 'Chrome', 'Firefox'],
          devices: ['iOS', 'Android', 'desktop']
        }
      );
      
      // Key browser/device combinations must be compatible
      expect(compatibility.iOS.Safari).toBe(true); // iOS Safari
      expect(compatibility.Android.Chrome).toBe(true); // Android Chrome
      expect(compatibility.desktop.Chrome).toBe(true); // Desktop Chrome
      expect(compatibility.desktop.Firefox).toBe(true); // Desktop Firefox
    }
  });
  
  it('measures loading time across multiple trials', async () => {
    for (const model of testModels) {
      // Measure load time with 5 trials
      const loadTimes = await measureARModelLoadTime(model.url, 5);
      
      // Expect average load time to be under 3 seconds (3000ms)
      expect(loadTimes.average).toBeLessThan(3000);
      
      // Log performance metrics for analysis
      console.log(`Load time for ${model.name}: 
        Avg: ${loadTimes.average.toFixed(2)}ms, 
        Min: ${loadTimes.min.toFixed(2)}ms, 
        Max: ${loadTimes.max.toFixed(2)}ms`);
    }
  });
  
  it('tests model rendering in different lighting conditions', () => {
    // Create a test environment with controlled lighting
    const container = document.createElement('div');
    document.body.appendChild(container);
    
    try {
      // Test with different lighting intensities
      [0.5, 1.0, 2.0].forEach(intensity => {
        const { scene, camera, renderer, cleanup } = createARTestEnvironment(
          container,
          { lightIntensity: intensity }
        );
        
        const quality = validateARModelRender(scene, camera, renderer);
        
        // Expect rendering quality to be above threshold
        expect(quality.qualityScore).toBeGreaterThanOrEqual(6);
        
        // Clean up to avoid memory leaks
        cleanup();
      });
    } finally {
      // Clean up
      if (document.body.contains(container)) {
        document.body.removeChild(container);
      }
    }
  });
  
  it('handles camera resolution changes appropriately', async () => {
    // Render component
    render(
      <VirtualTryOn 
        models={testModels} 
        userId="test-user-123"
      />
    );
    
    // Wait for render
    await waitFor(() => {
      expect(screen.getByTestId('three-ar-viewer')).toBeInTheDocument();
    });
    
    // Get the mock renderer ref
    const ThreeARViewer = require('@/components/ar/three-ar-viewer').ThreeARViewer;
    const rendererRef = ThreeARViewer.getRendererRef();
    
    // Test with different camera resolutions
    const resolutions = [
      { width: 640, height: 480 },  // Low
      { width: 1280, height: 720 }, // Medium
      { width: 1920, height: 1080 } // High
    ];
    
    for (const resolution of resolutions) {
      const result = await testARViewer(rendererRef, {
        cameraResolution: resolution,
        logPerformance: false
      });
      
      // Even at high resolution, should maintain minimum performance
      expect(result.performance.fps).toBeGreaterThanOrEqual(30);
      expect(result.success).toBe(true);
    }
  });
}); 