-- V4: Create the alerts table
-- Stores alert messages generated when a monitor goes down or recovers.

CREATE TABLE alerts (
    id         BIGSERIAL    PRIMARY KEY,
    monitor_id BIGINT       NOT NULL,
    message    VARCHAR(500) NOT NULL,
    created_at TIMESTAMP    NOT NULL,
    updated_at TIMESTAMP,

    CONSTRAINT fk_alerts_monitor FOREIGN KEY (monitor_id) REFERENCES monitors (id)
);
