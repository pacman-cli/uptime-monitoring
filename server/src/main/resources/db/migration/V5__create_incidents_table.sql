-- V5: Create the incidents table
-- Tracks downtime incidents with open/resolved timestamps.
-- An incident is opened when a monitor goes DOWN and resolved when it comes back UP.

CREATE TABLE incidents (
    id          BIGSERIAL PRIMARY KEY,
    monitor_id  BIGINT    NOT NULL,
    opened_at   TIMESTAMP,
    resolved_at TIMESTAMP,
    created_at  TIMESTAMP NOT NULL,
    updated_at  TIMESTAMP,

    CONSTRAINT fk_incidents_monitor FOREIGN KEY (monitor_id) REFERENCES monitors (id)
);
