import type { ThirdPartyConfig } from '../types/third-party';

export const THIRD_PARTY_CONFIG: ThirdPartyConfig = {
  analytics: {
    enabled: process.env['ANALYTICS_ENABLED'] === 'true',
    service: 'google-analytics',
    trackingId: process.env['GA_TRACKING_ID'],
    credentials: {
      apiKey: process.env['GA_API_KEY']
    },
    timeout: 5000,
    retryAttempts: 3,
    dataCollection: {
      pageViews: true,
      events: true,
      timing: true,
      exceptions: true
    },
    sampling: {
      rate: 1.0,
      userIdBased: false
    }
  },

  payment: {
    enabled: process.env['PAYMENT_ENABLED'] === 'true',
    service: 'stripe',
    credentials: {
      apiKey: process.env['STRIPE_SECRET_KEY'],
      apiSecret: process.env['STRIPE_WEBHOOK_SECRET']
    },
    timeout: 10000,
    retryAttempts: 3,
    supportedCurrencies: ['USD', 'EUR', 'GBP'],
    paymentMethods: ['card', 'bank_transfer'],
    testMode: process.env['NODE_ENV'] !== 'production'
  },

  auth: {
    enabled: process.env['AUTH_ENABLED'] === 'true',
    service: 'auth0',
    credentials: {
      clientId: process.env['AUTH0_CLIENT_ID'],
      clientSecret: process.env['AUTH0_CLIENT_SECRET'],
      domain: process.env['AUTH0_DOMAIN']
    },
    timeout: 5000,
    retryAttempts: 2,
    providers: ['google', 'github'],
    sessionDuration: 86400, // 24 hours in seconds
    callbackUrl: process.env['AUTH0_CALLBACK_URL']
  },

  storage: {
    enabled: process.env['STORAGE_ENABLED'] === 'true',
    service: 's3',
    credentials: {
      apiKey: process.env['AWS_ACCESS_KEY_ID'],
      apiSecret: process.env['AWS_SECRET_ACCESS_KEY']
    },
    timeout: 15000,
    retryAttempts: 3,
    bucket: process.env['S3_BUCKET'],
    region: process.env['AWS_REGION'],
    cdn: {
      enabled: process.env['CDN_ENABLED'] === 'true',
      domain: process.env['CDN_DOMAIN']
    },
    compression: true
  },

  messaging: {
    enabled: process.env['MESSAGING_ENABLED'] === 'true',
    service: 'sendgrid',
    credentials: {
      apiKey: process.env['SENDGRID_API_KEY']
    },
    timeout: 5000,
    retryAttempts: 3,
    templates: {
      welcome: process.env['SENDGRID_WELCOME_TEMPLATE'],
      resetPassword: process.env['SENDGRID_RESET_PASSWORD_TEMPLATE']
    },
    sender: {
      email: process.env['SENDER_EMAIL'],
      name: process.env['SENDER_NAME']
    },
    deliveryTracking: true
  },

  search: {
    enabled: process.env['SEARCH_ENABLED'] === 'true',
    service: 'algolia',
    credentials: {
      apiKey: process.env['ALGOLIA_API_KEY'],
      clientId: process.env['ALGOLIA_APP_ID']
    },
    timeout: 3000,
    retryAttempts: 2,
    indices: ['products', 'articles'],
    searchableAttributes: ['title', 'description', 'tags'],
    customRanking: ['desc(popularity)', 'desc(rating)']
  },

  logging: {
    enabled: process.env['LOGGING_ENABLED'] === 'true',
    service: 'sentry',
    credentials: {
      apiKey: process.env['SENTRY_DSN']
    },
    timeout: 2000,
    retryAttempts: 1,
    environment: (process.env['NODE_ENV'] as 'development' | 'staging' | 'production') || 'development',
    logLevel: (process.env['LOG_LEVEL'] as 'error' | 'warn' | 'info' | 'debug') || 'error',
    tags: {
      app: 'vibewell',
      version: process.env['APP_VERSION'] || '1.0.0'
    }
  },

  ai: {
    enabled: process.env['AI_ENABLED'] === 'true',
    service: 'openai',
    credentials: {
      apiKey: process.env['OPENAI_API_KEY']
    },
    timeout: 30000,
    retryAttempts: 2,
    models: ['gpt-4', 'gpt-3.5-turbo'],
    maxTokens: 2048,
    temperature: 0.7,
    caching: {
      enabled: true,
      ttl: 3600 // 1 hour in seconds
    }
  }
}; 