import React from 'react';
import { render as rtlRender, fireEvent, waitFor } from '@testing-library/react';
import { WebGLProvider } from '@/contexts/WebGLContext';
import { AudioProvider } from '@/contexts/AudioContext';
import { MeditationProvider } from '@/contexts/MeditationContext';

function render(ui: React.ReactNode, options = {}) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return (
      <WebGLProvider>
        <AudioProvider>
          <MeditationProvider>{children}</MeditationProvider>
        </AudioProvider>
      </WebGLProvider>
    );
  };

  return rtlRender(ui, { wrapper: Wrapper, ...options });
}

// Mock WebGL context
const mockWebGLContext = {
  viewport: jest.fn(),
  clearColor: jest.fn(),
  clear: jest.fn(),
  canvas: document.createElement('canvas'),
  getContextAttributes: jest.fn(),
  createBuffer: jest.fn(),
  bindBuffer: jest.fn(),
  bufferData: jest.fn(),
  createShader: jest.fn(),
  shaderSource: jest.fn(),
  compileShader: jest.fn(),
  createProgram: jest.fn(),
  attachShader: jest.fn(),
  linkProgram: jest.fn(),
  useProgram: jest.fn(),
  getAttribLocation: jest.fn(),
  enableVertexAttribArray: jest.fn(),
  vertexAttribPointer: jest.fn(),
  drawArrays: jest.fn(),
} as unknown as WebGLRenderingContext;

// Mock Audio context
const mockAudioContext = {
  createGain: () => ({
    connect: jest.fn(),
    gain: { value: 1 },
  }),
  createOscillator: () => ({
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
  }),
  destination: {},
  state: 'running',
  suspend: jest.fn(),
  resume: jest.fn(),
  close: jest.fn(),
} as unknown as AudioContext;

// Setup global mocks
const setupGlobalMocks = () => {
  // Mock WebGL
  HTMLCanvasElement.prototype.getContext = jest.fn((contextId) => {
    if (contextId === 'webgl') {
      return mockWebGLContext;
    }
    return null;
  });

  // Mock Audio Context
  window.AudioContext = jest.fn().mockImplementation(() => mockAudioContext);

  // Mock ResizeObserver
  global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));

  // Mock requestAnimationFrame
  global.requestAnimationFrame = jest.fn((callback) => setTimeout(callback, 0));
  global.cancelAnimationFrame = jest.fn((id) => clearTimeout(id));
};

// Cleanup global mocks
const cleanupGlobalMocks = () => {
  jest.restoreAllMocks();
};

export { render, fireEvent, waitFor, setupGlobalMocks, cleanupGlobalMocks };
