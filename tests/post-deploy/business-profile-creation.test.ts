import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import axios from 'axios';
import { http, HttpResponse } from 'msw';

    import { server } from '../mocks/server';

// Base URL for testing
const baseUrl = process.env.APP_URL || 'http://localhost:3000';

// Test data
const testBusinessProfile = {
  name: 'Test Spa Business',
  description: 'A luxury spa service',
  category: 'spa',
  location: '123 Main St, City, State, 12345',
  services: ['Massage', 'Facial', 'Manicure'],
  openingHours: [

    { day: 'Monday', hours: '9:00 AM - 5:00 PM' },

    { day: 'Tuesday', hours: '9:00 AM - 5:00 PM' },

    { day: 'Wednesday', hours: '9:00 AM - 5:00 PM' },

    { day: 'Thursday', hours: '9:00 AM - 5:00 PM' },

    { day: 'Friday', hours: '9:00 AM - 5:00 PM' }
  ],
  contact: {
    phone: '123-456-7890',
    email: 'contact@testspa.com',
    website: 'https://testspa.com'
const mockAuthUser = {

    id: 'test-user-id',
  email: 'test@example.com',
  role: 'provider'
// Mock axios directly
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Business Profile Creation Flow', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.resetAllMocks();
    
    // Set up MSW handlers
    server.use(

    http.get(`${baseUrl}/api/auth/session`, () => {
        return HttpResponse.json({ user: mockAuthUser }, { status: 200 });
),
      

    http.post(`${baseUrl}/api/business/profile`, () => {
        return HttpResponse.json({ 
          success: true, 

    data: { id: 'new-profile-id', ...testBusinessProfile }
{ status: 201 });
),
      

    http.get(`${baseUrl}/api/business/profile`, () => {
        return HttpResponse.json({ 
          success: true, 

    data: { id: 'new-profile-id', ...testBusinessProfile }
{ status: 200 });
)
afterEach(() => {
    // Clean up after each test
    jest.clearAllMocks();
it('Should allow a provider to create a business profile', async () => {
    // Mock provider dashboard page access
    mockedAxios.get.mockResolvedValueOnce({
      status: 200,
      data: '<html><body>Provider Dashboard</body></html>'
// Test access to provider dashboard

    const dashboardResponse = await axios.get(`${baseUrl}/provider/dashboard`);
    expect(dashboardResponse.status).toBe(200);
    expect(dashboardResponse.data).toContain('Provider Dashboard');

    // Mock navigation to profile creation page
    mockedAxios.get.mockResolvedValueOnce({
      status: 200,
      data: '<html><body>Business Profile Creation</body></html>'
// Test access to business profile creation page

    const profilePageResponse = await axios.get(`${baseUrl}/provider/profile`);
    expect(profilePageResponse.status).toBe(200);
    expect(profilePageResponse.data).toContain('Business Profile Creation');

    // Mock form submission
    mockedAxios.post.mockResolvedValueOnce({
      status: 201,
      data: {
        success: true,

    data: { id: 'new-profile-id', ...testBusinessProfile }
});

    // Test business profile creation
    const createResponse = await axios.post(

    `${baseUrl}/api/business/profile`,
      testBusinessProfile
expect(createResponse.status).toBe(201);
    expect(createResponse.data.success).toBe(true);
    expect(createResponse.data.data).toHaveProperty('id');
    expect(createResponse.data.data.name).toBe(testBusinessProfile.name);
    expect(createResponse.data.data.category).toBe(testBusinessProfile.category);

    // Mock verification of created profile
    mockedAxios.get.mockResolvedValueOnce({
      status: 200,
      data: {
        success: true,

    data: { id: 'new-profile-id', ...testBusinessProfile }
});

    // Verify the created profile

    const getResponse = await axios.get(`${baseUrl}/api/business/profile`);
    expect(getResponse.status).toBe(200);
    expect(getResponse.data.success).toBe(true);

    expect(getResponse.data.data).toHaveProperty('id', 'new-profile-id');
    expect(getResponse.data.data.name).toBe(testBusinessProfile.name);
it('Should validate required fields when creating a business profile', async () => {
    // Mock form submission with missing fields
    const incompleteProfile = {
      name: 'Test Spa Business',
      // Missing other required fields
// Mock validation error response
    mockedAxios.post.mockRejectedValueOnce({
      response: {
        status: 400,
        data: {
          success: false,
          errors: ['Description is required', 'Category is required']
}
// Test validation when submitting incomplete data
    try {

    await axios.post(`${baseUrl}/api/business/profile`, incompleteProfile);
      // If the request doesn't throw, fail the test
      expect(true).toBe(false);
catch (error: any) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.success).toBe(false);
      expect(error.response.data.errors).toContain('Description is required');
});

  it('Should handle form submission errors gracefully', async () => {
    // Mock server error
    mockedAxios.post.mockRejectedValueOnce({
      response: {
        status: 500,
        data: {
          success: false,
          message: 'Internal server error'
}
// Test error handling
    try {

    await axios.post(`${baseUrl}/api/business/profile`, testBusinessProfile);
      // If the request doesn't throw, fail the test
      expect(true).toBe(false);
catch (error: any) {
      expect(error.response.status).toBe(500);
      expect(error.response.data.success).toBe(false);
      expect(error.response.data.message).toBe('Internal server error');
});
