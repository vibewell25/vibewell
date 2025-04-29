# VibeWell Security Best Practices

This guide outlines security best practices for developing, deploying, and maintaining the VibeWell platform. Following these guidelines will help protect user data and maintain the integrity of the platform.

## Authentication & Authorization

### User Authentication
- Use Auth0 for all user authentication flows
- Implement multi-factor authentication (MFA) for administrative accounts
- Set appropriate token expiration times (recommended: 1-2 hours)
- Implement proper token refresh mechanisms
- Use HTTPS for all authentication endpoints

### Authorization
- Implement role-based access control (RBAC) consistently
- Apply principle of least privilege for all user roles
- Validate permissions on both client and server side
- Never trust client-side authorization checks alone
- Regularly audit user roles and permissions

## Data Protection

### Sensitive Data Handling
- Never store plaintext passwords or sensitive credentials
- Use environment variables for all sensitive configuration
- Implement data encryption at rest for sensitive information
- Use secure methods for data transmission (HTTPS, TLS)
- Mask or truncate sensitive data in logs

### Database Security
- Use parameterized queries to prevent SQL injection
- Implement database connection pooling with limits
- Keep database credentials secure and routinely rotated
- Back up databases regularly and test restoration procedures
- Limit database user permissions to only what's necessary

### File Storage Security
- Set proper access controls on AWS S3 buckets
- Implement signed URLs with short expiration times for file access
- Scan uploaded files for malware
- Validate file types, sizes, and content before storage
- Generate random, unpredictable filenames for stored content

## API Security

### Endpoint Protection
- Implement rate limiting for all API endpoints
- Use proper HTTP methods for operations (GET, POST, PUT, DELETE)
- Return appropriate HTTP status codes
- Validate all input data on the server
- Implement comprehensive error handling that doesn't leak information

### Protection Against Common Attacks
- Implement CSRF protection for all forms
- Use Content Security Policy (CSP) headers
- Enable XSS protection headers
- Implement proper CORS policies
- Use HSTS headers for HTTPS enforcement

## Security Scanning

- **Automated CI/CD scans**: npm audit, ESLint security rules, Snyk, OWASP ZAP on pushes, PRs, and schedules.
- **Middleware checks**: CSP, XSS, rate limiting, clickjacking protections via `src/middleware/security`.

## Security Standardization

- **Authentication**: unified auth context and RBAC (`src/contexts/unified-auth-context.tsx`, `src/hooks/use-unified-auth.ts`).
- **CSRF Protection**: custom HMAC-SHA256 tokens (`src/middleware/security/csrf.ts`).
- **Rate Limiting**: IP-based limits and headers (`src/middleware/security/index.ts`).
- **Security Headers**: CSP, HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy.
- **Input Validation & Encryption**: Zod schemas, AES-256-CBC field-level encryption.

## Security Testing

- **Scope**: auth flows, RBAC, input validation, APIs, client-side, AR components.
- **Tools**: ESLint security plugins, SonarQube, OWASP ZAP, Burp Suite.
- **Checklist**: CSRF tokens, rate limiting, header presence, SQL/NoSQL injection, XSS, dependency scans.

## Recent Security Updates

- **Web3 Removal**: replaced `@walletconnect/web3-provider` with `ethers.js`.
- **HTTP Client Migration**: `node-fetch` → `axios` in tests.
- **Redis Mock**: improved ioredis-mock coverage.
- **Custom CSRF**: integrated secure CSRF tokens middleware.
- **Dependencies**: all vulnerabilities fixed via `npm audit fix`.

## API Security

- **JWT**: auth flows, refresh tokens, expiration, secure signing.
- **Rate Limiting**: 100 req/min default, burst protection, headers.
- **Validation**: input sanitization, size limits, error formats.
- **Headers**: CSP, X-Frame-Options, HSTS, Referrer-Policy, Permissions-Policy.

## Code Security

### Secure Development Practices
- Follow secure coding guidelines
- Conduct regular code reviews with security focus
- Use static analysis tools to identify vulnerabilities
- Keep dependencies up to date with vulnerability scanning
- Implement security linting rules

### Dependency Management
- Regularly update all dependencies
- Use `npm audit` or equivalent to check for vulnerabilities
- Pin dependency versions to prevent unexpected updates
- Remove unused dependencies
- Consider using a lockfile for consistent builds

