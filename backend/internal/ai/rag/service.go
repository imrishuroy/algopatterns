package rag

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/rs/zerolog/log"
)

// Service handles RAG operations including embedding and retrieval
type Service struct {
	db        *pgxpool.Pool
	embedding EmbeddingProvider
}

// NewService creates a new RAG service
func NewService(db *pgxpool.Pool, embedding EmbeddingProvider) *Service {
	return &Service{
		db:        db,
		embedding: embedding,
	}
}

// ContentEmbedding represents a content chunk with its vector
type ContentEmbedding struct {
	ID          string          `json:"id"`
	ContentType string          `json:"content_type"`
	SourceID    string          `json:"source_id"`
	ChunkType   string          `json:"chunk_type"`
	Language    *string         `json:"language,omitempty"`
	Content     string          `json:"content"`
	Metadata    json.RawMessage `json:"metadata,omitempty"`
	Similarity  float64         `json:"similarity,omitempty"`
}

// SearchOptions configures the vector search
type SearchOptions struct {
	ContentType string
	SourceID    string
	ChunkType   string
	Language    string
	Limit       int
	MinScore    float64
}

// SearchContext retrieves relevant content for a query
func (s *Service) SearchContext(ctx context.Context, query string, opts SearchOptions) ([]ContentEmbedding, error) {
	if opts.Limit == 0 {
		opts.Limit = 5
	}

	queryEmbedding, err := s.embedding.Embed(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to embed query: %w", err)
	}

	vectorStr := vectorToString(queryEmbedding)

	sql := `
		SELECT
			id,
			content_type,
			source_id,
			chunk_type,
			language,
			content,
			metadata,
			1 - (embedding <=> $1::VECTOR) as similarity
		FROM content_embeddings
		WHERE 1=1
	`
	args := []interface{}{vectorStr}
	argIdx := 2

	if opts.ContentType != "" {
		sql += fmt.Sprintf(" AND content_type = $%d", argIdx)
		args = append(args, opts.ContentType)
		argIdx++
	}

	if opts.SourceID != "" {
		sql += fmt.Sprintf(" AND source_id = $%d", argIdx)
		args = append(args, opts.SourceID)
		argIdx++
	}

	if opts.ChunkType != "" {
		sql += fmt.Sprintf(" AND chunk_type = $%d", argIdx)
		args = append(args, opts.ChunkType)
		argIdx++
	}

	if opts.Language != "" {
		sql += fmt.Sprintf(" AND (language = $%d OR language IS NULL)", argIdx)
		args = append(args, opts.Language)
		argIdx++
	}

	if opts.MinScore > 0 {
		sql += fmt.Sprintf(" AND 1 - (embedding <=> $1::VECTOR) >= $%d", argIdx)
		args = append(args, opts.MinScore)
		argIdx++
	}

	sql += fmt.Sprintf(`
		ORDER BY embedding <=> $1::VECTOR ASC
		LIMIT $%d
	`, argIdx)
	args = append(args, opts.Limit)

	rows, err := s.db.Query(ctx, sql, args...)
	if err != nil {
		return nil, fmt.Errorf("vector search failed: %w", err)
	}
	defer rows.Close()

	var results []ContentEmbedding
	for rows.Next() {
		var e ContentEmbedding
		if err := rows.Scan(
			&e.ID, &e.ContentType, &e.SourceID, &e.ChunkType,
			&e.Language, &e.Content, &e.Metadata, &e.Similarity,
		); err != nil {
			return nil, err
		}
		results = append(results, e)
	}

	return results, nil
}

// EmbeddingInput is the input for creating/updating an embedding
type EmbeddingInput struct {
	ID          string
	ContentType string
	SourceID    string
	ChunkType   string
	Language    *string
	Content     string
	Metadata    map[string]interface{}
}

// UpsertEmbedding inserts or updates a content embedding
func (s *Service) UpsertEmbedding(ctx context.Context, input EmbeddingInput) error {
	hash := sha256.Sum256([]byte(input.Content))
	contentHash := hex.EncodeToString(hash[:])

	var existingHash string
	err := s.db.QueryRow(ctx,
		"SELECT content_hash FROM content_embeddings WHERE id = $1",
		input.ID,
	).Scan(&existingHash)

	if err == nil && existingHash == contentHash {
		log.Debug().Str("id", input.ID).Msg("Content unchanged, skipping re-embedding")
		return nil
	}

	embedding, err := s.embedding.Embed(ctx, input.Content)
	if err != nil {
		return fmt.Errorf("failed to generate embedding: %w", err)
	}

	vectorStr := vectorToString(embedding)

	var metadataJSON []byte
	if input.Metadata != nil {
		metadataJSON, _ = json.Marshal(input.Metadata)
	}

	_, err = s.db.Exec(ctx, `
		UPSERT INTO content_embeddings (
			id, content_type, source_id, chunk_type, language,
			content, content_hash, embedding, metadata, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::VECTOR, $9, now())
	`, input.ID, input.ContentType, input.SourceID, input.ChunkType, input.Language,
		input.Content, contentHash, vectorStr, metadataJSON)

	if err != nil {
		return fmt.Errorf("failed to upsert embedding: %w", err)
	}

	log.Debug().Str("id", input.ID).Msg("Upserted embedding")
	return nil
}

// DeleteEmbedding deletes an embedding by ID
func (s *Service) DeleteEmbedding(ctx context.Context, id string) error {
	_, err := s.db.Exec(ctx, "DELETE FROM content_embeddings WHERE id = $1", id)
	return err
}

// DeleteBySource deletes all embeddings for a source
func (s *Service) DeleteBySource(ctx context.Context, sourceID string) error {
	_, err := s.db.Exec(ctx, "DELETE FROM content_embeddings WHERE source_id = $1", sourceID)
	return err
}

// GetEmbeddingCount returns the total number of embeddings
func (s *Service) GetEmbeddingCount(ctx context.Context) (int, error) {
	var count int
	err := s.db.QueryRow(ctx, "SELECT COUNT(*) FROM content_embeddings").Scan(&count)
	return count, err
}

// GetEmbeddingCountByType returns the count of embeddings by type
func (s *Service) GetEmbeddingCountByType(ctx context.Context) (map[string]int, error) {
	rows, err := s.db.Query(ctx, `
		SELECT content_type, COUNT(*)
		FROM content_embeddings
		GROUP BY content_type
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	counts := make(map[string]int)
	for rows.Next() {
		var contentType string
		var count int
		if err := rows.Scan(&contentType, &count); err != nil {
			return nil, err
		}
		counts[contentType] = count
	}

	return counts, nil
}

// BuildRAGContext builds a context string from search results
func (s *Service) BuildRAGContext(results []ContentEmbedding) string {
	if len(results) == 0 {
		return ""
	}

	var sb strings.Builder
	for i, r := range results {
		if i > 0 {
			sb.WriteString("\n\n---\n\n")
		}
		sb.WriteString(fmt.Sprintf("[%s - %s]\n", r.ContentType, r.ChunkType))
		sb.WriteString(r.Content)
	}

	return sb.String()
}

// vectorToString converts []float32 to pgvector format "[1.0,2.0,...]"
func vectorToString(v []float32) string {
	b, _ := json.Marshal(v)
	return string(b)
}
