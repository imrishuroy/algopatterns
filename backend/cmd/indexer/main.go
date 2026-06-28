package main

import (
	"context"
	"encoding/json"
	"flag"
	"os"
	"strings"
	"time"

	"github.com/imrishuroy/algopatterns/internal/ai/rag"
	"github.com/imrishuroy/algopatterns/internal/config"
	"github.com/imrishuroy/algopatterns/internal/repository"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

func main() {
	log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stderr})

	indexType := flag.String("type", "problems", "Type to index: problems, patterns, all")
	flag.Parse()

	cfg, err := config.Load()
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to load config")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Minute)
	defer cancel()

	db, err := repository.NewDatabase(&cfg.Database)
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to connect to database")
	}
	defer db.Close()

	if cfg.AI.OpenAIAPIKey == "" {
		log.Fatal().Msg("OPENAI_API_KEY is required for RAG indexing")
	}

	embeddingProvider := rag.NewOpenAIEmbedding(rag.OpenAIEmbeddingConfig{
		APIKey:     cfg.AI.OpenAIAPIKey,
		Model:      "text-embedding-3-small",
		Dimensions: 1536,
		Timeout:    30 * time.Second,
	})

	ragService := rag.NewService(db.Pool, embeddingProvider)
	indexer := rag.NewIndexer(ragService)

	switch *indexType {
	case "problems":
		if err := indexProblems(ctx, db, indexer); err != nil {
			log.Fatal().Err(err).Msg("Failed to index problems")
		}
	case "patterns":
		if err := indexPatterns(ctx, indexer); err != nil {
			log.Fatal().Err(err).Msg("Failed to index patterns")
		}
	case "all":
		if err := indexProblems(ctx, db, indexer); err != nil {
			log.Fatal().Err(err).Msg("Failed to index problems")
		}
		if err := indexPatterns(ctx, indexer); err != nil {
			log.Fatal().Err(err).Msg("Failed to index patterns")
		}
	default:
		log.Fatal().Str("type", *indexType).Msg("Unknown index type")
	}

	count, err := ragService.GetEmbeddingCount(ctx)
	if err != nil {
		log.Error().Err(err).Msg("Failed to get embedding count")
	} else {
		log.Info().Int("total_embeddings", count).Msg("Indexing complete")
	}

	countByType, err := ragService.GetEmbeddingCountByType(ctx)
	if err != nil {
		log.Error().Err(err).Msg("Failed to get counts by type")
	} else {
		for t, c := range countByType {
			log.Info().Str("type", t).Int("count", c).Msg("Embeddings by type")
		}
	}
}

func indexProblems(ctx context.Context, db *repository.Database, indexer *rag.Indexer) error {
	log.Info().Msg("Fetching problems from database...")

	rows, err := db.Pool.Query(ctx, `
		SELECT
			id,
			title,
			slug,
			difficulty,
			COALESCE(description, ''),
			COALESCE(hints, ''),
			COALESCE(pattern_id, '')
		FROM problems
		ORDER BY id
	`)
	if err != nil {
		return err
	}
	defer rows.Close()

	var problems []rag.Problem
	for rows.Next() {
		var p rag.Problem
		var hintsStr string
		if err := rows.Scan(&p.ID, &p.Title, &p.Slug, &p.Difficulty, &p.Description, &hintsStr, &p.PatternID); err != nil {
			return err
		}

		if hintsStr != "" {
			p.Hints = parseHints(hintsStr)
		}

		problems = append(problems, p)
	}

	log.Info().Int("count", len(problems)).Msg("Found problems to index")

	for i, p := range problems {
		log.Info().Int("progress", i+1).Int("total", len(problems)).Str("title", p.Title).Msg("Indexing problem")
		if err := indexer.IndexProblem(ctx, p); err != nil {
			log.Error().Err(err).Str("problemId", p.ID).Msg("Failed to index problem, continuing...")
		}
		time.Sleep(100 * time.Millisecond)
	}

	return nil
}

func parseHints(hintsStr string) []string {
	parts := strings.Split(hintsStr, "Hint ")
	var hints []string
	for _, part := range parts {
		part = strings.TrimSpace(part)
		if part == "" {
			continue
		}
		if idx := strings.Index(part, ":"); idx > 0 {
			hint := strings.TrimSpace(part[idx+1:])
			if hint != "" {
				hints = append(hints, hint)
			}
		} else if part != "" {
			hints = append(hints, part)
		}
	}
	return hints
}

type patternsFile struct {
	Version       string          `json:"version"`
	TotalPatterns int             `json:"totalPatterns"`
	Patterns      []patternRecord `json:"patterns"`
}

type patternRecord struct {
	ID              string            `json:"id"`
	Category        string            `json:"category"`
	Difficulty      string            `json:"difficulty"`
	Description     string            `json:"description"`
	WhenToUse       []string          `json:"whenToUse"`
	CodeTemplates   map[string]string `json:"codeTemplates"`
	KeyInsights     []string          `json:"keyInsights"`
	CommonMistakes  []string          `json:"commonMistakes"`
	Variations      []variationRecord `json:"variations"`
	CommonProblems  []string          `json:"commonProblems"`
	TimeComplexity  string            `json:"timeComplexity"`
	SpaceComplexity string            `json:"spaceComplexity"`
}

type variationRecord struct {
	Name        string            `json:"name"`
	Description string            `json:"desc"`
	When        string            `json:"when"`
	Template    map[string]string `json:"template"`
	Problems    []string          `json:"problems"`
}

func indexPatterns(ctx context.Context, indexer *rag.Indexer) error {
	log.Info().Msg("Loading patterns from patterns.json...")

	data, err := os.ReadFile("data/patterns.json")
	if err != nil {
		return err
	}

	var pf patternsFile
	if err := json.Unmarshal(data, &pf); err != nil {
		return err
	}

	log.Info().Int("count", len(pf.Patterns)).Msg("Found patterns to index")

	for i, pr := range pf.Patterns {
		log.Info().Int("progress", i+1).Int("total", len(pf.Patterns)).Str("id", pr.ID).Msg("Indexing pattern")

		p := rag.Pattern{
			ID:             pr.ID,
			Category:       pr.Category,
			Description:    pr.Description,
			WhenToUse:      pr.WhenToUse,
			KeyInsights:    pr.KeyInsights,
			CommonMistakes: pr.CommonMistakes,
			CodeTemplates:  pr.CodeTemplates,
		}

		for _, vr := range pr.Variations {
			when := vr.When
			if when == "" {
				when = "Various scenarios"
			}
			p.Variations = append(p.Variations, rag.PatternVariation{
				Name:        vr.Name,
				Description: vr.Description + "\nWhen to use: " + when,
			})
		}

		if err := indexer.IndexPattern(ctx, p); err != nil {
			log.Error().Err(err).Str("patternId", pr.ID).Msg("Failed to index pattern, continuing...")
		}
		time.Sleep(100 * time.Millisecond)
	}

	return nil
}
