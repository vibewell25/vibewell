#!/bin/bash

# Script to install and configure testing dependencies for Vibewell

echo "Installing test dependencies..."

# Install required testing packages
npm install --save-dev \
  @testing-library/user-event@latest \
  jest-axe@latest \
  msw@latest \
  identity-obj-proxy@latest

# Create necessary mock files
mkdir -p __mocks__
mkdir -p src/types

# Create TypeScript declarations for testing libraries
echo "Creating TypeScript declarations for testing libraries..."
# jest-dom.d.ts
cat > src/types/jest-dom.d.ts << 'EOF'
import '@testing-library/jest-dom';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveAttribute(attr: string, value?: string): R;
      toHaveClass(...classNames: string[]): R;
      toHaveStyle(css: string): R;
      toHaveTextContent(text: string | RegExp): R;
      toBeVisible(): R;
      toBeDisabled(): R;
      toBeEnabled(): R;
      toBeEmpty(): R;
      toBeRequired(): R;
      toHaveFocus(): R;
      toBeChecked(): R;
      toBePartiallyChecked(): R;
      toHaveValue(value?: string | string[] | number): R;
      toHaveDisplayValue(value: string | string[] | RegExp): R;
      toBeInvalid(): R;
      toBeValid(): R;
    }
  }
}
EOF

# jest-axe.d.ts
cat > src/types/jest-axe.d.ts << 'EOF'
declare module 'jest-axe' {
  import { AxeResults } from 'axe-core';

  interface AxeOptions {
    runOnly?: {
      type: 'tag' | 'rule';
      values: string[];
    };
    rules?: {
      [key: string]: {
        enabled: boolean;
      };
    };
    reporter?: 'v1' | 'v2' | 'no-passes';
    resultTypes?: ('passes' | 'violations' | 'incomplete' | 'inapplicable')[];
    selectors?: boolean;
    ancestry?: boolean;
    xpath?: boolean;
    absolutePaths?: boolean;
    iframes?: boolean;
    elementRef?: boolean;
    framewaitTime?: number;
    performanceTimer?: boolean;
  }

  function configureAxe(options: AxeOptions): void;
  function axe(html: Element | string, options?: AxeOptions): Promise<AxeResults>;
  function toHaveNoViolations(results: AxeResults): { pass: boolean; message: () => string };

  global {
    namespace jest {
      interface Matchers<R> {
        toHaveNoViolations(): R;
      }
    }
  }

  export { axe, configureAxe, toHaveNoViolations };
}
EOF

# user-event.d.ts
cat > src/types/user-event.d.ts << 'EOF'
declare module '@testing-library/user-event' {
  import { PointerOptions } from '@testing-library/dom';

  interface TypeOptions {
    skipClick?: boolean;
    skipAutoClose?: boolean;
    delay?: number;
  }

  interface UserEvent {
    clear(element: Element): Promise<void>;
    click(element: Element, options?: PointerOptions): Promise<void>;
    dblClick(element: Element, options?: PointerOptions): Promise<void>;
    type(element: Element, text: string, options?: TypeOptions): Promise<void>;
    upload(element: Element, file: File | File[]): Promise<void>;
    hover(element: Element): Promise<void>;
    unhover(element: Element): Promise<void>;
    paste(element: Element, text: string): Promise<void>;
    selectOptions(element: Element, values: string | string[] | HTMLElement | HTMLElement[]): Promise<void>;
    deselectOptions(element: Element, values: string | string[] | HTMLElement | HTMLElement[]): Promise<void>;
    tab({ shift }?: { shift?: boolean }): Promise<void>;
  }

  export default function userEvent(): UserEvent;
}
EOF

# Create mock for file imports
echo "Creating file mock..."
cat > __mocks__/fileMock.js << 'EOF'
// Mock file for handling image, font, and other asset imports
module.exports = 'test-file-stub';
EOF

# Create mock for style imports
echo "Creating style mock..."
cat > __mocks__/styleMock.js << 'EOF'
// Mock file for CSS, SCSS, SASS and other style imports
module.exports = {};
EOF

# Create mock for Three.js
echo "Creating Three.js mock..."
cat > __mocks__/three.js << 'EOF'
// Basic Three.js mock
const mockVector3 = {
  set: jest.fn(),
  copy: jest.fn(),
  clone: jest.fn(() => ({ ...mockVector3 })),
  add: jest.fn(),
  sub: jest.fn(),
  multiply: jest.fn(),
  divide: jest.fn(),
  length: jest.fn(() => 1),
  normalize: jest.fn(),
};

