-- Create alert_thresholds table
CREATE TABLE IF NOT EXISTS alert_thresholds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    metric TEXT NOT NULL CHECK (metric IN ('rating', 'views', 'purchases', 'try_ons')),
    condition TEXT NOT NULL CHECK (condition IN ('below', 'above')),
    threshold NUMERIC NOT NULL,
    notification_methods TEXT[] NOT NULL,
    last_triggered TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create dashboard_notifications table for alerts and other notifications
CREATE TABLE IF NOT EXISTS dashboard_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content JSONB NOT NULL,
    is_read BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS alert_thresholds_product_id_idx ON alert_thresholds(product_id);
CREATE INDEX IF NOT EXISTS alert_thresholds_is_active_idx ON alert_thresholds(is_active);
CREATE INDEX IF NOT EXISTS dashboard_notifications_user_id_idx ON dashboard_notifications(user_id);
CREATE INDEX IF NOT EXISTS dashboard_notifications_is_read_idx ON dashboard_notifications(is_read);
CREATE INDEX IF NOT EXISTS dashboard_notifications_type_idx ON dashboard_notifications(type);

-- Create or update triggers for updated_at
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to alert_thresholds
DROP TRIGGER IF EXISTS update_alert_thresholds_timestamp ON alert_thresholds;
CREATE TRIGGER update_alert_thresholds_timestamp
BEFORE UPDATE ON alert_thresholds
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Enable Row Level Security
ALTER TABLE alert_thresholds ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for alert_thresholds
-- Admin users can do anything
CREATE POLICY admin_all_alert_thresholds ON alert_thresholds
    FOR ALL
    TO authenticated
    USING (auth.uid() IN (
        SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
    ));

-- Service role can do anything
CREATE POLICY service_all_alert_thresholds ON alert_thresholds
    FOR ALL
    TO service_role
    USING (true);

-- Create policies for dashboard_notifications
-- Users can view their own notifications
CREATE POLICY user_select_own_notifications ON dashboard_notifications
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY user_update_own_notifications ON dashboard_notifications
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

-- Admin users can do anything with notifications
CREATE POLICY admin_all_notifications ON dashboard_notifications
    FOR ALL
    TO authenticated
    USING (auth.uid() IN (
        SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
    ));

-- Service role can do anything with notifications
CREATE POLICY service_all_notifications ON dashboard_notifications
    FOR ALL
    TO service_role
    USING (true); 