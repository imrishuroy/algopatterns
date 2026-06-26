package main

import (
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"os"
	"time"

	"github.com/imrishuroy/algopatterns/internal/ai/rag"
	"github.com/imrishuroy/algopatterns/internal/config"
	"github.com/imrishuroy/algopatterns/internal/repository"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

func main() {
	log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stdout, TimeFormat: time.RFC3339})

	patternsFile := flag.String("patterns", "data/patterns.json", "Path to patterns.json file")
	dryRun := flag.Bool("dry-run", false, "Print what would be indexed without actually indexing")
	flag.Parse()

	cfg, err := config.Load()
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to load configuration")
	}

	if cfg.AI.OpenAIAPIKey == "" {
		log.Fatal().Msg("OPENAI_API_KEY is required for embeddings")
	}

	db, err := repository.NewDatabase(&cfg.Database)
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to connect to database")
	}
	defer db.Close()

	embedding := rag.NewOpenAIEmbedding(rag.OpenAIEmbeddingConfig{
		APIKey: cfg.AI.OpenAIAPIKey,
		Model:  cfg.AI.EmbeddingModel,
	})

	ragService := rag.NewService(db.Pool, embedding)
	indexer := rag.NewIndexer(ragService)

	ctx := context.Background()

	if *dryRun {
		log.Info().Msg("Dry run mode - will not actually index")
	}

	patterns, err := loadPatterns(*patternsFile)
	if err != nil {
		log.Fatal().Err(err).Str("file", *patternsFile).Msg("Failed to load patterns")
	}

	log.Info().Int("count", len(patterns)).Msg("Loaded patterns")

	if !*dryRun {
		if err := indexer.IndexAllPatterns(ctx, patterns); err != nil {
			log.Fatal().Err(err).Msg("Failed to index patterns")
		}
	} else {
		for _, p := range patterns {
			log.Info().Str("id", p.ID).Str("category", p.Category).Msg("Would index pattern")
		}
	}

	count, err := ragService.GetEmbeddingCount(ctx)
	if err != nil {
		log.Warn().Err(err).Msg("Failed to get embedding count")
	} else {
		log.Info().Int("total_embeddings", count).Msg("Indexing complete")
	}

	countByType, err := ragService.GetEmbeddingCountByType(ctx)
	if err != nil {
		log.Warn().Err(err).Msg("Failed to get embedding count by type")
	} else {
		for t, c := range countByType {
			log.Info().Str("type", t).Int("count", c).Msg("Embeddings by type")
		}
	}
}

type PatternFile struct {
	Patterns []PatternJSON `json:"patterns"`
}

type PatternJSON struct {
	ID             string            `json:"id"`
	Category       string            `json:"category"`
	Description    string            `json:"description"`
	WhenToUse      []string          `json:"whenToUse"`
	KeyInsights    []string          `json:"keyInsights"`
	CommonMistakes []string          `json:"commonMistakes"`
	CodeTemplates  map[string]string `json:"codeTemplates"`
	Variations     []struct {
		Name string `json:"name"`
		Desc string `json:"desc"`
	} `json:"variations"`
}

func loadPatterns(path string) ([]rag.Pattern, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("failed to read file: %w", err)
	}

	var pf PatternFile
	if err := json.Unmarshal(data, &pf); err != nil {
		return nil, fmt.Errorf("failed to parse JSON: %w", err)
	}

	patterns := make([]rag.Pattern, 0, len(pf.Patterns))
	for _, p := range pf.Patterns {
		variations := make([]rag.PatternVariation, 0, len(p.Variations))
		for _, v := range p.Variations {
			variations = append(variations, rag.PatternVariation{
				Name:        v.Name,
				Description: v.Desc,
			})
		}

		patterns = append(patterns, rag.Pattern{
			ID:             p.ID,
			Category:       p.Category,
			Description:    p.Description,
			WhenToUse:      p.WhenToUse,
			KeyInsights:    p.KeyInsights,
			CommonMistakes: p.CommonMistakes,
			CodeTemplates:  p.CodeTemplates,
			Variations:     variations,
		})
	}

	return patterns, nil
}
