# Analytics System Setup & Usage Guide

This document provides instructions for setting up and using the ViBEWELL analytics system, which tracks user engagement with the virtual try-on feature.

## Table of Contents

1. [Database Setup](#database-setup)
2. [Admin User Setup](#admin-user-setup)
3. [Testing Analytics](#testing-analytics)
4. [Admin Dashboard](#admin-dashboard)
5. [Customizing Analytics](#customizing-analytics)

## Database Setup

The analytics system requires several database tables to store try-on sessions and share analytics data.

### Running SQL Migrations

1. Navigate to your Supabase project dashboard
2. Go to the SQL Editor
3. Create a new query
4. Run the following migration files in order:

First, execute the contents of `supabase/migrations/20240301000000_create_analytics_tables.sql` to create the analytics tables:

```sql
-- Create try_on_sessions table
CREATE TABLE IF NOT EXISTS try_on_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('makeup', 'hairstyle', 'accessory')),
  product_id TEXT,
  product_name TEXT,
  duration INTEGER NOT NULL,
  intensity INTEGER,
  success BOOLEAN NOT NULL DEFAULT true,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create share_analytics table
CREATE TABLE IF NOT EXISTS share_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('email', 'social', 'download')),
  success BOOLEAN NOT NULL DEFAULT true,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_try_on_sessions_user_id ON try_on_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_try_on_sessions_created_at ON try_on_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_try_on_sessions_type ON try_on_sessions(type);
CREATE INDEX IF NOT EXISTS idx_share_analytics_user_id ON share_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_share_analytics_created_at ON share_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_share_analytics_method ON share_analytics(method);

-- Set up Row Level Security (RLS) policies
ALTER TABLE try_on_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE share_analytics ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can read their own try-on sessions" ON try_on_sessions;
DROP POLICY IF EXISTS "Users can insert their own try-on sessions" ON try_on_sessions;
DROP POLICY IF EXISTS "Users can read their own share analytics" ON share_analytics;
DROP POLICY IF EXISTS "Users can insert their own share analytics" ON share_analytics;
DROP POLICY IF EXISTS "Service role can read all analytics" ON try_on_sessions;
DROP POLICY IF EXISTS "Service role can read all share analytics" ON share_analytics;

-- Allow users to read their own sessions
CREATE POLICY "Users can read their own try-on sessions"
  ON try_on_sessions FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Allow users to insert their own sessions
CREATE POLICY "Users can insert their own try-on sessions"
  ON try_on_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Allow users to read their own share analytics
CREATE POLICY "Users can read their own share analytics"
  ON share_analytics FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Allow users to insert their own share analytics
CREATE POLICY "Users can insert their own share analytics"
  ON share_analytics FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Allow service role to read all analytics (for admin dashboard)
CREATE POLICY "Service role can read all analytics"
  ON try_on_sessions FOR SELECT
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can read all share analytics"
  ON share_analytics FOR SELECT
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Allow admins to read all analytics
CREATE POLICY "Admins can read all try-on sessions"
  ON try_on_sessions FOR SELECT
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Admins can read all share analytics"
  ON share_analytics FOR SELECT
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
```

Then, execute the contents of `supabase/migrations/20240301000001_update_profiles_table.sql` to add the admin roles:

```sql
-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  username TEXT,
  full_name TEXT,
  avatar_url TEXT,
  website TEXT
);

-- Add role column to profiles table if it doesn't exist
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- Create index for role
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Update RLS policies for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can read their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Service role can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Service role can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- Allow users to read their own profile
CREATE POLICY "Users can read their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Allow service role to read all profiles
CREATE POLICY "Service role can read all profiles"
  ON profiles FOR SELECT
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Allow service role to update all profiles
CREATE POLICY "Service role can update all profiles"
  ON profiles FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Allow admins to read all profiles
CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Allow admins to update all profiles
CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
```

### Verifying Table Creation

After running the migrations, you can verify the tables were created with these SQL queries:

```sql
-- Check try_on_sessions table
SELECT * FROM try_on_sessions LIMIT 5;

-- Check share_analytics table
SELECT * FROM share_analytics LIMIT 5;

-- Check profiles table with role column
SELECT id, role FROM profiles LIMIT 5;
```

## Admin User Setup

To access the analytics dashboard, users need admin privileges. We've created a special admin setup page to simplify this process.

### Using the Admin Setup Page

1. Navigate to `/admin/setup` in your application
2. You'll see two options:
   - **Create First Admin**: Use this for initial setup
   - **Set Admin**: Use this to add more admin users later

3. Enter the user UUID (found in Supabase Authentication dashboard)
4. Click the appropriate button to grant admin access

### Manual Setup (via SQL)

If you prefer to manually set up an admin user, you can run the following SQL:

```sql
-- Set a specific user as admin
UPDATE profiles 
SET role = 'admin' 
WHERE id = 'your-user-uuid';

-- If the profile doesn't exist yet, create it
INSERT INTO profiles (id, role, updated_at)
VALUES ('your-user-uuid', 'admin', NOW())
ON CONFLICT (id) DO UPDATE
SET role = 'admin', updated_at = NOW();
```

## Testing Analytics

To verify that the analytics system is working correctly, we've created a test page:

1. Navigate to `/test` in your application
2. Use the provided buttons to simulate:
   - Try-on sessions for different product types
   - Shares via different methods
   - Error scenarios

3. After running tests, check your database to verify data is being recorded:

```sql
-- Check recent try-on sessions
SELECT * FROM try_on_sessions ORDER BY created_at DESC LIMIT 10;

-- Check recent share analytics
SELECT * FROM share_analytics ORDER BY created_at DESC LIMIT 10;
```

## Admin Dashboard

The analytics dashboard provides visualization of user engagement data.

### Accessing the Dashboard

1. Log in with an admin account
2. Navigate to `/admin/analytics`
3. You'll see metrics including:
   - Total sessions
   - Unique users
   - Average duration
   - Success rate
   - Try-on sessions by type (makeup, hairstyle, accessory)
   - Shares by method (social, email, download)

### Using Dashboard Features

- **Time Range Selection**: Filter data by day, week, month, or custom date range
- **Custom Date Range**: Select specific start and end dates
- **Export**: Download analytics data as a CSV file for further analysis

## Customizing Analytics

If you need to customize the analytics tracking, here are the key files to modify:

- `src/services/analytics-service.ts`: Core service that handles tracking and retrieval
- `src/components/ar/virtual-try-on.tsx`: Implementation of session tracking in the AR component
- `src/components/ar/share-dialog.tsx`: Implementation of share tracking in the dialog
- `src/app/admin/analytics/page.tsx`: Admin dashboard UI and metrics visualization

### Adding New Metrics

To add new metrics to track:

1. Update the relevant interface in `analytics-service.ts`
2. Add tracking in the appropriate component
3. Update the dashboard to display the new metrics

### Data Retention

By default, all analytics data is stored indefinitely. If you need data retention policies:

1. Create a scheduled function in Supabase to clean up old data
2. Run a query like:

```sql
DELETE FROM try_on_sessions WHERE created_at < NOW() - INTERVAL '1 year';
DELETE FROM share_analytics WHERE created_at < NOW() - INTERVAL '1 year';
``` 