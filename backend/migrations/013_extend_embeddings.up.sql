-- Extend content_embeddings to support additional content types
-- New types: question, solution, tutorial, article

-- Drop the existing constraints (both naming conventions used in different environments)
ALTER TABLE content_embeddings DROP CONSTRAINT IF EXISTS content_embeddings_content_type_check;
ALTER TABLE content_embeddings DROP CONSTRAINT IF EXISTS check_content_type;
ALTER TABLE content_embeddings ADD CONSTRAINT content_embeddings_content_type_check
    CHECK (content_type IN ('pattern', 'concept', 'problem', 'hint', 'question', 'solution', 'tutorial', 'article'));

-- Drop the existing chunk_type constraints and add a new one with expanded values
ALTER TABLE content_embeddings DROP CONSTRAINT IF EXISTS content_embeddings_chunk_type_check;
ALTER TABLE content_embeddings DROP CONSTRAINT IF EXISTS check_chunk_type;
ALTER TABLE content_embeddings ADD CONSTRAINT content_embeddings_chunk_type_check
    CHECK (chunk_type IN ('overview', 'insights', 'mistakes', 'template', 'hint', 'description', 'section', 'approach'));

-- Create views for new content types
CREATE VIEW IF NOT EXISTS question_embeddings AS
SELECT * FROM content_embeddings WHERE content_type = 'question';

CREATE VIEW IF NOT EXISTS solution_embeddings AS
SELECT * FROM content_embeddings WHERE content_type = 'solution';

CREATE VIEW IF NOT EXISTS tutorial_embeddings AS
SELECT * FROM content_embeddings WHERE content_type = 'tutorial';

CREATE VIEW IF NOT EXISTS article_embeddings AS
SELECT * FROM content_embeddings WHERE content_type = 'article';
