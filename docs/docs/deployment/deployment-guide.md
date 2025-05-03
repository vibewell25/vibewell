# VibeWell Deployment Guide

This guide provides detailed instructions for deploying the VibeWell platform to various environments, including development, staging, and production.

## Prerequisites

Before deployment, ensure you have the following:

- Node.js (%NODE_VERSION%)
- NPM (version 8.x or later)
- Vercel CLI installed (`npm i -g vercel`)
- Access to VibeWell GitHub repository
- Access to AWS console (for S3 and other services)
- Access to Auth0 dashboard
- Access to Stripe dashboard
- Access to database credentials
- Environment variables configured

## Environment Setup

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# Base URLs
NEXT_PUBLIC_APP_URL=https://yourappurl.com

# Database
DATABASE_URL=postgresql://username:password@host:port/database

# Auth0
AUTH0_SECRET=your_auth0_secret
AUTH0_BASE_URL=https://yourappurl.com
AUTH0_ISSUER_BASE_URL=https://yourtenant.auth0.com
AUTH0_CLIENT_ID=your_auth0_client_id
AUTH0_CLIENT_SECRET=your_auth0_client_secret

# AWS S3
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
AWS_S3_BUCKET_NAME=your_s3_bucket_name

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Other
NEXTAUTH_SECRET=your_nextauth_secret
```

For different environments, use environment-specific values.

## Local Development Deployment

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/vibewell.git
   cd vibewell
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your local environment variables (see above).

4. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

The application should now be running at `http://localhost:3000`.

## Staging Deployment

Staging deployment uses Vercel Preview environments.

1. Create a new branch for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit them:
   ```bash
   git add .
   git commit -m "Description of changes"
   ```

3. Push to GitHub:
   ```bash
   git push origin feature/your-feature-name
   ```

4. Create a Pull Request on GitHub.

5. Vercel will automatically create a preview deployment for your PR.

6. After reviewing the preview deployment, merge the PR to trigger a production deployment.

## Production Deployment

### Automated Deployment with Vercel

1. Ensure all tests pass in the staging environment.

2. Merge your changes to the main branch:
   ```bash
   git checkout main
   git pull origin main
   ```

3. Vercel will automatically deploy the main branch to production.

4. Verify the deployment by accessing the production URL.

### Manual Production Deployment

If you need to manually deploy to production:

1. Install the Vercel CLI if not already installed:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy to production:
   ```bash
   vercel --prod
   ```

## Services Setup

### Auth0
Prerequisites:
- Auth0 account
- Access to the VibeWell production environment
- Node.js (%NODE_VERSION%)

1. Log in to Auth0 Dashboard and create a Regular Web Application named “VibeWell”.
2. Configure Application Settings:
   - Allowed Callback URLs: `https://your-domain.com/api/auth/callback`
   - Allowed Logout URLs: `https://your-domain.com`
   - Allowed Web Origins: `https://your-domain.com`
3. Create Auth0 API:
   - Name: “VibeWell API”
   - Identifier: `https://api.vibewell.com`
   - Signing Algorithm: RS256
4. Update production environment variables:
   ```
   AUTH0_BASE_URL=https://your-domain.com
   AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com
   AUTH0_CLIENT_ID=your-client-id
   AUTH0_CLIENT_SECRET=your-client-secret
   AUTH0_SECRET=your-generated-secret
   ```

### Stripe
Prerequisites:
- Stripe account
- Access to the VibeWell production environment
- Node.js (%NODE_VERSION%)

1. Create and verify a Stripe account; switch to Live mode.
2. Obtain API Keys (Publishable & Secret) from Developers > API Keys.
3. Update production environment variables:
   ```
   STRIPE_PUBLISHABLE_KEY=your_publishable_key
   STRIPE_SECRET_KEY=your_secret_key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_publishable_key
   ```

### AWS S3
Prerequisites:
- AWS account with administrative access
- Access to the VibeWell production environment
- Node.js (%NODE_VERSION%)

1. In AWS Console > IAM, create an access key with S3 permissions.
2. Update production environment variables:
   ```
   AWS_ACCESS_KEY_ID=your-access-key-id
   AWS_SECRET_ACCESS_KEY=your-secret-access-key
   AWS_REGION=your-preferred-region
   AWS_S3_BUCKET_NAME=vibewell-uploads
   ```
3. Run the setup script:
   ```bash
   npm run setup:s3
   ```
   This creates the S3 bucket, configures CORS, and IAM user.

### Redis
Overview: Used for rate limiting, distributed state, and metrics.

**Development**:
```bash
docker-compose up -d redis redis-exporter prometheus grafana
```

**Production**: AWS ElastiCache, Azure Cache, Redis Enterprise Cloud, Google Memorystore.

Configuration:
- Enable password authentication and persistence.
- Secure with SSL/TLS.
- Monitor via Redis Exporter + Prometheus.
- Follow backup and scaling best practices.

## Advanced Infrastructure
Overview: Production infrastructure including:
- Kubernetes cluster
- Redis instance
- PostgreSQL database
- Object storage & CDN
- SSL certificates & domain config

