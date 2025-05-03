export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this?.name = 'AuthError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this?.name = 'ValidationError';
  }
}

export class APIError extends Error {
  public statusCode: number;
  public data?: any;

  constructor(message: string, statusCode: number = 500, data?: any) {
    super(message);
    this?.name = 'APIError';
    this?.statusCode = statusCode;
    this?.data = data;
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this?.name = 'NetworkError';
  }
}

export class PermissionError extends Error {
  constructor(message: string = 'Insufficient permissions') {
    super(message);
    this?.name = 'PermissionError';
  }
}

export class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this?.name = 'ConfigurationError';
  }
}

export class MFAError extends Error {
  constructor(message: string) {
    super(message);
    this?.name = 'MFAError';
  }
}

export class RateLimitError extends Error {
  public retryAfter?: number;

  constructor(message: string, retryAfter?: number) {
    super(message);
    this?.name = 'RateLimitError';
    this?.retryAfter = retryAfter;
  }
}

export class SessionError extends Error {
  constructor(message: string = 'Invalid or expired session') {
    super(message);
    this?.name = 'SessionError';
  }
}

export class TokenError extends Error {
  constructor(message: string = 'Invalid or expired token') {
    super(message);
    this?.name = 'TokenError';
  }
}
