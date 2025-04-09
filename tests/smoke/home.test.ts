import axios from 'axios';

const baseUrl = process.env.TEST_URL || 'https://vibewell.com';

describe('Smoke tests', () => {
  test('Home page should return 200', async () => {
    const response = await axios.get(baseUrl);
    expect(response.status).toBe(200);
  });

  test('API health endpoint should return 200', async () => {
    const response = await axios.get(`${baseUrl}/api/health`);
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('status', 'healthy');
  });
}); 