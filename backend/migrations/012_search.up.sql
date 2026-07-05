-- Global search feature tables
-- CockroachDB/PostgreSQL compatible

-- Search history for recent searches and suggestions
CREATE TABLE IF NOT EXISTS search_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    query TEXT NOT NULL,
    mode VARCHAR(20) NOT NULL DEFAULT 'keyword'
        CHECK (mode IN ('keyword', 'ai')),
    result_count INT NOT NULL DEFAULT 0,
    
    -- For anonymous users, store a session identifier
    session_id VARCHAR(100),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_search_history_user ON search_history(user_id, created_at DESC);
CREATE INDEX idx_search_history_session ON search_history(session_id, created_at DESC)
    WHERE session_id IS NOT NULL;

-- User favorites/bookmarks
CREATE TABLE IF NOT EXISTS user_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    content_type VARCHAR(50) NOT NULL,
    content_id VARCHAR(100) NOT NULL,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(user_id, content_type, content_id)
);

CREATE INDEX idx_favorites_user ON user_favorites(user_id, created_at DESC);

-- Recently viewed content tracking
CREATE TABLE IF NOT EXISTS user_recent_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    content_type VARCHAR(50) NOT NULL,
    content_id VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    url VARCHAR(500) NOT NULL,
    
    view_count INT NOT NULL DEFAULT 1,
    last_viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(user_id, content_type, content_id)
);

CREATE INDEX idx_recent_views_user ON user_recent_views(user_id, last_viewed_at DESC);

-- Add full-text search vector to patterns table
ALTER TABLE patterns ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create trigger function to update search vector for patterns
CREATE OR REPLACE FUNCTION update_pattern_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english', COALESCE(NEW.id, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.category, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for patterns
DROP TRIGGER IF EXISTS pattern_search_update ON patterns;
CREATE TRIGGER pattern_search_update
    BEFORE INSERT OR UPDATE ON patterns
    FOR EACH ROW EXECUTE FUNCTION update_pattern_search_vector();

-- Create GIN index for full-text search on patterns
CREATE INDEX IF NOT EXISTS idx_patterns_search ON patterns USING gin(search_vector);

-- Update existing patterns to populate search_vector
UPDATE patterns SET updated_at = NOW() WHERE search_vector IS NULL;

-- Add full-text search vector to problems table
ALTER TABLE problems ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create trigger function to update search vector for problems
CREATE OR REPLACE FUNCTION update_problem_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.slug, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.hints, '')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for problems
DROP TRIGGER IF EXISTS problem_search_update ON problems;
CREATE TRIGGER problem_search_update
    BEFORE INSERT OR UPDATE ON problems
    FOR EACH ROW EXECUTE FUNCTION update_problem_search_vector();

-- Create GIN index for full-text search on problems
CREATE INDEX IF NOT EXISTS idx_problems_search ON problems USING gin(search_vector);

-- Update existing problems to populate search_vector
UPDATE problems SET updated_at = NOW() WHERE search_vector IS NULL;
