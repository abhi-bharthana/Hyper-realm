-- Extensions for UUID support
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Main Identity Table
CREATE TABLE h_users (
    hid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    google_sub TEXT UNIQUE NOT NULL, -- Google's unique user identifier
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE,            -- Optional at first, required after onboarding
    account_status VARCHAR(20) DEFAULT 'pending_onboarding',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Profile Table (Isolated for privacy)
CREATE TABLE h_profiles (
    hid UUID REFERENCES h_users(hid) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT,
    nickname TEXT,
    avatar_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexing for fast lookups
CREATE INDEX idx_h_users_username ON h_users(username);
CREATE INDEX idx_h_users_email ON h_users(email);