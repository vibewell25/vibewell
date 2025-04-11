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

-- Add new columns for user profile enhancements
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS profile_visibility TEXT DEFAULT 'public' CHECK (profile_visibility IN ('public', 'private', 'contacts_only')),
ADD COLUMN IF NOT EXISTS show_email BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS show_phone BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS allow_tagging BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS receive_messages_from TEXT DEFAULT 'anyone' CHECK (receive_messages_from IN ('anyone', 'contacts_only', 'none')),
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"email_notifications": true, "sms_notifications": true, "push_notifications": true, "marketing_emails": false, "booking_reminders": true, "messages_notifications": true, "promotional_notifications": false, "newsletter": false}'::jsonb;

-- Create index for role
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email_verified ON profiles(email_verified);
CREATE INDEX IF NOT EXISTS idx_profiles_profile_visibility ON profiles(profile_visibility);

-- Update RLS policies for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can read their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Service role can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Service role can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can read public profiles" ON profiles;

-- Allow users to read their own profile
CREATE POLICY "Users can read their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Allow users to read public profiles
CREATE POLICY "Users can read public profiles"
  ON profiles FOR SELECT
  USING (profile_visibility = 'public');

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