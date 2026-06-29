-- Rollback AI Tutor Feature Migration

DROP VIEW IF EXISTS concept_embeddings;
DROP VIEW IF EXISTS problem_embeddings;
DROP VIEW IF EXISTS pattern_embeddings;

DROP TABLE IF EXISTS content_embeddings;
DROP TABLE IF EXISTS ai_rate_limits;
DROP TABLE IF EXISTS ai_feedback;
DROP TABLE IF EXISTS ai_usage;
DROP TABLE IF EXISTS ai_messages;
DROP TABLE IF EXISTS ai_sessions;