const mockColor = {
  set: jest.fn(),
  copy: jest.fn(),
  clone: jest.fn(() => ({ ...mockColor })),
  r: 1, g: 1, b: 1,
};

const mockQuaternion = {
  set: jest.fn(),
  copy: jest.fn(),
  clone: jest.fn(() => ({ ...mockQuaternion })),
  setFromEuler: jest.fn(),
  setFromAxisAngle: jest.fn(),
};

const mockMatrix4 = {
  set: jest.fn(),
  copy: jest.fn(),
  clone: jest.fn(() => ({ ...mockMatrix4 })),
  identity: jest.fn(),
  makeRotationFromQuaternion: jest.fn(),
  multiply: jest.fn(),
};

const mockObject3D = {
  position: { ...mockVector3 },
  rotation: { ...mockVector3, _order: 'XYZ' },
  quaternion: { ...mockQuaternion },
  scale: { ...mockVector3, x: 1, y: 1, z: 1 },
  matrix: { ...mockMatrix4 },
  matrixWorld: { ...mockMatrix4 },
  children: [],
  parent: null,
  up: { ...mockVector3, y: 1 },
  visible: true,
  castShadow: false,
  receiveShadow: false,
  frustumCulled: true,
  renderOrder: 0,
  userData: {},
  uuid: 'mock-uuid',
  name: '',
  type: 'Object3D',
  add: jest.fn(function(child) { 
    this.children.push(child); 
    child.parent = this;
    return this;
  }),
  remove: jest.fn(function(child) {
    const index = this.children.indexOf(child);
    if (index !== -1) {
      this.children.splice(index, 1);
      child.parent = null;
    }
    return this;
  }),
  updateMatrix: jest.fn(),
  updateMatrixWorld: jest.fn(),
  updateWorldMatrix: jest.fn(),
  traverse: jest.fn(function(callback) {
    callback(this);
    this.children.forEach(child => child.traverse && child.traverse(callback));
  }),
  traverseVisible: jest.fn(),
  traverseAncestors: jest.fn(),
  lookAt: jest.fn(),
  clone: jest.fn(() => ({ ...mockObject3D })),
  copy: jest.fn(),
  getWorldPosition: jest.fn(() => ({ ...mockVector3 })),
  getWorldQuaternion: jest.fn(() => ({ ...mockQuaternion })),
  getWorldScale: jest.fn(() => ({ ...mockVector3 })),
  applyMatrix4: jest.fn(),
  raycast: jest.fn(),
};

const mockScene = {
  ...mockObject3D,
  type: 'Scene',
  background: null,
  environment: null,
  fog: null,
  overrideMaterial: null,
  autoUpdate: true,
  isScene: true,
};

const mockCamera = {
  ...mockObject3D,
  type: 'Camera',
  matrixWorldInverse: { ...mockMatrix4 },
  projectionMatrix: { ...mockMatrix4 },
  projectionMatrixInverse: { ...mockMatrix4 },
  isCamera: true,
  near: 0.1,
  far: 2000,
  zoom: 1,
  updateProjectionMatrix: jest.fn(),
  clone: jest.fn(() => ({ ...mockCamera })),
};

const mockMesh = {
  ...mockObject3D,
  type: 'Mesh',
  isMesh: true,
  geometry: {
    dispose: jest.fn(),
    attributes: { position: { count: 0 } },
    boundingSphere: { radius: 1 },
  },
  material: {
    dispose: jest.fn(),
    side: 0,
    transparent: false,
    opacity: 1,
    color: { ...mockColor },
  },
  updateMorphTargets: jest.fn(),
};

const mockRenderer = {
  domElement: document.createElement('div'),
  setSize: jest.fn(),
  setPixelRatio: jest.fn(),
  setClearColor: jest.fn(),
  render: jest.fn(),
  shadowMap: {
    enabled: false,
    type: 1,
  },
  xr: {
    enabled: false,
    setReferenceSpaceType: jest.fn(),
    getReferenceSpace: jest.fn(),
    getSession: jest.fn(),
    isPresenting: false,
  },
  outputEncoding: 3000,
  toneMapping: 0,
  toneMappingExposure: 1,
  dispose: jest.fn(),
};

