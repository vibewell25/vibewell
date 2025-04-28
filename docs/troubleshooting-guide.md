# VibeWell Troubleshooting Guide

This guide provides solutions for common issues you might encounter while setting up, developing, or deploying the VibeWell platform.

## Authentication Issues

### Unable to Log In with Auth0

**Symptoms:**
- Login redirects back to the login page without error
- Auth0 errors in the console
- "Unauthorized" errors after login attempt

**Solutions:**
1. Check Auth0 credentials in your `.env.local` file
2. Verify allowed callback URLs in Auth0 dashboard match your application URLs
3. Ensure the Auth0 tenant is correctly configured
4. Check network requests for detailed error messages
5. Verify your Auth0 application is enabled

### Role-Based Access Control Not Working

**Symptoms:**
- Users can access pages they shouldn't have permission for
- Admin or provider features not showing for appropriate users

**Solutions:**
1. Check that Auth0 rules for role assignment are properly configured
2. Verify JWT token contains the expected roles
3. Ensure the application is correctly parsing and validating roles
4. Check role-based middleware or guards are properly implemented

## Database Issues

### Prisma Migration Errors

**Symptoms:**
- Errors when running `prisma migrate dev`
- Failed deployments due to migration issues
- Database schema out of sync errors

**Solutions:**
1. Check your database connection string in `.env.local`
2. Ensure the database exists and is accessible
3. Try resetting the database: `npx prisma migrate reset` (warning: this deletes all data)
4. Check for conflicts in migration files
5. Verify PostgreSQL version compatibility

### Database Connection Issues

**Symptoms:**
- "Could not connect to database" errors
- Timeouts when accessing database
- Prisma client initialization failures

**Solutions:**
1. Verify database credentials and connection string
2. Check if database server is running and accessible
3. Test connection using a database client tool
4. Check for firewall or network restrictions
5. Ensure you're not exceeding connection limits

## AWS S3 Issues

### File Upload Failures

**Symptoms:**
- Files fail to upload
- Access denied errors
- S3 bucket not found errors

**Solutions:**
1. Verify AWS credentials in `.env.local`
2. Check S3 bucket permissions
3. Ensure CORS is properly configured for the S3 bucket
4. Verify IAM user has necessary permissions
5. Check file size limitations

### Image Display Issues

**Symptoms:**
- Images not loading
- Access denied when trying to view images
- Broken image links

**Solutions:**
1. Check S3 bucket policy allows public read access (if intended)
2. Verify file URLs are correctly formatted
3. Check browser console for specific error messages
4. Ensure CORS configuration allows your domain
5. Verify image file formats are supported

## Stripe Payment Issues

### Payment Processing Failures

**Symptoms:**
- Payments failing to process
- Stripe error messages
- Webhook errors

**Solutions:**
1. Check Stripe API keys in `.env.local`
2. Verify Stripe account is properly configured
3. Check webhook signing secret
4. Use Stripe CLI to debug webhook issues
5. Review Stripe dashboard for specific error messages

### Checkout Session Creation Fails

**Symptoms:**
- Unable to create checkout sessions
- API errors when attempting to pay
- Redirect to checkout not working

**Solutions:**
1. Verify Stripe API key is correct
2. Ensure price and product IDs exist in your Stripe account
3. Check success and cancel URLs
4. Verify webhook endpoint is properly configured
5. Check Stripe API version compatibility

## Deployment Issues

### Vercel Deployment Failures

**Symptoms:**
- Build failures in Vercel
- Deployment timeouts
- Application errors after deployment

**Solutions:**
1. Check build logs for specific errors
2. Verify all environment variables are properly set in Vercel
3. Ensure build commands are correct
4. Check for unsupported dependencies
5. Verify Node.js version compatibility

### Environment Variable Issues

**Symptoms:**
- "Cannot read property of undefined" errors
- Service integrations not working
- Authentication failures in production

**Solutions:**
1. Verify all required environment variables are set
2. Check for typos in environment variable names
3. Ensure values are properly formatted (no extra spaces)
4. Check if environment variables are being loaded correctly
5. Review Vercel (or hosting provider) environment configuration

## Performance Issues

### Slow Page Loading

**Symptoms:**
- Pages take a long time to load
- High Time to First Byte (TTFB)
- Slow API responses

**Solutions:**
1. Implement proper data caching
2. Optimize image loading and sizes
3. Use pagination for large data sets
4. Enable serverless function caching where appropriate
5. Review database query performance

### Memory Usage Issues

**Symptoms:**
- Out of memory errors
- Serverless function timeouts
- Application crashes

