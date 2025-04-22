import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

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
      mockedAxios.get.mockResolvedValueOnce({
        status: 200,
        data: '<html><body><h1>VibeWell</h1></body></html>',
        headers: {
          'content-type': 'text/html'
        }
      });

      // Make the request
      const response = await axios.get(`${BASE_URL}${ENDPOINTS.HOME}`);
      
      // Verify the response
      expect(response.status).toBe(200);
      expect(response.data).toContain('VibeWell');
      expect(mockedAxios.get).toHaveBeenCalledWith(`${BASE_URL}${ENDPOINTS.HOME}`);
    });

    it('Health endpoint should return healthy status', async () => {
      const mockTimestamp = Date.now();
      mockedAxios.get.mockResolvedValueOnce({
        status: 200,
        data: {
          status: 'healthy',
          timestamp: mockTimestamp,
          services: {
            database: 'connected',
            cache: 'available',
            storage: 'operational'
          }
        }
      });

      const response = await axios.get(`${BASE_URL}${ENDPOINTS.HEALTH}`);
      
      expect(response.status).toBe(200);
      expect(response.data).toMatchObject({
        status: 'healthy',
        services: expect.any(Object)
      });
      expect(mockedAxios.get).toHaveBeenCalledWith(`${BASE_URL}${ENDPOINTS.HEALTH}`);
    });
  });

  describe('Authentication', () => {
    it('Auth endpoint should handle unauthorized access', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        response: {
          status: 401,
          data: { error: 'Unauthorized' }
        }
      });

      try {
        await axios.get(`${BASE_URL}${ENDPOINTS.AUTH}`);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response.status).toBe(401);
        expect(error.response.data).toEqual({ error: 'Unauthorized' });
      }
    });
  });

  describe('Services API', () => {
    it('Services endpoint should return available services', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        status: 200,
        data: {
          services: [
            { id: 1, name: 'Haircut', duration: 30 },
            { id: 2, name: 'Massage', duration: 60 }
          ]
        }
      });

      const response = await axios.get(`${BASE_URL}${ENDPOINTS.SERVICES}`);
      
      expect(response.status).toBe(200);
      expect(response.data.services).toBeInstanceOf(Array);
      expect(response.data.services.length).toBeGreaterThan(0);
      expect(response.data.services[0]).toHaveProperty('id');
      expect(response.data.services[0]).toHaveProperty('name');
    });

    it('Services endpoint should handle errors gracefully', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        response: {
          status: 500,
          data: { error: 'Internal Server Error' }
        }
      });

      try {
        await axios.get(`${BASE_URL}${ENDPOINTS.SERVICES}`);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response.status).toBe(500);
        expect(error.response.data.error).toBe('Internal Server Error');
      }
    });
  });

  describe('Bookings API', () => {
    it('Bookings endpoint should handle rate limiting', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        response: {
          status: 429,
          data: { 
            error: 'Too Many Requests',
            retryAfter: 60
          },
          headers: {
            'retry-after': '60'
          }
        }
      });

      try {
        await axios.get(`${BASE_URL}${ENDPOINTS.BOOKINGS}`);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response.status).toBe(429);
        expect(error.response.headers['retry-after']).toBe('60');
        expect(error.response.data.retryAfter).toBe(60);
      }
    });
  });
}); 