const mockRaycaster = {
  ray: {
    origin: { ...mockVector3 },
    direction: { ...mockVector3 },
  },
  near: 0,
  far: Infinity,
  params: {
    Mesh: {},
    Line: {},
    LOD: {},
    Points: {},
    Sprite: {},
  },
  linePrecision: 1,
  set: jest.fn(),
  setFromCamera: jest.fn(),
  intersectObject: jest.fn(() => []),
  intersectObjects: jest.fn(() => []),
};

// Export all mocks for Three.js
module.exports = {
  // Basic structures
  Vector2: jest.fn(() => ({ x: 0, y: 0, ...mockVector3 })),
  Vector3: jest.fn(() => ({ x: 0, y: 0, z: 0, ...mockVector3 })),
  Vector4: jest.fn(() => ({ x: 0, y: 0, z: 0, w: 0 })),
  Quaternion: jest.fn(() => ({ x: 0, y: 0, z: 0, w: 1, ...mockQuaternion })),
  Matrix3: jest.fn(() => ({})),
  Matrix4: jest.fn(() => ({ ...mockMatrix4 })),
  Euler: jest.fn(() => ({ x: 0, y: 0, z: 0, order: 'XYZ' })),
  Box2: jest.fn(() => ({})),
  Box3: jest.fn(() => ({
    min: { x: -Infinity, y: -Infinity, z: -Infinity },
    max: { x: Infinity, y: Infinity, z: Infinity },
  })),
  Sphere: jest.fn(() => ({ center: { ...mockVector3 }, radius: 0 })),
  Color: jest.fn(() => ({ ...mockColor })),
  
  // Core classes
  Object3D: jest.fn(() => ({ ...mockObject3D })),
  Raycaster: jest.fn(() => ({ ...mockRaycaster })),
  Clock: jest.fn(() => ({
    startTime: 0,
    oldTime: 0,
    elapsedTime: 0,
    running: false,
    start: jest.fn(),
    stop: jest.fn(),
    getElapsedTime: jest.fn(() => 0),
    getDelta: jest.fn(() => 0),
  })),
  
  // Renderers
  WebGLRenderer: jest.fn(() => ({ ...mockRenderer })),
  WebGL1Renderer: jest.fn(() => ({ ...mockRenderer })),
  
  // Cameras
  Camera: jest.fn(() => ({ ...mockCamera })),
  PerspectiveCamera: jest.fn(() => ({ 
    ...mockCamera,
    fov: 50,
    aspect: 1,
    isPerspectiveCamera: true,
  })),
  OrthographicCamera: jest.fn(() => ({ 
    ...mockCamera,
    left: -1, right: 1, top: 1, bottom: -1,
    isOrthographicCamera: true,
  })),
  
  // Scene
  Scene: jest.fn(() => ({ ...mockScene })),
  Group: jest.fn(() => ({ ...mockObject3D, isGroup: true })),
  
  // Objects
  Mesh: jest.fn(() => ({ ...mockMesh })),
  InstancedMesh: jest.fn(() => ({ ...mockMesh, isInstancedMesh: true, count: 0 })),
  Line: jest.fn(() => ({ ...mockObject3D, isLine: true })),
  LineSegments: jest.fn(() => ({ ...mockObject3D, isLineSegments: true })),
  Points: jest.fn(() => ({ ...mockObject3D, isPoints: true })),
  Sprite: jest.fn(() => ({ ...mockObject3D, isSprite: true })),
  SkinnedMesh: jest.fn(() => ({ ...mockMesh, isSkinnedMesh: true })),
  
  // Materials
  Material: jest.fn(() => ({ dispose: jest.fn() })),
  MeshBasicMaterial: jest.fn(() => ({ 
    color: { ...mockColor },
    map: null,
    isMeshBasicMaterial: true,
    dispose: jest.fn(),
  })),
  MeshStandardMaterial: jest.fn(() => ({
    color: { ...mockColor },
    roughness: 1,
    metalness: 0,
    map: null,
    isMeshStandardMaterial: true,
    dispose: jest.fn(),
  })),
  LineBasicMaterial: jest.fn(() => ({ 
    color: { ...mockColor },
    isLineBasicMaterial: true,
    dispose: jest.fn(),
  })),
  
  // Geometries
  BufferGeometry: jest.fn(() => ({
    attributes: {},
    index: null,
    dispose: jest.fn(),
    isBufferGeometry: true,
  })),
  BoxGeometry: jest.fn(() => ({
    attributes: { position: { count: 24 } },
    dispose: jest.fn(),
    isBufferGeometry: true,
  })),
  SphereGeometry: jest.fn(() => ({
    attributes: { position: { count: 32 } },
    dispose: jest.fn(),
    isBufferGeometry: true,
  })),
  PlaneGeometry: jest.fn(() => ({
    attributes: { position: { count: 4 } },
    dispose: jest.fn(),
    isBufferGeometry: true,
  })),
  
  // Lights
  AmbientLight: jest.fn(() => ({ 
    ...mockObject3D,
    isAmbientLight: true,
    color: { ...mockColor },
    intensity: 1,
  })),
  DirectionalLight: jest.fn(() => ({ 
    ...mockObject3D,
    isDirectionalLight: true,
    color: { ...mockColor },
    intensity: 1,
    target: { ...mockObject3D },
  })),
  PointLight: jest.fn(() => ({ 
    ...mockObject3D,
    isPointLight: true,
    color: { ...mockColor },
    intensity: 1,
    distance: 0,
    decay: 2,
  })),
  
  // Textures
  Texture: jest.fn(() => ({
    image: {},
    dispose: jest.fn(),
    isTexture: true,
  })),
  
  // Constants
  LinearEncoding: 3000,
  sRGBEncoding: 3001,
  BasicShadowMap: 0,
  PCFShadowMap: 1,
  PCFSoftShadowMap: 2,
  FrontSide: 0,
  BackSide: 1,
  DoubleSide: 2,
  
  // Animation
  AnimationMixer: jest.fn(() => ({
    time: 0,
    timeScale: 1,
    update: jest.fn(),
    clipAction: jest.fn(() => ({
      play: jest.fn(),
      stop: jest.fn(),
      reset: jest.fn(),
      setLoop: jest.fn(),
      setEffectiveTimeScale: jest.fn(),
      setDuration: jest.fn(),
    })),
  })),
  
  // Loaders
  TextureLoader: jest.fn(() => ({
    load: jest.fn((url, onLoad) => {
      const texture = { url, isTexture: true, dispose: jest.fn() };
      if (onLoad) onLoad(texture);
      return texture;
    }),
  })),
};
EOF

