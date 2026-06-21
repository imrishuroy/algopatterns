-- Migration: 008_oauth_and_sessions.down.sql
-- Rollback OAuth and session changes

DROP TABLE IF EXISTS oauth_states;
DROP TABLE IF EXISTS user_sessions;
DROP TABLE IF EXISTS user_oauth_providers;

ALTER TABLE users DROP COLUMN IF EXISTS has_password;
ALTER TABLE users DROP COLUMN IF EXISTS avatar_url;

-- Restore NOT NULL constraint on password_hash
-- Note: This will fail if there are OAuth-only users without passwords
-- In that case, you need to handle those users first
ALTER TABLE users ALTER COLUMN password_hash SET NOT NULL;
