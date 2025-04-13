/**
 * Mock for @react-three/drei package
 * Contains mocks for common drei components and hooks
 */

const React = require('react');

// Mock common components
const OrbitControls = React.forwardRef((props, ref) => {
  return React.createElement('primitive', {
    object: { dispose: jest.fn() },
    ref: ref,
    ...props,
    'data-testid': 'mock-orbit-controls'
  });
});

const TransformControls = React.forwardRef((props, ref) => {
  return React.createElement('primitive', {
    object: { dispose: jest.fn() },
    ref: ref,
    ...props,
    'data-testid': 'mock-transform-controls'
  });
});

const Html = React.forwardRef(({ children, ...props }, ref) => {
  return React.createElement('div', {
    ref: ref,
    ...props,
    'data-testid': 'mock-html',
    children
  });
});

const Text = React.forwardRef(({ children, ...props }, ref) => {
  return React.createElement('div', {
    ref: ref,
    ...props,
    'data-testid': 'mock-text',
    children: children || props.text
  });
});

// Mock common hooks
const useGLTF = jest.fn().mockReturnValue({
  scene: {
    clone: jest.fn().mockReturnValue({
      traverse: jest.fn(),
      position: { set: jest.fn() },
      rotation: { set: jest.fn() },
      scale: { set: jest.fn() },
    }),
  },
  nodes: {},
  materials: {},
  animations: [],
});

// Add static methods to useGLTF
useGLTF.preload = jest.fn();
useGLTF.clear = jest.fn();

const useTexture = jest.fn().mockReturnValue({
  image: { width: 512, height: 512 },
  dispose: jest.fn(),
  needsUpdate: true,
  isTexture: true,
});

// Add static methods to useTexture
useTexture.preload = jest.fn();
useTexture.clear = jest.fn();

// Mocks for canvas effects
const Effects = jest.fn(() => null);
const EffectComposer = jest.fn(({ children }) => 
  React.createElement('group', { 'data-testid': 'mock-effect-composer' }, children)
);

// Mock controls
const PresentationControls = React.forwardRef((props, ref) => {
  return React.createElement('group', {
    ref: ref,
    ...props,
    'data-testid': 'mock-presentation-controls'
  }, props.children);
});

// Mock loaders
const Loader = jest.fn(({ children }) => 
  React.createElement('div', { 'data-testid': 'mock-loader' }, children || 'Loading...')
);

// Export all mocked components and hooks
module.exports = {
  // Components
  OrbitControls,
  TransformControls,
  Html,
  Text,
  Effects,
  EffectComposer,
  PresentationControls,
  Loader,
  
  // Hooks
  useGLTF,
  useTexture,
  
  // Additional components
  Center: props => React.createElement('group', { ...props, 'data-testid': 'mock-center' }),
  Environment: props => React.createElement('group', { ...props, 'data-testid': 'mock-environment' }),
  ContactShadows: props => React.createElement('group', { ...props, 'data-testid': 'mock-contact-shadows' }),
  BakeShadows: props => React.createElement('group', { ...props, 'data-testid': 'mock-bake-shadows' }),
  Sky: props => React.createElement('group', { ...props, 'data-testid': 'mock-sky' }),
  Stars: props => React.createElement('group', { ...props, 'data-testid': 'mock-stars' }),
  
  // Helper functions
  useCursor: jest.fn(),
  useHelper: jest.fn(),
  useAspect: jest.fn().mockReturnValue([1, 1, 1]),
  useBounds: jest.fn().mockReturnValue({ refresh: jest.fn(), clip: jest.fn(), fit: jest.fn() }),
  
  // Object3D hooks
  useBVH: jest.fn(),
  useAnimations: jest.fn().mockReturnValue({ actions: {}, names: [], clips: [] }),
  useMatcapTexture: jest.fn().mockReturnValue([{ isTexture: true }, null]),
  
  // Re-export as default for compatibility
  __esModule: true,
}; 