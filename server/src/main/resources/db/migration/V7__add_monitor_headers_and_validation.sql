-- Add custom headers support (stored as JSONB for flexibility)
ALTER TABLE monitors ADD COLUMN headers JSONB;

-- Add expected status codes support (comma-separated: "200,201,204")
ALTER TABLE monitors ADD COLUMN expected_status_codes VARCHAR(100);

-- Add response body validation (keyword that must be present)
ALTER TABLE monitors ADD COLUMN expected_body_contains VARCHAR(500);

-- Add SSL certificate expiration check flag
ALTER TABLE monitors ADD COLUMN check_ssl_expiration BOOLEAN DEFAULT FALSE;

-- Add SSL certificate expiration days (days before expiry to alert)
ALTER TABLE monitors ADD COLUMN ssl_expiry_days_threshold INTEGER DEFAULT 30;

-- Add index for better query performance
CREATE INDEX idx_monitors_check_ssl ON monitors(check_ssl_expiration) WHERE check_ssl_expiration = TRUE;
