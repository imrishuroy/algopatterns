-- Pattern progress tracking for course-like tutorial navigation
CREATE TABLE IF NOT EXISTS pattern_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pattern_id VARCHAR(100) NOT NULL,
    section_index INTEGER NOT NULL,
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, pattern_id, section_index)
);

-- Index for fast lookups by user and pattern
CREATE INDEX IF NOT EXISTS idx_pattern_progress_user_pattern
    ON pattern_progress(user_id, pattern_id);
