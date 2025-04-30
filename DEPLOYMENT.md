# Deployment Guide

## Pre-deployment Checklist

### Environment Setup
- [ ] Copy `.env.example` to `.env` and fill in all required values
- [ ] Set up Auth0 application and configure callbacks
- [ ] Configure PostgreSQL database and update connection string
- [ ] Set up Redis instance (if using for caching/rate limiting)
- [ ] Configure AWS S3 bucket for file uploads
- [ ] Set up proper CORS settings for production domain

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

## Post-deployment Checklist

- [ ] Verify application is running
- [ ] Check all API endpoints are working
- [ ] Verify Auth0 authentication flow
- [ ] Test file uploads to S3
- [ ] Monitor error logs
- [ ] Check database performance
- [ ] Verify SSL/TLS certificates
- [ ] Test backup and restore procedures

## Scaling Considerations

- Configure auto-scaling rules if using cloud providers
- Set up load balancing if needed
- Monitor database connection pools
- Configure proper caching strategies
- Set up CDN for static assets

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

## Maintenance

Regular maintenance tasks:

1. **Daily**
   - Monitor error logs
   - Check application health
   - Review performance metrics

2. **Weekly**
   - Review security updates
   - Check database performance
   - Analyze API usage patterns

3. **Monthly**
   - Rotate access keys
   - Review and update dependencies
   - Check SSL certificates
   - Review backup procedures 