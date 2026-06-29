package rag

import (
	"context"
	"fmt"
	"strings"

	"github.com/rs/zerolog/log"
)

// Indexer handles indexing content for RAG
type Indexer struct {
	rag *Service
}

// NewIndexer creates a new content indexer
func NewIndexer(rag *Service) *Indexer {
	return &Indexer{rag: rag}
}

// Pattern represents a DSA pattern to be indexed
type Pattern struct {
	ID             string
	Category       string
	Description    string
	WhenToUse      []string
	KeyInsights    []string
	CommonMistakes []string
	CodeTemplates  map[string]string
	Variations     []PatternVariation
}

// PatternVariation represents a pattern variation
type PatternVariation struct {
	Name        string
	Description string
}

// IndexPattern creates embeddings for all chunks of a pattern
func (i *Indexer) IndexPattern(ctx context.Context, p Pattern) error {
	chunks := []EmbeddingInput{
		{
			ID:          fmt.Sprintf("pattern-%s-overview", p.ID),
			ContentType: "pattern",
			SourceID:    p.ID,
			ChunkType:   "overview",
			Content: fmt.Sprintf("Pattern: %s\n\n%s\n\nWhen to use:\n%s",
				p.Category, p.Description, joinList(p.WhenToUse)),
			Metadata: map[string]interface{}{
				"patternId": p.ID,
				"category":  p.Category,
			},
		},
	}

	if len(p.KeyInsights) > 0 {
		chunks = append(chunks, EmbeddingInput{
			ID:          fmt.Sprintf("pattern-%s-insights", p.ID),
			ContentType: "pattern",
			SourceID:    p.ID,
			ChunkType:   "insights",
			Content: fmt.Sprintf("Key insights for %s:\n\n%s",
				p.Category, numberedList(p.KeyInsights)),
			Metadata: map[string]interface{}{
				"patternId": p.ID,
			},
		})
	}

	if len(p.CommonMistakes) > 0 {
		chunks = append(chunks, EmbeddingInput{
			ID:          fmt.Sprintf("pattern-%s-mistakes", p.ID),
			ContentType: "pattern",
			SourceID:    p.ID,
			ChunkType:   "mistakes",
			Content: fmt.Sprintf("Common mistakes in %s:\n\n%s",
				p.Category, numberedList(p.CommonMistakes)),
			Metadata: map[string]interface{}{
				"patternId": p.ID,
			},
		})
	}

	for lang, template := range p.CodeTemplates {
		langStr := lang
		chunks = append(chunks, EmbeddingInput{
			ID:          fmt.Sprintf("pattern-%s-template-%s", p.ID, lang),
			ContentType: "pattern",
			SourceID:    p.ID,
			ChunkType:   "template",
			Language:    &langStr,
			Content: fmt.Sprintf("%s code template for %s:\n\n```%s\n%s\n```",
				lang, p.Category, lang, template),
			Metadata: map[string]interface{}{
				"patternId": p.ID,
				"language":  lang,
			},
		})
	}

	for idx, v := range p.Variations {
		chunks = append(chunks, EmbeddingInput{
			ID:          fmt.Sprintf("pattern-%s-variation-%d", p.ID, idx),
			ContentType: "pattern",
			SourceID:    p.ID,
			ChunkType:   "overview",
			Content: fmt.Sprintf("Variation of %s: %s\n\n%s",
				p.Category, v.Name, v.Description),
			Metadata: map[string]interface{}{
				"patternId":     p.ID,
				"variationName": v.Name,
			},
		})
	}

	for _, chunk := range chunks {
		if err := i.rag.UpsertEmbedding(ctx, chunk); err != nil {
			return fmt.Errorf("failed to index chunk %s: %w", chunk.ID, err)
		}
	}

	log.Info().Str("patternId", p.ID).Int("chunks", len(chunks)).Msg("Indexed pattern")
	return nil
}

// Concept represents a DSA concept to be indexed
type Concept struct {
	ID           string
	Name         string
	Category     string
	Description  string
	Complexity   string
	CodeSnippets map[string]string
}

