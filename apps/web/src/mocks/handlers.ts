import { http } from 'msw';

// Define API handlers
export const handlers = [
  // Example API handlers - replace with your actual handlers
  http.get('/api/user', () => {
    return new Response(
      JSON.stringify({ id: 1, name: 'User' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
),
  
  http.post('/api/login', () => {
    return new Response(
      JSON.stringify({ token: 'mock-token' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
),
];

export default handlers;
