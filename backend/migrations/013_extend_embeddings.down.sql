-- Revert content_embeddings constraints to original values

-- Drop new views
DROP VIEW IF EXISTS article_embeddings;
DROP VIEW IF EXISTS tutorial_embeddings;
DROP VIEW IF EXISTS solution_embeddings;
DROP VIEW IF EXISTS question_embeddings;

-- Delete new content types from table
DELETE FROM content_embeddings WHERE content_type IN ('question', 'solution', 'tutorial', 'article');

-- Restore original constraints
ALTER TABLE content_embeddings DROP CONSTRAINT IF EXISTS content_embeddings_content_type_check;
ALTER TABLE content_embeddings ADD CONSTRAINT content_embeddings_content_type_check
    CHECK (content_type IN ('pattern', 'concept', 'problem', 'hint'));

ALTER TABLE content_embeddings DROP CONSTRAINT IF EXISTS content_embeddings_chunk_type_check;
ALTER TABLE content_embeddings ADD CONSTRAINT content_embeddings_chunk_type_check
    CHECK (chunk_type IN ('overview', 'insights', 'mistakes', 'template', 'hint', 'description'));
