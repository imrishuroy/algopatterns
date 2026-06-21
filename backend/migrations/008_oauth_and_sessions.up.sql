-- Migration: 008_oauth_and_sessions.up.sql
-- Adds OAuth provider support, session management, and single-session enforcement

-- OAuth provider connections
CREATE TABLE IF NOT EXISTS user_oauth_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,
    provider_user_id VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    name VARCHAR(255),
    avatar_url TEXT,
    raw_profile JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(provider, provider_user_id),
    UNIQUE(user_id, provider)
);

CREATE INDEX IF NOT EXISTS idx_oauth_provider_user ON user_oauth_providers(user_id);
CREATE INDEX IF NOT EXISTS idx_oauth_provider_lookup ON user_oauth_providers(provider, provider_user_id);
CREATE INDEX IF NOT EXISTS idx_oauth_email ON user_oauth_providers(provider, email);

-- Active sessions table (replaces refresh_tokens for single-session enforcement)
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token_hash VARCHAR(255) NOT NULL UNIQUE,
    device_info JSONB,
    ip_address_hash VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_used_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    revoked_reason VARCHAR(100)
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(refresh_token_hash);
CREATE INDEX IF NOT EXISTS idx_sessions_active ON user_sessions(user_id) WHERE revoked_at IS NULL;

-- OAuth state storage (for CSRF protection and PKCE)
CREATE TABLE IF NOT EXISTS oauth_states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    state VARCHAR(255) NOT NULL UNIQUE,
    code_verifier VARCHAR(255) NOT NULL,
    redirect_uri TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_oauth_states_state ON oauth_states(state);
CREATE INDEX IF NOT EXISTS idx_oauth_states_expires ON oauth_states(expires_at);

-- Modify users table for OAuth support
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS has_password BOOLEAN DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Existing users all have passwords
UPDATE users SET has_password = TRUE WHERE has_password IS NULL;

-- Make password_hash nullable for OAuth-only users
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- Migrate existing refresh_tokens to user_sessions
INSERT INTO user_sessions (id, user_id, refresh_token_hash, expires_at, created_at, revoked_at)
SELECT id, user_id, token_hash, expires_at, created_at, revoked_at
FROM refresh_tokens
ON CONFLICT DO NOTHING;
