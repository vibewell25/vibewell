/**
 * Environment Variable Handling
 * 
 * This utility provides a type-safe way to access environment variables
 * with validation, default values, and documentation.
 */

/**
 * Environment configuration with validation
 */
interface EnvConfig {
  /**
   * Environment variable name
   */
  name: string;
  
  /**
   * Default value to use if environment variable is not set
   */
  defaultValue?: string;
  
  /**
   * Whether the environment variable is required
   */
  required?: boolean;
  
  /**
   * Regular expression to validate the environment variable
   */
  format?: RegExp;
  
  /**
   * Description of the environment variable
   */
  description: string;
  
  /**
   * Error message to show if validation fails
   */
  errorMessage?: string;
  
  /**
   * Process-specific environment variable
   * (i.e., only used in specific process like server/build)
   */
  processType?: 'server' | 'client' | 'build';
}

/**
 * Environment categories
 */
export enum EnvCategory {
  API = 'API Settings',
  AUTH = 'Authentication',
  DATABASE = 'Database Settings',
  STORAGE = 'Storage & Media',
  SERVICES = 'External Services',
  ANALYTICS = 'Analytics & Monitoring',
  FEATURES = 'Feature Flags',
  DEPLOYMENT = 'Deployment Settings',
}

/**
 * Complete environment configuration with validation
 */
const ENV_CONFIG: Record<string, { category: EnvCategory; config: EnvConfig }> = {
  // API Settings
  API_URL: {
    category: EnvCategory.API,
    config: {
      name: 'NEXT_PUBLIC_API_URL',
      defaultValue: '/api',
      description: 'Base URL for API requests',
      format: /^(\/[a-z0-9-]+|https?:\/\/.+)$/i,
      errorMessage: 'API_URL must be a valid URL or path starting with /',
    },
  },
  API_TIMEOUT: {
    category: EnvCategory.API,
    config: {
      name: 'API_TIMEOUT',
      defaultValue: '30000',
      description: 'API request timeout in milliseconds',
      format: /^\d+$/,
      errorMessage: 'API_TIMEOUT must be a number',
    },
  },
  
  // Authentication
  AUTH_SECRET: {
    category: EnvCategory.AUTH,
    config: {
      name: 'AUTH_SECRET',
      required: true,
      description: 'Secret key for authentication (JWT, cookies, etc.)',
      processType: 'server',
    },
  },
  AUTH_PROVIDER: {
    category: EnvCategory.AUTH,
    config: {
      name: 'NEXT_PUBLIC_AUTH_PROVIDER',
      defaultValue: 'credentials',
      description: 'Authentication provider (credentials, oauth, etc.)',
    },
  },
  
  // Database
  DATABASE_URL: {
    category: EnvCategory.DATABASE,
    config: {
      name: 'DATABASE_URL',
      required: true,
      description: 'PostgreSQL connection string',
      format: /^postgres(ql)?:\/\/.+/i,
      errorMessage: 'DATABASE_URL must be a valid PostgreSQL connection string',
      processType: 'server',
    },
  },
  DATABASE_POOL_SIZE: {
    category: EnvCategory.DATABASE,
    config: {
      name: 'DATABASE_POOL_SIZE',
      defaultValue: '10',
      description: 'Maximum number of connections in the database pool',
      format: /^\d+$/,
      errorMessage: 'DATABASE_POOL_SIZE must be a number',
      processType: 'server',
    },
  },
  
  // Storage
  UPLOAD_DIR: {
    category: EnvCategory.STORAGE,
    config: {
      name: 'UPLOAD_DIR',
      defaultValue: './uploads',
      description: 'Directory path for file uploads',
      processType: 'server',
    },
  },
  S3_BUCKET: {
    category: EnvCategory.STORAGE,
    config: {
      name: 'S3_BUCKET',
      description: 'AWS S3 bucket name for file storage',
      processType: 'server',
    },
  },
  
  // Analytics & Monitoring
  ANALYTICS_ID: {
    category: EnvCategory.ANALYTICS,
    config: {
      name: 'NEXT_PUBLIC_ANALYTICS_ID',
      description: 'Analytics tracking ID',
    },
  },
  SENTRY_DSN: {
    category: EnvCategory.ANALYTICS,
    config: {
      name: 'NEXT_PUBLIC_SENTRY_DSN',
      description: 'Sentry DSN for error tracking',
    },
  },
  
  // Feature Flags
  FEATURE_BOOKING: {
    category: EnvCategory.FEATURES,
    config: {
      name: 'NEXT_PUBLIC_FEATURE_BOOKING',
      defaultValue: 'true',
      description: 'Enable booking features',
      format: /^(true|false)$/i,
      errorMessage: 'FEATURE_BOOKING must be true or false',
    },
  },
  FEATURE_COMMUNITY: {
    category: EnvCategory.FEATURES,
    config: {
      name: 'NEXT_PUBLIC_FEATURE_COMMUNITY',
      defaultValue: 'true',
      description: 'Enable community features',
      format: /^(true|false)$/i,
      errorMessage: 'FEATURE_COMMUNITY must be true or false',
    },
  },
  
  // External Services
  STRIPE_SECRET_KEY: {
    category: EnvCategory.SERVICES,
    config: {
      name: 'STRIPE_SECRET_KEY',
      description: 'Stripe API secret key',
      processType: 'server',
    },
  },
  STRIPE_PUBLIC_KEY: {
    category: EnvCategory.SERVICES,
    config: {
      name: 'NEXT_PUBLIC_STRIPE_PUBLIC_KEY',
      description: 'Stripe API publishable key',
    },
  },
  
  // Deployment Settings
  NODE_ENV: {
    category: EnvCategory.DEPLOYMENT,
    config: {
      name: 'NODE_ENV',
      defaultValue: 'development',
      description: 'Node environment (development, production, test)',
      format: /^(development|production|test)$/i,
      errorMessage: 'NODE_ENV must be development, production, or test',
    },
  },
  PORT: {
    category: EnvCategory.DEPLOYMENT,
    config: {
      name: 'PORT',
      defaultValue: '3000',
      description: 'Port to run the server on',
      format: /^\d+$/,
      errorMessage: 'PORT must be a number',
      processType: 'server',
    },
  },
};

