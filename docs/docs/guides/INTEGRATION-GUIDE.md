# VibeWell Integration Guide

## Table of Contents
1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Authentication](#authentication)
4. [API Integration](#api-integration)
5. [Webhooks](#webhooks)
6. [SDK Integration](#sdk-integration)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

## Overview

This guide provides comprehensive instructions for integrating with the VibeWell platform. Our platform offers various integration points for different use cases:

- REST API for direct integration
- WebSocket for real-time features
- Webhooks for event notifications
- SDK for simplified integration
- OAuth2 for authentication

## Getting Started

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- A VibeWell account
- API credentials

### Installation

```bash
# Install the VibeWell SDK
npm install @vibewell/sdk

# Install optional dependencies
npm install @vibewell/ar # For AR features
npm install @vibewell/analytics # For analytics
```

### Basic Setup

```typescript
import { VibeWellClient } from '@vibewell/sdk';

const client = new VibeWellClient({
  apiKey: 'your-api-key',
  environment: 'production', // or 'sandbox' for testing
  debug: true // Enable debug logging
});
```

## Authentication

### OAuth2 Flow

1. Register your application in the VibeWell Developer Console
2. Implement the OAuth2 flow:

```typescript
const authConfig = {
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
  redirectUri: 'https://your-app.com/callback',
  scope: 'read write'
};

// Redirect user to authorization page
const authUrl = client.getAuthorizationUrl(authConfig);

// Handle callback
async function handleCallback(code: string) {
  const tokens = await client.exchangeCode(code);
  // Store tokens securely
}
```

### API Key Authentication

For server-to-server integrations, use API key authentication:

```typescript
const client = new VibeWellClient({
  apiKey: 'your-api-key'
});
```

## API Integration

### Booking API

```typescript
// Create a booking
const booking = await client.bookings.create({
  serviceId: 'service-id',
  startTime: new Date(),
  duration: 60, // minutes
  userId: 'user-id'
});

// Get booking details
const bookingDetails = await client.bookings.get(booking.id);

// Update booking
await client.bookings.update(booking.id, {
  status: 'confirmed'
});
```

### Payment API

```typescript
// Create payment intent
const paymentIntent = await client.payments.createIntent({
  amount: 1000, // in cents
  currency: 'usd',
  bookingId: 'booking-id'
});

// Handle payment confirmation
await client.payments.confirm(paymentIntent.id);
```

### User Management

```typescript
// Create user
const user = await client.users.create({
  email: 'user@example.com',
  name: 'John Doe'
});

// Update user preferences
await client.users.updatePreferences(user.id, {
  notifications: {
    email: true,
    sms: false
  }
});
```

## Webhooks

### Setting Up Webhooks

1. Register webhook endpoint in Developer Console
2. Implement webhook handler:

```typescript
import express from 'express';
import { validateWebhook } from '@vibewell/sdk';

const app = express();

app.post('/webhooks', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['x-vibewell-signature'];
  
  if (!validateWebhook(req.body, signature, 'your-webhook-secret')) {
    return res.status(400).send('Invalid signature');
  }

  const event = JSON.parse(req.body);
  
  switch (event.type) {
    case 'booking.created':
      handleBookingCreated(event.data);
      break;
    case 'payment.succeeded':
      handlePaymentSucceeded(event.data);
      break;
    // Handle other events
  }

  res.json({ received: true });
});
```

### Webhook Events

- `booking.created`
- `booking.updated`
- `booking.cancelled`
- `payment.succeeded`
- `payment.failed`
- `user.created`
- `user.updated`

## SDK Integration

### AR Features

```typescript
import { ARViewer } from '@vibewell/ar';

// Initialize AR viewer
const viewer = new ARViewer({
  container: '#ar-container',
  modelUrl: 'https://models.vibewell.com/hairstyle-1.glb'
});

// Handle AR events
viewer.on('modelLoaded', () => {
  console.log('Model loaded successfully');
});

viewer.on('error', (error) => {
  console.error('AR error:', error);
});
```

### Analytics Integration

```typescript
import { Analytics } from '@vibewell/analytics';

const analytics = new Analytics({
  apiKey: 'your-analytics-key'
});

// Track events
analytics.track('booking_completed', {
  bookingId: 'booking-id',
  serviceId: 'service-id',
  revenue: 100
});

// Get analytics data
const report = await analytics.getReport({
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-01-31'),
  metrics: ['bookings', 'revenue']
});
```

## Best Practices

### Security
- Store API keys and secrets securely
- Use environment variables for configuration
- Implement rate limiting
- Validate all user input
- Use HTTPS for all API calls

### Performance
- Implement caching where appropriate
- Use connection pooling for database connections
- Optimize API requests
- Implement retry logic with exponential backoff

### Error Handling
- Implement proper error handling
- Log errors appropriately
- Provide meaningful error messages
- Use appropriate HTTP status codes

### Testing
- Test integration points thoroughly
- Use sandbox environment for testing
- Implement automated tests
- Test edge cases and error scenarios

## Troubleshooting

### Common Issues

1. Authentication Errors
   - Check API key validity
   - Verify OAuth2 configuration
   - Check token expiration

2. Webhook Issues
   - Verify webhook signature
   - Check endpoint accessibility
   - Monitor webhook logs

3. API Rate Limits
   - Implement rate limiting
   - Use bulk operations where possible
   - Cache responses when appropriate

### Support

For additional support:
- Documentation: https://docs.vibewell.com
- API Reference: https://api.vibewell.com/docs
- Support Email: support@vibewell.com
- Developer Forum: https://developers.vibewell.com/forum 