export enum ApiVersion {
  V1 = 'v1',
  V2 = 'v2',
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: {
    version: ApiVersion;
    timestamp: string;
    [key: string]: any;
  };
}
