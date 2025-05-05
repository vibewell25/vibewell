imports, react/no-unescaped-entities, import/no-anonymous-default-export, no-unused-vars, security/detect-object-injection, unicorn/no-null, unicorn/consistent-function-scoping *//**
 * Tests for the booking service
 */
import { http, HttpResponse } from 'msw';

import { bookingService, Booking, CreateBookingParams } from './booking-service';

import { server, apiMock } from '../test-utils/server';

// Mock booking data
const mockBookings: Booking[] = [
  {
    id: '1',

    serviceId: 'service-1',
    serviceName: 'Haircut',

    providerId: 'provider-1',
    providerName: 'Jane Smith',
    date: '2023-06-15',
    time: '14:00',
    duration: 60,
    status: 'confirmed',
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    price: 50,
    paymentStatus: 'paid',
    createdAt: '2023-06-10T10:30:00Z',
    updatedAt: '2023-06-10T10:30:00Z',
{
    id: '2',

    serviceId: 'service-2',
    serviceName: 'Massage',

    providerId: 'provider-2',
    providerName: 'Mike Johnson',
    date: '2023-06-18',
    time: '10:00',
    duration: 90,
    status: 'pending',
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    price: 80,
    paymentStatus: 'pending',
    createdAt: '2023-06-12T09:15:00Z',
    updatedAt: '2023-06-12T09:15:00Z',
];

// Sample booking for testing
const sampleBooking = mockBookings[0];

// Setup mock server
beforeAll(() => {
  apiMock.start();
afterAll(() => {
  apiMock.stop();
// Reset handlers between tests
afterEach(() => {
  apiMock.reset();
describe('Booking Service', () => {
  describe('getBookings', () => {
    it('should fetch all bookings successfully', async () => {
      // Setup mock response
      server.use(

        http.get('/api/bookings', () => {
          return HttpResponse.json(mockBookings);
),
// Execute the service call
      const response = await bookingService.getBookings();

      // Assertions
      expect(response.success).toBe(true);
      expect(response.data).toHaveLength(2);
      expect(response.data.[0].id).toBe('1');
      expect(response.data.[1].id).toBe('2');
it('should handle filter parameters correctly', async () => {
      // Setup mock to test that filter parameters are passed correctly
      server.use(

        http.get('/api/bookings', ({ request }) => {
          const url = new URL(request.url);
          const status = url.searchParams.get('status');
          const providerId = url.searchParams.get('providerId');


          // If filtering by confirmed status and provider-1

          if (status === 'confirmed' && providerId === 'provider-1') {
            return HttpResponse.json([mockBookings[0]]);
return HttpResponse.json(mockBookings);
),
// Execute with filters
      const response = await bookingService.getBookings({
        status: 'confirmed',

        providerId: 'provider-1',
// Assertions
      expect(response.success).toBe(true);
      expect(response.data).toHaveLength(1);
      expect(response.data.[0].id).toBe('1');
it('should handle error responses', async () => {
      // Setup error response
      server.use(

        http.get('/api/bookings', () => {
          return new HttpResponse(null, {
            status: 500,
            statusText: 'Internal Server Error',
),
// Execute the service call
      const response = await bookingService.getBookings();

      // Assertions
      expect(response.success).toBe(false);
      expect(response.status).toBe(500);
      expect(response.error).toBeDefined();
describe('getBooking', () => {
    it('should fetch a booking by ID successfully', async () => {
      // Setup mock response
      server.use(

        http.get('/api/bookings/1', () => {
          return HttpResponse.json(sampleBooking);
),
// Execute the service call
      const response = await bookingService.getBooking('1');

      // Assertions
      expect(response.success).toBe(true);
      expect(response.data.id).toBe('1');
      expect(response.data.serviceName).toBe('Haircut');
it('should handle booking not found', async () => {
      // Setup not found response
      server.use(

        http.get('/api/bookings/999', () => {
          return new HttpResponse(JSON.stringify({ message: 'Booking not found' }), {
            status: 404,
),
// Execute the service call
      const response = await bookingService.getBooking('999');

      // Assertions
      expect(response.success).toBe(false);
      expect(response.status).toBe(404);
describe('createBooking', () => {
    it('should create a booking successfully', async () => {
      // Setup booking data to create
      const newBookingData: CreateBookingParams = {

        serviceId: 'service-1',

        providerId: 'provider-1',
        date: '2023-07-01',
        time: '15:00',
        customerName: 'Alice Jones',
        customerEmail: 'alice@example.com',
// Expected response with assigned ID
      const createdBooking: Booking = {
        id: '3',
        serviceId: newBookingData.serviceId,
        serviceName: 'Haircut',
        providerId: newBookingData.providerId,
        providerName: 'Jane Smith',
        date: newBookingData.date,
        time: newBookingData.time,
        duration: 60,
        status: 'pending',
        customerName: newBookingData.customerName,
        customerEmail: newBookingData.customerEmail,
        price: 50,
        paymentStatus: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
// Setup mock response
      server.use(

        http.post('/api/bookings', async ({ request }) => {
          const reqBody = await request.json();

          // Validate the request body contains all required fields
          if (!reqBody.serviceId || !reqBody.providerId || !reqBody.date) {
            return new HttpResponse(JSON.stringify({ message: 'Missing required fields' }), {
              status: 400,
return HttpResponse.json(createdBooking);
),
// Execute the service call
      const response = await bookingService.createBooking(newBookingData);

      // Assertions
      expect(response.success).toBe(true);
      expect(response.data.id).toBe('3');
      expect(response.data.customerName).toBe('Alice Jones');
      expect(response.data.status).toBe('pending');
it('should handle validation errors', async () => {
      // Setup incomplete booking data
      const incompleteData = {
        // Missing required fields

        serviceId: 'service-1',
as CreateBookingParams;

      // Setup mock response for validation error
      server.use(

        http.post('/api/bookings', () => {
          return new HttpResponse(
            JSON.stringify({
              message: 'Validation failed',
              errors: ['providerId is required', 'date is required'],
),
            { status: 400 },
),
// Execute the service call
      const response = await bookingService.createBooking(incompleteData);

      // Assertions
      expect(response.success).toBe(false);
      expect(response.status).toBe(400);
describe('updateBooking', () => {
    it('should update a booking successfully', async () => {
      // Setup update data
      const updateData = {
        id: '1',
        status: 'cancelled' as const,
        notes: 'Customer requested cancellation',
// Expected updated booking
      const updatedBooking = {
        ...sampleBooking,
        status: 'cancelled',
        notes: 'Customer requested cancellation',
        updatedAt: new Date().toISOString(),
// Setup mock response
      server.use(

        http.put('/api/bookings/1', async ({ request }) => {
          const reqBody = await request.json();

          // Check that only allowed fields are updated
          if (reqBody.id) {
            return new HttpResponse(JSON.stringify({ message: 'Cannot update ID' }), {
              status: 400,
return HttpResponse.json(updatedBooking);
),
// Execute the service call
      const response = await bookingService.updateBooking(updateData);

      // Assertions
      expect(response.success).toBe(true);
      expect(response.data.status).toBe('cancelled');
      expect(response.data.notes).toBe('Customer requested cancellation');
describe('cancelBooking', () => {
    it('should cancel a booking successfully', async () => {
      // Expected cancelled booking
      const cancelledBooking = {
        ...sampleBooking,
        status: 'cancelled',
        notes: 'No longer needed',
        updatedAt: new Date().toISOString(),
// Setup mock response
      server.use(

        http.put('/api/bookings/1/cancel', async ({ request }) => {
          const reqBody = await request.json();
          const reason = reqBody.reason;

          // Return the cancelled booking with the reason as notes
          return HttpResponse.json({
            ...cancelledBooking,
            notes: reason,
),
// Execute the service call
      const response = await bookingService.cancelBooking('1', 'No longer needed');

      // Assertions
      expect(response.success).toBe(true);
      expect(response.data.status).toBe('cancelled');
      expect(response.data.notes).toBe('No longer needed');
describe('completeBooking', () => {
    it('should mark a booking as completed successfully', async () => {
      // Expected completed booking
      const completedBooking = {
        ...sampleBooking,
        status: 'completed',
        updatedAt: new Date().toISOString(),
// Setup mock response
      server.use(

        http.put('/api/bookings/1/complete', () => {
          return HttpResponse.json(completedBooking);
),
// Execute the service call
      const response = await bookingService.completeBooking('1');

      // Assertions
      expect(response.success).toBe(true);
      expect(response.data.status).toBe('completed');
describe('deleteBooking', () => {
    it('should delete a booking successfully', async () => {
      // Setup mock response
      server.use(

        http.delete('/api/bookings/1', () => {
          return new HttpResponse(null, { status: 204 });
),
// Execute the service call
      const response = await bookingService.deleteBooking('1');

      // Assertions
      expect(response.success).toBe(true);
      expect(response.status).toBe(204);
it('should handle deletion of non-existent booking', async () => {

      // Setup mock response for non-existent booking
      server.use(

        http.delete('/api/bookings/999', () => {
          return new HttpResponse(JSON.stringify({ message: 'Booking not found' }), {
            status: 404,
),
// Execute the service call
      const response = await bookingService.deleteBooking('999');

      // Assertions
      expect(response.success).toBe(false);
      expect(response.status).toBe(404);
