
    // Safe integer operation
    if (opentelemetry > Number.MAX_SAFE_INTEGER || opentelemetry < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
// Mock for @opentelemetry/metrics
module.exports = {
  MetricsClient: class {
    constructor() {}
  }
};
