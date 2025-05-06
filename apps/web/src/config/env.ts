import { z } from 'zod';

// Define environment schema with Zod for runtime validation
const envSchema = z.object({
  // App
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  
  // Database
  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().min(1),
  
  // Auth0
  AUTH0_SECRET: z.string().min(32),
  AUTH0_BASE_URL: z.string().url(),
  AUTH0_ISSUER_BASE_URL: z.string().url(),
  AUTH0_CLIENT_ID: z.string().min(1),
  AUTH0_CLIENT_SECRET: z.string().min(1),
  AUTH0_AUDIENCE: z.string().min(1),
  AUTH0_NAMESPACE: z.string().min(1),
  
  // Stripe
  STRIPE_SECRET_KEY: z.string().refine(val => val.startsWith('sk_'), {
    message: 'STRIPE_SECRET_KEY must start with sk_'
  }),
  STRIPE_PUBLISHABLE_KEY: z.string().refine(val => val.startsWith('pk_'), {
    message: 'STRIPE_PUBLISHABLE_KEY must start with pk_'
  }),
  STRIPE_WEBHOOK_SECRET: z.string().refine(val => val.startsWith('whsec_'), {
    message: 'STRIPE_WEBHOOK_SECRET must start with whsec_'
  }),
  
  // Security
  CORS_ORIGINS: z.string(),
  JWT_SECRET: z.string().min(32),
  ENCRYPTION_KEY: z.string().length(32),
  COOKIE_SECRET: z.string().min(32),
  CSRF_SECRET: z.string().min(32),
  
  // Redis
  REDIS_URL: z.string().min(1),
  
  // Rate limiting
  RATE_LIMIT_WINDOW: z.string().transform(val => parseInt(val, 10)),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(val => parseInt(val, 10)),
  
  // OpenAI
  OPENAI_API_KEY: z.string().refine(val => val.startsWith('sk-'), {
    message: 'OPENAI_API_KEY must start with sk-'
  }),
  CHAT_MODEL: z.string().default('gpt-3.5-turbo'),
  
  // WebAuthn
  WEBAUTHN_RP_ID: z.string().min(1),
  WEBAUTHN_ORIGIN: z.string().url(),
  
  // AWS S3
  AWS_ACCESS_KEY_ID: z.string().min(1).optional(),
  AWS_SECRET_ACCESS_KEY: z.string().min(1).optional(),
  AWS_REGION: z.string().min(1).optional(),
  AWS_BUCKET_NAME: z.string().min(1).optional(),
  
  // Content Security Policy
  CSP_IMG_SOURCES: z.string().optional(),
  CSP_CONNECT_SOURCES: z.string().optional(),
  CSP_MEDIA_SOURCES: z.string().optional(),
  
  // Analytics - New
  NEXT_PUBLIC_ANALYTICS_ID: z.string().min(1).optional(),
  ANALYTICS_API_KEY: z.string().min(1).optional(),
  ANALYTICS_API_SECRET: z.string().min(1).optional(),
  ANALYTICS_ENDPOINT: z.string().url().optional(),
  ANONYMIZE_IP: z.string().transform(val => val === 'true').optional().default('true'),
  ANALYTICS_SAMPLE_RATE: z.string().transform(val => parseFloat(val)).optional().default('1.0'),
  
  // A/B Testing - New
  NEXT_PUBLIC_ENABLE_AB_TESTING: z.string().transform(val => val === 'true').optional().default('true'),
  AB_TEST_STORAGE_MODE: z.enum(['local', 'session', 'database']).default('local'),
  AB_TEST_DEBUG_MODE: z.string().transform(val => val === 'true').optional().default('false'),
  
  // Social Sharing - New
  NEXT_PUBLIC_SHARE_APP_ID: z.string().optional(),
  NEXT_PUBLIC_FACEBOOK_APP_ID: z.string().optional(),
  NEXT_PUBLIC_TWITTER_HANDLE: z.string().optional(),
  QR_CODE_SERVICE_API_KEY: z.string().optional(),
  QR_CODE_SERVICE_URL: z.string().url().optional(),
  
  // User Preferences - New
  USER_PREFERENCES_SYNC_INTERVAL: z.string().transform(val => parseInt(val, 10)).optional().default('300000'), // 5 minutes in ms
  USER_PREFERENCES_STORAGE_MODE: z.enum(['local', 'database', 'hybrid']).default('hybrid'),
  
  // Virtual Try-On - New
  AR_API_ENDPOINT: z.string().url().optional(),
  AR_MODEL_BASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_AR_FEATURES_ENABLED: z.string().transform(val => val === 'true').optional().default('true'),
  
  // Upstash Redis for Rate Limiting - New
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
});

// Process environment variables
function getValidatedEnv() {
  // In server components, we can use process.env directly
  // In client components, we should only use NEXT_PUBLIC_* variables
  
  try {
    if (typeof process === 'undefined') {
      throw new Error('process is not defined');
    }
    
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Invalid environment variables:', JSON.stringify(error.format(), null, 2));
      throw new Error('Invalid environment variables');
    }
    throw error;
  }
}

export const env = getValidatedEnv();

// Type export for TypeScript
export type Env = z.infer<typeof envSchema>; 