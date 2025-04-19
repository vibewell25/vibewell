# Supabase to Prisma Migration Guide

This document provides a comprehensive guide for completing the migration from Supabase to Prisma in the VibeWell platform.

## Current Migration Status

The VibeWell platform is in the process of migrating from Supabase to Prisma as the primary database client. Here's the current status:

- ✅ Prisma schema created and configured
- ✅ Database client compatibility layer implemented
- ✅ Database connection configured for Prisma
- ✅ Deprecated warnings added to Supabase client modules
- ❌ Legacy Supabase migration files still present
- ❌ Some code still directly imports from Supabase
- ❌ Environment variables for Supabase still present

## Handling Remaining Supabase Files

### 1. Migrate SQL Schemas to Prisma

The `supabase/migrations/*.sql` files contain SQL schemas that need to be migrated to Prisma format:

1. **Create Prisma Migrations**:

   For each Supabase SQL migration, create an equivalent Prisma migration:

   ```bash
   # First, ensure your Prisma schema is up-to-date with the current database
   npx prisma db pull

   # Then create a new migration for each feature
   npx prisma migrate dev --name feature_name
   ```

2. **Convert SQL to Prisma Schema**:

   Example of converting a SQL table to Prisma schema:

   ```sql
   -- SQL (Supabase)
   CREATE TABLE try_on_sessions (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     type TEXT NOT NULL CHECK (type IN ('makeup', 'hairstyle', 'accessory')),
     product_id TEXT,
     duration INTEGER NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
   );
   ```

   Becomes:

   ```prisma
   // Prisma
   model TryOnSession {
     id        String   @id @default(uuid())
     userId    String   
     type      String   
     productId String?
     duration  Int
     createdAt DateTime @default(now())
     user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

     @@map("try_on_sessions")
   }
   ```

3. **Handle Custom SQL Functions**:

   For any custom SQL functions in Supabase migrations, you'll need to:
   
   - Create equivalent Prisma Client extensions
   - Or use `prisma.$queryRaw` for raw SQL queries
   - Or implement the functionality in application code

### 2. Remove Supabase Directory

Once all schemas have been migrated to Prisma:

1. Create a backup of the `supabase` directory:

   ```bash
   cp -r supabase supabase.backup
   ```

2. Remove the Supabase directory:

   ```bash
   rm -rf supabase
   ```

3. Update any scripts that reference the Supabase directory:
   - Check `scripts/setup-test-db.js` and other setup scripts
   - Update CI/CD workflows that might reference Supabase

### 3. Update Test Environment

If you were using Supabase for local testing:

1. Update the test environment to use a local PostgreSQL database with Prisma
2. Modify test scripts to use Prisma instead of Supabase
3. Update any mock implementations for testing

## Code Migration Steps

### 1. Find and Replace Supabase Imports

Use the migration helper script to identify files that still import from Supabase:

```bash
node scripts/migrate-from-supabase.js
```

Replace the imports as follows:

```typescript
// OLD
import { supabase } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

// NEW
import { prisma } from '@/lib/database/client';
import { User } from '@prisma/client';
```

### 2. Convert Query Patterns

Convert Supabase query patterns to Prisma patterns:

```typescript
// OLD: Supabase
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId);

// NEW: Prisma
const user = await prisma.user.findUnique({
  where: { id: userId }
});
```

More complex query examples:

```typescript
// OLD: Supabase with joins
const { data, error } = await supabase
  .from('posts')
  .select(`
    *,
    user:user_id (id, name, avatar),
    comments (*)
  `)
  .eq('status', 'published')
  .order('created_at', { ascending: false });

// NEW: Prisma with relations
const posts = await prisma.post.findMany({
  where: { status: 'published' },
  include: {
    user: {
      select: { id: true, name: true, avatar: true }
    },
    comments: true
  },
  orderBy: { createdAt: 'desc' }
});
```

### 3. Remove Compatibility Layer Usage

Gradually remove usage of the compatibility layer:

```typescript
// OLD: Using compatibility layer
import { supabase } from '@/lib/database/client';

const data = await supabase
  .from('users')
  .select('*')
  .eq('id', userId);

// NEW: Using Prisma directly
import { prisma } from '@/lib/database/client';

const user = await prisma.user.findUnique({
  where: { id: userId }
});
```

## Clean Up Environment Variables

1. Mark Supabase variables as deprecated in your `.env.example` file
2. Remove Supabase variables from deployment environments
3. Update documentation to reflect the change

## Testing the Migration

1. Run database migrations in development and staging environments
2. Test all API endpoints that interact with the database
3. Verify that all features work correctly
4. Check for performance regressions
5. Test error handling

## Rollback Plan

In case of issues:

1. Keep the Supabase compatibility layer until confident in the migration
2. Document how to revert to Supabase if necessary
3. Consider running both systems in parallel during the transition period

## Next Steps After Migration

1. Optimize Prisma queries for performance
2. Implement proper database indexing
3. Set up database monitoring
4. Update documentation to reflect the new database access patterns

## Resources

- [Prisma Documentation](https://www.prisma.io/docs/)
- [Prisma Migration Guide](https://www.prisma.io/docs/guides/migrate-to-prisma)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference) 