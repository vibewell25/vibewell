-- Create analytics_events table for tracking user interactions
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  properties JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX analytics_events_event_idx ON analytics_events(event);
CREATE INDEX analytics_events_user_id_idx ON analytics_events(user_id);
CREATE INDEX analytics_events_session_id_idx ON analytics_events(session_id);
CREATE INDEX analytics_events_timestamp_idx ON analytics_events(timestamp);
CREATE INDEX analytics_events_properties_gin_idx ON analytics_events USING GIN (properties jsonb_path_ops);

-- Create function to get top events
CREATE OR REPLACE FUNCTION get_top_events(
  event_name TEXT,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  property_name TEXT,
  limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
  property_value TEXT,
  event_count BIGINT
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    properties->property_name AS property_value,
    COUNT(*) AS event_count
  FROM 
    analytics_events
  WHERE 
    event = event_name
    AND timestamp >= start_time
    AND timestamp <= end_time
    AND properties ? property_name
  GROUP BY 
    properties->property_name
  ORDER BY 
    COUNT(*) DESC
  LIMIT 
    limit_count;
END;
$$;

-- Create function to get event metrics over time
CREATE OR REPLACE FUNCTION get_event_metrics_by_time(
  event_name TEXT,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  interval_type TEXT DEFAULT 'day'
)
RETURNS TABLE (
  time_bucket TIMESTAMPTZ,
  event_count BIGINT
) 
LANGUAGE plpgsql
AS $$
BEGIN
  IF interval_type = 'hour' THEN
    RETURN QUERY
    SELECT 
      date_trunc('hour', timestamp) AS time_bucket,
      COUNT(*) AS event_count
    FROM 
      analytics_events
    WHERE 
      event = event_name
      AND timestamp >= start_time
      AND timestamp <= end_time
    GROUP BY 
      time_bucket
    ORDER BY 
      time_bucket;
  ELSIF interval_type = 'day' THEN
    RETURN QUERY
    SELECT 
      date_trunc('day', timestamp) AS time_bucket,
      COUNT(*) AS event_count
    FROM 
      analytics_events
    WHERE 
      event = event_name
      AND timestamp >= start_time
      AND timestamp <= end_time
    GROUP BY 
      time_bucket
    ORDER BY 
      time_bucket;
  ELSIF interval_type = 'week' THEN
    RETURN QUERY
    SELECT 
      date_trunc('week', timestamp) AS time_bucket,
      COUNT(*) AS event_count
    FROM 
      analytics_events
    WHERE 
      event = event_name
      AND timestamp >= start_time
      AND timestamp <= end_time
    GROUP BY 
      time_bucket
    ORDER BY 
      time_bucket;
  ELSIF interval_type = 'month' THEN
    RETURN QUERY
    SELECT 
      date_trunc('month', timestamp) AS time_bucket,
      COUNT(*) AS event_count
    FROM 
      analytics_events
    WHERE 
      event = event_name
      AND timestamp >= start_time
      AND timestamp <= end_time
    GROUP BY 
      time_bucket
    ORDER BY 
      time_bucket;
  ELSE
    RAISE EXCEPTION 'Invalid interval_type: %', interval_type;
  END IF;
END;
$$;

-- Create function to get unique users per event
CREATE OR REPLACE FUNCTION get_unique_users_per_event(
  event_name TEXT,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ
)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
  user_count BIGINT;
BEGIN
  SELECT 
    COUNT(DISTINCT user_id)
  INTO
    user_count
  FROM 
    analytics_events
  WHERE 
    event = event_name
    AND timestamp >= start_time
    AND timestamp <= end_time
    AND user_id IS NOT NULL;
    
  RETURN user_count;
END;
$$;

-- Create function to get conversion funnel
CREATE OR REPLACE FUNCTION get_conversion_funnel(
  funnel_events TEXT[],
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ
)
RETURNS TABLE (
  funnel_step TEXT,
  user_count BIGINT
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH funnel AS (
    SELECT
      event,
      user_id,
      MIN(timestamp) AS first_occurrence
    FROM
      analytics_events
    WHERE
      event = ANY(funnel_events)
      AND timestamp >= start_time
      AND timestamp <= end_time
      AND user_id IS NOT NULL
    GROUP BY
      event, user_id
  )
  SELECT
    event AS funnel_step,
    COUNT(DISTINCT user_id) AS user_count
  FROM
    funnel
  GROUP BY
    event
  ORDER BY
    array_position(funnel_events, event);
END;
$$;

-- Enable Row Level Security
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Anyone can insert analytics events (client-side tracking)
CREATE POLICY "Anyone can insert analytics events"
  ON analytics_events
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- Users can only view their own analytics data  
CREATE POLICY "Users can view their own analytics data"
  ON analytics_events
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Service role can manage all analytics data
CREATE POLICY "Service role can manage all analytics data"
  ON analytics_events
  FOR ALL
  TO service_role
  USING (true);

-- Admins can view all analytics data
CREATE POLICY "Admins can view all analytics data"
  ON analytics_events
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid() AND auth.users.role = 'admin'
    )
  ); 