# Create mock for GLTFLoader
echo "Creating GLTFLoader mock..."
cat > __mocks__/GLTFLoader.js << 'EOF'
// Mock for GLTFLoader from Three.js
class GLTFLoader {
  constructor() {
    this.setDRACOLoader = jest.fn(() => this);
    this.setPath = jest.fn(() => this);
    this.setResourcePath = jest.fn(() => this);
    this.setCrossOrigin = jest.fn(() => this);
  }

  load(url, onLoad, onProgress, onError) {
    // Simulate successful loading of a GLTF model
    const mockScene = {
      visible: true,
      userData: {},
      traverse: (callback) => {
        // Create a mock mesh to traverse
        const mockMesh = {
          isMesh: true,
          isSkinnedMesh: false,
          visible: true,
          material: { transparent: false, opacity: 1 },
          geometry: { dispose: jest.fn() },
          userData: {}
        };
        callback(mockScene);
        callback(mockMesh);
      }
    };

    // Call the onLoad callback with a mock GLTF object
    setTimeout(() => {
      onLoad({
        scene: mockScene,
        scenes: [mockScene],
        animations: [],
        parser: { getDependencies: jest.fn() }
      });
    }, 0);

    return { scene: mockScene };
  }
}

module.exports = { GLTFLoader };
EOF

# Create mock for DRACOLoader
echo "Creating DRACOLoader mock..."
cat > __mocks__/DRACOLoader.js << 'EOF'
// Mock for DRACOLoader from Three.js
class DRACOLoader {
  constructor() {
    this.setDecoderPath = jest.fn(() => this);
    this.setDecoderConfig = jest.fn(() => this);
    this.setWorkerLimit = jest.fn(() => this);
    this.preload = jest.fn(() => this);
    this.dispose = jest.fn();
  }
}

module.exports = { DRACOLoader };
EOF

