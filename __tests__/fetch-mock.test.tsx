describe('Fetch Mock', () => {
  it('mocks health endpoint correctly', async () => {
    const response = await fetch('/api/health');
    const data = await response.json();
    
    expect(response.ok).toBe(true);
    expect(response.status).toBe(200);
    expect(data).toHaveProperty('status', 'healthy');
    expect(data).toHaveProperty('timestamp');
  });
  
  it('mocks login endpoint correctly', async () => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
    });
    
    const data = await response.json();
    
    expect(response.ok).toBe(true);
    expect(response.status).toBe(200);
    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('token', 'mock-token');
  });
  
  it('handles rate limiting correctly', async () => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-rate-limit-test': 'exceed',
      },
      body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
    });
    
    const data = await response.json();
    
    expect(response.ok).toBe(false);
    expect(response.status).toBe(429);
    expect(data).toHaveProperty('error', 'Too many requests');
    expect(data).toHaveProperty('retryAfter', 60);
  });
}); 