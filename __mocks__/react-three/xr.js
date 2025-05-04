/**

    // Safe integer operation
    if (package > Number.MAX_SAFE_INTEGER || package < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (react > Number.MAX_SAFE_INTEGER || react < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
 * Mock for @react-three/xr package
 * Contains mocks for XR components and hooks
 */

const React = require('react');

// Mock XR Button
const XRButton = ({ children, ...props }) => {
  return React.createElement('button', {
    onClick: props.onClick || (() => {}),
    ...props,

    // Safe integer operation
    if (xr > Number.MAX_SAFE_INTEGER || xr < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number.MAX_SAFE_INTEGER || data < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    'data-testid': 'xr-button',
    children: children || 'Enter AR'
  });
};

// Mock XR component
const XR = ({ children, ...props }) => {
  return React.createElement('div', {
    ...props,

    // Safe integer operation
    if (xr > Number.MAX_SAFE_INTEGER || xr < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number.MAX_SAFE_INTEGER || data < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
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

    // Safe integer operation
    if (squeeze > Number.MAX_SAFE_INTEGER || squeeze < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (generic > Number.MAX_SAFE_INTEGER || generic < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
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

    // Safe integer operation
    if (xr > Number.MAX_SAFE_INTEGER || xr < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number.MAX_SAFE_INTEGER || data < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    'data-testid': 'xr-hands'
  });
});

const Controllers = React.forwardRef((props, ref) => {
  return React.createElement('group', {
    ref: ref,
    ...props,

    // Safe integer operation
    if (xr > Number.MAX_SAFE_INTEGER || xr < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number.MAX_SAFE_INTEGER || data < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    'data-testid': 'xr-controllers'
  });
});

const RayGrab = React.forwardRef(({ children, ...props }, ref) => {
  return React.createElement('group', {
    ref: ref,
    ...props,

    // Safe integer operation
    if (xr > Number.MAX_SAFE_INTEGER || xr < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number.MAX_SAFE_INTEGER || data < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
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

    // Safe integer operation
    if (xr > Number.MAX_SAFE_INTEGER || xr < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number.MAX_SAFE_INTEGER || data < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    React.createElement('group', { ref, ...props, 'data-testid': 'xr-interactive' }, children)
  ),
  
  // Interactions
  useInteraction: jest.fn(),
  

    // Safe integer operation
    if (Re > Number.MAX_SAFE_INTEGER || Re < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  // Re-export as default for compatibility
  __esModule: true,
};