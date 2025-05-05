import { http, HttpResponse } from 'msw';

// Base URL for consistent API paths
const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const paymentHandlers = [
  // Create payment intent endpoint
  http.post(`${baseUrl}/api/payments/intent`, async ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    
    // Check for authentication
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
const body = await request.json();
    
    // Validate input
    if (!body.amount || body.amount <= 0 || !body.currency) {
      return HttpResponse.json(
        { error: 'Invalid payment data' },
        { status: 400 }
// Handle test errors
    if (body.testMode === 'error') {
      return HttpResponse.json(
        { error: 'Failed to create payment intent' },
        { status: 500 }
return HttpResponse.json(
      {
        clientSecret: 'pi_mock_secret_123456',
        paymentIntentId: 'pi_mock_123456',
        amount: body.amount,
        currency: body.currency
{ status: 200 }
),
  
  // Get payment details endpoint
  http.get(`${baseUrl}/api/payments/:id`, ({ params, request }) => {
    const authHeader = request.headers.get('Authorization');
    
    // Check for authentication
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
const { id } = params;
    
    // Not found payment
    if (id === 'nonexistent') {
      return HttpResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
return HttpResponse.json(
      {
        id,
        amount: 10000,
        currency: 'usd',
        status: 'succeeded',
        bookingId: 'booking-123',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
{ status: 200 }
),
  
  // Process payment endpoint
  http.post(`${baseUrl}/api/payments`, async ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    
    // Check for authentication
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
const body = await request.json();
    
    // Validate input
    if (!body.paymentIntentId || !body.bookingId) {
      return HttpResponse.json(
        { error: 'Invalid payment data' },
        { status: 400 }
// Handle payment failure
    if (body.paymentIntentId === 'pi_failed') {
      return HttpResponse.json(
        { error: 'Payment failed', code: 'payment_failed' },
        { status: 400 }
return HttpResponse.json(
      {
        id: 'payment-123',
        bookingId: body.bookingId,
        amount: body.amount || 10000,
        currency: body.currency || 'usd',
        status: 'succeeded',
        paymentIntentId: body.paymentIntentId,
        createdAt: new Date().toISOString()
{ status: 200 }
),
  
  // Refund payment endpoint
  http.post(`${baseUrl}/api/payments/:id/refund`, async ({ params, request }) => {
    const authHeader = request.headers.get('Authorization');
    
    // Check for authentication
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
const { id } = params;
    const body = await request.json();
    
    // Validate input
    if (!body.amount || body.amount <= 0) {
      return HttpResponse.json(
        { error: 'Invalid refund amount' },
        { status: 400 }
// Payment not found
    if (id === 'nonexistent') {
      return HttpResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
// Already refunded
    if (id === 'already-refunded') {
      return HttpResponse.json(
        { error: 'Payment already refunded' },
        { status: 400 }
return HttpResponse.json(
      {
        id: `refund-${id}`,
        paymentId: id,
        amount: body.amount,
        status: 'succeeded',
        createdAt: new Date().toISOString()
{ status: 200 }
),
  
  // Webhook endpoint for payment events
  http.post(`${baseUrl}/api/webhooks/stripe`, async ({ request }) => {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');
    
    // Validate signature
    if (!signature) {
      return HttpResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
// Parse webhook event
    let event;
    try {
      // In a real implementation, this would verify the signature
      event = JSON.parse(body);
catch (err) {
      return HttpResponse.json(
        { error: 'Invalid webhook payload' },
        { status: 400 }
// Process different webhook events
    switch (event.type) {
      case 'payment_intent.succeeded':
        // Handle successful payment
        break;
      case 'payment_intent.payment_failed':
        // Handle failed payment
        break;
      case 'charge.refunded':
        // Handle refund
        break;
      default:
        // Unhandled event type
        break;
return HttpResponse.json(
      { received: true },
      { status: 200 }
)
]; 