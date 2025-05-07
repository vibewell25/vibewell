# Deployment Guide

## Pre-deployment Checklist

### Environment Setup
- [ ] Copy `.env.example` to `.env` and fill in all required values
- [ ] Set up Auth0 application and configure callbacks
- [ ] Configure PostgreSQL database and update connection string
- [ ] Set up Redis instance (if using for caching/rate limiting)
- [ ] Configure AWS S3 bucket for file uploads
- [ ] Set up proper CORS settings for production domain
- [ ] Configure Stripe account and API keys
- [ ] Set up WebAuthn RPID and origin for biometric authentication

### Database
- [ ] Run database migrations: `npm run db:migrate`
- [ ] Verify database indexes are optimized
- [ ] Set up database backup strategy

### Security
- [ ] Enable production mode (`NODE_ENV=production`)
- [ ] Verify all secrets are properly set
- [ ] Configure rate limiting
- [ ] Set up proper CORS headers
- [ ] Enable security headers
- [ ] Configure SSL/TLS certificates

### Additional Service Configuration
- [ ] Configure Redis connection (host, port, password, TLS)
- [ ] Set up Stripe webhooks for payment notifications
- [ ] Configure WebAuthn settings for secure login
- [ ] Set up two-factor authentication settings

### Performance
- [ ] Run production build: `npm run build`
- [ ] Verify no build warnings/errors
- [ ] Check bundle size analysis
- [ ] Configure CDN for static assets
- [ ] Set up caching strategy

### Monitoring
- [ ] Set up error tracking (e.g., Sentry)
- [ ] Configure logging
- [ ] Set up performance monitoring
- [ ] Configure alerts for critical errors

## Deployment Steps

1. **Prepare Environment**
   ```bash
   # Copy and configure environment variables
   cp .env.example .env
   # Edit .env with production values
   ```

2. **Database Setup**
   ```bash
   # Run migrations
   npm run db:migrate
   ```

3. **Build Application**
   ```bash
   # Install dependencies
   npm ci
   
   # Build application
   npm run build
   ```

4. **Docker Deployment**
   ```bash
   # Build Docker image
   docker build -t vibewell:latest .
   
   # Run container
   docker run -d \
     --name vibewell \
     -p 3000:3000 \
     --env-file .env \
     vibewell:latest
   ```

## Required Environment Variables

```
# App
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Redis
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
REDIS_TLS=true

# Auth
AUTH0_SECRET=your-auth0-secret
AUTH0_BASE_URL=https://yourdomain.com
AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com
AUTH0_CLIENT_ID=your-auth0-client-id
AUTH0_CLIENT_SECRET=your-auth0-client-secret

# WebAuthn
WEBAUTHN_RP_ID=yourdomain.com
WEBAUTHN_ORIGIN=https://yourdomain.com

# Stripe
STRIPE_SECRET_KEY=sk_live_your_stripe_secret
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_PUBLIC_KEY=pk_live_your_public_key

# AWS S3
AWS_S3_BUCKET=your-bucket-name
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=your-region
```

## Post-deployment Checklist

- [ ] Verify application is running
- [ ] Check all API endpoints are working
- [ ] Verify Auth0 authentication flow
- [ ] Test file uploads to S3
- [ ] Monitor error logs
- [ ] Check database performance
- [ ] Verify SSL/TLS certificates
- [ ] Test backup and restore procedures
- [ ] Verify payment processing with Stripe
- [ ] Test WebAuthn and two-factor authentication

## Scaling Considerations

- Configure auto-scaling rules if using cloud providers
- Set up load balancing if needed
- Monitor database connection pools
- Configure proper caching strategies
- Set up CDN for static assets
- Monitor Redis connection limits and memory usage

## Troubleshooting

Common issues and their solutions:

1. **Database Connection Issues**
   - Verify connection string
   - Check network security groups
   - Verify database user permissions

2. **Auth0 Authentication Issues**
   - Verify callback URLs
   - Check Auth0 application settings
   - Verify environment variables

3. **File Upload Issues**
   - Check S3 bucket permissions
   - Verify AWS credentials
   - Check file size limits

4. **Payment Processing Issues**
   - Verify Stripe API keys
   - Check webhook configuration
   - Monitor Stripe dashboard for errors

5. **WebAuthn Authentication Issues**
   - Verify RPID and origin settings
   - Ensure HTTPS is properly configured
   - Check browser compatibility

## Maintenance

Regular maintenance tasks:

1. **Daily**
   - Monitor error logs
   - Check application health
   - Review performance metrics
   - Monitor payment transactions

2. **Weekly**
   - Review security updates
   - Check database performance
   - Analyze API usage patterns
   - Review failed payments

3. **Monthly**
   - Rotate access keys
   - Review and update dependencies
   - Check SSL certificates
   - Review backup procedures 
   - Update payment provider settings 