Software Requirements:
- Docker, kubectl, Helm, Terraform, Git, Node.js, npm

Configuration Files:
- `.env.production`
- `kustomization.yaml`
- `values.yaml`
- `terraform.tfvars`
- `docker-compose.prod.yml`

Environment Variables example:
```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Redis
REDIS_URL=redis://:yourpassword@host:6379

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1h

# Storage
STORAGE_BUCKET=your-bucket-name
STORAGE_REGION=your-region
```

## Database Migrations

### Running Migrations in Production

1. Generate the migration:
   ```bash
   npx prisma migrate dev --name descriptive-migration-name
   ```

2. Apply the migration to production:
   ```bash
   npx prisma migrate deploy
   ```

Always back up your production database before running migrations!

## SSL Configuration

Ensure HTTPS is enabled:

1. Vercel handles SSL certificates automatically.
2. If using a custom domain, configure it in the Vercel dashboard.
3. Verify the SSL certificate is valid and properly configured.

## Post-Deployment Verification

After deploying, verify the following:

1. The application loads correctly at the production URL.
2. User authentication works as expected.
3. Database operations are functioning properly.
4. File uploads to S3 are working.
5. Stripe payments are processing correctly.
6. All critical user flows are functioning as expected.

## Rollback Procedure

If issues are encountered after deployment:

1. In the Vercel dashboard, navigate to the "Deployments" tab.
2. Find the last stable deployment.
3. Click the three dots menu and select "Promote to Production".
4. Verify the rollback fixed the issue.

## Monitoring and Logging

1. Set up Sentry.io for error tracking:
   ```bash
   npm install @sentry/nextjs
   ```

2. Configure Sentry in your `next.config.js` file.

3. Monitor application health using Vercel Analytics.

4. Set up alerts for critical errors and performance issues.

## Scheduled Maintenance

For planned maintenance:

1. Notify users at least 24 hours in advance.
2. Schedule maintenance during low-traffic periods.
3. Use a maintenance page if necessary.
4. Keep a log of all maintenance activities.

## Performance Optimization

After deployment, consider running:

1. Lighthouse audits for performance metrics.
2. Load testing to ensure the application can handle expected traffic.
3. Database query optimization if needed.

---

This deployment guide should be updated regularly as the deployment process evolves. For any questions or issues, contact the DevOps team or system administrator.# VibeWell Deployment Checklist

Use this checklist to ensure you've completed all necessary steps before deploying the VibeWell platform to production.

## Pre-Deployment Configuration

### Authentication
- [ ] Set up Auth0 account and application
- [ ] Configure Auth0 callback URLs for production
- [ ] Create Auth0 API audience
- [ ] Set up user roles and rules
- [ ] Update environment variables with Auth0 credentials

### Storage
- [ ] Create AWS S3 bucket with appropriate permissions
- [ ] Configure CORS settings for production domain
- [ ] Create IAM user with appropriate policies
- [ ] Update environment variables with AWS credentials
- [ ] Test file upload and retrieval functionality

### Payment Processing
- [ ] Set up Stripe account
- [ ] Configure webhook endpoints for production
- [ ] Set up payment success and failure redirects
- [ ] Update environment variables with Stripe API keys
- [ ] Test payment flow with test cards

### Database
- [ ] Set up production database (PostgreSQL recommended)
- [ ] Run migrations to create schema
- [ ] Configure database connection string in environment variables
- [ ] Test database connectivity
- [ ] Consider data backup strategy

### Environment Variables
- [ ] Verify all environment variables are properly set
- [ ] Ensure no development-only variables are exposed in production
- [ ] Use appropriate URL values for production (no localhost)
- [ ] Check for any hardcoded development URLs in the code

## Build and Deployment

### Code Quality
- [ ] Run linter to ensure code quality: `npm run lint`
- [ ] Fix any linting errors
- [ ] Run type checking: `npm run type-check`
- [ ] Fix any type errors
- [ ] Run tests: `npm test`
- [ ] Fix any failing tests

### Build Process
- [ ] Update `next.config.js` for production if needed
- [ ] Run a production build: `npm run build`
- [ ] Verify build completes without errors
- [ ] Test the production build locally: `npm run start`

### CI/CD
- [ ] Set up CI/CD pipeline (if using)
- [ ] Configure build and test steps
- [ ] Set up environment variables in CI/CD provider
- [ ] Configure deployment triggers

### Deployment
- [ ] Push code to repository
- [ ] Deploy to Vercel (or your preferred hosting provider)
- [ ] Verify deployment succeeds
- [ ] Check deployed application functionality

## Post-Deployment

### Testing
- [ ] Test user registration and login
- [ ] Test provider account creation and service listing
- [ ] Test appointment booking flow
- [ ] Test payment processing
- [ ] Test file uploads
- [ ] Test responsiveness on mobile devices
- [ ] Verify accessibility compliance

### Monitoring
- [ ] Set up application monitoring
- [ ] Configure error tracking (e.g., Sentry)
- [ ] Set up performance monitoring
- [ ] Configure alerting for critical issues

