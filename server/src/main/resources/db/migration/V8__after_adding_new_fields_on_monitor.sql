ALTER TABLE monitors
    ADD check_ssl_expiration BOOLEAN;

ALTER TABLE monitors
    ADD expected_body_contains VARCHAR(500);

ALTER TABLE monitors
    ADD expected_status_codes VARCHAR(100);

ALTER TABLE monitors
    ADD headers JSONB;

ALTER TABLE monitors
    ADD name VARCHAR(255);

ALTER TABLE monitors
    ADD ssl_expiry_days_threshold INTEGER;

ALTER TABLE monitors
    ALTER COLUMN name SET NOT NULL;