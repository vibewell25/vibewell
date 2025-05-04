
import { apiClient } from '../api-client';

// Mock fetch
global.fetch = jest.fn() as jest.Mock;

describe('API Client', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  describe('GET requests', () => {
    it('should make a successful GET request', async () => {
      // Setup mock response
      const mockResponse = {
        ok: true,
        status: 200,

        json: jest.fn().mockResolvedValue({ data: 'test-data' }),
        statusText: 'OK',
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Make the request

      const result = await apiClient.get('/test-endpoint');

      // Verify the request was made correctly

      expect(global.fetch).toHaveBeenCalledWith('/test-endpoint', {
        method: 'GET',
        headers: {


          'Content-Type': 'application/json',
        },
        body: undefined,
      });

      // Verify the response was processed correctly
      expect(result).toEqual({

        data: { data: 'test-data' },
        status: 200,
        success: true,
      });
    });

    it('should handle API errors in GET requests', async () => {
      // Setup mock response
      const mockResponse = {
        ok: false,
        status: 404,
        json: jest.fn().mockResolvedValue({ error: 'Not found' }),
        statusText: 'Not Found',
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Make the request
      const result = await apiClient.get('/nonexistent');

      // Verify the response was processed correctly
      expect(result).toEqual({
        data: { error: 'Not found' },
        status: 404,
        success: false,
        error: 'Not Found',
      });
    });

    it('should handle network errors in GET requests', async () => {
      // Setup network error
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      // Make the request

      const result = await apiClient.get('/test-endpoint');

      // Verify the error was handled properly
      expect(result).toEqual({
        status: 0,
        success: false,
        error: 'Network error',
      });
    });

    it('should handle invalid JSON responses', async () => {
      // Setup mock response with JSON parsing error
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
        statusText: 'OK',
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Make the request

      const result = await apiClient.get('/test-endpoint');

      // Verify the error was handled properly
      expect(result).toEqual({
        status: 200,
        success: true,
        error: undefined,
      });
    });

    it('should apply custom config options', async () => {
      // Setup mock response
      const mockResponse = {
        ok: true,
        status: 200,

        json: jest.fn().mockResolvedValue({ data: 'test-data' }),
        statusText: 'OK',
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Config with base URL and headers
      const config = {
        baseUrl: 'https://api.example.com',
        headers: {
          Authorization: 'Bearer token123',
        },
      };

      // Make the request

      await apiClient.get('/test-endpoint', config);

      // Verify the request was made with the correct URL and headers

      expect(global.fetch).toHaveBeenCalledWith('https://api.example.com/test-endpoint', {
        method: 'GET',
        headers: {


          'Content-Type': 'application/json',
          Authorization: 'Bearer token123',
        },
        body: undefined,
      });
    });
  });

  describe('POST requests', () => {
    it('should make a successful POST request with data', async () => {
      // Setup mock response
      const mockResponse = {
        ok: true,
        status: 201,

        json: jest.fn().mockResolvedValue({ id: 'new-resource-id' }),
        statusText: 'Created',
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Data to send
      const postData = { name: 'Test Resource', value: 42 };

      // Make the request

      const result = await apiClient.post('/test-resource', postData);

      // Verify the request was made correctly

      expect(global.fetch).toHaveBeenCalledWith('/test-resource', {
        method: 'POST',
        headers: {


          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      // Verify the response was processed correctly
      expect(result).toEqual({

        data: { id: 'new-resource-id' },
        status: 201,
        success: true,
      });
    });
  });

  describe('PUT requests', () => {
    it('should make a successful PUT request with data', async () => {
      // Setup mock response
      const mockResponse = {
        ok: true,
        status: 200,

        json: jest.fn().mockResolvedValue({ id: 'resource-id', updated: true }),
        statusText: 'OK',
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Data to send
      const putData = { name: 'Updated Resource', value: 99 };

      // Make the request

      const result = await apiClient.put('/test-resource/123', putData);

      // Verify the request was made correctly

      expect(global.fetch).toHaveBeenCalledWith('/test-resource/123', {
        method: 'PUT',
        headers: {


          'Content-Type': 'application/json',
        },
        body: JSON.stringify(putData),
      });

      // Verify the response was processed correctly
      expect(result).toEqual({

        data: { id: 'resource-id', updated: true },
        status: 200,
        success: true,
      });
    });
  });

  describe('DELETE requests', () => {
    it('should make a successful DELETE request', async () => {
      // Setup mock response
      const mockResponse = {
        ok: true,
        status: 204,
        json: jest.fn().mockRejectedValue(new Error('No content')), // No content to parse
        statusText: 'No Content',
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Make the request

      const result = await apiClient.delete('/test-resource/123');

      // Verify the request was made correctly

      expect(global.fetch).toHaveBeenCalledWith('/test-resource/123', {
        method: 'DELETE',
        headers: {


          'Content-Type': 'application/json',
        },
        body: undefined,
      });

      // Verify the response was processed correctly
      expect(result).toEqual({
        status: 204,
        success: true,
      });
    });
  });

  describe('PATCH requests', () => {
    it('should make a successful PATCH request with data', async () => {
      // Setup mock response
      const mockResponse = {
        ok: true,
        status: 200,

        json: jest.fn().mockResolvedValue({ id: 'resource-id', patched: true }),
        statusText: 'OK',
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Data to send
      const patchData = { value: 75 };

      // Make the request

      const result = await apiClient.patch('/test-resource/123', patchData);

      // Verify the request was made correctly

      expect(global.fetch).toHaveBeenCalledWith('/test-resource/123', {
        method: 'PATCH',
        headers: {


          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patchData),
      });

      // Verify the response was processed correctly
      expect(result).toEqual({

        data: { id: 'resource-id', patched: true },
        status: 200,
        success: true,
      });
    });
  });
});
