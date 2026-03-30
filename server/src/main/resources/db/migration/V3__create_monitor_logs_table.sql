-- V3: Create the monitor_logs table
-- Stores the result of every health-check performed against a monitor.
-- Used for uptime calculations, latency percentiles, and historical reporting.

CREATE TABLE monitor_logs (
    id            BIGSERIAL   PRIMARY KEY,
    monitor_id    BIGINT      NOT NULL,
    status        VARCHAR(20) NOT NULL,
    status_code   INTEGER,
    response_time BIGINT,
    created_at    TIMESTAMP   NOT NULL,
    updated_at    TIMESTAMP,

    CONSTRAINT fk_monitor_logs_monitor FOREIGN KEY (monitor_id) REFERENCES monitors (id)
);
