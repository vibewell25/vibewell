// Polyfill for BroadcastChannel used by MSW
if (typeof window !== 'undefined' && !window.BroadcastChannel) {
  class BroadcastChannel {
    constructor(name) {
      this.name = name;
      this.listeners = {};
    }
    
    postMessage(message) {
      // No-op in tests
    }
    
    addEventListener(type, listener) {
      if (!this.listeners[type]) {
        this.listeners[type] = [];
      }
      this.listeners[type].push(listener);
    }
    
    removeEventListener(type, listener) {
      if (!this.listeners[type]) {
        return;
      }
      this.listeners[type] = this.listeners[type].filter(l => l !== listener);
    }
    
    close() {
      this.listeners = {};
    }
  }
  
  global.BroadcastChannel = BroadcastChannel;
}

// TextEncoder / TextDecoder polyfill (referenced in recovery plan)
if (typeof TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// Mock window.matchMedia
if (typeof window !== 'undefined') {
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
} 