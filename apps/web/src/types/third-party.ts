export interface ServiceCredentials {
  apiKey?: string;
  apiSecret?: string;
  clientId?: string;
  clientSecret?: string;
  accessToken?: string;
  refreshToken?: string;
  endpoint?: string;
  domain?: string;
  appId?: string;
  dsn?: string;
}

export interface ServiceConfig {
  enabled: boolean;
  credentials: ServiceCredentials;
  timeout: number;
  retryAttempts: number;
  rateLimits?: {
    maxRequests: number;
    windowMs: number;
  };
}

export interface AnalyticsConfig extends ServiceConfig {
  service: 'google-analytics' | 'mixpanel' | 'segment';
  trackingId?: string;
  dataCollection: {
    pageViews: boolean;
    events: boolean;
    timing: boolean;
    exceptions: boolean;
  };
  sampling?: {
    rate: number;
    userIdBased: boolean;
  };
}

export interface PaymentConfig extends ServiceConfig {
  service: 'stripe' | 'paypal' | 'square';
  webhookSecret?: string;
  supportedCurrencies: string[];
  paymentMethods: ('card' | 'bank_transfer' | 'wallet')[];
  testMode: boolean;
}

export interface AuthConfig extends ServiceConfig {
  service: 'auth0' | 'firebase' | 'okta';
  domain?: string;
  callbackUrl?: string;
  providers: ('google' | 'facebook' | 'github' | 'apple')[];
  sessionDuration: number;
}

export interface StorageConfig extends ServiceConfig {
  service: 's3' | 'gcs' | 'azure-blob';
  bucket?: string;
  region?: string;
  cdn?: {
    enabled: boolean;
    domain?: string;
  };
  compression: boolean;
}

export interface MessagingConfig extends ServiceConfig {
  service: 'sendgrid' | 'twilio' | 'firebase-fcm';
  templates?: Record<string, string>;
  sender?: {
    email?: string;
    phone?: string;
    name?: string;
  };
  deliveryTracking: boolean;
}

export interface SearchConfig extends ServiceConfig {
  service: 'algolia' | 'elasticsearch' | 'meilisearch';
  indices: string[];
  replicas?: string[];
  searchableAttributes: string[];
  customRanking?: string[];
}

export interface LoggingConfig extends ServiceConfig {
  service: 'datadog' | 'sentry' | 'newrelic';
  environment: 'development' | 'staging' | 'production';
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  tags?: Record<string, string>;
}

export interface AIConfig extends ServiceConfig {
  service: 'openai' | 'cohere' | 'anthropic';
  models: string[];
  maxTokens?: number;
  temperature?: number;
  caching?: {
    enabled: boolean;
    ttl: number;
  };
}

export interface ThirdPartyConfig {
  analytics?: AnalyticsConfig;
  payment?: PaymentConfig;
  auth?: AuthConfig;
  storage?: StorageConfig;
  messaging?: MessagingConfig;
  search?: SearchConfig;
  logging?: LoggingConfig;
  ai?: AIConfig;
}
