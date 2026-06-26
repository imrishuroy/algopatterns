-- AI Tutor Feature Migration
-- Creates tables for AI sessions, messages, usage tracking, feedback, and vector embeddings

-- AI conversation sessions
CREATE TABLE IF NOT EXISTS ai_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    problem_id UUID REFERENCES problems(id) ON DELETE SET NULL,
    pattern_id VARCHAR(50),
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_message_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    message_count INT NOT NULL DEFAULT 0,
    total_tokens INT NOT NULL DEFAULT 0,

    INDEX idx_ai_sessions_user (user_id),
    INDEX idx_ai_sessions_problem (problem_id),
    INDEX idx_ai_sessions_last_message (last_message_at DESC)
);

-- Individual AI messages
CREATE TABLE IF NOT EXISTS ai_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES ai_sessions(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    message_type VARCHAR(30) CHECK (message_type IN ('hint', 'review', 'explain', 'chat', 'pattern')),
    tokens_used INT,
    model_used VARCHAR(50),
    provider_used VARCHAR(30),
    latency_ms INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    INDEX idx_ai_messages_session (session_id, created_at)
);

-- AI usage tracking (for rate limiting and analytics)
CREATE TABLE IF NOT EXISTS ai_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    request_count INT NOT NULL DEFAULT 0,
    tokens_input INT NOT NULL DEFAULT 0,
    tokens_output INT NOT NULL DEFAULT 0,
    cost_cents INT NOT NULL DEFAULT 0,

    UNIQUE (user_id, date),
    INDEX idx_ai_usage_user_date (user_id, date DESC)
);

-- AI feedback (for model improvement)
CREATE TABLE IF NOT EXISTS ai_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES ai_messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    feedback_type VARCHAR(30) CHECK (feedback_type IN ('helpful', 'unhelpful', 'gave_answer', 'wrong', 'other')),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    UNIQUE (message_id, user_id)
);

-- Rate limits (for MVP without Redis - DB-based rate limiting)
CREATE TABLE IF NOT EXISTS ai_rate_limits (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    window_start TIMESTAMPTZ NOT NULL,
    request_count INT NOT NULL DEFAULT 1,

    PRIMARY KEY (user_id, window_start),
    INDEX idx_ai_rate_limits_window (window_start)
);

-- Content embeddings for RAG (CockroachDB 24.2+ Vector Search)
-- Using CockroachDB's native VECTOR type (pgvector-compatible)
CREATE TABLE IF NOT EXISTS content_embeddings (
    id VARCHAR(100) PRIMARY KEY,
    content_type VARCHAR(30) NOT NULL CHECK (content_type IN ('pattern', 'concept', 'problem', 'hint')),
    source_id VARCHAR(100) NOT NULL,
    chunk_type VARCHAR(30) NOT NULL CHECK (chunk_type IN ('overview', 'insights', 'mistakes', 'template', 'hint', 'description')),
    language VARCHAR(20),
    content TEXT NOT NULL,
    content_hash VARCHAR(64) NOT NULL,
    embedding VECTOR(1536) NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    INDEX idx_content_embeddings_type (content_type),
    INDEX idx_content_embeddings_source (source_id),
    INDEX idx_content_embeddings_language (language),
    INDEX idx_content_embeddings_chunk_type (chunk_type)
);

-- Pattern-specific embeddings view for convenience
CREATE VIEW IF NOT EXISTS pattern_embeddings AS
SELECT * FROM content_embeddings WHERE content_type = 'pattern';

-- Problem-specific embeddings view
CREATE VIEW IF NOT EXISTS problem_embeddings AS
SELECT * FROM content_embeddings WHERE content_type = 'problem';

-- Concept-specific embeddings view
CREATE VIEW IF NOT EXISTS concept_embeddings AS
SELECT * FROM content_embeddings WHERE content_type = 'concept';
