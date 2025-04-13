/**
 * API testing utilities
 * 
 * This file provides utilities for testing API endpoints, services, and requests.
 */
import { jest } from '@jest/globals';
import { mockApiResponse } from './mock-utils';

/**
 * Mock for the api-client used in services
 * @param {Object} responses - Map of endpoint paths to mock responses
 * @returns {Object} - Mock api client
 */
export function createMockApiClient(responses = {}) {
  return {
    get: jest.fn((path) => {
      if (responses[path]) {
        return Promise.resolve(responses[path]);
      }
      return Promise.resolve(mockApiResponse({ message: 'Mock GET response' }));
    }),
    
    post: jest.fn((path, data) => {
      if (responses[path]) {
        return Promise.resolve(
          typeof responses[path] === 'function' 
            ? responses[path](data) 
            : responses[path]
        );
      }
      return Promise.resolve(mockApiResponse({ message: 'Mock POST response', data }));
    }),
    
    put: jest.fn((path, data) => {
      if (responses[path]) {
        return Promise.resolve(
          typeof responses[path] === 'function' 
            ? responses[path](data) 
            : responses[path]
        );
      }
      return Promise.resolve(mockApiResponse({ message: 'Mock PUT response', data }));
    }),
    
    patch: jest.fn((path, data) => {
      if (responses[path]) {
        return Promise.resolve(
          typeof responses[path] === 'function' 
            ? responses[path](data) 
            : responses[path]
        );
      }
      return Promise.resolve(mockApiResponse({ message: 'Mock PATCH response', data }));
    }),
    
    delete: jest.fn((path) => {
      if (responses[path]) {
        return Promise.resolve(responses[path]);
      }
      return Promise.resolve(mockApiResponse({ message: 'Mock DELETE response' }));
    }),
    
    request: jest.fn((config) => {
      const { url, method = 'GET', data } = config;
      if (responses[url]) {
        return Promise.resolve(
          typeof responses[url] === 'function' 
            ? responses[url](data, method) 
            : responses[url]
        );
      }
      return Promise.resolve(mockApiResponse({ message: `Mock ${method} response`, data }));
    }),
  };
}

/**
 * Create a mock HTTP response object for testing Next.js API handlers
 * @returns {Object} - Mock response object
 */
export function createMockResponse() {
  const res = {
    statusCode: 200,
    statusMessage: 'OK',
    headersSent: false,
    headers: {},
    cookies: {},
    finished: false,
    _sent: false,
    
    status: jest.fn(function(statusCode) {
      this.statusCode = statusCode;
      return this;
    }),
    
    json: jest.fn(function(data) {
      this._sent = true;
      this.data = data;
      return this;
    }),
    
    send: jest.fn(function(data) {
      this._sent = true;
      this.data = data;
      return this;
    }),
    
    setHeader: jest.fn(function(name, value) {
      this.headers[name.toLowerCase()] = value;
      return this;
    }),
    
    getHeader: jest.fn(function(name) {
      return this.headers[name.toLowerCase()];
    }),
    
    removeHeader: jest.fn(function(name) {
      delete this.headers[name.toLowerCase()];
      return this;
    }),
    
    setCookie: jest.fn(function(name, value, options) {
      this.cookies[name] = { value, options };
      return this;
    }),
    
    clearCookie: jest.fn(function(name) {
      delete this.cookies[name];
      return this;
    }),
    
    redirect: jest.fn(function(url) {
      this._sent = true;
      this.redirectUrl = url;
      return this;
    }),
    
    end: jest.fn(function(data) {
      this._sent = true;
      if (data) this.data = data;
      return this;
    }),
  };
  
  return res;
}

/**
 * Create a mock HTTP request object for testing Next.js API handlers
 * @param {Object} options - Request options
 * @returns {Object} - Mock request object
 */
export function createMockRequest(options = {}) {
  const {
    method = 'GET',
    url = '/api/mock',
    headers = {},
    cookies = {},
    query = {},
    params = {},
    body = null,
    session = null,
  } = options;
  
  return {
    method,
    url,
    headers: {
      'host': 'localhost:3000',
      'content-type': 'application/json',
      ...headers,
    },
    cookies,
    query,
    params,
    body,
    session,
  };
}

/**
 * Create mock Next.js API request and response objects
 * @param {Object} reqOptions - Request options
 * @returns {Object} - Mock req and res objects
 */
export function createMockReqRes(reqOptions = {}) {
  return {
    req: createMockRequest(reqOptions),
    res: createMockResponse(),
  };
}

/**
 * Test a Next.js API handler
 * @param {Function} handler - API route handler
 * @param {Object} reqOptions - Request options
 * @returns {Promise<Object>} - Response from the handler
 */
export async function testApiHandler(handler, reqOptions = {}) {
  const { req, res } = createMockReqRes(reqOptions);
  await handler(req, res);
  return { req, res };
}

/**
 * Create a testing wrapper for a service
 * @param {Object} Service - Service class or object
 * @param {Object} mockApiClient - Mock API client
 * @returns {Object} - Service instance with mock API client
 */
export function createServiceTestWrapper(Service, mockApiClient) {
  if (typeof Service === 'function') {
    // It's a class, instantiate it with the mock API client
    return new Service(mockApiClient);
  } else {
    // It's an object with methods, update to use mock API client
    return {
      ...Service,
      apiClient: mockApiClient,
    };
  }
} 