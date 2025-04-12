# API Security Documentation

## Overview
This document outlines the security measures implemented in the Vibewell API, including authentication, rate limiting, request validation, and other security features.

## Authentication

### JWT Authentication
- All API endpoints require JWT authentication
- Tokens expire after 1 hour
- Refresh tokens are provided for token renewal
- Tokens are signed with a secure secret key

### Authentication Flow
1. Client sends credentials to `/api/auth/login`
2. Server validates credentials and returns JWT
3. Client includes JWT in Authorization header
4. Server validates JWT on each request

### Authorization Header
```
Authorization: Bearer <jwt_token>
```

## Rate Limiting

### Configuration
- Default: 100 requests per minute per IP
- Burst protection: 20 requests per 10 seconds
- Custom limits for specific endpoints
- Rate limit headers included in responses

### Rate Limit Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1625097600
```

### Error Response
```json
{
  "error": "Too many requests, please try again later.",
  "retryAfter": 60
}
```

## Request Validation

### Content Type
- All requests must have `Content-Type: application/json`
- File uploads use `multipart/form-data`

### Request Size
- Maximum request size: 1MB
- File uploads: 10MB maximum

### Input Validation
- All input is sanitized
- SQL injection prevention
- XSS protection
- CSRF protection

## Security Headers

### Response Headers
```
Content-Security-Policy: default-src 'self'
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

## Error Handling

### Standard Error Format
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {
      "field": "Additional error details"
    }
  }
}
```

### Common Error Codes
- `AUTH_REQUIRED`: Authentication required
- `INVALID_TOKEN`: Invalid or expired token
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INVALID_INPUT`: Invalid request data
- `NOT_FOUND`: Resource not found
- `FORBIDDEN`: Insufficient permissions

## Endpoint Security

### Public Endpoints
- `/api/auth/login`
- `/api/auth/register`
- `/api/auth/refresh`
- `/api/public/*`

### Protected Endpoints
- All other endpoints require authentication
- Role-based access control
- Resource-level permissions

## Data Protection

### Encryption
- TLS 1.3 for all communications
- Data encryption at rest
- Secure key management
- Encrypted sensitive fields

### Data Validation
- Input sanitization
- Output encoding
- Parameter validation
- Query validation

## Monitoring

### Logging
- Access logs
- Error logs
- Security logs
- Performance logs

### Metrics
- Request rate
- Error rate
- Response time
- Resource usage

## Best Practices

### Client Implementation
1. Always use HTTPS
2. Store tokens securely
3. Implement token refresh
4. Handle rate limits
5. Validate responses

### Security Headers
1. Include all security headers
2. Use secure cookies
3. Implement CORS properly
4. Set appropriate cache headers
5. Use secure redirects

### Error Handling
1. Don't expose sensitive information
2. Use appropriate status codes
3. Include helpful error messages
4. Log errors appropriately
5. Monitor error rates

## Compliance

### GDPR
- Data protection
- User consent
- Data portability
- Right to be forgotten

### PCI DSS
- Secure payment processing
- Card data protection
- Access controls
- Monitoring and logging 