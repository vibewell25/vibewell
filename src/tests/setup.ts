import { vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { toHaveNoViolations } from 'jest-axe';
import type { ReactNode } from 'react';

// Extend expect with jest-axe
expect.extend(toHaveNoViolations);

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
  }),
  usePathname: () => '',
}));

// Mock next-auth
vi.mock('next-auth/react', () => ({
  useSession: () => ({
    data: {
      user: {
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
    status: 'authenticated',
  }),
  signIn: vi.fn(),
  signOut: vi.fn(),
  SessionProvider: ({ children }: { children: ReactNode }) => children,
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Create partial implementations that satisfy the required interfaces
const mockWebGLContext = {
  canvas: null as any,
  drawingBufferWidth: 0,
  drawingBufferHeight: 0,
  drawingBufferColorSpace: 'srgb',
  // Required WebGL properties
  DEPTH_BUFFER_BIT: 0x00000100,
  STENCIL_BUFFER_BIT: 0x00000400,
  COLOR_BUFFER_BIT: 0x00004000,
  ARRAY_BUFFER: 0x8892,
  ELEMENT_ARRAY_BUFFER: 0x8893,
  STATIC_DRAW: 0x88e4,
  FLOAT: 0x1406,
  TRIANGLES: 0x0004,
  UNSIGNED_SHORT: 0x1403,
  VERTEX_SHADER: 0x8b31,
  FRAGMENT_SHADER: 0x8b30,
  COMPILE_STATUS: 0x8b81,
  LINK_STATUS: 0x8b82,
  TEXTURE_2D: 0x0de1,
  TEXTURE0: 0x84c0,
  // Required WebGL methods
  getContextAttributes: jest.fn(() => ({
    alpha: true,
    antialias: true,
    depth: true,
    desynchronized: false,
    failIfMajorPerformanceCaveat: false,
    powerPreference: 'default',
    premultipliedAlpha: true,
    preserveDrawingBuffer: false,
    stencil: false,
  })),
  isContextLost: jest.fn(() => false),
  getExtension: jest.fn(() => null),
  activeTexture: jest.fn(),
  attachShader: jest.fn(),
  bindBuffer: jest.fn(),
  bindTexture: jest.fn(),
  blendFunc: jest.fn(),
  bufferData: jest.fn(),
  clear: jest.fn(),
  clearColor: jest.fn(),
  compileShader: jest.fn(),
  createBuffer: jest.fn(() => ({})),
  createProgram: jest.fn(() => ({})),
  createShader: jest.fn(() => ({})),
  createTexture: jest.fn(() => ({})),
  deleteBuffer: jest.fn(),
  deleteProgram: jest.fn(),
  deleteShader: jest.fn(),
  deleteTexture: jest.fn(),
  disable: jest.fn(),
  drawArrays: jest.fn(),
  drawElements: jest.fn(),
  enable: jest.fn(),
  enableVertexAttribArray: jest.fn(),
  getAttribLocation: jest.fn(() => 0),
  getError: jest.fn(() => 0),
  getProgramParameter: jest.fn(() => true),
  getShaderParameter: jest.fn(() => true),
  getUniformLocation: jest.fn(() => ({})),
  linkProgram: jest.fn(),
  shaderSource: jest.fn(),
  texImage2D: jest.fn(),
  texParameteri: jest.fn(),
  uniform1f: jest.fn(),
  uniform1i: jest.fn(),
  uniform2f: jest.fn(),
  uniform3f: jest.fn(),
  uniform4f: jest.fn(),
  useProgram: jest.fn(),
  vertexAttribPointer: jest.fn(),
  viewport: jest.fn(),
} as unknown as WebGLRenderingContext;

const mock2DContext = {
  canvas: null as any,
  // Required 2D context properties
  globalAlpha: 1,
  globalCompositeOperation: 'source-over',
  filter: 'none',
  imageSmoothingEnabled: true,
  imageSmoothingQuality: 'low' as ImageSmoothingQuality,
  strokeStyle: '#000',
  fillStyle: '#000',
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  shadowBlur: 0,
  shadowColor: 'rgba(0, 0, 0, 0)',
  lineWidth: 1,
  lineCap: 'butt' as CanvasLineCap,
  lineJoin: 'miter' as CanvasLineJoin,
  miterLimit: 10,
  lineDashOffset: 0,
  font: '10px sans-serif',
  textAlign: 'start' as CanvasTextAlign,
  textBaseline: 'alphabetic' as CanvasTextBaseline,
  direction: 'ltr' as CanvasDirection,
  // Required 2D context methods
  getContextAttributes: jest.fn(() => ({
    alpha: true,
    colorSpace: 'srgb',
    desynchronized: false,
    willReadFrequently: false,
  })),
  isContextLost: jest.fn(() => false),
  reset: jest.fn(),
  commit: jest.fn(),
  save: jest.fn(),
  restore: jest.fn(),
  scale: jest.fn(),
  rotate: jest.fn(),
  translate: jest.fn(),
  transform: jest.fn(),
  setTransform: jest.fn(),
  resetTransform: jest.fn(),
  createConicGradient: jest.fn(() => ({
    addColorStop: jest.fn(),
  })),
  createLinearGradient: jest.fn(() => ({
    addColorStop: jest.fn(),
  })),
  createRadialGradient: jest.fn(() => ({
    addColorStop: jest.fn(),
  })),
  createPattern: jest.fn(() => null),
  clearRect: jest.fn(),
  fillRect: jest.fn(),
  strokeRect: jest.fn(),
  fillText: jest.fn(),
  strokeText: jest.fn(),
  measureText: jest.fn(() => ({
    width: 0,
    actualBoundingBoxLeft: 0,
    actualBoundingBoxRight: 0,
    actualBoundingBoxAscent: 0,
    actualBoundingBoxDescent: 0,
  })),
  getLineDash: jest.fn(() => []),
  setLineDash: jest.fn(),
  createImageData: jest.fn(() => ({
    width: 0,
    height: 0,
    data: new Uint8ClampedArray(),
  })),
  getImageData: jest.fn(() => ({
    width: 0,
    height: 0,
    data: new Uint8ClampedArray(),
  })),
  putImageData: jest.fn(),
  drawImage: jest.fn(),
  beginPath: jest.fn(),
  closePath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  bezierCurveTo: jest.fn(),
  quadraticCurveTo: jest.fn(),
  arc: jest.fn(),
  arcTo: jest.fn(),
  ellipse: jest.fn(),
  rect: jest.fn(),
  roundRect: jest.fn(),
  fill: jest.fn(),
  stroke: jest.fn(),
  clip: jest.fn(),
  isPointInPath: jest.fn(() => false),
  isPointInStroke: jest.fn(() => false),
  getTransform: jest.fn(() => new DOMMatrix()),
} as unknown as CanvasRenderingContext2D;

// Type-safe mock implementation of getContext with overloads
function getContextMock(
  contextId: '2d',
  options?: CanvasRenderingContext2DSettings,
): CanvasRenderingContext2D | null;
function getContextMock(
  contextId: 'bitmaprenderer',
  options?: ImageBitmapRenderingContextSettings,
): ImageBitmapRenderingContext | null;
function getContextMock(
  contextId: 'webgl',
  options?: WebGLContextAttributes,
): WebGLRenderingContext | null;
function getContextMock(
  contextId: 'webgl2',
  options?: WebGLContextAttributes,
): WebGL2RenderingContext | null;
function getContextMock(
  this: HTMLCanvasElement,
  contextId: string,
  options?: any,
): RenderingContext | null {
  if (contextId === 'webgl' || contextId === 'webgl2') {
    return mockWebGLContext;
  }
  if (contextId === '2d') {
    return mock2DContext;
  }
  return null;
}

HTMLCanvasElement.prototype.getContext = getContextMock;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
};

// Mock requestAnimationFrame
global.requestAnimationFrame = (callback) => setTimeout(callback, 0);
global.cancelAnimationFrame = jest.fn();

// Mock AudioContext
class MockAudioContext {
  baseLatency = 0;
  outputLatency = 0;
  audioWorklet = {} as AudioWorklet;
  destination = {} as AudioDestinationNode;
  listener = {} as AudioListener;
  sampleRate = 44100;
  state = 'running' as AudioContextState;
  currentTime = 0;

  close = jest.fn();
  createMediaElementSource = jest.fn();
  createMediaStreamDestination = jest.fn();
  createMediaStreamSource = jest.fn();
  createBuffer = jest.fn();
  createBufferSource = jest.fn();
  createGain = jest.fn(() => ({
    connect: jest.fn(),
    disconnect: jest.fn(),
    gain: { value: 1 },
  }));
  createOscillator = jest.fn(() => ({
    connect: jest.fn(),
    disconnect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
  }));
  createAnalyser = jest.fn(() => ({
    connect: jest.fn(),
    disconnect: jest.fn(),
    getByteFrequencyData: jest.fn(),
  }));
  createBiquadFilter = jest.fn();
  createConstantSource = jest.fn();
  createChannelMerger = jest.fn();
  createChannelSplitter = jest.fn();
  createConvolver = jest.fn();
  createDelay = jest.fn();
  createDynamicsCompressor = jest.fn();
  createIIRFilter = jest.fn();
  createPanner = jest.fn();
  createPeriodicWave = jest.fn();
  createScriptProcessor = jest.fn();
  createStereoPanner = jest.fn();
  createWaveShaper = jest.fn();
  decodeAudioData = jest.fn();
  resume = jest.fn();
  suspend = jest.fn();
}

Object.defineProperty(window, 'AudioContext', {
  writable: true,
  value: MockAudioContext,
});

// Suppress console errors during tests
global.console.error = jest.fn();

// Clean up after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
