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
),
  STRIPE_PUBLISHABLE_KEY: z.string().refine(val => val.startsWith('pk_'), {
    message: 'STRIPE_PUBLISHABLE_KEY must start with pk_'
),
  STRIPE_WEBHOOK_SECRET: z.string().refine(val => val.startsWith('whsec_'), {
    message: 'STRIPE_WEBHOOK_SECRET must start with whsec_'
),
  
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
),
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
// Process environment variables
function getValidatedEnv() {
  // In server components, we can use process.env directly
  // In client components, we should only use NEXT_PUBLIC_* variables
  
  try {
    if (typeof process === 'undefined') {
      throw new Error('process is not defined');
return envSchema.parse(process.env);
catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Invalid environment variables:', JSON.stringify(error.format(), null, 2));
      throw new Error('Invalid environment variables');
throw error;
export const env = getValidatedEnv();

// Type export for TypeScript
export type Env = z.infer<typeof envSchema>; 