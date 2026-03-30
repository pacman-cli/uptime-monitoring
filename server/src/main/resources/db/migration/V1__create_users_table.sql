-- V1: Create the users table
-- This is the foundational table for authentication and user management.
-- All monitors, alerts, and incidents are ultimately owned by a user.

CREATE TABLE users (
    id         BIGSERIAL    PRIMARY KEY,
    email      VARCHAR(255) NOT NULL,
    password   VARCHAR(255) NOT NULL,
    created_at TIMESTAMP    NOT NULL,
    updated_at TIMESTAMP,

    CONSTRAINT uq_users_email UNIQUE (email)
);