## Infrastructure Security

### Server/Serverless Security
- Keep all server environments patched and updated
- Limit server access to necessary personnel only
- Use firewalls and security groups to control access
- Monitor server logs for suspicious activity
- Implement proper user access controls on servers

### Cloud Security
- Follow AWS security best practices
- Use IAM roles with least privilege principles
- Enable AWS CloudTrail for auditing
- Encrypt data in transit and at rest
- Regularly review and audit cloud resources

## Monitoring & Incident Response

### Security Monitoring
- Implement logging for security-relevant events
- Set up alerts for suspicious activities
- Monitor authentication failures
- Use tools like Sentry for error monitoring
- Regularly review security logs

### Incident Response
- Create an incident response plan
- Define roles and responsibilities during a security incident
- Document steps for containment, eradication, and recovery
- Establish communication procedures during incidents
- Conduct post-incident reviews

## Compliance

### Data Privacy
- Implement GDPR compliance measures
- Create clear privacy policies
- Provide data export and deletion capabilities for users
- Limit data collection to what's necessary
- Implement data retention policies

### Health Information
- Ensure HIPAA compliance for all health-related data
- Implement additional security for health information
- Create Business Associate Agreements when necessary
- Train developers on health data regulations
- Conduct regular HIPAA compliance assessments

## Deployment Security

### CI/CD Security
- Secure your CI/CD pipelines
- Scan code during the build process
- Use secrets management for deployment credentials
- Implement proper access controls for deployment systems
- Verify deployment integrity

### Production Safeguards
- Implement staging environments that mirror production
- Conduct security testing before production deployment
- Use blue/green deployment strategies
- Implement rollback capabilities
- Regularly test disaster recovery procedures

## Regular Security Practices

### Security Testing
- Conduct regular penetration testing
- Implement security unit tests
- Perform regular vulnerability scanning
- Use OWASP ZAP or similar tools for application security testing
- Test authentication and authorization controls regularly

### Security Training
- Provide security training for all developers
- Keep the team updated on security best practices
- Conduct secure code reviews
- Hold regular security workshops
- Create a security-conscious culture

## Third-Party Services

### Vendor Security
- Assess security practices of third-party services
- Limit third-party access to necessary data only
- Regularly review third-party access and permissions
- Monitor third-party service status and security updates
- Have contingency plans for third-party service outages

## Security Documentation

- Maintain up-to-date security documentation
- Document security configurations and controls
- Create security runbooks for common scenarios
- Keep a record of security decisions and changes
- Document security testing results and remediation

---
*Other SECURITY-*.md variants have been consolidated into this guide and removed.*

This guide should be reviewed and updated regularly as security best practices evolve. All team members should be familiar with these guidelines and apply them consistently throughout the development and maintenance of the VibeWell platform. # Security Guidelines for Secret Management

## Overview

This document outlines best practices for handling sensitive information such as API keys, passwords, and other credentials within the Vibewell platform development workflow.

## Secret Management Principles

1. **No hardcoded secrets**: Never commit real secrets directly into the source code.
2. **Separation of concerns**: Keep configuration separate from application code.
3. **Least privilege**: Limit access to secrets to only those who need them.
4. **Rotation**: Regularly rotate secrets to reduce the impact of potential leaks.
5. **Audit trail**: Maintain a record of access to secrets.

## Environment Variables

### Development Environment

1. **Local development**:
   - Use `.env.local` for local development and ensure it's added to `.gitignore`.
   - Copy `.env.local.example` to `.env.local` and add your actual values.
   - Never commit `.env.local` files to the repository.

2. **Test environment**:
   - Use `.env.test` with non-sensitive placeholders for tests.
   - Replace actual credentials with test tokens and placeholders.

### Production Environment

1. **CI/CD pipeline**:
   - Store secrets as protected environment variables in GitHub Actions.
   - Use GitHub Secrets for sensitive values referenced in workflows.

2. **Deployment**:
   - Use AWS Secrets Manager or similar services for storing production secrets.
   - Reference secrets in environment variables or configuration files at deployment time.

## Handling Specific Types of Secrets

### API Keys

- Store API keys in environment variables.
- Use different API keys for development, testing, and production environments.
- Create keys with appropriate scopes and permissions.

### Database Credentials

