// Polyfill for BroadcastChannel which is needed by MSW but not available in Node.js
class BroadcastChannelPolyfill {
  constructor(channel) {
    this.channel = channel;
    this.listeners = {};
  }

  postMessage(message) {
    // In real implementation, this would broadcast to other instances
    // For test purposes, we just simulate it locally
    if (this.onmessage) {
      const event = { data: message };
      this.onmessage(event);
    }
  }

  addEventListener(type, listener) {
    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }
    this.listeners[type].push(listener);
  }

  removeEventListener(type, listener) {
    if (!this.listeners[type]) return;
    const index = this.listeners[type].indexOf(listener);
    if (index !== -1) this.listeners[type].splice(index, 1);
  }

  close() {
    this.listeners = {};
  }
}

// Add to global
global.BroadcastChannel = BroadcastChannelPolyfill; 