-- Migration: Add context_type column to ai_sessions for Omni-Tutor support
-- This allows distinguishing between problem, pattern, and general chat sessions

-- Add context_type column with default 'problem' for backwards compatibility
ALTER TABLE ai_sessions ADD COLUMN IF NOT EXISTS context_type VARCHAR(20)
    NOT NULL DEFAULT 'problem';

-- Add check constraint for valid context types
ALTER TABLE ai_sessions ADD CONSTRAINT ai_sessions_context_type_check
    CHECK (context_type IN ('problem', 'pattern', 'general'));

-- Backfill existing rows based on existing data
UPDATE ai_sessions SET context_type = 'pattern' WHERE pattern_id IS NOT NULL AND problem_id IS NULL;
UPDATE ai_sessions SET context_type = 'problem' WHERE problem_id IS NOT NULL;

-- Create index for efficient general session lookups
CREATE INDEX IF NOT EXISTS idx_ai_sessions_context_type
    ON ai_sessions (user_id, context_type, is_archived, last_message_at DESC);
