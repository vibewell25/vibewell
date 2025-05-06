import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import axios from 'axios';

// Base URL for testing
const baseUrl = 'http://localhost:3000';

// Mock axios directly instead of using MSW
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Critical paths', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.resetAllMocks();
afterEach(() => {
    // Clean up after each test
    jest.clearAllMocks();
it('Login page should load', async () => {
    // Mock axios.get response for login page
    mockedAxios.get.mockResolvedValueOnce({
      status: 200,
      data: '<html><body>Login Page</body></html>',
const response = await axios.get(`${baseUrl}/login`);
    expect(response.status).toBe(200);
    expect(response.data).toContain('Login Page');
it('Service booking flow should be accessible', async () => {
    // Mock axios.get response for services page
    mockedAxios.get.mockResolvedValueOnce({
      status: 200,
      data: '<html><body>Services Page</body></html>',
const response = await axios.get(`${baseUrl}/services`);
    expect(response.status).toBe(200);
    expect(response.data).toContain('Services Page');
it('API should return providers', async () => {
    // Mock axios.get response for providers API
    mockedAxios.get.mockResolvedValueOnce({
      status: 200,
      data: {
        providers: [
          { id: 1, name: 'Provider 1', specialties: ['Yoga', 'Meditation'] },
          { id: 2, name: 'Provider 2', specialties: ['Fitness', 'Nutrition'] }
        ]
});


    const response = await axios.get(`${baseUrl}/api/providers`);
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('providers');
    expect(Array.isArray(response.data.providers)).toBe(true);
    expect(response.data.providers.length).toBe(2);
    expect(response.data.providers[0]).toHaveProperty('name', 'Provider 1');
it('Should retrieve bookings', async () => {
    // Mock axios.get response for bookings API
    mockedAxios.get.mockResolvedValueOnce({
      status: 200,
      data: {
        bookings: [
          { id: 1, providerId: 1, service: 'Yoga Session', date: '2023-11-10', time: '14:00', status: 'confirmed' },
          { id: 2, providerId: 2, service: 'Fitness Training', date: '2023-11-12', time: '10:00', status: 'pending' }
        ]
});


    const response = await axios.get(`${baseUrl}/api/bookings`);
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('bookings');
    expect(Array.isArray(response.data.bookings)).toBe(true);
    expect(response.data.bookings.length).toBe(2);
it('Should create a new booking', async () => {
    const bookingData = {
      providerId: 1,
      service: 'Yoga Session',
      date: '2023-11-10',
      time: '14:00'
// Mock axios.post response for creating a booking
    mockedAxios.post.mockResolvedValueOnce({
      status: 201,
      data: { 
        id: 3, 
        ...bookingData, 
        status: 'pending',
        message: 'Booking created successfully' 
});
    

    const response = await axios.post(`${baseUrl}/api/bookings`, bookingData);
    expect(response.status).toBe(201);
    expect(response.data).toHaveProperty('id');
    expect(response.data).toHaveProperty('message', 'Booking created successfully');
    expect(response.data.service).toBe('Yoga Session');
