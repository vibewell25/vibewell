# VibeWell Deployment Guide

This guide provides detailed instructions for deploying the VibeWell platform to various environments, including development, staging, and production.

## Prerequisites

Before deployment, ensure you have the following:

- Node.js (version 16.x or later)
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

## AWS S3 Configuration

Ensure your S3 bucket is configured correctly:

1. Create an S3 bucket with the proper name.
2. Configure CORS to allow uploads from your domains:
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
       "AllowedOrigins": ["https://yourappurl.com"],
       "ExposeHeaders": ["ETag"]
     }
   ]
   ```
3. Set appropriate bucket policies and IAM permissions.

## Stripe Webhook Configuration

1. In the Stripe dashboard, navigate to Developers > Webhooks.
2. Add an endpoint with the URL: `https://yourappurl.com/api/webhooks/stripe`.
3. Select events to listen for (e.g., `checkout.session.completed`, `invoice.paid`).
4. Get the webhook secret and add it to your environment variables.

## Auth0 Configuration

1. Create a new application in Auth0 dashboard.
2. Configure the callback URLs:
   - Allowed Callback URLs: `https://yourappurl.com/api/auth/callback/auth0`
   - Allowed Logout URLs: `https://yourappurl.com`
   - Allowed Web Origins: `https://yourappurl.com`
3. Get your Client ID and Client Secret and add them to your environment variables.

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

This deployment guide should be updated regularly as the deployment process evolves. For any questions or issues, contact the DevOps team or system administrator. 