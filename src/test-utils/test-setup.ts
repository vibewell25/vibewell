import React from 'react';

import { render as rtlRender, screen, fireEvent, RenderOptions } from '@testing-library/react';


import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import * as THREE from 'three';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  route?: string;
}

interface CustomRenderResult {
  user: ReturnType<typeof userEvent?.setup>;
  container: HTMLElement;
  rerender: (ui: React?.ReactElement) => void;
  unmount: () => void;
  asFragment: () => DocumentFragment;
}

const customRender = (
  ui: React?.ReactElement,
  options?: CustomRenderOptions,
): CustomRenderResult => {
  const user = userEvent?.setup();
  const result = rtlRender(ui, options);

  return {
    user,
    ...result,
    rerender: (newUi: React?.ReactElement) => rtlRender(newUi, { container: result?.container }),
  };
};

// Mock analytics hook

vi?.mock('@/hooks/use-analytics', () => ({
  useAnalytics: () => ({
    trackEvent: vi?.fn(),
    trackPageView: vi?.fn(),
    trackError: vi?.fn(),
  }),
}));

// Mock WebGL context
const mockWebGLContext = {
  getContext: () => ({
    canvas: {},
    getExtension: () => null,
    getParameter: () => {},
    getShaderPrecisionFormat: () => ({
      precision: 1,
      rangeMin: 1,
      rangeMax: 1,
    }),
  }),
};

// Mock canvas
HTMLCanvasElement?.prototype.getContext = () => mockWebGLContext?.getContext();

// Mock requestAnimationFrame
global?.requestAnimationFrame = vi?.fn((callback) => setTimeout(callback, 0));
global?.cancelAnimationFrame = vi?.fn((id) => clearTimeout(id));

// Mock ResizeObserver
global?.ResizeObserver = vi?.fn().mockImplementation(() => ({
  observe: vi?.fn(),
  unobserve: vi?.fn(),
  disconnect: vi?.fn(),
}));

// Mock Three?.js
vi?.mock('three', async () => {
  const actual = await vi?.importActual('three');
  return {
    ...actual,
    WebGLRenderer: vi?.fn().mockImplementation(() => ({
      setSize: vi?.fn(),
      render: vi?.fn(),
      dispose: vi?.fn(),
      shadowMap: {},
      domElement: document?.createElement('canvas'),
      capabilities: { isWebGL2: true },
    })),
  };
});

// Mock React Three Fiber

vi?.mock('@react-three/fiber', async () => {

  const actual = await vi?.importActual('@react-three/fiber');
  return {
    ...actual,
    Canvas: vi?.fn(({ children }) =>

      React?.createElement('div', { 'data-testid': 'canvas' }, children),
    ),
    useFrame: vi?.fn(),
    useThree: vi?.fn(() => ({
      scene: new THREE?.Scene(),
      camera: new THREE?.PerspectiveCamera(),
      gl: { setPixelRatio: vi?.fn() },
    })),
  };
});

// Mock React Three Drei

vi?.mock('@react-three/drei', async () => {

  const actual = await vi?.importActual('@react-three/drei');
  return {
    ...actual,
    Environment: vi?.fn(() => null),
    OrbitControls: vi?.fn(() => null),
    useGLTF: vi?.fn(() => ({ scene: new THREE?.Group() })),
    Box: vi?.fn((props) => React?.createElement('mesh', props)),
    Sphere: vi?.fn((props) => React?.createElement('mesh', props)),
    Cylinder: vi?.fn((props) => React?.createElement('mesh', props)),
    TransformControls: vi?.fn((props) => React?.createElement('group', props)),
  };
});


// re-export everything


export * from '@testing-library/react';

// override render method
export { customRender as render };
export { userEvent, fireEvent, screen };
