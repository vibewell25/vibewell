# Stripe Payment Integration Guide for VibeWell

This guide provides step-by-step instructions for setting up Stripe payment processing for the VibeWell platform in a production environment.

## Prerequisites

- Stripe account
- Access to the VibeWell production environment
- Node.js and npm installed

## Step 1: Stripe Account Setup

1. Create a [Stripe Account](https://dashboard.stripe.com/register)
2. Complete the account verification process
3. Switch to Live mode when ready for production

## Step 2: Get API Keys

1. Go to Developers > API Keys in your Stripe Dashboard
2. Note down:
   - Publishable Key
   - Secret Key

## Step 3: Configure Environment Variables

1. Update your production environment variables:
   ```
   STRIPE_PUBLISHABLE_KEY=your_publishable_key
   STRIPE_SECRET_KEY=your_secret_key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_publishable_key
   ```

## Step 4: Run Setup Script

1. Run the Stripe setup script:
   ```bash
   npm run setup:stripe
   ```

   This script will:
   - Test the Stripe connection
   - Set up webhook endpoints
   - Create test products (in development)
   - Provide webhook signing secrets

2. Add the webhook secret to your environment:
   ```
   STRIPE_WEBHOOK_SECRET=your_webhook_secret
   ```

## Step 5: Configure Webhooks

1. Verify webhook endpoints in Stripe Dashboard:
   - Go to Developers > Webhooks
   - Confirm endpoints are active
   - Test webhook delivery

2. Configure webhook event handling:
   - Review webhook handlers in `src/app/api/webhooks/stripe/route.ts`
   - Test each event type
   - Implement error handling

## Step 6: Test Payment Flow

1. Test basic payment:
   ```javascript
   // Create payment intent
   const paymentIntent = await stripe.paymentIntents.create({
     amount: 2000, // $20.00
     currency: 'usd',
   });
   ```

2. Test subscription:
   ```javascript
   // Create subscription
   const subscription = await stripe.subscriptions.create({
     customer: customerId,
     items: [{ price: priceId }],
   });
   ```

## Step 7: Security Considerations

1. Data Security:
   - Never log full card details
   - Use Stripe Elements for secure input
   - Implement proper error handling

2. Authentication:
   - Secure webhook endpoints
   - Validate webhook signatures
   - Implement rate limiting

3. PCI Compliance:
   - Use Stripe.js
   - Don't store card data
   - Follow security best practices

## Step 8: Monitoring

1. Set up Stripe Dashboard monitoring:
   - Monitor transactions
   - Track failed payments
   - Set up alerts

2. Configure logging:
   - Log payment events
   - Monitor webhook delivery
   - Track error rates

## Step 9: Testing

1. Test payment scenarios:
   - Successful payments
   - Failed payments
   - Refunds
   - Subscriptions
   - Webhook events

2. Test error handling:
   - Invalid cards
   - Network errors
   - Webhook failures

## Step 10: Go Live

1. Final checklist:
   - Switch to live API keys
   - Update webhook endpoints
   - Test live mode
   - Monitor transactions

## Troubleshooting

### Common Issues

1. Payment Failures:
   - Check API keys
   - Verify webhook configuration
   - Check error logs

2. Webhook Issues:
   - Verify endpoint URLs
   - Check signing secrets
   - Monitor webhook logs

3. Integration Issues:
   - Review Stripe.js setup
   - Check Elements configuration
   - Verify event handling

### Support

For additional support:
1. Check [Stripe Documentation](https://stripe.com/docs)
2. Contact VibeWell support team
3. Review Stripe support forums

## Maintenance

1. Regular Updates:
   - Keep dependencies updated
   - Monitor API version changes
   - Update webhook configurations

2. Security:
   - Rotate API keys
   - Update webhook secrets
   - Review security settings

3. Monitoring:
   - Track payment success rates
   - Monitor webhook delivery
   - Review error logs

## Best Practices

1. Error Handling:
   - Implement proper error messages
   - Log payment failures
   - Handle edge cases

2. User Experience:
   - Clear payment forms
   - Helpful error messages
   - Smooth checkout flow

3. Testing:
   - Regular integration tests
   - Webhook testing
   - Error scenario testing 