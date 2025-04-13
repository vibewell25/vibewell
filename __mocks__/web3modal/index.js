/**
 * Mock implementation of Web3Modal
 * Used in Jest tests to avoid actual Web3Modal dependency
 */

class Web3Modal {
  constructor(options) {
    this.options = options || {};
    this.cachedProvider = null;
    
    // Mock methods
    this.connect = jest.fn().mockImplementation(() => {
      return Promise.resolve({
        on: jest.fn(),
        off: jest.fn(),
        enable: jest.fn().mockResolvedValue(['0x123456789abcdef']),
        request: jest.fn().mockImplementation(({ method }) => {
          if (method === 'eth_accounts') {
            return Promise.resolve(['0x123456789abcdef']);
          }
          if (method === 'eth_chainId') {
            return Promise.resolve('0x1');
          }
          return Promise.resolve(null);
        }),
        selectedAddress: '0x123456789abcdef',
        networkVersion: '1',
        isConnected: jest.fn().mockReturnValue(true),
      });
    });
    
    this.connectTo = jest.fn().mockImplementation(() => {
      return this.connect();
    });
    
    this.toggleModal = jest.fn();
    this.clearCachedProvider = jest.fn().mockImplementation(() => {
      this.cachedProvider = null;
    });
    
    this.setCachedProvider = jest.fn().mockImplementation((provider) => {
      this.cachedProvider = provider;
    });
    
    this.getUserOptions = jest.fn().mockReturnValue([]);
    this.getProviderInfo = jest.fn().mockReturnValue({
      name: 'Mock Provider',
      type: 'web',
      logo: 'mock-logo.svg',
    });
    
    // Emulate EventEmitter
    this._events = {};
    this.on = jest.fn().mockImplementation((event, callback) => {
      if (!this._events[event]) this._events[event] = [];
      this._events[event].push(callback);
      return this;
    });
    
    this.off = jest.fn().mockImplementation((event, callback) => {
      if (!this._events[event]) return this;
      if (callback) {
        this._events[event] = this._events[event].filter(cb => cb !== callback);
      } else {
        delete this._events[event];
      }
      return this;
    });
    
    this.emit = jest.fn().mockImplementation((event, ...args) => {
      if (!this._events[event]) return false;
      this._events[event].forEach(cb => cb(...args));
      return true;
    });
  }
}

// Default export
module.exports = Web3Modal; 