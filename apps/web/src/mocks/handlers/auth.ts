import { http, HttpResponse } from 'msw';

// Base URL for consistent API paths
const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const authHandlers = [
  // Login endpoint
  http.post(`${baseUrl}/api/auth/login`, async ({ request }) => {
    const body = await request.json();
    
    // Validate input
    if (!body.email || !body.password) {
      return HttpResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
// Check for rate limiting test headers
    const headers = request.headers;
    if (headers.get('x-rate-limit-test') === 'exceed') {
      return HttpResponse.json(
        { error: 'Too many requests', retryAfter: 60 },
        { status: 429 }
// Simulate authentication
    if (body.email === 'invalid@example.com' || body.password === 'wrong') {
      return HttpResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
return HttpResponse.json(
      { 
        success: true, 
        token: 'mock-jwt-token',
        user: {
          id: 'user-123',
          email: body.email,
          name: 'Test User'
{ status: 200 }
),
  
  // Register endpoint
  http.post(`${baseUrl}/api/auth/signup`, async ({ request }) => {
    const body = await request.json();
    
    // Validate input
    if (!body.email || !body.password || !body.fullName) {
      return HttpResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
// Check for existing user
    if (body.email === 'existing@example.com') {
      return HttpResponse.json(
        { error: 'User already exists' },
        { status: 409 }
return HttpResponse.json(
      { 
        success: true, 
        message: 'Account created successfully. Please verify your email.' 
{ status: 201 }
),
  
  // Password reset endpoint
  http.post(`${baseUrl}/api/auth/password-reset`, async ({ request }) => {
    const body = await request.json();
    
    // Validate input
    if (!body.email) {
      return HttpResponse.json(
        { error: 'Email is required' },
        { status: 400 }
return HttpResponse.json(
      { success: true, message: 'Password reset email sent' },
      { status: 200 }
),
  
  // Get user profile
  http.get(`${baseUrl}/api/auth/me`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    
    // Check for authentication
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
return HttpResponse.json(
      {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER',
        onboardingCompleted: true
{ status: 200 }
),
  
  // Logout endpoint
  http.post(`${baseUrl}/api/auth/logout`, () => {
    return HttpResponse.json(
      { success: true },
      { status: 200 }
),
  
  // Email verification endpoint
  http.get(`${baseUrl}/api/auth/verify-email/:token`, ({ params }) => {
    const { token } = params;
    
    if (token === 'invalid-token') {
      return HttpResponse.json(
        { error: 'Invalid or expired token' },
        { status: 400 }
return HttpResponse.json(
      { success: true, message: 'Email verified successfully' },
      { status: 200 }
),
  
  // Refresh token endpoint
  http.post(`${baseUrl}/api/auth/refresh-token`, async ({ request }) => {
    const body = await request.json();
    
    if (!body.refreshToken) {
      return HttpResponse.json(
        { error: 'Refresh token is required' },
        { status: 400 }
if (body.refreshToken === 'expired-token') {
      return HttpResponse.json(
        { error: 'Refresh token expired' },
        { status: 401 }
return HttpResponse.json(
      { 
        token: 'new-mock-jwt-token',
        refreshToken: 'new-mock-refresh-token'
{ status: 200 }
)
]; 