# VibeWell Security Implementation Guide

This document outlines the security measures implemented in the VibeWell application to protect user data, prevent common web vulnerabilities, and ensure secure operations.

## Table of Contents

1. [Environment Variables & Configuration](#environment-variables--configuration)
2. [CSRF Protection](#csrf-protection)
3. [Rate Limiting](#rate-limiting)
4. [OpenAI Integration Security](#openai-integration-security)
5. [WebAuthn Implementation](#webauthn-implementation)
6. [Security Headers](#security-headers)
7. [Input Sanitization](#input-sanitization)
8. [Authentication Middleware](#authentication-middleware)
9. [Stripe Webhook Security](#stripe-webhook-security)
10. [Production Deployment Security](#production-deployment-security)

## Environment Variables & Configuration

- **Zod Validation**: All environment variables are validated using Zod schemas in `src/config/env.ts`.
- **Type Safety**: TypeScript types are generated from Zod schemas for type-safe usage throughout the application.
- **Secrets Handling**: Sensitive values like API keys and secrets are validated for length and format.
- **Default Values**: Non-sensitive config has sensible defaults to prevent runtime errors.

## CSRF Protection

The CSRF protection is implemented in `src/middleware/csrf.ts` using the double-submit cookie pattern:

- **Double CSRF Tokens**: Uses the `csrf-csrf` library to implement the double-submit token pattern.
- **Secure Cookie Settings**: CSRF cookies are set with `httpOnly`, `sameSite`, and `secure` flags.
- **Custom Validation Logic**: Customized token validation to handle various request types.
- **Route-Specific Skip Logic**: Certain routes (like auth and webhooks) have custom CSRF handling.
- **Token Generation**: New CSRF tokens are generated for sensitive operations.

## Rate Limiting

Rate limiting is implemented in `src/lib/rate-limiter.ts` to prevent abuse:

- **Multi-Store Support**: Uses Redis in production and in-memory store in development.
- **Protocol Support**: Handles HTTP API, GraphQL, and WebSocket connections.
- **Configurable Limits**: Different limits for different endpoints based on sensitivity.
- **Suspicious Activity Detection**: Tracks and limits suspicious IPs more aggressively.
- **Header Compliance**: Follows RFC standards for rate limiting headers.
- **Predefined Limiters**: Ready-to-use rate limiters for auth, payments, etc.

## OpenAI Integration Security

The OpenAI integration is secured in `src/lib/openai.ts`:

- **Input Validation**: All user input is validated with Zod schemas.
- **Prompt Injection Prevention**: Input is scanned for prompt injection attempts.
- **Rate Limiting**: User-specific rate limits prevent abuse.
- **Content Validation**: Prevents sending potentially harmful content to the API.
- **Secure Logging**: Logs omit full message content to avoid sensitive data exposure.
- **Error Handling**: Proper error handling to prevent leaking implementation details.

## WebAuthn Implementation

The WebAuthn implementation in `src/lib/webauthn.ts` provides passwordless authentication:

- **Challenge Management**: Secure challenge generation and verification.
- **User Verification**: Requires user verification for added security.
- **Authenticator Tracking**: Tracks all user authenticators for better security.
- **Replay Protection**: Handles counter validation to prevent replay attacks.
- **Error Handling**: Custom errors with proper messaging.
- **Metadata Storage**: Stores authenticator metadata for security auditing.

## Security Headers

Security headers configuration in `src/lib/securityHeaders.ts`:

- **Content Security Policy**: Strict CSP to prevent XSS and other injection attacks.
- **Permissions Policy**: Limits access to browser features.
- **HSTS**: Enforces HTTPS connections.
- **XSS Protection**: Additional layer of XSS protection for older browsers.
- **Frame Protection**: Prevents clickjacking attacks.
- **Referrer Policy**: Controls information in referrer headers.
- **Nonce Generation**: Secure nonce generation for CSP script-src.

## Input Sanitization

Input sanitization utilities in `src/lib/sanitization.ts`:

- **HTML Sanitization**: Uses DOMPurify to sanitize HTML content.
- **Text Sanitization**: Removes potentially harmful characters from text.
- **URL Validation**: Ensures URLs are safe and properly formatted.
- **Email Validation**: Validates and normalizes email addresses.
- **Schema Validation**: Uses Zod schemas for data validation.
- **SQL Injection Prevention**: Sanitizes inputs for SQL operations.
- **Filename Sanitization**: Ensures safe filenames for uploads.

## Authentication Middleware

Authentication middleware in `src/middleware/authMiddleware.ts`:

- **Session Validation**: Verifies user sessions for all protected routes.
- **Role-Based Access Control**: Implements RBAC for fine-grained permissions.
- **Error Handling**: Proper error responses for authentication failures.
- **Secure Headers**: Sets secure headers for authenticated routes.
- **Logging**: Logs authentication attempts for security auditing.

## Stripe Webhook Security

Stripe webhook security in `src/pages/api/webhooks/stripe.ts`:

- **Signature Verification**: Verifies webhook signatures.
- **Raw Body Handling**: Properly handles raw request body for validation.
- **Idempotency**: Handles duplicate webhook events.
- **Order Status Management**: Secure order status transitions.
- **Error Handling**: Proper error responses for webhook processing failures.

## Production Deployment Security

Security configurations for production deployment:

- **Environment Variables**: Production-specific environment variables in `.env.production`.
- **Next.js Configuration**: Security optimizations in `next.config.js`.
- **CI/CD**: Security checks in the CI/CD pipeline.
- **Dependency Updates**: Regular dependency updates for security patches.
- **Error Monitoring**: Configured Sentry for error monitoring.
- **Logging**: Secure logging configuration for production.
- **Performance Optimization**: Security-focused performance optimizations.

## Conclusion

The security implementations in VibeWell follow OWASP best practices and industry standards for web application security. Regular security audits should be performed to ensure ongoing protection against emerging threats. 