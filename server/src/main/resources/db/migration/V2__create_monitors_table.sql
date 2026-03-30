-- V2: Create the monitors table
-- Each monitor represents a URL endpoint being tracked for uptime.
-- A user can own multiple monitors.

CREATE TABLE monitors (
    id               BIGSERIAL    PRIMARY KEY,
    user_id          BIGINT       NOT NULL,
    url              VARCHAR(255) NOT NULL,
    method           VARCHAR(10)  NOT NULL,
    interval_seconds INTEGER      NOT NULL,
    timeout_seconds  INTEGER      NOT NULL,
    active           BOOLEAN      NOT NULL,
    created_at       TIMESTAMP    NOT NULL,
    updated_at       TIMESTAMP,

    CONSTRAINT fk_monitors_user FOREIGN KEY (user_id) REFERENCES users (id)
);