- Use different credentials for different environments.
- Restrict database user permissions based on the application's needs.
- Consider using IAM-based authentication for AWS services where possible.

### JWT Tokens

- Never hardcode JWT tokens or secrets.
- Ensure proper expiration times on tokens.
- Use strong secrets for signing tokens.

## Tools and Services

1. **Secrets Management**:
   - AWS Secrets Manager
   - GitHub Secrets
   - HashiCorp Vault

2. **Environment Variable Management**:
   - dotenv (for local development)
   - AWS Parameter Store (for production configuration)

## Implementation Guidelines

### Code Review Checklist

During code reviews, check for:
- Hardcoded secrets or credentials
- Inappropriate logging of sensitive information
- Missing or incomplete environment variable validation

### Testing

- Use mock or fake values for secrets in tests
- Ensure tests can run without access to production credentials

### Documentation

- Document required environment variables in README files
- Provide clear instructions for development setup
- Use placeholders or examples in documentation, never real values

## Incident Response

If a secret is accidentally committed to the repository:

1. Immediately rotate the exposed credential
2. Remove the secret from the Git history (contact DevOps team for assistance)
3. Document the incident and take preventive measures

## Contact Information

For questions about secret management or to report security concerns, contact:
- Security Team: security@vibewell.com
- DevOps Team: devops@vibewell.com # Vibewell Security Implementation

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
5. **Dependency Scanning**: Regularly scan and update dependencies with security vulnerabilities # Security Guidelines for Secret Management

## Overview

This document outlines best practices for handling sensitive information such as API keys, passwords, and other credentials within the Vibewell platform development workflow.

## Secret Management Principles

1. **No hardcoded secrets**: Never commit real secrets directly into the source code.
2. **Separation of concerns**: Keep configuration separate from application code.
3. **Least privilege**: Limit access to secrets to only those who need them.
4. **Rotation**: Regularly rotate secrets to reduce the impact of potential leaks.
5. **Audit trail**: Maintain a record of access to secrets.

## Environment Variables

### Development Environment

1. **Local development**:
   - Use `.env.local` for local development and ensure it's added to `.gitignore`.
   - Copy `.env.local.example` to `.env.local` and add your actual values.
   - Never commit `.env.local` files to the repository.

2. **Test environment**:
   - Use `.env.test` with non-sensitive placeholders for tests.
   - Replace actual credentials with test tokens and placeholders.

### Production Environment

1. **CI/CD pipeline**:
   - Store secrets as protected environment variables in GitHub Actions.
   - Use GitHub Secrets for sensitive values referenced in workflows.

2. **Deployment**:
   - Use AWS Secrets Manager or similar services for storing production secrets.
   - Reference secrets in environment variables or configuration files at deployment time.

## Handling Specific Types of Secrets

### API Keys

- Store API keys in environment variables.
- Use different API keys for development, testing, and production environments.
- Create keys with appropriate scopes and permissions.

### Database Credentials

- Use different credentials for different environments.
- Restrict database user permissions based on the application's needs.
- Consider using IAM-based authentication for AWS services where possible.

### JWT Tokens

- Never hardcode JWT tokens or secrets.
- Ensure proper expiration times on tokens.
- Use strong secrets for signing tokens.

## Tools and Services

1. **Secrets Management**:
   - AWS Secrets Manager
   - GitHub Secrets
   - HashiCorp Vault

2. **Environment Variable Management**:
   - dotenv (for local development)
   - AWS Parameter Store (for production configuration)

## Implementation Guidelines

### Code Review Checklist

During code reviews, check for:
- Hardcoded secrets or credentials
- Inappropriate logging of sensitive information
- Missing or incomplete environment variable validation

### Testing

- Use mock or fake values for secrets in tests
- Ensure tests can run without access to production credentials

### Documentation

- Document required environment variables in README files
- Provide clear instructions for development setup
- Use placeholders or examples in documentation, never real values

## Incident Response

If a secret is accidentally committed to the repository:

1. Immediately rotate the exposed credential
2. Remove the secret from the Git history (contact DevOps team for assistance)
3. Document the incident and take preventive measures

## Contact Information

For questions about secret management or to report security concerns, contact:
- Security Team: security@vibewell.com
- DevOps Team: devops@vibewell.com # Vibewell Security Implementation

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