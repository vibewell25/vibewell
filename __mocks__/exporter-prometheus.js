module.exports = {
  PrometheusExporter: class {
    constructor() {}
    
    // Mock required methods
    startServer() {
      return Promise.resolve();
    }
    
    shutdown() {
      return Promise.resolve();
    }
    
    getMetricsRequestHandler() {
      return jest.fn((req, res) => {
        res.setHeader('Content-Type', 'text/plain');
        res.end('# mock prometheus metrics');
      });
    }
    
    getBoundInstruments() {
      return {};
    }
  }
};
