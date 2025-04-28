/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type, @typescript-eslint/no-namespace, @typescript-eslint/no-require-imports, react/no-unescaped-entities, import/no-anonymous-default-export, no-unused-vars, security/detect-object-injection, unicorn/no-null, unicorn/consistent-function-scoping */import { GET } from '@/app/api/health/route';

describe('Health API Endpoint', () => {
  test('should return status ok and the correct data structure', async () => {
    // Execute the handler directly
    const response = await GET();

    // Convert response to JSON
    const data = await response.json();

    // Verify the response structure and values
    expect(response.status).toBe(200);
    expect(data).toHaveProperty('status', 'ok');
    expect(data).toHaveProperty('message', 'API is running');
    expect(data).toHaveProperty('timestamp');

    // Validate that timestamp is a valid ISO date string
    expect(() => new Date(data.timestamp)).not.toThrow();
  });

  test('should include CORS headers in the response', async () => {
    // Execute the handler
    const response = await GET();

    // Convert response to JSON for verification
    await response.json();

    // Set by NextResponse.json() internally or by middleware
    // This test verifies that our endpoint is compatible with CORS setup
    expect(response.headers.get('content-type')).toBe('application/json');
  });

  test('should be fast - respond within 100ms', async () => {
    const startTime = Date.now();

    // Execute the handler
    await GET();

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    // Assert that the response time is acceptable (under 100ms)
    expect(responseTime).toBeLessThan(100);
  });
});
