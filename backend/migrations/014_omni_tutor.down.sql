-- Rollback: Remove context_type column from ai_sessions

DROP INDEX IF EXISTS idx_ai_sessions_context_type;

ALTER TABLE ai_sessions DROP CONSTRAINT IF EXISTS ai_sessions_context_type_check;

ALTER TABLE ai_sessions DROP COLUMN IF EXISTS context_type;
