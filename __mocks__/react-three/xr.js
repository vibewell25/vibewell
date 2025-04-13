/**
 * Mock for @react-three/xr package
 * Contains mocks for XR components and hooks
 */

const React = require('react');

// Mock XR Button
const XRButton = ({ children, ...props }) => {
  return React.createElement('button', {
    onClick: props.onClick || (() => {}),
    ...props,
    'data-testid': 'xr-button',
    children: children || 'Enter AR'
  });
};

// Mock XR component
const XR = ({ children, ...props }) => {
  return React.createElement('div', {
    ...props,
    'data-testid': 'xr-container',
    children
  });
};

// Mock XR hooks
const useXR = jest.fn().mockReturnValue({
  isPresenting: false,
  player: { 
    position: { set: jest.fn(), x: 0, y: 0, z: 0 },
    rotation: { set: jest.fn(), x: 0, y: 0, z: 0 }
  },
  session: null,
  isAvailable: true,
  enter: jest.fn(),
  exit: jest.fn()
});

const useController = jest.fn().mockReturnValue({
  grip: {
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 }
  },
  ray: {
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 }
  },
  buttons: {
    trigger: { pressed: false, touched: false, value: 0 },
    grip: { pressed: false, touched: false, value: 0 },
    pad: { pressed: false, touched: false, value: 0, x: 0, y: 0 },
    thumbstick: { pressed: false, touched: false, value: 0, x: 0, y: 0 }
  },
  hand: null,
  hapticActuators: [{ pulse: jest.fn() }],
  handedness: 'right',
  profiles: ['generic-trigger-squeeze-touchpad-thumbstick'],
  laserPointer: {
    visible: true,
    setVisible: jest.fn(),
    active: false,
    setActive: jest.fn()
  }
});

const useHitTest = jest.fn().mockReturnValue({
  hits: [],
  isHitting: false
});

// Create store creator
const createXRStore = jest.fn(() => ({
  getState: jest.fn(() => ({
    isPresenting: false,
    player: { position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 } },
    session: null,
    controllers: []
  })),
  setState: jest.fn(),
  subscribe: jest.fn(),
  getSubscribers: jest.fn(() => [])
}));

// Mock interactive components
const Hands = React.forwardRef((props, ref) => {
  return React.createElement('group', {
    ref: ref,
    ...props,
    'data-testid': 'xr-hands'
  });
});

const Controllers = React.forwardRef((props, ref) => {
  return React.createElement('group', {
    ref: ref,
    ...props,
    'data-testid': 'xr-controllers'
  });
});

const RayGrab = React.forwardRef(({ children, ...props }, ref) => {
  return React.createElement('group', {
    ref: ref,
    ...props,
    'data-testid': 'xr-ray-grab'
  }, children);
});

// Export all mocked components and hooks
module.exports = {
  // Components
  XRButton,
  XR,
  Hands,
  Controllers,
  RayGrab,
  
  // Hooks
  useXR,
  useController,
  useHitTest,
  
  // Store
  createXRStore,
  
  // Additional exports
  Interactive: React.forwardRef(({ children, ...props }, ref) => 
    React.createElement('group', { ref, ...props, 'data-testid': 'xr-interactive' }, children)
  ),
  
  // Interactions
  useInteraction: jest.fn(),
  
  // Re-export as default for compatibility
  __esModule: true,
};