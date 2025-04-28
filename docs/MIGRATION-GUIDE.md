# VibeWell Migration Guide

This guide provides instructions for migrating from previous authentication and database systems to the current implementation.

## Migration Plan

- **Icon Standardization**: replace direct heroicon imports with centralized `Icons` component across all components.
- **Supabase → Prisma**: finalize Prisma schema, migrate remaining services, update imports, remove Supabase code.
- **TypeScript**: address TS errors in profit calculator and icon imports.
- **Authentication**: Clerk → Auth0 migration steps completed above.

## Migration Checklist

Use this checklist to track migration progress:

- [ ] Complete Prisma model mapping (`npx prisma db pull`, `npx prisma generate`)
- [ ] Migrate remaining Supabase services and remove legacy code
- [ ] Remove Supabase environment variables and dependencies
- [ ] Update all components to use centralized `Icons`
- [ ] Refactor Auth0 flows and verify in dev/staging/production
- [ ] Fix any remaining TypeScript errors (`npm run type-check`)

## Migration Summary

This guide now covers all migration efforts:

- Authentication (Clerk → Auth0)
- Database (Supabase → Prisma)
- Icon Standardization
- TypeScript fixes
- Performance optimizations integration

**Next Steps**: testing & verification, documentation updates, cleanup of legacy files.

## Authentication Migration: Clerk to Auth0

VibeWell has migrated from Clerk to Auth0 for authentication. Here's what you need to know:

### Environment Variables

Add the following environment variables to your `.env.local` file:

```
# Auth0 Configuration
AUTH0_SECRET=yourlongsecretkey
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
AUTH0_AUDIENCE=https://api.vibewell.com
NEXT_PUBLIC_AUTH0_NAMESPACE=https://vibewell.com
```

### Auth0 Configuration

1. Create an Auth0 account and set up a tenant
2. Create a regular web application for your frontend
3. Set up the following allowed callback URLs:
   - `http://localhost:3000/api/auth/callback`
   - `https://yourdomain.com/api/auth/callback`
4. Set up the following allowed logout URLs:
   - `http://localhost:3000`
   - `https://yourdomain.com`
5. Set up the following allowed web origins:
   - `http://localhost:3000`
   - `https://yourdomain.com`
6. Create an API with the identifier matching your `AUTH0_AUDIENCE`
7. Set up roles and permissions in your Auth0 tenant

### Code Changes

Replace Clerk imports with Auth0 imports:

```ts
// Old Clerk import
import { useAuth } from '@/contexts/clerk-auth-context';

// New Auth0 import
import { useAuth } from '@/contexts/auth-context';
```

The `AuthProvider` component is available for wrapping your application:

```tsx
<AuthProvider>
  <YourApp />
</AuthProvider>
```

## Database Migration: Supabase to Prisma

VibeWell is in the process of migrating from Supabase to Prisma for database management. 

### Completed Steps

1. Created a Prisma-based database client in `src/lib/database/client.ts`
2. Added compatibility layers for existing Supabase imports:
   - `src/lib/supabase/client.ts`
   - `src/lib/supabase/index.ts`
   - `src/lib/supabase/config.ts`
3. Updated environment variables

### Remaining Steps

For complete migration from Supabase to Prisma, follow these steps:

1. **Update API Function Implementations**:
   - Review all services in `src/services/` that use Supabase
   - Refactor services to use Prisma directly instead of the compatibility layer

2. **Update Schema**:
   - Create Prisma models to match your existing database schema
   - Run `npx prisma db pull` to import existing schema

3. **Update Imports**:
   - Gradually replace `import { supabase } from '@/lib/supabase/client'` with:
     ```ts
     import { prisma } from '@/lib/database/client';
     ```

4. **Test Carefully**:
   - Test each component after migration
   - Verify database operations work as expected

### Prisma Migration Commands

```bash
# Generate Prisma client
npx prisma generate

# Pull schema from existing database
npx prisma db pull

# Push changes to database
npx prisma db push

# Run migrations
npx prisma migrate deploy
```

## Vercel Deployment

Remember to set up all environment variables in your Vercel project settings when deploying.

## Troubleshooting

If you encounter issues during migration:

1. Check the console for deprecation warnings
2. Verify all environment variables are correctly set
3. Refer to the TROUBLESHOOTING-GUIDE.md file
4. Ensure database connection strings are correct
5. Verify Auth0 configuration is correct

For detailed information on API changes, refer to the API documentation. 

---
*Other MIGRATION-*.md variants have been consolidated into this guide and removed.*