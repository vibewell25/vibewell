-- Create table for analytics alerts
CREATE TABLE analytics_alerts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  threshold JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_triggered TIMESTAMPTZ,
  notification_method TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create index on user_id for faster lookups
CREATE INDEX idx_analytics_alerts_user_id ON analytics_alerts(user_id);

-- Create index on product_id for faster lookups
CREATE INDEX idx_analytics_alerts_product_id ON analytics_alerts(product_id);

-- Create table for user notifications
CREATE TABLE user_notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  alert_id UUID REFERENCES analytics_alerts(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create index on user_id for faster lookups
CREATE INDEX idx_user_notifications_user_id ON user_notifications(user_id);

-- Create index on alert_id for faster lookups
CREATE INDEX idx_user_notifications_alert_id ON user_notifications(alert_id);

-- Create index on read status for filtering unread notifications
CREATE INDEX idx_user_notifications_read ON user_notifications(read);

-- Enable Row Level Security
ALTER TABLE analytics_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies to control access to analytics alerts
-- Users can view their own alerts
CREATE POLICY "Users can view their own alerts" 
  ON analytics_alerts 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can insert their own alerts
CREATE POLICY "Users can insert their own alerts" 
  ON analytics_alerts 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own alerts
CREATE POLICY "Users can update their own alerts" 
  ON analytics_alerts 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Users can delete their own alerts
CREATE POLICY "Users can delete their own alerts" 
  ON analytics_alerts 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Admin users can manage all alerts
CREATE POLICY "Admins can manage all alerts" 
  ON analytics_alerts 
  FOR ALL 
  USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Create policies to control access to user notifications
-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications" 
  ON user_notifications 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications" 
  ON user_notifications 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications" 
  ON user_notifications 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- System role can create notifications
CREATE POLICY "System role can create notifications" 
  ON user_notifications 
  FOR INSERT 
  WITH CHECK (
    auth.jwt() ->> 'role' = 'service_role' OR
    auth.jwt() ->> 'role' = 'admin'
  );

-- Admin users can manage all notifications
CREATE POLICY "Admins can manage all notifications" 
  ON user_notifications 
  FOR ALL 
  USING (
    auth.jwt() ->> 'role' = 'admin'
  ); 