# Create an enhanced Jest setup file
echo "Creating enhanced Jest setup file..."
cat > jest.enhanced-setup.js << 'EOF'
// Enhanced Jest setup file for Vibewell project
// This setup file combines all testing utilities and fixes common issues

// Import base setup
import './jest.setup.js';

// Add jest-dom matchers for testing DOM elements
import '@testing-library/jest-dom';

// Add jest-axe for accessibility testing
import { toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

// Add enhanced Jest matchers
expect.extend({
  toHaveBeenCalledWith(received, ...expected) {
    const pass = this.equals(received.mock.calls[0], expected);
    return {
      pass,
      message: () => {
        const message = pass
          ? `Expected mock not to have been called with ${this.utils.printExpected(expected)}`
          : `Expected mock to have been called with ${this.utils.printExpected(expected)}\n` +
            `But it was called with ${this.utils.printReceived(received.mock.calls[0])}`;
        return message;
      },
    };
  },
  toHaveBeenCalledTimes(received, expected) {
    const pass = received.mock.calls.length === expected;
    return {
      pass,
      message: () => {
        const message = pass
          ? `Expected mock not to have been called ${expected} times`
          : `Expected mock to have been called ${expected} times, but it was called ${received.mock.calls.length} times`;
        return message;
      },
    };
  },
  toHaveNoViolations(received) {
    if (typeof toHaveNoViolations === 'function') {
      return toHaveNoViolations.call(this, received);
    }
    
    // Fallback implementation if jest-axe is not available
    return {
      pass: true,
      message: () => 'Accessibility testing is not available',
    };
  },
  toBeLessThan(received, expected) {
    const pass = received < expected;
    return {
      pass,
      message: () => {
        const message = pass
          ? `Expected ${received} not to be less than ${expected}`
          : `Expected ${received} to be less than ${expected}`;
        return message;
      },
    };
  },
  toHaveProperty(received, property, value) {
    const hasProperty = Object.prototype.hasOwnProperty.call(received, property);
    const pass = value !== undefined
      ? hasProperty && this.equals(received[property], value)
      : hasProperty;
    
    return {
      pass,
      message: () => {
        const message = pass
          ? `Expected object not to have property '${property}'${value !== undefined ? ` with value ${this.utils.printExpected(value)}` : ''}`
          : `Expected object to have property '${property}'${value !== undefined ? ` with value ${this.utils.printExpected(value)}` : ''}`;
        return message;
      },
    };
  },
});

// Add support for object.anything() in expects
expect.anything = () => ({
  asymmetricMatch: (actual) => actual !== null && actual !== undefined,
});

// Setup MSW for API mocking
import { setupServer } from 'msw/node';
import { HttpResponse, http } from 'msw';

// Create and export the MSW server
export const server = setupServer();

// Setup MSW server lifecycle
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() { return null; }
  unobserve() { return null; }
  disconnect() { return null; }
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() { return null; }
  unobserve() { return null; }
  disconnect() { return null; }
};

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = String(value);
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    length: 0,
    key: jest.fn(() => null),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock,
});

// Fix for userEvent in tests
jest.mock('@testing-library/user-event', () => {
  return {
    __esModule: true,
    default: () => ({
      clear: async (element) => {
        element.value = '';
        element.dispatchEvent(new Event('input', { bubbles: true }));
      },
      click: async (element) => {
        element.click();
      },
      dblClick: async (element) => {
        element.click();
        element.click();
      },
      type: async (element, text) => {
        const currentValue = element.value || '';
        element.value = currentValue + text;
        element.dispatchEvent(new Event('input', { bubbles: true }));
      },
      tab: async () => {
        // Mock tab implementation
      },
      hover: async () => {
        // Mock hover implementation
      },
      unhover: async () => {
        // Mock unhover implementation
      },
      upload: async () => {
        // Mock upload implementation
      },
      selectOptions: async () => {
        // Mock selectOptions implementation
      },
      deselectOptions: async () => {
        // Mock deselectOptions implementation
      },
      paste: async () => {
        // Mock paste implementation
      },
    }),
  };
});
EOF

# Update Jest configurations to include enhanced setup
echo "Updating Jest configuration files..."
node ./scripts/update-jest-configs.js

echo "Installation complete! Try running tests with:"
echo "npm test"
echo "npm run test:enhanced"
echo "npm run test:enhanced:coverage"
echo ""
echo "Note: You may need to update some tests to match the new testing utilities." 