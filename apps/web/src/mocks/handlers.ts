// Define simple mock handlers without using MSW directly
// This is a temporary solution until we can properly configure MSW in tests
export const handlers = [
  {
    url: '/api/user',
    method: 'GET',
    response: { id: 1, name: 'User' }
  },
  {
    url: '/api/login',
    method: 'POST',
    response: { token: 'mock-token' }
  }
];

export default handlers;
