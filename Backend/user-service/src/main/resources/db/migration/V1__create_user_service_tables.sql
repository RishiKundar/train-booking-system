-- =========================================================
-- USER SERVICE - INITIAL SCHEMA
-- Version: V1
-- Purpose: Create core authentication & authorization tables
-- =========================================================


-- Enable UUID generation (PostgreSQL)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

------------------------------------------------------------
-- USERS TABLE
------------------------------------------------------------
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    username VARCHAR(100) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,

    email_id VARCHAR(150) NOT NULL UNIQUE,
    mobile_no VARCHAR(20) NOT NULL UNIQUE,

    password VARCHAR(255) NOT NULL,

    is_mobile_verified BOOLEAN DEFAULT FALSE,
    is_email_verified BOOLEAN DEFAULT FALSE,

    active_flag BOOLEAN DEFAULT TRUE,
    is_account_locked BOOLEAN DEFAULT FALSE,

    incorrect_password_cnt INT DEFAULT 0,
    acc_unlock_time TIMESTAMP,

    password_last_changed TIMESTAMP,

    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP
);

------------------------------------------------------------
-- ROLES TABLE
------------------------------------------------------------
CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    role VARCHAR(50) NOT NULL UNIQUE
);

------------------------------------------------------------
-- USER_ROLES (MANY-TO-MANY)
------------------------------------------------------------
CREATE TABLE user_roles (
    user_id UUID NOT NULL,
    role_id BIGINT NOT NULL,

    CONSTRAINT pk_user_roles PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_user_roles_user
        FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_user_roles_role
        FOREIGN KEY (role_id) REFERENCES roles(id)
);


------------------------------------------------------------
-- REFRESH TOKENS TABLE
------------------------------------------------------------
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    user_id UUID NOT NULL,
    token VARCHAR(500) NOT NULL UNIQUE,
    expiry_date TIMESTAMP NOT NULL,
    revoked BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_refresh_token_user
        FOREIGN KEY (user_id) REFERENCES users(id)
);


------------------------------------------------------------
-- INDEXES (PERFORMANCE & SECURITY)
------------------------------------------------------------
CREATE INDEX idx_users_email ON users(email_id);
CREATE INDEX idx_users_mobile ON users(mobile_no);
CREATE INDEX idx_refresh_token_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_token_user ON refresh_tokens(user_id);