-- Add archive support for AI chat sessions
ALTER TABLE ai_sessions ADD COLUMN IF NOT EXISTS is_archived BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE ai_sessions ADD COLUMN IF NOT EXISTS title VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_ai_sessions_archived ON ai_sessions(user_id, is_archived, last_message_at DESC);
