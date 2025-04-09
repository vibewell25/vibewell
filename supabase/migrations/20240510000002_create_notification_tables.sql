-- Create the notification_log table to track all sent notifications
CREATE TABLE IF NOT EXISTS notification_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('email', 'sms', 'push')),
  notification_type TEXT NOT NULL CHECK (notification_type IN ('alert', 'feedback', 'product', 'system')),
  recipient TEXT,  -- User ID, email, or phone number
  subject TEXT,
  message TEXT NOT NULL,
  data JSONB,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on recipient for faster lookups
CREATE INDEX IF NOT EXISTS notification_log_recipient_idx ON notification_log(recipient);
CREATE INDEX IF NOT EXISTS notification_log_created_at_idx ON notification_log(created_at);
CREATE INDEX IF NOT EXISTS notification_log_type_idx ON notification_log(type);
CREATE INDEX IF NOT EXISTS notification_log_notification_type_idx ON notification_log(notification_type);

-- Create table for user notification preferences
CREATE TABLE IF NOT EXISTS user_notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email_enabled BOOLEAN DEFAULT TRUE,
  sms_enabled BOOLEAN DEFAULT FALSE,
  push_enabled BOOLEAN DEFAULT TRUE,
  marketing_enabled BOOLEAN DEFAULT TRUE,
  product_alerts_enabled BOOLEAN DEFAULT TRUE,
  feedback_enabled BOOLEAN DEFAULT TRUE,
  system_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS user_notification_preferences_user_id_idx ON user_notification_preferences(user_id);

-- Add trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_notification_log_updated_at
BEFORE UPDATE ON notification_log
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_notification_preferences_updated_at
BEFORE UPDATE ON user_notification_preferences
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for notification_log
CREATE POLICY "Authenticated users can view their own notifications"
ON notification_log FOR SELECT
TO authenticated
USING (recipient = auth.uid()::text);

CREATE POLICY "Service role can manage all notifications"
ON notification_log FOR ALL
TO service_role
USING (true);

CREATE POLICY "Admin users can view all notifications"
ON notification_log FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Create policies for user_notification_preferences
CREATE POLICY "Users can view their own notification preferences"
ON user_notification_preferences FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notification preferences"
ON user_notification_preferences FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Service role can manage all notification preferences"
ON user_notification_preferences FOR ALL
TO service_role
USING (true);

CREATE POLICY "Admin users can view all notification preferences"
ON user_notification_preferences FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid() AND role = 'admin'
  )
); 