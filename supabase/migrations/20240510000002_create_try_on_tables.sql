-- Create try-on sessions tracking tables

-- Table for try-on sessions
CREATE TABLE IF NOT EXISTS try_on_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  duration_seconds INTEGER,
  completed BOOLEAN DEFAULT false,
  feedback JSONB, -- { rating: number, would_try_in_real_life: boolean, comment: string }
  screenshots TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Add constraints and indexes for better performance
  CONSTRAINT valid_duration CHECK (duration_seconds IS NULL OR duration_seconds >= 0)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_try_on_sessions_user_id ON try_on_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_try_on_sessions_product_id ON try_on_sessions(product_id);
CREATE INDEX IF NOT EXISTS idx_try_on_sessions_created_at ON try_on_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_try_on_sessions_completed ON try_on_sessions(completed);

-- Create view for try-on analytics
CREATE OR REPLACE VIEW try_on_analytics AS
SELECT
  date_trunc('day', created_at) AS day,
  COUNT(*) AS total_sessions,
  COUNT(CASE WHEN completed = true THEN 1 END) AS completed_sessions,
  AVG(CASE WHEN completed = true THEN duration_seconds END) AS avg_duration,
  COUNT(DISTINCT user_id) AS unique_users,
  json_agg(
    json_build_object(
      'product_id', product_id,
      'count', COUNT(*)
    )
  ) FILTER (WHERE product_id IS NOT NULL) AS product_breakdown
FROM try_on_sessions
GROUP BY date_trunc('day', created_at)
ORDER BY date_trunc('day', created_at) DESC;

-- Enable Row Level Security (RLS)
ALTER TABLE try_on_sessions ENABLE ROW LEVEL SECURITY;

-- Set up RLS policies
-- Users can view their own try-on sessions
CREATE POLICY "Users can view their own try-on sessions"
  ON try_on_sessions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own try-on sessions
CREATE POLICY "Users can insert their own try-on sessions"
  ON try_on_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own try-on sessions
CREATE POLICY "Users can update their own try-on sessions"
  ON try_on_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can manage all try-on data
CREATE POLICY "Admins can manage all try-on sessions"
  ON try_on_sessions FOR ALL
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Service role can manage all try-on data
CREATE POLICY "Service role can manage all try-on sessions"
  ON try_on_sessions FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Create trigger function to track product popularity based on try-ons
CREATE OR REPLACE FUNCTION update_product_popularity_from_try_on()
RETURNS TRIGGER AS $$
BEGIN
  -- Update product popularity metrics (implement based on business rules)
  -- This is just a placeholder for actual implementation
  IF TG_OP = 'INSERT' THEN
    -- Could increment a try_on_count or similar field in products table
    -- Could update a product_popularity table with a score
    NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update product popularity when a try-on session is added
CREATE TRIGGER update_product_popularity_on_try_on
  AFTER INSERT ON try_on_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_product_popularity_from_try_on(); 