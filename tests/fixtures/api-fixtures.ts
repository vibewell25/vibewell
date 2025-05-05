export const mockServices = [
  {
    id: 1,
    name: 'Haircut',
    duration: 30,
    price: 50.00,
    description: 'Professional haircut service',
    category: 'hair',
    available: true
{
    id: 2,
    name: 'Massage',
    duration: 60,
    price: 80.00,
    description: 'Relaxing full body massage',
    category: 'wellness',
    available: true
];

export const mockBookings = [
  {
    id: 'booking_1',
    serviceId: 1,
    userId: 'user_1',
    date: '2024-03-15T10:00:00Z',
    status: 'confirmed',
    notes: 'First time client'
{
    id: 'booking_2',
    serviceId: 2,
    userId: 'user_2',
    date: '2024-03-16T14:00:00Z',
    status: 'pending',
    notes: 'Requested specific therapist'
];

export const mockUsers = [
  {
    id: 'user_1',
    email: 'test1@example.com',
    name: 'Test User 1',
    role: 'client',
    preferences: {
      notifications: true,
      language: 'en'
},
  {
    id: 'user_2',
    email: 'test2@example.com',
    name: 'Test User 2',
    role: 'provider',
    preferences: {
      notifications: true,
      language: 'es'
}
];

export const mockHealthResponse = {
  status: 'healthy',
  timestamp: '2024-03-14T12:00:00Z',
  services: {
    database: 'connected',
    cache: 'available',
    storage: 'operational'
version: '1.0.0'
export const mockErrorResponses = {
  unauthorized: {
    status: 401,
    error: 'Unauthorized',
    message: 'Authentication required'
notFound: {
    status: 404,
    error: 'Not Found',
    message: 'Resource not found'
rateLimited: {
    status: 429,
    error: 'Too Many Requests',
    message: 'Rate limit exceeded',
    retryAfter: 60
serverError: {
    status: 500,
    error: 'Internal Server Error',
    message: 'An unexpected error occurred'
