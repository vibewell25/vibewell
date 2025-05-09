const React = require('react');

// Mock Canvas component
const Canvas = ({ children, ...props }) => {
  return React.createElement('div', {
    ...props,
    'data-testid': 'r3f-canvas',
    style: { width: '100%', height: '100%', ...props.style },
    children
  });
};

// Mock hooks
const useThree = jest.fn().mockReturnValue({
  gl: { 
    domElement: {},
    setClearColor: jest.fn(),
    setPixelRatio: jest.fn(),
    setSize: jest.fn(),
    render: jest.fn()
  },
  scene: {
    background: null,
    fog: null,
    children: [],
    add: jest.fn(),
    remove: jest.fn(),
    traverse: jest.fn()
  },
  camera: {
    position: { set: jest.fn(), copy: jest.fn(), x: 0, y: 0, z: 5 },
    lookAt: jest.fn(),
    updateProjectionMatrix: jest.fn(),
    near: 0.1,
    far: 1000
  },
  raycaster: {
    setFromCamera: jest.fn(),
    intersectObjects: jest.fn().mockReturnValue([])
  },
  size: { width: 1280, height: 720 },
  viewport: { width: 1280, height: 720, factor: 1 },
  clock: { getElapsedTime: jest.fn(() => 0), getDelta: jest.fn(() => 0.016) },
  get: jest.fn(),
  invalidate: jest.fn(),
  advance: jest.fn(),
  setSize: jest.fn(),
  setDpr: jest.fn(),
  setFrameloop: jest.fn(),
  onPointerMissed: jest.fn()
});

const useFrame = jest.fn();
const useLoader = jest.fn().mockReturnValue({});
const useGraph = jest.fn().mockReturnValue({});

// Creation hooks
const createPortal = jest.fn((children, scene) => children);
const createRoot = jest.fn(() => ({ 
  configure: jest.fn(), 
  render: jest.fn(), 
  unmount: jest.fn() 
}));

// Additional hooks
const useUpdate = jest.fn((fn, deps, object) => {
  React.useEffect(fn, deps);
});

const events = {
  connect: jest.fn(),
  disconnect: jest.fn(),
  linked: new Set(),
  handlers: {},
  onPointerDown: jest.fn(),
  onPointerUp: jest.fn(),
  onPointerMove: jest.fn()
};

// Export all mocked components and hooks
module.exports = {
  // Components
  Canvas,
  
  // Hooks
  useThree,
  useFrame,
  useLoader,
  useGraph,
  useUpdate,
  
  // Creation functions
  createPortal,
  createRoot,
  
  // Additional exports
  events,
  act: fn => fn(),
  render: jest.fn(),
  extend: jest.fn(),
  
  // Re-export as default for compatibility
  __esModule: true
};
