# Vibewell Security Implementation

This document outlines the security measures implemented in the Vibewell application, focusing on HTTP security headers and rate limiting.

## Table of Contents

1. [HTTP Security Headers](#http-security-headers)
2. [Rate Limiting](#rate-limiting)
   - [In-Memory Rate Limiting](#in-memory-rate-limiting)
   - [Redis Rate Limiting](#redis-rate-limiting)
   - [Specialized Rate Limiters](#specialized-rate-limiters)
3. [Authentication & Authorization](#authentication--authorization)
4. [Data Protection](#data-protection)
5. [Best Practices](#best-practices)
6. [Environment Setup](#environment-setup)

## HTTP Security Headers

Security headers have been implemented in the middleware to protect against various web vulnerabilities:

```typescript
const securityHeaders = {
  'X-DNS-Prefetch-Control': 'on',
  'X-XSS-Protection': '1; mode=block',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://res.cloudinary.com; font-src 'self' data:; connect-src 'self' https://*.supabase.co; frame-src 'self' https://js.stripe.com; object-src 'none'; base-uri 'self';",
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self), interest-cohort=()',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload'
};
```

### Header Explanations

| Header                     | Purpose                                                     |
|----------------------------|-------------------------------------------------------------|
| X-DNS-Prefetch-Control     | Controls browser DNS prefetching                            |
| X-XSS-Protection           | Enables XSS filtering in supported browsers                 |
| X-Frame-Options            | Prevents clickjacking by restricting framing                |
| X-Content-Type-Options     | Prevents MIME-type sniffing                                 |
| Referrer-Policy            | Controls how much referrer information is included          |
| Content-Security-Policy    | Restricts resources the browser can load                    |
| Permissions-Policy         | Controls browser feature permissions                        |
| Strict-Transport-Security  | Enforces HTTPS connections                                  |

## Rate Limiting

Rate limiting has been implemented to prevent abuse of API endpoints with multiple strategies:

### In-Memory Rate Limiting

Used for development and as a fallback if Redis is unavailable:

```typescript
const rateLimit = {
  windowMs: 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per windowMs
  store: new Map(),
};
```

### Redis Rate Limiting

For production environments, distributed rate limiting with Redis:

```typescript
// Create Redis-backed rate limiter
export function createRedisRateLimiter(options: RedisRateLimitOptions = {}) {
  // Options include windowMs, max, message, keyPrefix
  // Implementation details...
}
```

### Specialized Rate Limiters

Different rate limiters for various types of endpoints:

| Rate Limiter Type         | Window | Max Requests | Purpose                                       |
|---------------------------|--------|--------------|-----------------------------------------------|
| API Rate Limiter          | 1 min  | 60           | General API usage                             |
| Auth Rate Limiter         | 15 min | 10           | Login attempts                                |
| Sensitive API Limiter     | 1 hour | 30           | Sensitive operations                          |
| Password Reset Limiter    | 1 hour | 3            | Password reset attempts                       |
| Signup Rate Limiter       | 24 hrs | 5            | New account creation                          |
| Token Rate Limiter        | 1 min  | 5            | API token generation                          |
| Financial Rate Limiter    | 1 hour | 10           | Payment and financial operations              |
| Admin Rate Limiter        | 5 min  | 30           | Admin panel operations                        |

Implementation example for a sensitive endpoint:

```typescript
// Apply specialized rate limiting for password reset
const rateLimitResponse = await applyRateLimit(req, passwordResetRateLimiter);
if (rateLimitResponse) {
  return rateLimitResponse; // Rate limit exceeded
}
```

## Authentication & Authorization

Security in the authentication system:

1. **Supabase Authentication**: Leveraging Supabase for secure authentication
2. **Role-Based Access Control**: User roles (customer, provider, admin)
3. **Protected Routes**: Middleware checks for authentication and authorization
4. **Multi-Factor Authentication (MFA)**: Optional MFA for sensitive accounts

## Data Protection

1. **Input Validation**: Using Zod schema validation for request data
2. **XSS Protection**: Content Security Policy and input sanitization
3. **CSRF Protection**: Supabase tokens provide CSRF protection
4. **Database Security**: Row-level security policies in Supabase

## Best Practices

- **Environment Variables**: Sensitive information stored in environment variables
- **Principle of Least Privilege**: Users only have access to what they need
- **Secure Password Storage**: Passwords are hashed and never stored in plaintext
- **Regular Security Testing**: XSS and other vulnerability tests
- **Error Handling**: Generic error messages that don't reveal sensitive information
- **Logging**: Security-related events are logged but sensitive data is redacted

## Environment Setup

For production environments, you need to set up Redis for distributed rate limiting:

1. Add the following environment variables to your `.env.production` file:

```
# Redis configuration for rate limiting
REDIS_URL=redis://username:password@your-redis-server:6379
```

2. Deploy with Redis:
   - For AWS: Use ElastiCache for Redis
   - For Vercel: Use Upstash or Redis Enterprise Cloud
   - For self-hosted: Configure Redis with proper authentication and TLS

3. Ensure Redis Connection Health:
   - The application will automatically fall back to in-memory rate limiting if Redis connection fails
   - Monitor Redis connection health in your logging infrastructure

## Recommendations for Further Improvements

1. **Redis for Rate Limiting**: In production, use Redis instead of in-memory storage for rate limiting
2. **Web Application Firewall (WAF)**: Consider implementing a WAF like AWS WAF or Cloudflare
3. **Regular Security Audits**: Conduct regular security assessments
4. **Security Headers Monitoring**: Use tools like Mozilla Observatory to monitor security headers
5. **Dependency Scanning**: Regularly scan and update dependencies with security vulnerabilities 