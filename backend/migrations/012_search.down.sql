-- Rollback search feature tables

-- Drop triggers
DROP TRIGGER IF EXISTS problem_search_update ON problems;
DROP TRIGGER IF EXISTS pattern_search_update ON patterns;

-- Drop trigger functions
DROP FUNCTION IF EXISTS update_problem_search_vector();
DROP FUNCTION IF EXISTS update_pattern_search_vector();

-- Drop indexes
DROP INDEX IF EXISTS idx_problems_search;
DROP INDEX IF EXISTS idx_patterns_search;

-- Drop search vector columns
ALTER TABLE problems DROP COLUMN IF EXISTS search_vector;
ALTER TABLE patterns DROP COLUMN IF EXISTS search_vector;

-- Drop tables
DROP TABLE IF EXISTS user_recent_views;
DROP TABLE IF EXISTS user_favorites;
DROP TABLE IF EXISTS search_history;
