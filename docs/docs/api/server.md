# Vibewell Server

## Overview
This is the backend server for the Vibewell platform. It provides endpoints for authentication, calendar integration, reporting, virtual try-on, security features (2FA, WebAuthn, CSRF), and more.

## Environment Variables
| Name | Description |
|------|-------------|
| DATABASE_URL | Postgres connection string |
| FRONTEND_URL | Your front-end origin (for CORS & WebAuthn) |
| GOOGLE_CLIENT_ID | Google OAuth client ID |
| GOOGLE_CLIENT_SECRET | Google OAuth client secret |
| GOOGLE_REDIRECT_URI | Google OAuth redirect URI |
| OUTLOOK_CLIENT_ID | Microsoft OAuth client ID |
| OUTLOOK_CLIENT_SECRET | Microsoft OAuth client secret |
| OUTLOOK_TENANT_ID | Azure tenant ID |
| OUTLOOK_REDIRECT_URI | Microsoft OAuth redirect URI |
| RP_ID | Relying Party ID for WebAuthn (domain) |
| COOKIE_SECRET | Secret for signed cookies |
| JWT_SECRET | Secret for JWT validation |
| NODE_ENV | `production` or `development` |

## Getting Started

```bash
# Install dependencies
npm install

# Run migrations in development
npm run prisma:migrate

# Apply migrations (production)
npm run prisma:deploy

# Build TypeScript
npm run build

# Start server
npm start
```

## Testing & Smoke Tests
- **Unit/E2E**: `npm test` (Jest)
- **Cypress**: `npm run cypress:open`
- Manually verify:
  - 2FA (TOTP) endpoints: `/api/security/totp/setup`, `/api/security/totp/verify`
  - WebAuthn flows: `/api/security/webauthn/register`, `/api/security/webauthn/authenticate`
  - Reporting: `/api/reports/bookings`, `/api/reports/bookings/csv`, `/api/reports/revenue`, `/api/reports/churn`
  - Virtual Try-On: `/api/virtual-tryon/makeup`, `/api/virtual-tryon/hair`, `/api/virtual-tryon/style-recommendations`
  - Metrics: `/metrics`
  - Swagger UI: `/api/docs`

## Security Hardening
- CSRF cookies are `httpOnly`, `secure` in production, `sameSite: strict`
- HTTP headers via Helmet
- CORS restricted to `FRONTEND_URL` with credentials

## Deployment Checklist
1. Set all required env vars in your deployment environment.
2. Run `npm run prisma:deploy` to apply migrations.
3. Build and start: `npm run build && npm start`.
4. Ensure Docker/Procfile starts on correct port.
5. Run E2E tests and smoke tests.

