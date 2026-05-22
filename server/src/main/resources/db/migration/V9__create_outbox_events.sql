CREATE TABLE outbox_events (
    id BIGSERIAL PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    payload TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    processed_at TIMESTAMP
);

CREATE INDEX idx_outbox_events_unprocessed ON outbox_events (created_at) WHERE processed_at IS NULL;