**Solutions:**
1. Optimize large data operations
2. Implement pagination for data-heavy requests
3. Check for memory leaks in your application
4. Consider increasing function memory limits (if possible)
5. Break down complex operations into smaller chunks

## Development Environment Issues

### Next.js Hot Reload Not Working

**Symptoms:**
- Changes not reflecting in development server
- Need to manually restart server for changes to appear

**Solutions:**
1. Check for errors in terminal or browser console
2. Ensure you're editing the correct files
3. Verify file watching is enabled
4. Try clearing `.next` folder and restarting
5. Check for conflicting build processes

### TypeScript Errors

**Symptoms:**
- Type errors preventing build
- Editor showing type errors
- Failed type checking

**Solutions:**
1. Run `npm run type-check` to see all errors
2. Update types or add appropriate type assertions
3. Check for outdated type definitions
4. Ensure `tsconfig.json` is properly configured
5. Update dependencies if using outdated type libraries

## Database Migration Issues

### Supabase to Prisma Migration

**Symptoms:**
- Errors referencing Supabase functions or methods
- Console warnings about deprecated Supabase imports
- Database connection errors after deployment
- Inconsistent behavior between local and production environments
- TypeScript errors related to Supabase types
- Auth errors after migrating from Supabase Auth to Auth0

**Solutions:**

1. **Run Migration Scripts**:
   - We have two helper scripts to assist with migration:
     ```bash
     # Remove Supabase environment variables
     node scripts/remove-supabase-env-vars.js .env.local
     
     # Automatically convert Supabase code to Prisma 
     node scripts/migrate-remaining-supabase.js
     ```

2. **Update Import Statements**:
   - Replace all Supabase imports with Prisma imports:
     ```typescript
     // OLD - deprecated
     import { supabase } from '@/lib/supabase/client';
     import { createClient } from '@supabase/supabase-js';
     
     // NEW - use this instead
     import { prisma } from '@/lib/database/client';
     ```

3. **Update Environment Variables**:
   - Remove Supabase-specific variables from `.env.local` and `.env.production`:
     ```
     # Remove these variables
     NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
     SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
     ```
   - Ensure your DATABASE_URL is correctly set:
     ```
     DATABASE_URL=postgresql://user:password@host:5432/database
     ```

4. **Update Database Queries**:
   - Replace Supabase query patterns with Prisma patterns:
   
     ```typescript
     // OLD Supabase pattern
     const { data, error } = await supabase
       .from('users')
       .select('*')
       .eq('id', userId);
     
     // NEW Prisma pattern
     const user = await prisma.user.findUnique({
       where: { id: userId }
     });
     ```
     
   - Replace joins and complex selects:
     ```typescript
     // OLD Supabase complex query
     const { data, error } = await supabase
       .from('providers')
       .select(`
         *,
         services (*),
         reviews (*)
       `)
       .eq('id', providerId);
     
     // NEW Prisma with relations
     const provider = await prisma.provider.findUnique({
       where: { id: providerId },
       include: {
         services: true,
         reviews: true
       }
     });
     ```
     
   - Replace pagination:
     ```typescript
     // OLD Supabase pagination
     const { data, error } = await supabase
       .from('products')
       .select('*')
       .range(0, 9);
     
     // NEW Prisma pagination
     const products = await prisma.product.findMany({
       take: 10,
       skip: 0
     });
     ```

5. **Handle Authentication Changes**:
   - Update auth workflows as we've migrated from Supabase Auth to Auth0:
     ```typescript
     // OLD Supabase auth session check
     const { data: { session } } = await supabase.auth.getSession();
     
     // NEW Auth0 session check
     import { getSession } from '@auth0/nextjs-auth0';
     const session = await getSession();
     
     // OLD Supabase auth sign in
     const { user, error } = await supabase.auth.signIn({ email, password });
     
     // NEW Auth0 sign in
     import { useAuth0 } from '@auth0/auth0-react';
     const { loginWithRedirect } = useAuth0();
     loginWithRedirect();
     ```

6. **Fix Common Error Patterns**:
   - Supabase client initialization:
     ```typescript
     // Remove this code
     const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
     const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
     const supabase = createClient(supabaseUrl, supabaseAnonKey);
     ```
   
   - Error handling pattern change:
     ```typescript
     // OLD Supabase error pattern
     const { data, error } = await supabase.from('users').select('*');
     if (error) return { error: error.message };
     
     // NEW Prisma error pattern
     try {
       const users = await prisma.user.findMany();
       return { data: users };
     } catch (error) {
       return { error: error.message };
     }
     ```

