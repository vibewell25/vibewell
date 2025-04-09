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