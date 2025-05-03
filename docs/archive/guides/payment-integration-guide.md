# Payment Integration Guide

This guide covers the payment integration implementation in the VibeWell platform, focusing on our Stripe integration.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Environment Variables](#environment-variables)
- [Payment Components](#payment-components)
- [Payment Flow](#payment-flow)
- [API Endpoints](#api-endpoints)
- [Testing Payments](#testing-payments)
- [Going to Production](#going-to-production)

## Overview

The VibeWell platform uses Stripe as its primary payment provider. The integration is designed with flexibility in mind, using an interface-based approach that would allow for additional payment providers in the future if needed.

## Architecture

The payment system consists of several key components:

1. **Payment Provider Interface**: A common interface that defines the contract for any payment provider implementation.
2. **Stripe Provider**: An implementation of the payment provider interface that integrates with the Stripe API.
3. **Payment Service**: A singleton service that provides a unified API for payment operations.
4. **API Routes**: Server-side endpoints that handle payment operations securely.
5. **UI Components**: React components that provide the checkout experience to users.

### File Structure

```
src/
├── lib/
│   └── payment/
│       ├── payment-provider.ts         # Payment provider interface
│       ├── stripe-provider.ts          # Stripe implementation
│       └── payment-service.ts          # Payment service singleton
├── components/
│   └── payment/
│       ├── PaymentForm.tsx             # Stripe payment form
│       ├── PaymentCheckout.tsx         # Checkout flow component
│       └── payment-method-selector.tsx # Payment method selection
├── app/
│   ├── api/
│   │   └── payments/
│   │       ├── route.ts                # Payment API routes
│   │       └── intent/
│   │           └── route.ts            # Payment intent creation
│   └── payment/
│       ├── checkout/
│       │   └── page.tsx                # Checkout page
│       └── confirmation/
│           └── page.tsx                # Confirmation page
```

## Environment Variables

The following environment variables must be set:

```
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_your_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
```

For development, use test keys from your Stripe Dashboard. For production, use live keys.

## Payment Components

### PaymentCheckout

The `PaymentCheckout` component provides a complete checkout experience:

```tsx
import { PaymentCheckout } from '@/components/payment/PaymentCheckout';

<PaymentCheckout
  amount={49.99}
  currency="USD"
  description="Premium Membership"
  metadata={{
    itemName: 'Premium Membership',
    itemId: 'membership-premium-monthly',
    planType: 'monthly'
  }}
  onPaymentSuccess={(paymentIntentId) => {
    // Handle successful payment
  }}
  onPaymentError={(error) => {
    // Handle payment error
  }}
  redirectUrl="/payment/confirmation"
  buttonText="Pay Now"
  showSummary={true}
/>
```

#### Props

- `amount` (required): The payment amount.
- `currency` (optional): The currency code (default: "USD").
- `description` (required): A description of the payment.
- `metadata` (optional): Additional data to store with the payment.
- `onPaymentSuccess` (optional): Callback for successful payments.
- `onPaymentError` (optional): Callback for failed payments.
- `redirectUrl` (optional): URL to redirect to after payment.
- `buttonText` (optional): Text for the payment button (default: "Proceed to Payment").
- `showSummary` (optional): Whether to show a payment summary (default: true).

### PaymentForm

`PaymentForm` is a lower-level component that renders the Stripe payment elements:

```tsx
import { PaymentFormWrapper } from '@/components/payment/PaymentForm';

<PaymentFormWrapper
  clientSecret="pi_123_secret_456"
  amount={49.99}
  currency="USD"
  onPaymentSuccess={handleSuccess}
  onPaymentError={handleError}
/>
```

## Payment Flow

The standard payment flow works as follows:

1. User initiates checkout
2. Application creates a payment intent via the API
3. Stripe Elements form is displayed to collect payment details
4. User submits payment details
5. Payment is processed by Stripe
6. User is redirected to a confirmation page
7. Application receives webhook notification of the payment (in production)

## API Endpoints

### Create Payment Intent

```
POST /api/payments/intent
```

Request Body:
```json
{
  "amount": 49.99,
  "currency": "usd",
  "description": "Premium Membership",
  "metadata": {
    "itemName": "Premium Membership"
  }
}
```

Response:
```json
{
  "clientSecret": "pi_123_secret_456",
  "id": "pi_123456789"
}
```

### Confirm Payment Intent

```
PUT /api/payments
```

Request Body:
```json
{
  "payment_intent_id": "pi_123456789",
  "payment_method_id": "pm_123456789"
}
```

Response:
```json
{
  "status": "succeeded",
  "id": "pi_123456789"
}
```

### Get Payment History

```
GET /api/payments
```

Response:
```json
{
  "payments": [
    {
      "id": "pi_123456789",
      "amount": 4999,
      "currency": "usd",
      "status": "succeeded",
      "createdAt": "2023-05-01T12:00:00Z"
    }
  ]
}
```

## Testing Payments

For testing, use the Stripe test cards:

- **Success**: 4242 4242 4242 4242
- **Requires Authentication**: 4000 0025 0000 3155
- **Declined**: 4000 0000 0000 0002

Use any future date for expiration, any 3-digit CVC, and any postal code.

## Going to Production

Before going to production:

1. Replace test keys with live keys
2. Set up and test Stripe webhooks
3. Implement proper error handling and logging
4. Add additional security measures:
   - Ensure HTTPS is enabled
   - Implement idempotency keys for API requests
   - Add request rate limiting

### Webhooks

For production, set up Stripe webhooks to receive payment event notifications:

1. Go to the Stripe Dashboard > Developers > Webhooks
2. Add an endpoint pointing to your production URL
3. Select the events to listen for (e.g., `payment_intent.succeeded`, `payment_intent.payment_failed`)
4. Implement a webhook handler in your API

```
POST /api/webhooks/stripe
```

Remember to verify webhook signatures to prevent fraudulent requests. 