### Security
- [ ] Enable HTTPS
- [ ] Check Content Security Policy
- [ ] Verify API endpoints are properly secured
- [ ] Configure rate limiting for API endpoints
- [ ] Review authentication flows for security issues

### Documentation
- [ ] Update API documentation (if applicable)
- [ ] Document deployment process
- [ ] Update user documentation
- [ ] Create troubleshooting guide

### Performance
- [ ] Run Lighthouse audits
- [ ] Optimize image loading
- [ ] Verify effective caching strategies
- [ ] Check for any render-blocking resources
- [ ] Optimize JavaScript bundles

## Final Steps

- [ ] Create production database backup
- [ ] Set up regular backup schedule
- [ ] Configure domain and DNS settings
- [ ] Set up SSL certificate
- [ ] Create monitoring dashboard
- [ ] Schedule post-deployment review

## Emergency Planning

- [ ] Document rollback procedure
- [ ] Create emergency contact list
- [ ] Define incident response process
- [ ] Test backup restoration
- [ ] Document common issues and solutions

---

Use this checklist as a guide to ensure a smooth deployment process. Adapt it to your specific needs and infrastructure. # VibeWell Deployment Checklist

Use this checklist to ensure you've completed all necessary steps before deploying the VibeWell platform to production.

## Pre-Deployment Configuration

### Authentication
- [ ] Set up Auth0 account and application
- [ ] Configure Auth0 callback URLs for production
- [ ] Create Auth0 API audience
- [ ] Set up user roles and rules
- [ ] Update environment variables with Auth0 credentials

### Storage
- [ ] Create AWS S3 bucket with appropriate permissions
- [ ] Configure CORS settings for production domain
- [ ] Create IAM user with appropriate policies
- [ ] Update environment variables with AWS credentials
- [ ] Test file upload and retrieval functionality

### Payment Processing
- [ ] Set up Stripe account
- [ ] Configure webhook endpoints for production
- [ ] Set up payment success and failure redirects
- [ ] Update environment variables with Stripe API keys
- [ ] Test payment flow with test cards

### Database
- [ ] Set up production database (PostgreSQL recommended)
- [ ] Run migrations to create schema
- [ ] Configure database connection string in environment variables
- [ ] Test database connectivity
- [ ] Consider data backup strategy

### Environment Variables
- [ ] Verify all environment variables are properly set
- [ ] Ensure no development-only variables are exposed in production
- [ ] Use appropriate URL values for production (no localhost)
- [ ] Check for any hardcoded development URLs in the code

## Build and Deployment

### Code Quality
- [ ] Run linter to ensure code quality: `npm run lint`
- [ ] Fix any linting errors
- [ ] Run type checking: `npm run type-check`
- [ ] Fix any type errors
- [ ] Run tests: `npm test`
- [ ] Fix any failing tests

### Build Process
- [ ] Update `next.config.js` for production if needed
- [ ] Run a production build: `npm run build`
- [ ] Verify build completes without errors
- [ ] Test the production build locally: `npm run start`

### CI/CD
- [ ] Set up CI/CD pipeline (if using)
- [ ] Configure build and test steps
- [ ] Set up environment variables in CI/CD provider
- [ ] Configure deployment triggers

### Deployment
- [ ] Push code to repository
- [ ] Deploy to Vercel (or your preferred hosting provider)
- [ ] Verify deployment succeeds
- [ ] Check deployed application functionality

## Post-Deployment

### Testing
- [ ] Test user registration and login
- [ ] Test provider account creation and service listing
- [ ] Test appointment booking flow
- [ ] Test payment processing
- [ ] Test file uploads
- [ ] Test responsiveness on mobile devices
- [ ] Verify accessibility compliance

### Monitoring
- [ ] Set up application monitoring
- [ ] Configure error tracking (e.g., Sentry)
- [ ] Set up performance monitoring
- [ ] Configure alerting for critical issues

### Security
- [ ] Enable HTTPS
- [ ] Check Content Security Policy
- [ ] Verify API endpoints are properly secured
- [ ] Configure rate limiting for API endpoints
- [ ] Review authentication flows for security issues

### Documentation
- [ ] Update API documentation (if applicable)
- [ ] Document deployment process
- [ ] Update user documentation
- [ ] Create troubleshooting guide

### Performance
- [ ] Run Lighthouse audits
- [ ] Optimize image loading
- [ ] Verify effective caching strategies
- [ ] Check for any render-blocking resources
- [ ] Optimize JavaScript bundles

## Final Steps

- [ ] Create production database backup
- [ ] Set up regular backup schedule
- [ ] Configure domain and DNS settings
- [ ] Set up SSL certificate
- [ ] Create monitoring dashboard
- [ ] Schedule post-deployment review

## Emergency Planning

- [ ] Document rollback procedure
- [ ] Create emergency contact list
- [ ] Define incident response process
- [ ] Test backup restoration
- [ ] Document common issues and solutions

---

Use this checklist as a guide to ensure a smooth deployment process. Adapt it to your specific needs and infrastructure. 