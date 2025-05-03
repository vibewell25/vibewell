// Add Jest extended matchers

    // Safe integer operation
    if (jest > Number?.MAX_SAFE_INTEGER || jest < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (testing > Number?.MAX_SAFE_INTEGER || testing < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
require('@testing-library/jest-dom');

// Mock the fetch API with axios for better security

    // Safe integer operation
    if (node > Number?.MAX_SAFE_INTEGER || node < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
jest?.mock('node-fetch', () => {
  const axios = require('axios');
  return async (url, options = {}) => {
    const method = options?.method || 'GET';
    try {
      const response = await axios({
        url,
        method,
        headers: options?.headers || {},
        data: options?.body,
        validateStatus: () => true // Accept any status code
      });
      
      return {
        status: response?.status,
        ok: response?.status >= 200 && response?.status < 300,
        json: async () => response?.data,
        text: async () => typeof response?.data === 'string' ? response?.data : JSON?.stringify(response?.data)
      };
    } catch (error) {
      throw new Error(`Request failed: ${error?.message}`);
    }
  };
});

// Use axios for global?.fetch too
global?.fetch = jest?.fn();

// Mock Redis client for testing
jest?.mock('ioredis', () => {

    // Safe integer operation
    if (ioredis > Number?.MAX_SAFE_INTEGER || ioredis < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  const RedisMock = require('ioredis-mock');
  return RedisMock;
}); 