// IndexConcept creates embeddings for a DSA concept
func (i *Indexer) IndexConcept(ctx context.Context, c Concept) error {
	chunks := []EmbeddingInput{
		{
			ID:          fmt.Sprintf("concept-%s-overview", c.ID),
			ContentType: "concept",
			SourceID:    c.ID,
			ChunkType:   "overview",
			Content: fmt.Sprintf("DSA Concept: %s\nCategory: %s\n\n%s\n\nComplexity: %s",
				c.Name, c.Category, c.Description, c.Complexity),
			Metadata: map[string]interface{}{
				"conceptId": c.ID,
				"category":  c.Category,
			},
		},
	}

	for lang, code := range c.CodeSnippets {
		langStr := lang
		chunks = append(chunks, EmbeddingInput{
			ID:          fmt.Sprintf("concept-%s-code-%s", c.ID, lang),
			ContentType: "concept",
			SourceID:    c.ID,
			ChunkType:   "template",
			Language:    &langStr,
			Content: fmt.Sprintf("%s implementation of %s:\n\n```%s\n%s\n```",
				lang, c.Name, lang, code),
			Metadata: map[string]interface{}{
				"conceptId": c.ID,
				"language":  lang,
			},
		})
	}

	for _, chunk := range chunks {
		if err := i.rag.UpsertEmbedding(ctx, chunk); err != nil {
			return fmt.Errorf("failed to index chunk %s: %w", chunk.ID, err)
		}
	}

	log.Info().Str("conceptId", c.ID).Int("chunks", len(chunks)).Msg("Indexed concept")
	return nil
}

// Problem represents a coding problem to be indexed
type Problem struct {
	ID          string
	Title       string
	Slug        string
	Difficulty  string
	PatternID   string
	Description string
	Companies   []string
	Hints       []string
}

// IndexProblem creates embeddings for a coding problem
func (i *Indexer) IndexProblem(ctx context.Context, p Problem) error {
	chunks := []EmbeddingInput{
		{
			ID:          fmt.Sprintf("problem-%s-meta", p.ID),
			ContentType: "problem",
			SourceID:    p.ID,
			ChunkType:   "description",
			Content: fmt.Sprintf("Problem: %s\nDifficulty: %s\nPattern: %s\nCompanies: %s\n\n%s",
				p.Title, p.Difficulty, p.PatternID, strings.Join(p.Companies, ", "), p.Description),
			Metadata: map[string]interface{}{
				"problemId":  p.ID,
				"slug":       p.Slug,
				"difficulty": p.Difficulty,
				"patternId":  p.PatternID,
			},
		},
	}

	if len(p.Hints) > 0 {
		chunks = append(chunks, EmbeddingInput{
			ID:          fmt.Sprintf("problem-%s-hints", p.ID),
			ContentType: "problem",
			SourceID:    p.ID,
			ChunkType:   "hint",
			Content: fmt.Sprintf("Hints for %s:\n\n%s",
				p.Title, numberedList(p.Hints)),
			Metadata: map[string]interface{}{
				"problemId": p.ID,
			},
		})
	}

	for _, chunk := range chunks {
		if err := i.rag.UpsertEmbedding(ctx, chunk); err != nil {
			return fmt.Errorf("failed to index chunk %s: %w", chunk.ID, err)
		}
	}

	log.Info().Str("problemId", p.ID).Int("chunks", len(chunks)).Msg("Indexed problem")
	return nil
}

// IndexAllPatterns indexes multiple patterns
func (i *Indexer) IndexAllPatterns(ctx context.Context, patterns []Pattern) error {
	for _, p := range patterns {
		if err := i.IndexPattern(ctx, p); err != nil {
			return err
		}
	}
	log.Info().Int("count", len(patterns)).Msg("Indexed all patterns")
	return nil
}

// IndexAllConcepts indexes multiple concepts
func (i *Indexer) IndexAllConcepts(ctx context.Context, concepts []Concept) error {
	for _, c := range concepts {
		if err := i.IndexConcept(ctx, c); err != nil {
			return err
		}
	}
	log.Info().Int("count", len(concepts)).Msg("Indexed all concepts")
	return nil
}

// IndexAllProblems indexes multiple problems
func (i *Indexer) IndexAllProblems(ctx context.Context, problems []Problem) error {
	for _, p := range problems {
		if err := i.IndexProblem(ctx, p); err != nil {
			return err
		}
	}
	log.Info().Int("count", len(problems)).Msg("Indexed all problems")
	return nil
}

func joinList(items []string) string {
	return strings.Join(items, "\n- ")
}

func numberedList(items []string) string {
	var sb strings.Builder
	for i, item := range items {
		sb.WriteString(fmt.Sprintf("%d. %s\n", i+1, item))
	}
	return sb.String()
}
