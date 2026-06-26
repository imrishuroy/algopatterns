-- Rollback archive support for AI chat sessions
DROP INDEX IF EXISTS idx_ai_sessions_archived;
ALTER TABLE ai_sessions DROP COLUMN IF EXISTS title;
ALTER TABLE ai_sessions DROP COLUMN IF EXISTS is_archived;
