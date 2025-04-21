import { ApiVersion, ApiResponse } from '@/types/api';

export interface ApiEndpointDoc {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  version: ApiVersion;
  description: string;
  rateLimits?: {
    requestsPerMinute: number;
    burstLimit?: number;
  };
  auth?: {
    required: boolean;
    type?: 'Bearer' | 'Basic' | 'ApiKey';
  };
  parameters?: {
    query?: Record<
      string,
      {
        type: string;
        required: boolean;
        description: string;
      }
    >;
    body?: Record<
      string,
      {
        type: string;
        required: boolean;
        description: string;
      }
    >;
  };
  responses: {
    [statusCode: string]: {
      description: string;
      schema: any;
    };
  };
}

export const API_DOCUMENTATION: Record<string, ApiEndpointDoc> = {
  health: {
    path: '/api/health',
    method: 'GET',
    version: ApiVersion.V1,
    description: 'Check API health status',
    rateLimits: {
      requestsPerMinute: 60,
    },
    auth: {
      required: false,
    },
    responses: {
      '200': {
        description: 'API is healthy',
        schema: {
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['healthy'] },
            uptime: { type: 'number' },
          },
        },
      },
    },
  },
  auth: {
    path: '/api/auth',
    method: 'POST',
    version: ApiVersion.V1,
    description: 'Authenticate user and get access token',
    rateLimits: {
      requestsPerMinute: 5,
      burstLimit: 3,
    },
    auth: {
      required: false,
    },
    parameters: {
      body: {
        email: {
          type: 'string',
          required: true,
          description: 'User email address',
        },
        password: {
          type: 'string',
          required: true,
          description: 'User password',
        },
      },
    },
    responses: {
      '200': {
        description: 'Authentication successful',
        schema: {
          type: 'object',
          properties: {
            token: { type: 'string' },
            expiresIn: { type: 'number' },
          },
        },
      },
      '401': {
        description: 'Authentication failed',
        schema: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
  },
};

/**
 * Get documentation for a specific endpoint
 */
export function getEndpointDocs(path: string): ApiEndpointDoc | undefined {
  return API_DOCUMENTATION[path];
}

/**
 * Get all API documentation
 */
export function getAllApiDocs(): Record<string, ApiEndpointDoc> {
  return API_DOCUMENTATION;
}

/**
 * Get documentation for endpoints of a specific version
 */
export function getVersionDocs(version: ApiVersion): Record<string, ApiEndpointDoc> {
  return Object.entries(API_DOCUMENTATION).reduce(
    (acc, [key, doc]) => {
      if (doc.version === version) {
        acc[key] = doc;
      }
      return acc;
    },
    {} as Record<string, ApiEndpointDoc>
  );
}
