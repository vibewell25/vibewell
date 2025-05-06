

import '@testing-library/jest-dom';

import { mockAuth0, mockUseUser } from './helpers/auth0-mock';

// Mock Auth0

jest.mock('@auth0/nextjs-auth0', () => ({

  ...jest.requireActual('@auth0/nextjs-auth0'),
  getSession: () => mockAuth0.getSession(),
  withApiAuthRequired: (handler: any) => mockAuth0.withApiAuthRequired(handler),
  withPageAuthRequired: (handler: any) => mockAuth0.withPageAuthRequired(handler),
}));



jest.mock('@auth0/nextjs-auth0/client', () => ({
  useUser: () => mockUseUser(),
}));

// Mock window.fetch
global.fetch = jest.fn();

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
class MockIntersectionObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: MockIntersectionObserver,
});

// Mock ResizeObserver
class MockResizeObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: MockResizeObserver,
});

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