/**
 * Get an environment variable
 * 
 * @param key Key from the ENV_CONFIG object
 * @returns The environment variable value
 */
export function getEnv(key: keyof typeof ENV_CONFIG): string {
  const { config } = ENV_CONFIG[key];
  
  // Check if the variable is accessible in the current environment
  if (
    config.processType === 'server' && 
    typeof window !== 'undefined' &&
    process.env.NODE_ENV === 'production'
  ) {
    throw new Error(`Environment variable ${config.name} is server-only and cannot be accessed client-side`);
  }
  
  // Get the value
  const value = process.env[config.name] || config.defaultValue;
  
  // Check if required
  if (config.required && !value) {
    throw new Error(`Required environment variable ${config.name} is not set`);
  }
  
  // Validate format
  if (value && config.format && !config.format.test(value)) {
    throw new Error(config.errorMessage || `Environment variable ${config.name} has invalid format`);
  }
  
  return value || '';
}

/**
 * Check if an environment variable is set to true
 * 
 * @param key Key from the ENV_CONFIG object
 * @returns Boolean indicating if the environment variable is true
 */
export function isEnvEnabled(key: keyof typeof ENV_CONFIG): boolean {
  const value = getEnv(key).toLowerCase();
  return value === 'true' || value === '1';
}

/**
 * Get all environment variables for a category
 * 
 * @param category Environment category
 * @returns Object with environment variables
 */
export function getEnvByCategory(category: EnvCategory): Record<string, string> {
  const result: Record<string, string> = {};
  
  Object.entries(ENV_CONFIG)
    .filter(([_, { category: cat }]) => cat === category)
    .forEach(([key, _]) => {
      try {
        result[key] = getEnv(key as keyof typeof ENV_CONFIG);
      } catch (error) {
        console.warn(`Error getting environment variable ${key}: ${error.message}`);
      }
    });
    
  return result;
}

/**
 * Validate all environment variables
 * 
 * @returns Object with validation results
 */
export function validateEnv(): {
  valid: boolean;
  errors: Array<{ key: string; error: string }>;
} {
  const errors: Array<{ key: string; error: string }> = [];
  
  Object.keys(ENV_CONFIG).forEach((key) => {
    try {
      getEnv(key as keyof typeof ENV_CONFIG);
    } catch (error) {
      errors.push({ key, error: error.message });
    }
  });
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

// Convenience exports for common environment variables
export const API_URL = getEnv('API_URL');
export const NODE_ENV = getEnv('NODE_ENV');
export const IS_PRODUCTION = NODE_ENV === 'production';
export const IS_DEVELOPMENT = NODE_ENV === 'development';
export const IS_TEST = NODE_ENV === 'test'; 