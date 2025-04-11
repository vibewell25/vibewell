-- Create backup_metadata table
CREATE TABLE IF NOT EXISTS backup_metadata (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  type TEXT NOT NULL CHECK (type IN ('full', 'incremental')),
  size BIGINT NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  location TEXT NOT NULL,
  checksum TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_backup_metadata_timestamp ON backup_metadata(timestamp);
CREATE INDEX IF NOT EXISTS idx_backup_metadata_type ON backup_metadata(type);
CREATE INDEX IF NOT EXISTS idx_backup_metadata_status ON backup_metadata(status);

-- Add RLS policies
ALTER TABLE backup_metadata ENABLE ROW LEVEL SECURITY;

-- Only allow admin users to access backup metadata
CREATE POLICY "Allow admin users to manage backup metadata"
  ON backup_metadata
  USING (auth.uid() IN (
    SELECT user_id
    FROM user_roles
    WHERE role = 'admin'
  ));

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_backup_metadata_updated_at
  BEFORE UPDATE ON backup_metadata
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create view for backup statistics
CREATE OR REPLACE VIEW backup_statistics AS
SELECT
  type,
  COUNT(*) as total_backups,
  SUM(size) as total_size,
  MIN(timestamp) as oldest_backup,
  MAX(timestamp) as latest_backup,
  COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_backups,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as successful_backups
FROM backup_metadata
GROUP BY type;

-- Create function to cleanup old backups
CREATE OR REPLACE FUNCTION cleanup_old_backups(retention_days INTEGER)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM backup_metadata
  WHERE timestamp < NOW() - (retention_days || ' days')::INTERVAL
  RETURNING COUNT(*) INTO deleted_count;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to get backup summary
CREATE OR REPLACE FUNCTION get_backup_summary(days INTEGER DEFAULT 30)
RETURNS TABLE (
  day DATE,
  total_backups BIGINT,
  successful_backups BIGINT,
  failed_backups BIGINT,
  total_size BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE(timestamp) as day,
    COUNT(*) as total_backups,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as successful_backups,
    COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_backups,
    SUM(size) as total_size
  FROM backup_metadata
  WHERE timestamp >= NOW() - (days || ' days')::INTERVAL
  GROUP BY DATE(timestamp)
  ORDER BY day DESC;
END;
$$ LANGUAGE plpgsql; 