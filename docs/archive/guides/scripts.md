# VibeWell Scripts

This directory contains utility scripts for the VibeWell platform.

## Supabase to Prisma Migration Scripts

### identify-missing-tables.js

This script identifies tables that exist in Supabase migrations but are missing from the Prisma schema.

```bash
node scripts/identify-missing-tables.js
```

**Features:**
- Extracts table names from Prisma schema
- Extracts table names from Supabase SQL migrations
- Compares the two sets to find missing tables
- Identifies tables that might be redundant
- Provides next steps for migration

### migrate-from-supabase.js

This script helps identify files that use Supabase and suggests replacements with Prisma.

```bash
node scripts/migrate-from-supabase.js
```

**Features:**
- Scans the codebase for Supabase imports
- Provides a summary of files using Supabase
- Checks for Supabase environment variables
- Shows examples of how to migrate from Supabase to Prisma

### cleanup-supabase.js

This script helps clean up Supabase references after the migration to Prisma is complete.

```bash
node scripts/cleanup-supabase.js
```

**Features:**
- Identifies files with Supabase imports
- Lists Supabase dependencies in package.json
- Finds Supabase environment variables
- Lists files that can be safely removed
- Provides next steps for cleanup

## Migration Process

The complete migration process from Supabase to Prisma involves:

1. Run `identify-missing-tables.js` to find tables that need to be added to Prisma schema
2. Update the Prisma schema with missing models
3. Run `migrate-from-supabase.js` to identify files that need to be updated
4. Migrate services and components to use Prisma instead of Supabase
5. Run `cleanup-supabase.js` to identify remaining cleanup tasks
6. Remove Supabase dependencies and files once migration is complete

Refer to `docs/supabase-to-prisma-migration.md` for a complete migration guide. 