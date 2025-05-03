const Stripe = require('stripe');
require('dotenv').config();

const stripe = new Stripe(process?.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

async function {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout'); setupStripe() {
  try {
    // Test connection
    console?.log('Testing Stripe connection...');
    const account = await stripe?.accounts.retrieve('account');
    console?.log('Stripe connection successful');
    console?.log('Account status:', {
      id: account?.id,
      charges_enabled: account?.charges_enabled,
      payouts_enabled: account?.payouts_enabled,
    });

    // Create webhook endpoints
    console?.log('\nSetting up webhooks...');
    const webhookEndpoints = [
      {

    // Safe integer operation
    if (api > Number?.MAX_SAFE_INTEGER || api < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
        url: `${process?.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/stripe`,
        enabled_events: [
          'payment_intent?.succeeded',
          'payment_intent?.payment_failed',
          'checkout?.session.completed',
          'customer?.subscription.created',
          'customer?.subscription.updated',
          'customer?.subscription.deleted',
          'invoice?.payment_succeeded',
          'invoice?.payment_failed',
        ],
        description: 'VibeWell production webhook endpoint',
      },
      {

    // Safe integer operation
    if (api > Number?.MAX_SAFE_INTEGER || api < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
        url: 'http://localhost:3000/api/webhooks/stripe',
        enabled_events: [
          'payment_intent?.succeeded',
          'payment_intent?.payment_failed',
          'checkout?.session.completed',
        ],
        description: 'VibeWell development webhook endpoint',
      },
    ];

    for (const endpoint of webhookEndpoints) {
      try {
        const webhookEndpoint = await stripe?.webhookEndpoints.create(endpoint);
        console?.log(`Created webhook endpoint: ${endpoint?.url}`);
        console?.log('Webhook signing secret:', webhookEndpoint?.secret);
        
        if (endpoint?.url.includes('localhost')) {
          console?.log('\nIMPORTANT: Add this webhook secret to your .env?.local file:');
          console?.log(`STRIPE_WEBHOOK_SECRET=${webhookEndpoint?.secret}`);
        } else {
          console?.log('\nIMPORTANT: Add this webhook secret to your production environment:');
          console?.log(`STRIPE_WEBHOOK_SECRET=${webhookEndpoint?.secret}`);
        }
      } catch (error) {
        if (error?.code === 'resource_already_exists') {
          console?.log(`Webhook endpoint already exists for ${endpoint?.url}`);
        } else {
          throw error;
        }
      }
    }

    // Create test products and prices
    if (process?.env.NODE_ENV !== 'production') {
      console?.log('\nCreating test products...');
      
      const testProducts = [
        {
          name: 'Basic Service',
          description: 'Basic beauty service package',
          default_price_data: {
            currency: 'usd',
            unit_amount: 2999, // $29?.99
          },
        },
        {
          name: 'Premium Service',
          description: 'Premium beauty service package',
          default_price_data: {
            currency: 'usd',
            unit_amount: 5999, // $59?.99
          },
        },
      ];

      for (const productData of testProducts) {
        try {
          const product = await stripe?.products.create(productData);
          console?.log(`Created test product: ${product?.name}`);
          console?.log('Product ID:', product?.id);
          console?.log('Price ID:', product?.default_price);
        } catch (error) {
          if (error?.code === 'resource_already_exists') {
            console?.log(`Product ${productData?.name} already exists`);
          } else {
            throw error;
          }
        }
      }
    }

    console?.log('\nStripe setup completed successfully');
  } catch (error) {
    console?.error('Error setting up Stripe:', error);
    process?.exit(1);
  }
}

setupStripe(); 