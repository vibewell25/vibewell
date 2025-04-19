# Supabase to Prisma Migration Plan

This document outlines the comprehensive plan to complete the migration from Supabase to Prisma for the VibeWell platform.

## Current Status

The migration from Supabase to Prisma is partially complete:

- ✅ Prisma schema created and configured
- ✅ Basic Prisma client implementation
- ✅ Environment variables for database connection updated
- ✅ Automatic migration script created
- ✅ Environment variables cleanup script created
- ❌ Several files still use Supabase directly
- ❌ Some Supabase-specific code patterns remain

## Migration Steps

### 1. Manual Code Updates

Files requiring manual updates (based on migration script output):

| File | Changes Needed |
|------|---------------|
| `src/app/admin/rate-limits/page.tsx` | Replace Supabase auth with Auth0 or Prisma queries |
| `src/app/api/analytics/track/route.ts` | Replace Supabase auth with Auth0 |
| `src/app/api/auth/password-reset/route.ts` | Replace with Auth0 password reset flow |
| `src/app/api/payments/route.ts` | Replace Supabase auth with Auth0 and DB queries with Prisma |
| `src/app/api/reviews/route.ts` | Complete migration to Prisma (partially done) |
| `src/app/auth/callback/page.tsx` | Replace with Auth0 callback handling |
| `src/app/auth/mfa-setup/page.tsx` | Replace with Auth0 MFA setup flow |
| `src/components/profile/notification-preferences.tsx` | Update to use Prisma |
| `src/components/profile/privacy-settings.tsx` | Update to use Prisma |
| `src/contexts/__tests__/auth-context.test.tsx` | Update mocks to reflect Auth0 instead of Supabase |
| `src/middleware/auth.ts` | Replace Supabase auth with Auth0 middleware |
| `src/pages/api/_backup/graphql.ts` | Update or remove if obsolete |

### 2. Authentication Migration

Replace Supabase Auth with Auth0:

1. Ensure Auth0 is properly configured (see `SERVICE-SETUP-GUIDE.md`)
2. Update all authentication flows:
   - Login/Logout
   - Registration
   - Password Reset
   - Email Verification
   - MFA Setup
   - Session Management

#### Example of Auth0 Implementation:

```typescript
// OLD Supabase Auth
const { data: { session } } = await supabase.auth.getSession();

// NEW Auth0
import { getSession } from '@auth0/nextjs-auth0';
const session = await getSession();
```

### 3. Database Query Migration

Replace all remaining Supabase database queries with Prisma:

#### Example of Prisma Implementation:

```typescript
// OLD Supabase Query
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId);

// NEW Prisma Query
const user = await prisma.user.findUnique({
  where: { id: userId }
});
```

For complex queries:

```typescript
// OLD Supabase with Joins
const { data, error } = await supabase
  .from('providers')
  .select(`
    *,
    services (*),
    reviews (*)
  `)
  .eq('id', providerId);

// NEW Prisma with Relations
const provider = await prisma.provider.findUnique({
  where: { id: providerId },
  include: {
    services: true,
    reviews: true
  }
});
```

### 4. Remove Supabase Dependencies

After all code has been migrated:

1. Remove Supabase packages from dependencies:
   - `@supabase/auth-helpers-nextjs`
   - `@supabase/ssr`
   - `@supabase/supabase-js`

2. Run:
```bash
npm uninstall @supabase/auth-helpers-nextjs @supabase/ssr @supabase/supabase-js
```

### 5. Testing

1. **Unit Tests**:
   - Update all tests that mock Supabase
   - Ensure they now properly mock Prisma and Auth0

2. **Integration Tests**:
   - Test all API endpoints
   - Verify database operations
   - Check authentication flows

3. **End-to-End Tests**:
   - Run full E2E tests to verify complete workflows
   - Test user journeys that involve database and auth operations

### 6. Documentation Updates

1. **Update `TROUBLESHOOTING-GUIDE.md`**:
   - Remove or update Supabase-specific troubleshooting steps
   - Add Prisma-specific troubleshooting information

2. **Update `README.md` and other docs**:
   - Remove references to Supabase
   - Update database setup instructions to focus on Prisma
   - Update authentication setup to focus on Auth0

### 7. Cleanup

1. Remove any lingering Supabase files:
   - `/src/lib/supabase/` directory
   - Any migration files in `supabase/` directory

2. Delete migration scripts once complete:
   - `scripts/migrate-remaining-supabase.js`
   - `scripts/remove-supabase-env-vars.js`

## Rollback Plan

In case issues arise during the migration:

1. Keep Git commits small and focused
2. Document database schema changes
3. Have a backup plan for reverting to Supabase if critical issues occur
4. Consider a phased rollout to production

## Timeline

| Task | Estimated Time | Priority |
|------|---------------|----------|
| Manual code updates | 3-5 days | High |
| Authentication migration | 2-3 days | High |
| Database query migration | 2-4 days | High |
| Remove dependencies | 1 day | Medium |
| Testing | 3-4 days | High |
| Documentation updates | 1-2 days | Medium |
| Cleanup | 1 day | Low |

## Resources

- [Prisma Documentation](https://www.prisma.io/docs/)
- [Auth0 Next.js SDK](https://auth0.com/docs/quickstart/webapp/nextjs)
- [Existing Migration Guide](./supabase-to-prisma-migration.md) 