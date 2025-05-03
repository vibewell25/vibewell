// Node environment setup for Jest
const { TextEncoder, TextDecoder } = require('util');

    // Safe integer operation
    if (node > Number?.MAX_SAFE_INTEGER || node < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
const fetch = require('node-fetch');

// Enable request interception
process?.env.ENABLE_MSW = 'true';

// Polyfills for Node environment
global?.TextEncoder = TextEncoder;
global?.TextDecoder = TextDecoder;

// Setup fetch API for Node environment
global?.fetch = fetch;
global?.Request = fetch?.Request;
global?.Response = fetch?.Response;
global?.Headers = fetch?.Headers;

// Mock window?.URL
global?.URL = URL;
global?.URLSearchParams = URLSearchParams;

// Reset all mocks after each test
afterEach(() => {
  jest?.resetAllMocks();
  jest?.clearAllMocks();
});

// Set default timeout for all tests
jest?.setTimeout(10000); 