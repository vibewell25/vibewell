import axios from 'axios';

const baseUrl = process.env.TEST_URL || 'https://vibewell.com';

describe('Critical paths', () => {
  test('Login page should load', async () => {
    const response = await axios.get(`${baseUrl}/login`);
    expect(response.status).toBe(200);
  });

  test('Service booking flow should be accessible', async () => {
    const response = await axios.get(`${baseUrl}/services`);
    expect(response.status).toBe(200);
  });

  test('API should return providers', async () => {
    const response = await axios.get(`${baseUrl}/api/providers`);
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('providers');
    expect(Array.isArray(response.data.providers)).toBe(true);
  });
}); 