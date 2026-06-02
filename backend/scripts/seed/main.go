package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"time"

	"github.com/imrishuroy/algopatterns/internal/config"
	"github.com/imrishuroy/algopatterns/internal/models"
	"github.com/imrishuroy/algopatterns/internal/repository"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

func main() {
	log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stdout, TimeFormat: time.RFC3339})

	if err := run(); err != nil {
		log.Fatal().Err(err).Msg("Seed failed")
	}
}

func run() error {
	cfg, err := config.Load()
	if err != nil {
		return fmt.Errorf("failed to load configuration: %w", err)
	}

	db, err := repository.NewDatabase(&cfg.Database)
	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}
	defer db.Close()

	repo := repository.NewPatternRepository(db)

	dataFile := "data/patterns.json"
	if len(os.Args) > 1 {
		dataFile = os.Args[1]
	}

	data, err := os.ReadFile(dataFile)
	if err != nil {
		return fmt.Errorf("failed to read patterns data file %s: %w", dataFile, err)
	}

	var patternsData struct {
		Patterns []models.Pattern `json:"patterns"`
	}
	if err := json.Unmarshal(data, &patternsData); err != nil {
		var patterns []models.Pattern
		if err := json.Unmarshal(data, &patterns); err != nil {
			return fmt.Errorf("failed to parse patterns data: %w", err)
		}
		patternsData.Patterns = patterns
	}

	ctx := context.Background()
	var imported, failed int

	for _, pattern := range patternsData.Patterns {
		if err := repo.Create(ctx, &pattern); err != nil {
			log.Warn().Err(err).Str("id", pattern.ID).Msg("Failed to create pattern")
			failed++
		} else {
			log.Info().Str("id", pattern.ID).Str("category", pattern.Category).Msg("Created pattern")
			imported++
		}
	}

	fmt.Printf("\nSeed completed: %d imported, %d failed\n", imported, failed)
	return nil
}
