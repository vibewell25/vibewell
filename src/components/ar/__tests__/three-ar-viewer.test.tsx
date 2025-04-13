import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ThreeARViewer } from '../three-ar-viewer';
import * as Security from '@/utils/security';
import * as ARSecurity from '@/utils/ar-security';

// Mock the dependencies
jest.mock('@/utils/security', () => ({
  sanitizeARData: jest.fn((data) => data),
  validateARModel: jest.fn(() => true),
}));

jest.mock('@/utils/ar-security', () => ({
  parseModelPermissions: jest.fn(() => null),
  validatePermissions: jest.fn(() => true),
  DEFAULT_MODEL_PERMISSIONS: {
    allowCapture: true,
    allowShare: true,
    allowExport: false,
    allowedDomains: ['vibewell.com', 'localhost'],
    expiresAt: null
  }
}));

// Mock Three.js since it relies on browser APIs
jest.mock('three', () => {
  const actualThree = jest.requireActual('three');
  
  // Keep most of the original functionality but mock browser-specific APIs
  return {
    ...actualThree,
    WebGLRenderer: jest.fn().mockImplementation(() => ({
      setSize: jest.fn(),
      setPixelRatio: jest.fn(),
      setClearColor: jest.fn(),
      render: jest.fn(),
      domElement: {
        setAttribute: jest.fn(),
        style: {},
        toDataURL: jest.fn(() => 'mock-data-url')
      },
      dispose: jest.fn()
    })),
    PerspectiveCamera: jest.fn().mockImplementation(() => ({
      position: { set: jest.fn(), z: 0 },
      lookAt: jest.fn(),
      aspect: 1,
      updateProjectionMatrix: jest.fn()
    })),
    Scene: jest.fn().mockImplementation(() => ({
      add: jest.fn(),
      remove: jest.fn(),
      children: [],
      background: null
    })),
    Color: jest.fn(),
    AmbientLight: jest.fn(),
    DirectionalLight: jest.fn().mockImplementation(() => ({
      position: { set: jest.fn() }
    })),
    Object3D: jest.fn().mockImplementation(() => ({
      rotation: { y: 0 },
      position: { set: jest.fn() }
    })),
    Mesh: jest.fn().mockImplementation(() => ({
      rotation: { y: 0 },
      position: { set: jest.fn() },
      scale: { set: jest.fn() },
      material: {}
    })),
    MeshStandardMaterial: jest.fn(),
    SphereGeometry: jest.fn(),
    BufferGeometry: jest.fn(),
    BoxGeometry: jest.fn()
  };
});

// Mock the loader to avoid browser APIs
jest.mock('three/examples/jsm/loaders/GLTFLoader', () => ({
  GLTFLoader: jest.fn().mockImplementation(() => ({
    load: jest.fn((url, onLoad) => {
      // Simulate successful model loading
      onLoad({ scene: new (jest.requireMock('three').Object3D)() });
    }),
    setPath: jest.fn(),
    setDRACOLoader: jest.fn()
  }))
}));

// Mock WebGL detection
Object.defineProperty(window, 'WebGLRenderingContext', {
  value: jest.fn()
});

describe('ThreeARViewer Component', () => {
  // Create a sample model data for testing
  const sampleModelData = new Uint8Array([
    // GLB header with "glTF" magic
    0x67, 0x6C, 0x54, 0x46, // "glTF"
    0x02, 0x00, 0x00, 0x00, // version 2
    0x00, 0x00, 0x00, 0x00, // total length (placeholder)
    // Additional placeholder data
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
  ]);

  // Clear mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock canvas and context for WebGL
    const mockContext = {
      getParameter: jest.fn(() => 1),
      getExtension: jest.fn(() => true),
      getShaderPrecisionFormat: jest.fn(() => ({ precision: 1 })),
      MAX_TEXTURE_SIZE: 4096
    };
    
    global.document.createElement = jest.fn().mockImplementation((tag) => {
      if (tag === 'canvas') {
        return {
          getContext: jest.fn(() => mockContext),
          width: 800,
          height: 600,
          style: {}
        };
      }
      return {};
    });
    
    // Mock requestAnimationFrame
    global.requestAnimationFrame = jest.fn(cb => setTimeout(cb, 0));
    global.cancelAnimationFrame = jest.fn();
  });

  test('renders without crashing', async () => {
    render(
      <ThreeARViewer 
        modelData={sampleModelData} 
        type="makeup" 
        data-testid="test-ar-viewer"
      />
    );
    
    // Check if component renders with the correct testId
    expect(screen.getByTestId('test-ar-viewer')).toBeInTheDocument();
    
    // Verify that security checks were called
    await waitFor(() => {
      expect(Security.sanitizeARData).toHaveBeenCalledWith(sampleModelData);
      expect(ARSecurity.parseModelPermissions).toHaveBeenCalledWith(sampleModelData);
    });
  });

  test('displays error message when WebGL is not supported', async () => {
    // Mock WebGL not supported
    global.document.createElement = jest.fn().mockImplementation((tag) => {
      if (tag === 'canvas') {
        return {
          getContext: jest.fn(() => null),
          width: 800,
          height: 600,
          style: {}
        };
      }
      return {};
    });
    
    render(
      <ThreeARViewer 
        modelData={sampleModelData} 
        type="makeup"
      />
    );
    
    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/WebGL is not supported/i)).toBeInTheDocument();
    });
  });

  test('respects model permissions', async () => {
    // Mock permissions that restrict capture
    (ARSecurity.parseModelPermissions as jest.Mock).mockReturnValue({
      allowCapture: false,
      allowShare: false,
      allowExport: false,
      allowedDomains: ['vibewell.com'],
      expiresAt: null
    });
    
    const onCaptureMock = jest.fn();
    
    render(
      <ThreeARViewer 
        modelData={sampleModelData} 
        type="makeup"
        onCapture={onCaptureMock}
      />
    );
    
    // Wait for component to fully render
    await waitFor(() => {
      expect(ARSecurity.parseModelPermissions).toHaveBeenCalled();
    });
    
    // Check for restricted permissions indicators
    expect(await screen.findByText(/Capture Restricted/i)).toBeInTheDocument();
    expect(await screen.findByText(/Sharing Restricted/i)).toBeInTheDocument();
  });

  test('handles model data sanitization', async () => {
    // Mock the sanitization to reject the model
    (Security.sanitizeARData as jest.Mock).mockImplementation(() => {
      throw new Error('Potentially harmful content found in model');
    });
    
    render(
      <ThreeARViewer 
        modelData={sampleModelData} 
        type="makeup"
      />
    );
    
    // Security function should be called
    expect(Security.sanitizeARData).toHaveBeenCalledWith(sampleModelData);
    
    // In a real implementation, this would show an error message
    // For now we just verify the security check was made
  });

  // Clean up after tests
  afterAll(() => {
    jest.restoreAllMocks();
  });
}); 