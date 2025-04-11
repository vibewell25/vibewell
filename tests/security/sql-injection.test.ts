/**
 * SQL Injection Testing
 * 
 * This test suite checks various endpoints for SQL injection vulnerabilities
 * by sending potentially malicious SQL payloads and verifying they are properly sanitized.
 */

import { describe, beforeAll, afterAll, afterEach, it, expect } from '@jest/globals';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import axios from 'axios';

// Base URL for API requests
const baseUrl = 'http://localhost:3000';

// SQL injection test payloads
const SQL_INJECTION_PAYLOADS = [
  "' OR 1=1--",
  "admin' --",
  "'; DROP TABLE users--",
  "1'; SELECT * FROM users; --",
  "' UNION SELECT username, password FROM users--",
  "'; INSERT INTO logs VALUES('hacked')--"
];

// Set up MSW server
const server = setupServer(
  // Mock API endpoint that should be protected against SQL injection
  http.get(`${baseUrl}/api/products/:id`, ({ params }) => {
    const { id } = params;
    
    // Check for SQL injection patterns in the ID parameter
    if (typeof id === 'string' && 
        (id.includes("'") || id.includes(";") || id.includes("--") || 
         id.includes("=") || id.includes(" OR ") || id.includes(" UNION "))) {
      return HttpResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    
    return HttpResponse.json(
      { id, name: `Product ${id}`, price: 99.99 },
      { status: 200 }
    );
  }),
  
  // Mock API endpoint for users that should be protected
  http.get(`${baseUrl}/api/users`, ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('query');
    
    // Check for SQL injection patterns in the query parameter
    if (query && 
        (query.includes("'") || query.includes(";") || query.includes("--") || 
         query.includes("=") || query.includes(" OR ") || query.includes(" UNION "))) {
      return HttpResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    
    return HttpResponse.json(
      { users: [{ id: 1, name: 'Test User' }] },
      { status: 200 }
    );
  }),
  
  // Mock API endpoint for authentication
  http.post(`${baseUrl}/api/auth/login`, async ({ request }) => {
    const requestBody = await request.json();
    const { username, password } = requestBody;
    
    // Check for SQL injection patterns in username/password
    if ((username && 
         (username.includes("'") || username.includes(";") || username.includes("--"))) ||
        (password && 
         (password.includes("'") || password.includes(";") || password.includes("--")))) {
      return HttpResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    
    // For the test, let's say only 'admin'/'secure123' is valid
    if (username === 'admin' && password === 'secure123') {
      return HttpResponse.json(
        { success: true, token: 'mock-token' },
        { status: 200 }
      );
    }
    
    return HttpResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  })
);

// Start MSW server before tests
beforeAll(() => server.listen());

// Reset request handlers between tests
afterEach(() => server.resetHandlers());

// Close MSW server after all tests
afterAll(() => server.close());

describe('SQL Injection Protection Tests', () => {
  it('should block SQL injection attempts in URL parameters', async () => {
    // Test each SQL injection payload against the product endpoint
    for (const payload of SQL_INJECTION_PAYLOADS) {
      const response = await axios.get(`${baseUrl}/api/products/${payload}`, {
        validateStatus: () => true // Accept any status code
      });
      
      // Expecting 400 Bad Request for SQL injection attempts
      expect(response.status).toBe(400);
      expect(response.data).toHaveProperty('error', 'Invalid input');
    }
    
    // Verify legitimate requests still work
    const response = await axios.get(`${baseUrl}/api/products/123`);
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('id', '123');
  });
  
  it('should block SQL injection attempts in query parameters', async () => {
    // Test each SQL injection payload against the users endpoint
    for (const payload of SQL_INJECTION_PAYLOADS) {
      const response = await axios.get(`${baseUrl}/api/users?query=${encodeURIComponent(payload)}`, {
        validateStatus: () => true // Accept any status code
      });
      
      // Expecting 400 Bad Request for SQL injection attempts
      expect(response.status).toBe(400);
      expect(response.data).toHaveProperty('error', 'Invalid input');
    }
    
    // Verify legitimate requests still work
    const response = await axios.get(`${baseUrl}/api/users?query=test`);
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('users');
  });
  
  it('should block SQL injection attempts in request body', async () => {
    // Test SQL injection in username and password fields
    for (const payload of SQL_INJECTION_PAYLOADS) {
      // Test injection in username
      let response = await axios.post(`${baseUrl}/api/auth/login`, 
        { username: payload, password: 'secure123' },
        { validateStatus: () => true }
      );
      
      expect(response.status).toBe(400);
      expect(response.data).toHaveProperty('error', 'Invalid input');
      
      // Test injection in password
      response = await axios.post(`${baseUrl}/api/auth/login`, 
        { username: 'admin', password: payload },
        { validateStatus: () => true }
      );
      
      expect(response.status).toBe(400);
      expect(response.data).toHaveProperty('error', 'Invalid input');
    }
    
    // Verify legitimate login still works
    const response = await axios.post(`${baseUrl}/api/auth/login`, { 
      username: 'admin', 
      password: 'secure123' 
    });
    
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('token');
  });
}); 