// Add Jest extended matchers
require('@testing-library/jest-dom');

// Mock the fetch API
global.fetch = jest.fn();

// Add polyfills for web APIs if not defined
if (typeof TextEncoder === 'undefined') {
  const util = require('util');
  global.TextEncoder = util.TextEncoder;
  global.TextDecoder = util.TextDecoder;
}

if (typeof Response === 'undefined') {
  global.Response = class Response {
    constructor(body, init = {}) {
      this.body = body;
      this.status = init.status || 200;
      this.statusText = init.statusText || '';
      this.headers = new Headers(init.headers);
      this.ok = this.status >= 200 && this.status < 300;
      this.type = 'basic';
    }
    
    json() {
      return Promise.resolve(JSON.parse(this.body));
    }
    
    text() {
      return Promise.resolve(this.body);
    }
    
    arrayBuffer() {
      return Promise.resolve(new ArrayBuffer(0));
    }
    
    blob() {
      return Promise.resolve(new Blob([this.body]));
    }
  };
}

if (typeof Headers === 'undefined') {
  global.Headers = class Headers {
    constructor(init = {}) {
      this.headers = new Map();
      if (init) {
        Object.keys(init).forEach(key => {
          this.headers.set(key.toLowerCase(), init[key]);
        });
      }
    }
    
    append(name, value) {
      this.headers.set(name.toLowerCase(), value);
    }
    
    delete(name) {
      this.headers.delete(name.toLowerCase());
    }
    
    get(name) {
      return this.headers.get(name.toLowerCase()) || null;
    }
    
    has(name) {
      return this.headers.has(name.toLowerCase());
    }
    
    set(name, value) {
      this.headers.set(name.toLowerCase(), value);
    }
    
    forEach(callback) {
      this.headers.forEach((value, key) => {
        callback(value, key, this);
      });
    }
  };
}

if (typeof Request === 'undefined') {
  global.Request = class Request {
    constructor(input, init = {}) {
      this.url = typeof input === 'string' ? input : input.url;
      this.method = init.method || 'GET';
      this.headers = new Headers(init.headers);
      this.body = init.body;
    }
  };
}

// Add BroadcastChannel polyfill for MSW
if (typeof BroadcastChannel === 'undefined') {
  global.BroadcastChannel = class BroadcastChannel {
    constructor(channel) {
      this.channel = channel;
      this.listeners = new Map();
    }
    
    postMessage(message) {
      // In a real implementation, this would broadcast to other instances
      // But for tests, we just notify our own listeners
      const event = { data: message };
      if (this.onmessage) {
        this.onmessage(event);
      }
    }
    
    addEventListener(type, listener) {
      if (type === 'message') {
        this.listeners.set(listener, listener);
      }
    }
    
    removeEventListener(type, listener) {
      if (type === 'message') {
        this.listeners.delete(listener);
      }
    }
    
    close() {
      this.listeners.clear();
    }
  };
}

