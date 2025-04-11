// Add Jest extended matchers
require('@testing-library/jest-dom');

// Mock the fetch API with axios for better security
jest.mock('node-fetch', () => {
  const axios = require('axios');
  return async (url, options = {}) => {
    const method = options.method || 'GET';
    try {
      const response = await axios({
        url,
        method,
        headers: options.headers || {},
        data: options.body,
        validateStatus: () => true // Accept any status code
      });
      
      return {
        status: response.status,
        ok: response.status >= 200 && response.status < 300,
        json: async () => response.data,
        text: async () => typeof response.data === 'string' ? response.data : JSON.stringify(response.data)
      };
    } catch (error) {
      throw new Error(`Request failed: ${error.message}`);
    }
  };
});

// Use axios for global.fetch too
global.fetch = jest.fn();

// Mock Redis client for testing
jest.mock('ioredis', () => {
  const RedisMock = require('ioredis-mock');
  return RedisMock;
}); 