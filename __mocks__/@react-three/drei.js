/**
 * Mock for @react-three/drei package
 * Contains mocks for drei components and hooks
 */

const React = require('react');

// Mock for common drei components
const OrbitControls = jest.fn(({ children, ...props }) => {
  return React.createElement('div', {
    'data-testid': 'drei-orbit-controls',
    ...props,
    children
  });
});

const TransformControls = jest.fn(({ children, ...props }) => {
  return React.createElement('div', {
    'data-testid': 'drei-transform-controls',
    ...props,
    children
  });
});

const PresentationControls = jest.fn(({ children, ...props }) => {
  return React.createElement('div', {
    'data-testid': 'drei-presentation-controls',
    ...props,
    children
  });
});

const Environment = jest.fn(({ children, ...props }) => {
  // If there is a preset or path prop, trigger environment map loading simulation
  if (props.preset || props.files || props.path) {
    // Call any onLoad callback provided
    if (props.onLoad) {
      setTimeout(() => {
        const mockEnvMap = {
          isTexture: true,
          encoding: 3001, // sRGBEncoding
          mapping: 301,   // CubeReflectionMapping
          dispose: jest.fn()
        };
        props.onLoad(mockEnvMap);
      }, 0);
    }
  }
  
  return React.createElement('div', {
    'data-testid': 'drei-environment',
    ...props,
    children
  });
});

const Sky = jest.fn(({ children, ...props }) => {
  return React.createElement('div', {
    'data-testid': 'drei-sky',
    ...props,
    children
  });
});

const ContactShadows = jest.fn(({ children, ...props }) => {
  return React.createElement('div', {
    'data-testid': 'drei-contact-shadows',
    ...props,
    children
  });
});

const Text = jest.fn(({ children, ...props }) => {
  return React.createElement('div', {
    'data-testid': 'drei-text',
    ...props,
    children
  });
});

// Mock hooks
const useGLTF = jest.fn().mockReturnValue({
  nodes: {
    defaultMesh: {
      geometry: { attributes: { position: { array: new Float32Array([0, 0, 0]) } } },
      material: {}
    }
  },
  materials: { defaultMaterial: {} },
  scene: {
    clone: () => ({
      traverse: jest.fn(),
      scale: { set: jest.fn() },
      position: { set: jest.fn() },
      rotation: { set: jest.fn() }
    })
  }
});

const useTexture = jest.fn((pathOrPaths) => {
  // Create mock texture object with appropriate properties
  const createMockTexture = (path) => ({
    isTexture: true,
    uuid: `mock-texture-${Math.random().toString(36).substr(2, 9)}`,
    name: path ? path.split('/').pop() : 'mock-texture',
    source: { data: {} },
    mapping: 300, // UVMapping
    wrapS: 1001, // ClampToEdgeWrapping
    wrapT: 1001, // ClampToEdgeWrapping
    magFilter: 1006, // LinearFilter
    minFilter: 1008, // LinearMipmapLinearFilter
    anisotropy: 1,
    format: 1023, // RGBAFormat
    type: 1009, // UnsignedByteType
    offset: { x: 0, y: 0 },
    repeat: { x: 1, y: 1 },
    generateMipmaps: true,
    flipY: true,
    needsUpdate: true,
    dispose: jest.fn()
  });
  
  // Handle both single path and array of paths
  if (Array.isArray(pathOrPaths)) {
    return pathOrPaths.map(createMockTexture);
  }
  
  return createMockTexture(pathOrPaths);
});

const useVideoTexture = jest.fn().mockReturnValue({});
const useMatcapTexture = jest.fn().mockReturnValue([{}, 'loaded']);
const useAnimations = jest.fn().mockReturnValue({
  actions: {},
  names: [],
  clips: []
});

// Mock for helper functions
const Html = jest.fn(({ children, ...props }) => {
  return React.createElement('div', {
    'data-testid': 'drei-html',
    ...props,
    children
  });
});

const Edges = jest.fn(({ children, ...props }) => {
  return React.createElement('div', {
    'data-testid': 'drei-edges',
    ...props,
    children
  });
});

const Center = jest.fn(({ children, ...props }) => {
  return React.createElement('div', {
    'data-testid': 'drei-center',
    ...props,
    children
  });
});

// Export all mock components and hooks
module.exports = {
  // Components
  OrbitControls,
  TransformControls,
  PresentationControls,
  Environment,
  Sky,
  ContactShadows,
  Text,
  Html,
  Edges,
  Center,

  // Hooks
  useGLTF,
  useTexture,
  useVideoTexture,
  useMatcapTexture,
  useAnimations,

  // Helper functions
  draco: jest.fn(),
  softShadows: jest.fn(),
  meshBounds: jest.fn(),
  meshStandardMaterial: jest.fn(),
  shaderMaterial: jest.fn(),
  
  // Re-export as default for compatibility
  __esModule: true,
}; 