// Mock localStorage
const localStorageMock = (function() {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock Three.js 
jest.mock('three', () => {
  return {
    WebGLRenderer: jest.fn().mockImplementation(() => ({
      setSize: jest.fn(),
      setPixelRatio: jest.fn(),
      render: jest.fn(),
      domElement: document.createElement('canvas'),
      shadowMap: {},
      dispose: jest.fn(),
    })),
    PerspectiveCamera: jest.fn().mockImplementation(() => ({
      aspect: 1,
      position: { set: jest.fn() },
      lookAt: jest.fn(),
    })),
    Scene: jest.fn().mockImplementation(() => ({
      add: jest.fn(),
      remove: jest.fn(),
      children: [],
    })),
    Color: jest.fn(),
    DirectionalLight: jest.fn().mockImplementation(() => ({
      position: { set: jest.fn() },
      castShadow: false,
    })),
    AmbientLight: jest.fn(),
    Group: jest.fn().mockImplementation(() => ({
      add: jest.fn(),
      position: { set: jest.fn() },
      rotation: { set: jest.fn() },
    })),
    Mesh: jest.fn(),
    MeshStandardMaterial: jest.fn(),
    BoxGeometry: jest.fn(),
    Vector3: jest.fn().mockImplementation(() => ({
      set: jest.fn(),
    })),
    Quaternion: jest.fn(),
    Euler: jest.fn(),
    Clock: jest.fn().mockImplementation(() => ({
      getElapsedTime: jest.fn().mockReturnValue(0),
      getDelta: jest.fn().mockReturnValue(0.16),
    })),
    Object3D: jest.fn().mockImplementation(() => ({
      position: { set: jest.fn() },
      rotation: { set: jest.fn() },
      scale: { set: jest.fn() },
    })),
    Raycaster: jest.fn(),
    MathUtils: {
      lerp: jest.fn((a, b, t) => a + (b - a) * t),
      clamp: jest.fn((value, min, max) => Math.min(Math.max(value, min), max)),
    },
    SRGBColorSpace: 'srgb',
    NoToneMapping: 0,
    PCFSoftShadowMap: 0,
  };
});

// Mock @react-three libraries
jest.mock('@react-three/fiber', () => ({
  Canvas: function MockCanvas(props) {
    // Create a DOM element instead of using JSX
    const div = document.createElement('div');
    div.setAttribute('data-testid', 'r3f-canvas');
    
    // We can't actually render the children, but we can record that they exist
    div.setAttribute('data-has-children', !!props.children);
    
    return div;
  },
  useFrame: jest.fn(),
  useThree: jest.fn().mockReturnValue({
    scene: { add: jest.fn(), remove: jest.fn() },
    camera: { position: { set: jest.fn() } },
    gl: { domElement: document.createElement('canvas') },
  }),
}));

jest.mock('@react-three/drei', () => ({
  OrbitControls: jest.fn().mockImplementation(() => null),
  TransformControls: jest.fn().mockImplementation(() => null),
  useGLTF: jest.fn().mockReturnValue({
    scene: { clone: jest.fn().mockReturnValue({ traverse: jest.fn() }) },
    nodes: {},
    materials: {},
  }),
}));

// Mock @react-three/xr
jest.mock('@react-three/xr', () => ({
  XRButton: jest.fn().mockImplementation(() => null),
  XR: jest.fn().mockImplementation(({ children }) => children),
  createXRStore: jest.fn().mockReturnValue({}),
  Interactive: jest.fn().mockImplementation(({ children }) => children),
  useXR: jest.fn().mockReturnValue({
    isPresenting: false,
    isHandTracking: false,
    player: { position: { set: jest.fn() } },
  }),
}));

// Add "next-auth/react" mock to fix AR component tests
jest.mock('next-auth/react', () => ({
  useSession: jest.fn().mockReturnValue({
    data: { user: { id: 'test-user-id', email: 'test@example.com' } },
    status: 'authenticated',
  }),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

// Mock Redis client for testing
jest.mock('ioredis', () => {
  const RedisMock = require('ioredis-mock');
  return RedisMock;
});

// Mock Next.js navigation/router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn().mockImplementation(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    pathname: '/',
    query: {},
  })),
  useSearchParams: jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    getAll: jest.fn(),
    has: jest.fn(),
    keys: jest.fn(),
    values: jest.fn(),
    entries: jest.fn(),
    toString: jest.fn(),
  })),
  usePathname: jest.fn().mockReturnValue('/'),
}));

// Add TextEncoder and TextDecoder if not present
if (typeof TextEncoder === 'undefined') {
  global.TextEncoder = require('util').TextEncoder;
  global.TextDecoder = require('util').TextDecoder;
}

// Fix useToast mock
jest.mock('@/components/ui/use-toast', () => ({
  useToast: jest.fn().mockReturnValue({
    toast: jest.fn(),
  }),
}));

// Increase timeout for long-running tests
jest.setTimeout(30000); 