7. **Update Dependencies**:
   - Remove Supabase packages after migration is complete:
     ```bash
     npm uninstall @supabase/auth-helpers-nextjs @supabase/ssr @supabase/supabase-js
     ```

8. **Run Database Migrations**:
   - Ensure your database schema is up-to-date:
     ```bash
     npx prisma migrate deploy
     ```
   - Generate the latest Prisma client:
     ```bash
     npx prisma generate
     ```

9. **Update Tests**:
   - Update mock implementations:
     ```typescript
     // OLD Supabase mock
     jest.mock('@/lib/supabase/client', () => ({
       supabase: {
         from: jest.fn().mockReturnValue({
           select: jest.fn().mockReturnThis(),
           eq: jest.fn().mockReturnThis(),
           single: jest.fn().mockResolvedValue({ data: mockUser, error: null })
         })
       }
     }));
     
     // NEW Prisma mock
     jest.mock('@/lib/database/client', () => ({
       prisma: {
         user: {
           findUnique: jest.fn().mockResolvedValue(mockUser)
         }
       }
     }));
     ```

10. **Check for Files in Migration Script Output**:
    - Review the output of `migrate-remaining-supabase.js` script 
    - Focus on files marked with "⚠️ No changes made - may need manual attention"

**Common Migration Errors:**

1. **"Cannot read properties of undefined (reading 'from')"**
   - Cause: Trying to use Supabase after switching to Prisma
   - Solution: Update the query to use prisma client instead

2. **"Cannot read properties of undefined (reading 'auth')"**
   - Cause: Using Supabase auth after switching to Auth0
   - Solution: Replace with Auth0 authentication methods

3. **"Cannot find module '@supabase/supabase-js'"**
   - Cause: Supabase dependencies removed but code still references them
   - Solution: Update imports to use Prisma and Auth0

4. **TypeScript errors with Prisma types**
   - Cause: Mismatch between expected types from Supabase vs Prisma
   - Solution: Update type declarations to match Prisma schema

**Migration Resources:**

For more detailed information on the migration process, refer to:
- [Migration Plan Document](./docs/MIGRATION-PLAN.md)
- [Detailed Migration Guide](./docs/supabase-to-prisma-migration.md)

**When to Contact Support:**
- If you encounter persistent database connection issues after following these steps
- When you need help migrating complex Supabase queries to Prisma
- If you need to restore data from a Supabase backup

## Redis Rate Limiting Troubleshooting

- **Connection Issues**: verify Redis service status, network connectivity, configuration and authentication settings.
- **Rate Limiting Not Working**: check RATE_LIMIT and REDIS_ENABLED env vars, inspect `vibewell:ratelimit:*` keys, review middleware config, and test with rapid curl requests.
- **Performance Issues**: use `redis-cli info`, `redis-cli latency`, and `redis-cli info commandstats` to diagnose latency and CPU bottlenecks.
- **Memory Issues**: inspect memory via `redis-cli info memory`, verify eviction policy and memory limits, and check for memory leaks.
- **High 429 Responses**: adjust rate limit thresholds or clear old limit keys (`redis-cli keys "vibewell:ratelimit:*" | xargs redis-cli del`).
- **Persistence & Data Loss**: verify AOF/RDB persistence settings and disk space; check appendonly and save directives.
- **Monitoring & Alerts**: integrate Redis metrics in monitoring stack and configure alerts for key performance indicators.

*Other troubleshooting variants have been consolidated into this guide and removed.*

## General Troubleshooting Steps

1. **Check Logs**: Always check console logs, network requests, and server logs for specific error messages
2. **Clear Cache**: Clear browser cache and application data
3. **Update Dependencies**: Ensure all packages are up to date
4. **Restart Services**: Sometimes restarting the development server or services resolves issues
5. **Isolate the Problem**: Create a minimal reproduction to isolate the issue
6. **Check Documentation**: Review documentation for the specific service or library causing issues
7. **Community Support**: Check GitHub issues or community forums for similar problems

If you encounter issues not covered in this guide, please open an issue on the GitHub repository or contribute to this troubleshooting guide with your solution. 

# Update AWS RDS connection string in .env files to replace Supabase URL
node scripts/remove-supabase-env-vars.js .env.local
node scripts/remove-supabase-env-vars.js .env.example

# Convert Supabase code to Prisma
node scripts/migrate-remaining-supabase.js

# Update dependencies
node scripts/update-dependencies.js
npm install

# Generate Prisma client for AWS RDS
npx prisma generate 