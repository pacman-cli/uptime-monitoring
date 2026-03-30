-- V6: Add performance indexes based on application query patterns
-- These indexes optimize the most common repository queries.

-- monitors: lookup by user and by active status (MonitorRepository)
CREATE INDEX idx_monitors_user_id ON monitors (user_id);
CREATE INDEX idx_monitors_active  ON monitors (active);

-- monitor_logs: queries order by created_at and filter by monitor_id (MonitorLogRepository)
CREATE INDEX idx_monitor_logs_monitor_created ON monitor_logs (monitor_id, created_at DESC);

-- monitor_logs: native query for latency percentiles filters on response_time IS NOT NULL
CREATE INDEX idx_monitor_logs_monitor_response ON monitor_logs (monitor_id, response_time)
    WHERE response_time IS NOT NULL;

-- alerts: joined query filtering by user via monitor (AlertRepository)
CREATE INDEX idx_alerts_monitor_id ON alerts (monitor_id);
CREATE INDEX idx_alerts_created_at ON alerts (created_at DESC);

-- incidents: find open incidents by monitor (IncidentRepository)
CREATE INDEX idx_incidents_monitor_resolved ON incidents (monitor_id, resolved_at);
CREATE INDEX idx_incidents_opened_at        ON incidents (opened_at DESC);
