import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

    import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import React from 'react';

// Add TextEncoder and TextDecoder to global scope for Jest
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

// Setup MSW server for API mocking
const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const handlers = [
  // Health endpoint

    http.get(`${baseUrl}/api/health`, () => {
    return HttpResponse.json(
      { status: 'healthy', timestamp: Date.now() },
      { status: 200 }
),

  // Mock login endpoint

    http.post(`${baseUrl}/api/auth/login`, ({ request }) => {
    const headers = request.headers;

    if (headers.get('x-rate-limit-test') === 'exceed') {
      return HttpResponse.json(
        { error: 'Too many requests', retryAfter: 60 },
        { status: 429 }
return HttpResponse.json(

    { success: true, token: 'mock-token' },
      { status: 200 }
),

  // Mock password reset endpoint

    http.post(`${baseUrl}/api/auth/reset-password`, ({ request }) => {
    const headers = request.headers;

    if (headers.get('x-rate-limit-test') === 'exceed') {
      return HttpResponse.json(
        { error: 'Too many requests', retryAfter: 60 },
        { status: 429 }
return HttpResponse.json(
      { success: true, message: 'Password reset email sent' },
      { status: 200 }
),

  // Mock providers endpoint

    http.get(`${baseUrl}/api/providers`, () => {
    return HttpResponse.json(
      {
        providers: [
          { id: 'provider1', name: 'Provider 1' },
          { id: 'provider2', name: 'Provider 2' }
        ]
{ status: 200 }
),

  // Mock products endpoint

    http.get(`${baseUrl}/api/products/:id`, ({ params }) => {
    const { id } = params;
    // Check for SQL injection patterns
    if (typeof id === 'string' && 
        (id.includes("'") || id.includes(";") || id.includes("--") || 
         id.includes("=") || id.includes(" OR ") || id.includes(" UNION "))) {
      return HttpResponse.json(
        { error: 'Invalid input' },
        { status: 400 }
return HttpResponse.json(
      { id, name: `Product ${id}`, price: 99.99 },
      { status: 200 }
),

  // Mock providers/:id endpoint

    http.get(`${baseUrl}/api/providers/:id`, ({ params }) => {
    const { id } = params;
    // Check for SQL injection patterns
    if (typeof id === 'string' && 
        (id.includes("'") || id.includes(";") || id.includes("--") || 
         id.includes("=") || id.includes(" OR ") || id.includes(" UNION "))) {
      return HttpResponse.json(
        { error: 'Invalid input' },
        { status: 400 }
return HttpResponse.json(
      { id, name: `Provider ${id}` },
      { status: 200 }
),

  // Mock services/:id endpoint

    http.get(`${baseUrl}/api/services/:id`, ({ params }) => {
    const { id } = params;
    // Check for SQL injection patterns
    if (typeof id === 'string' && 
        (id.includes("'") || id.includes(";") || id.includes("--") || 
         id.includes("=") || id.includes(" OR ") || id.includes(" UNION "))) {
      return HttpResponse.json(
        { error: 'Invalid input' },
        { status: 400 }
return HttpResponse.json(
      { id, name: `Service ${id}` },
      { status: 200 }
),

  // Handle other API routes that might not be explicitly defined
  http.all(`${baseUrl}/api/*`, ({ request }) => {
    console.log(`Unhandled request: ${request.method} ${request.url.toString()}`);
    return HttpResponse.json(
      { error: 'Not found' },
      { status: 404 }
),

  // Handle routes for smoke tests
  http.get(`${baseUrl}`, () => {
    return new HttpResponse(
      '<html><body>Home Page</body></html>',
      {
        status: 200,
        headers: {

    'Content-Type': 'text/html',
),

  http.get(`${baseUrl}/login`, () => {
    return new HttpResponse(
      '<html><body>Login Page</body></html>',
      {
        status: 200,
        headers: {

    'Content-Type': 'text/html',
),

  http.get(`${baseUrl}/services`, () => {
    return new HttpResponse(
      '<html><body>Services Page</body></html>',
      {
        status: 200,
        headers: {

    'Content-Type': 'text/html',
)
];

export const server = setupServer(...handlers);

// Start server before all tests
beforeAll(() => server.listen());

// Reset handlers after each test
afterEach(() => server.resetHandlers());

// Close server after all tests
afterAll(() => server.close()); 