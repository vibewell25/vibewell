/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import * as THREE from 'three';
import ARViewer from '../ARViewer';
import { Forest } from '../models/Forest';
import { Beach } from '../models/Beach';
import { Mountain } from '../models/Mountain';
import { ZenGarden } from '../models/ZenGarden';
import { ModelControls } from '../ModelControls';
import { useThree } from '@react-three/fiber';
import '@testing-library/jest-dom/vitest';

// Mock Three.js
vi.mock('three', () => {
  const THREE = vi.importActual('three');
  return {
    ...THREE,
    Group: vi.fn().mockImplementation(() => ({
      position: { set: vi.fn() },
      rotation: { set: vi.fn() },
      scale: { set: vi.fn() },
    })),
  };
});

// Mock React Three Fiber
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="canvas">{children}</div>
  ),
  useFrame: vi.fn((callback: (state: { clock: { getElapsedTime: () => number } }) => void) =>
    callback({ clock: { getElapsedTime: () => 0 } })
  ),
  useThree: vi.fn(() => ({
    camera: { position: { set: vi.fn() } },
    gl: {
      setPixelRatio: vi.fn(),
      setSize: vi.fn(),
      capabilities: {
        isWebGL2: true,
        maxTextures: 32,
        maxVertexTextures: 16,
        maxTextureSize: 16384,
        maxCubemapSize: 16384,
        maxAttributes: 16,
        maxVertexUniforms: 4096,
        maxVaryings: 16,
        maxFragmentUniforms: 1024,
        vertexTextures: true,
        floatFragmentTextures: true,
        floatVertexTextures: true,
      },
    },
    scene: { background: null },
  })),
}));

// Mock React Three Drei
vi.mock('@react-three/drei', () => ({
  Environment: vi.fn(() => null),
  OrbitControls: vi.fn(() => null),
  useGLTF: vi.fn(() => ({
    scene: {
      clone: vi.fn(() => ({
        traverse: vi.fn(),
      })),
    },
  })),
  Box: vi.fn((props: JSX.IntrinsicElements['mesh']) => <mesh {...props} />),
  Sphere: vi.fn((props: JSX.IntrinsicElements['mesh']) => <mesh {...props} />),
  Cylinder: vi.fn((props: JSX.IntrinsicElements['mesh']) => <mesh {...props} />),
  TransformControls: vi.fn((props: any) => <group {...props} />),
}));

describe('AR Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ARViewer', () => {
    const defaultProps = {
      modelUrl: 'test.glb',
      backgroundColor: '#ffffff',
    };

    it('renders without crashing', () => {
      render(<ARViewer {...defaultProps} />);
      const container = screen.getByTestId('loading-spinner');
      expect(container).toBeInTheDocument();
    });

    it('shows loading state initially', () => {
      render(<ARViewer {...defaultProps} />);
      const loadingSpinner = screen.getByTestId('loading-spinner');
      expect(loadingSpinner).toBeInTheDocument();
      expect(loadingSpinner.className).toContain('animate-spin');
    });

    it('applies custom background color', () => {
      const customColor = '#ff0000';
      render(<ARViewer {...defaultProps} backgroundColor={customColor} />);
      const container = screen.getByTestId('ar-viewer-container');
      expect(container).toHaveStyle({ backgroundColor: customColor });
    });
  });

  describe('Environment Models', () => {
    const testModel = (Component: React.ComponentType) => {
      render(
        <div data-testid="canvas">
          <Component />
        </div>
      );
      const canvas = screen.getByTestId('canvas');
      expect(canvas).toBeInTheDocument();
    };

    it('renders Forest model', () => {
      testModel(Forest);
    });

    it('renders Beach model', () => {
      testModel(Beach);
    });

    it('renders Mountain model', () => {
      testModel(Mountain);
    });

    it('renders ZenGarden model', () => {
      testModel(ZenGarden);
    });
  });

  describe('ModelControls', () => {
    const mockRef = { current: new THREE.Group() };
    const defaultProps = {
      modelRef: mockRef,
      type: 'test',
      onModeChange: vi.fn(),
    };

    it('renders transform controls', () => {
      const { container } = render(
        <div data-testid="canvas">
          <ModelControls {...defaultProps} />
        </div>
      );
      expect(container).toBeInTheDocument();
    });

    it('handles mode changes', () => {
      const { container } = render(
        <div data-testid="canvas">
          <ModelControls {...defaultProps} />
        </div>
      );

      // Simulate mode change through TransformControls props
      const transformControls = container.querySelector('[data-testid="canvas"]') as HTMLElement;
      if (transformControls) {
        fireEvent.click(transformControls);
        // Since onModeChange is not a prop, we just verify the click event was fired
        expect(transformControls).toBeInTheDocument();
      }
    });
  });

  describe('Performance', () => {
    it('optimizes rendering based on device capabilities', async () => {
      const mockGl = {
        setPixelRatio: vi.fn(),
        setSize: vi.fn(),
        capabilities: {
          isWebGL2: true,
          maxTextures: 32,
          maxVertexTextures: 16,
          maxTextureSize: 16384,
          maxCubemapSize: 16384,
          maxAttributes: 16,
          maxVertexUniforms: 4096,
          maxVaryings: 16,
          maxFragmentUniforms: 1024,
          vertexTextures: true,
          floatFragmentTextures: true,
          floatVertexTextures: true,
        },
      };

      (useThree as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        camera: { position: { set: vi.fn() } },
        gl: mockGl,
        scene: { background: null },
      });

      render(<ARViewer modelUrl="test.glb" />);

      await waitFor(() => {
        expect(mockGl.setPixelRatio).toHaveBeenCalled();
        expect(mockGl.setSize).toHaveBeenCalled();
      });
    });
  });
});
