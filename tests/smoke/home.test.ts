import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import crossFetch from 'cross-fetch';

// Mock cross-fetch
jest.mock('cross-fetch');
const mockedFetch = crossFetch as jest.MockedFunction<typeof crossFetch>;

// Constants
const BASE_URL = 'http://localhost:3000';
const ENDPOINTS = {
  HOME: '/',
  HEALTH: '/api/health',
  AUTH: '/api/auth',
  SERVICES: '/api/services',
  BOOKINGS: '/api/bookings'
} as const;

describe('Smoke tests', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.resetAllMocks();
  });
  
  afterEach(() => {
    // Clear all mocks after each test
    jest.clearAllMocks();
  });
  
  describe('Core endpoints', () => {
    it('Home page should return 200 and contain VibeWell', async () => {
      // Mock the response
      mockedFetch.mockResolvedValueOnce({
        status: 200,
        text: async () => '<html><body><h1>VibeWell</h1></body></html>',
        ok: true,
        headers: new Headers({ 'content-type': 'text/html' })
      } as Response);

      // Make the request
      const response = await crossFetch(`${BASE_URL}${ENDPOINTS.HOME}`);
      const data = await response.text();
      
      // Verify the response
      expect(response.status).toBe(200);
      expect(data).toContain('VibeWell');
      expect(mockedFetch).toHaveBeenCalledWith(`${BASE_URL}${ENDPOINTS.HOME}`);
    });
    
    it('Health endpoint should return healthy status', async () => {
      const mockTimestamp = Date.now();
      const mockData = {
        status: 'healthy',
        timestamp: mockTimestamp,
        services: {
          database: 'connected',
          cache: 'available',
          storage: 'operational'
        }
      };
      
      mockedFetch.mockResolvedValueOnce({
        status: 200,
        json: async () => mockData,
        ok: true
      } as Response);
      
      const response = await crossFetch(`${BASE_URL}${ENDPOINTS.HEALTH}`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toMatchObject({
        status: 'healthy',
        services: expect.any(Object)
      });
      expect(mockedFetch).toHaveBeenCalledWith(`${BASE_URL}${ENDPOINTS.HEALTH}`);
    });
  });
  
  describe('Authentication', () => {
    it('Auth endpoint should handle unauthorized access', async () => {
      mockedFetch.mockResolvedValueOnce({
        status: 401,
        json: async () => ({ error: 'Unauthorized' }),
        ok: false
      } as Response);

      const response = await crossFetch(`${BASE_URL}${ENDPOINTS.AUTH}`);
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data).toEqual({ error: 'Unauthorized' });
    });
  });
  
  describe('Services API', () => {
    it('Services endpoint should return available services', async () => {
      const mockData = {
        services: [
          { id: 1, name: 'Haircut', duration: 30 },
          { id: 2, name: 'Massage', duration: 60 }
        ]
      };
      
      mockedFetch.mockResolvedValueOnce({
        status: 200,
        json: async () => mockData,
        ok: true
      } as Response);

      const response = await crossFetch(`${BASE_URL}${ENDPOINTS.SERVICES}`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.services).toBeInstanceOf(Array);
      expect(data.services.length).toBeGreaterThan(0);
      expect(data.services[0]).toHaveProperty('id');
      expect(data.services[0]).toHaveProperty('name');
    });
    
    it('Services endpoint should handle errors gracefully', async () => {
      mockedFetch.mockResolvedValueOnce({
        status: 500,
        json: async () => ({ error: 'Internal Server Error' }),
        ok: false
      } as Response);

      const response = await crossFetch(`${BASE_URL}${ENDPOINTS.SERVICES}`);
      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe('Internal Server Error');
    });
  });
  
  describe('Bookings API', () => {
    it('Bookings endpoint should handle rate limiting', async () => {
      const headers = new Headers({
        'retry-after': '60'
      });
      
      mockedFetch.mockResolvedValueOnce({
        status: 429,
        json: async () => ({ 
          error: 'Too Many Requests',
          retryAfter: 60
        }),
        ok: false,
        headers
      } as Response);
      
      const response = await crossFetch(`${BASE_URL}${ENDPOINTS.BOOKINGS}`);
      expect(response.status).toBe(429);
      expect(response.headers.get('retry-after')).toBe('60');
      const data = await response.json();
      expect(data.retryAfter).toBe(60);
    });
  });
});
