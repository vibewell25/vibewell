# Vibewell Deployment Guide

This guide provides detailed instructions for deploying the Vibewell application to different environments, setting up infrastructure, and handling deployments.

## Prerequisites

Before deploying the application, ensure you have:

1. Node.js 18.x or higher
2. npm 9.x or higher
3. A Vercel account (for production deployment)
4. Access to the application's Git repository
5. Required environment variables and API keys

## Environment Variables

The application requires the following environment variables:

| Variable Name | Description | Example Value |
|---------------|-------------|--------------|
| `NEXT_PUBLIC_API_URL` | Base URL for API requests | `https://api.vibewell.com` |
| `NEXT_PUBLIC_WEBSITE_URL` | Base URL for the website | `https://vibewell.com` |
| `DATABASE_URL` | Connection string for the database | `postgresql://user:password@localhost:5432/vibewell` |
| `AUTH_SECRET` | Secret key for authentication | `your-secret-key` |
| `STRIPE_SECRET_KEY` | Stripe API secret key | `sk_test_1234567890` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | `whsec_1234567890` |

## Local Development Deployment

To run the application locally:

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/vibewell.git
   cd vibewell
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory and add the required environment variables.

4. Run the development server:
   ```bash
   npm run dev
   ```

5. The application will be available at `http://localhost:3000`.

## Staging Environment Deployment

For staging deployments, we use Vercel Preview Environments:

1. Push your changes to a feature branch:
   ```bash
   git checkout -b feature/my-feature
   git add .
   git commit -m "Add my feature"
   git push origin feature/my-feature
   ```

2. Create a Pull Request on GitHub.

3. Vercel will automatically create a preview deployment for the PR.

4. The preview URL will be posted as a comment on your PR.

## Production Deployment

To deploy to production:

1. Merge your changes to the main branch:
   ```bash
   git checkout main
   git pull
   git merge feature/my-feature
   git push origin main
   ```

2. Vercel will automatically deploy the main branch to production.

3. Monitor the deployment on the Vercel dashboard.

## Manual Deployment to Vercel

If you need to deploy manually:

1. Install the Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Log in to Vercel:
   ```bash
   vercel login
   ```

3. Deploy to production:
   ```bash
   vercel --prod
   ```

## Database Migrations

When deploying changes that include database migrations:

1. Ensure your migrations are tested in the staging environment.

2. Back up the production database before applying migrations:
   ```bash
   pg_dump -U username -d vibewell > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

3. Apply migrations using Prisma:
   ```bash
   npx prisma migrate deploy
   ```

## Rollback Procedure

If you need to roll back a deployment:

1. On Vercel:
   - Go to the Vercel dashboard
   - Navigate to the Vibewell project
   - Go to "Deployments"
   - Find the previous working deployment
   - Click "..." and select "Promote to Production"

2. For database rollbacks:
   - Restore from the backup created before the deployment
   ```bash
   psql -U username -d vibewell < backup_filename.sql
   ```

## Monitoring and Logs

After deployment, monitor the application's health:

1. Check Vercel logs in the dashboard under the "Logs" tab.

2. Monitor application performance using Vercel Analytics.

3. Check server logs for any errors or warnings.

## SSL Certificates

Vercel handles SSL certificates automatically. If you're deploying to a custom domain:

1. Add your domain in the Vercel dashboard.

2. Configure DNS settings as instructed by Vercel.

3. Vercel will automatically issue and renew SSL certificates.

## Continuous Integration

The repository is configured with GitHub Actions for CI:

1. Automated tests run on every push and PR.

2. The workflow file is located at `.github/workflows/ci.yml`.

3. Tests must pass before merging to main.

## Security Considerations

When deploying, ensure:

1. All environment variables are properly set and secured.

2. The application is using HTTPS.

3. Database access is restricted to application IP addresses.

4. Regular security audits and updates are performed.

## Performance Optimization

For optimal performance:

1. Enable Vercel's Edge Caching for static assets.

2. Configure proper cache headers for API responses.

3. Use Vercel's Image Optimization for image assets.

## Troubleshooting

Common deployment issues:

1. **Build Failure**: Check the build logs for errors.

2. **API Connection Issues**: Verify environment variables and network access.

3. **Database Connection Problems**: Check connection strings and firewall rules.

4. **Missing Environment Variables**: Ensure all required variables are set.

## Contact and Support

For deployment assistance, contact:

- DevOps Team: devops@vibewell.com
- Engineering Lead: engineering-lead@vibewell.com

Emergency support is available 24/7 at support@vibewell.com. 