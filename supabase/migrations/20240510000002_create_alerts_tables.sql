-- Create alert_thresholds table
CREATE TABLE alert_thresholds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    metric TEXT NOT NULL CHECK (metric IN ('rating', 'views', 'purchases', 'try_ons')),
    condition TEXT NOT NULL CHECK (condition IN ('below', 'above')),
    threshold NUMERIC NOT NULL,
    notification_methods TEXT[] NOT NULL,
    last_triggered TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create dashboard_notifications table for alert notifications
CREATE TABLE dashboard_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL CHECK (type IN ('alert', 'system', 'feedback')),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content JSONB NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX idx_alert_thresholds_product_id ON alert_thresholds(product_id);
CREATE INDEX idx_alert_thresholds_is_active ON alert_thresholds(is_active);
CREATE INDEX idx_alert_thresholds_metric ON alert_thresholds(metric);
CREATE INDEX idx_dashboard_notifications_user_id ON dashboard_notifications(user_id);
CREATE INDEX idx_dashboard_notifications_is_read ON dashboard_notifications(is_read);
CREATE INDEX idx_dashboard_notifications_type ON dashboard_notifications(type);
CREATE INDEX idx_dashboard_notifications_created_at ON dashboard_notifications(created_at);

-- Enable Row Level Security
ALTER TABLE alert_thresholds ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for alert_thresholds
CREATE POLICY "Admins can manage alert thresholds" ON alert_thresholds
    FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Service role can manage alert thresholds" ON alert_thresholds
    FOR ALL
    TO service_role
    USING (true);

-- Create RLS policies for dashboard_notifications
CREATE POLICY "Users can view their own notifications" ON dashboard_notifications
    FOR SELECT
    TO authenticated
    USING (
        user_id = auth.uid() OR 
        user_id IS NULL AND auth.jwt() ->> 'role' = 'admin'
    );

CREATE POLICY "Users can mark their notifications as read" ON dashboard_notifications
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin')
    WITH CHECK (user_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Service role can manage notifications" ON dashboard_notifications
    FOR ALL
    TO service_role
    USING (true);

-- Create trigger function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for alert_thresholds
CREATE TRIGGER update_alert_thresholds_updated_at
BEFORE UPDATE ON alert_thresholds
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column(); 