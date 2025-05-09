module.exports = {
  MetricsClient: class {
    constructor() {}
    
    // Mock required methods
    startSpan(name, options) {
      return {
        name,
        options,
        end: jest.fn(),
        updateName: jest.fn(),
        setAttribute: jest.fn(),
        setAttributes: jest.fn(),
        addEvent: jest.fn(),
        recordException: jest.fn(),
        setStatus: jest.fn(),
        isRecording: jest.fn(() => true)
      };
    }
    
    counter(name, options) {
      return {
        add: jest.fn(),
        inc: jest.fn()
      };
    }
    
    gauge(name, options) {
      return {
        set: jest.fn()
      };
    }
    
    histogram(name, options) {
      return {
        record: jest.fn()
      };
    }
    
    shutdown() {
      return Promise.resolve();
    }
  }
};
