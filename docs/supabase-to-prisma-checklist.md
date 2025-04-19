# Supabase to Prisma Migration Checklist

This document provides a step-by-step checklist for completing the migration from Supabase to Prisma in the VibeWell platform.

## Migration Status

- ✅ Prisma schema created and configured
- ✅ Database client compatibility layer implemented in `src/lib/database/client.ts`
- ✅ Database connection configured for Prisma
- ✅ Deprecated warnings added to Supabase client modules
- ⬜ Update remaining files that import Supabase (53 files identified)
- ⬜ Remove Supabase environment variables 
- ⬜ Remove Supabase dependencies from package.json
- ⬜ Update Auth flows to use Auth0 consistently

## Migration Checklist

### 1. Code Migration

- [ ] Run the automated migration script:
  ```bash
  node scripts/migrate-remaining-supabase.js
  ```

- [ ] Manually review and update complex queries in:
  - [ ] `src/services/engagement-service.ts`
  - [ ] `src/services/analytics-service.ts`
  - [ ] `src/services/feedback-service.ts`
  - [ ] `src/services/recommendation-service.ts`
  - [ ] `src/services/product-service.ts`
  - [ ] `src/services/provider-service.ts`

- [ ] Update API routes that still use Supabase:
  - [ ] `src/app/api/reviews/route.ts`
  - [ ] `src/app/api/reviews/[id]/route.ts`
  - [ ] `src/app/api/graphql/route.ts`
  - [ ] `src/app/api/admin/reset-rate-limits/route.ts`
  - [ ] `src/app/api/admin/rate-limit-events/route.ts`

- [ ] Update components that directly import from Supabase:
  - [ ] `src/components/business/business-profile-edit.tsx`
  - [ ] `src/components/business/business-profile-wizard.tsx`
  - [ ] `src/components/admin/backup-statistics.tsx`
  - [ ] `src/components/provider/profile-form.tsx`
  - [ ] `src/components/profile/email-verification.tsx`
  - [ ] `src/components/profile/privacy-settings.tsx`
  - [ ] `src/components/profile/profile-form.tsx`
  - [ ] `src/components/profile/notification-preferences.tsx`

### 2. Environment Variables Cleanup

- [ ] Run the environment variables cleanup script for each env file:
  ```bash
  node scripts/remove-supabase-env-vars.js .env.local
  node scripts/remove-supabase-env-vars.js .env.example
  node scripts/remove-supabase-env-vars.js .env.production
  node scripts/remove-supabase-env-vars.js .env.development
  ```

### 3. Dependencies Update

- [ ] Remove Supabase dependencies and ensure Prisma dependencies:
  ```bash
  node scripts/update-dependencies.js
  ```

- [ ] Install updated dependencies:
  ```bash
  npm install
  ```

- [ ] Generate updated Prisma client:
  ```bash
  npx prisma generate
  ```

### 4. Authentication Flow Migration

- [ ] Ensure all authentication flows use Auth0 instead of Supabase Auth:
  - [ ] Update middleware/auth.ts
  - [ ] Update contexts/auth-context.tsx
  - [ ] Update providers/auth-provider.tsx
  - [ ] Update lib/auth/index.ts
  - [ ] Update lib/auth/two-factor.ts

### 5. Testing

- [ ] Run database migrations in development environment:
  ```bash
  npx prisma migrate dev
  ```

- [ ] Test API endpoints that interact with the database:
  ```bash
  npm run test:api
  ```

- [ ] Verify crucial features work correctly:
  - [ ] User authentication and authorization
  - [ ] Profile management
  - [ ] Bookings and services
  - [ ] Content creation and management
  - [ ] Admin functions

- [ ] Test for performance issues
  - [ ] Monitor query performance
  - [ ] Check for N+1 query issues
  - [ ] Optimize problematic queries

### 6. Documentation Updates

- [ ] Update README.md to reflect the new database setup
- [ ] Update DEVELOPMENT-SETUP.md to remove Supabase setup instructions
- [ ] Update API documentation to reflect Prisma query patterns
- [ ] Remove or archive Supabase-specific documentation

### 7. CI/CD Updates

- [ ] Update GitHub workflow files to remove Supabase environment variables
- [ ] Update deployment scripts to use Prisma migration commands
- [ ] Add Prisma migration to deployment pipeline

### 8. Monitoring & Cleanup

- [ ] Enable query logging in production temporarily to monitor for issues
- [ ] Set up alerts for database-related errors
- [ ] After stable release, remove compatibility layer in `src/lib/database/client.ts` 
  and use Prisma directly throughout the codebase

## Manual Attention Required

The following areas may need special attention during the migration:

1. **Complex queries**: Queries with joins, nested selections, or complex filtering
2. **Transaction handling**: Code that uses Supabase transactions
3. **Authentication**: User sessions and role-based access control
4. **Real-time subscriptions**: Any code using Supabase real-time features
5. **Storage**: Files stored in Supabase storage

## Resources

- [Prisma Documentation](https://www.prisma.io/docs/)
- [Prisma Migration Guide](https://www.prisma.io/docs/guides/migrate-to-prisma)
- [Auth0 Documentation](https://auth0.com/docs/)
- [Supabase to Prisma Migration Guide](docs/supabase-to-prisma-migration.md) 