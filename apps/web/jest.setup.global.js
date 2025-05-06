// Polyfill for BroadcastChannel needed by MSW
global.BroadcastChannel = class BroadcastChannel {
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
}; 