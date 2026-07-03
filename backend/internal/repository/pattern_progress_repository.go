package repository

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
)

type PatternProgressRepository struct {
	db *Database
}

func NewPatternProgressRepository(db *Database) *PatternProgressRepository {
	return &PatternProgressRepository{db: db}
}

func (r *PatternProgressRepository) MarkComplete(ctx context.Context, userID uuid.UUID, patternID string, sectionIndex int) error {
	_, err := r.db.Pool.Exec(ctx, `
		INSERT INTO pattern_progress (user_id, pattern_id, section_index, completed_at)
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (user_id, pattern_id, section_index) DO NOTHING
	`, userID, patternID, sectionIndex, time.Now())

	if err != nil {
		return fmt.Errorf("failed to mark section complete: %w", err)
	}
	return nil
}

func (r *PatternProgressRepository) MarkIncomplete(ctx context.Context, userID uuid.UUID, patternID string, sectionIndex int) error {
	_, err := r.db.Pool.Exec(ctx, `
		DELETE FROM pattern_progress
		WHERE user_id = $1 AND pattern_id = $2 AND section_index = $3
	`, userID, patternID, sectionIndex)

	if err != nil {
		return fmt.Errorf("failed to mark section incomplete: %w", err)
	}
	return nil
}

func (r *PatternProgressRepository) GetByPattern(ctx context.Context, userID uuid.UUID, patternID string) ([]int, error) {
	rows, err := r.db.Pool.Query(ctx, `
		SELECT section_index
		FROM pattern_progress
		WHERE user_id = $1 AND pattern_id = $2
		ORDER BY section_index ASC
	`, userID, patternID)
	if err != nil {
		return nil, fmt.Errorf("failed to query pattern progress: %w", err)
	}
	defer rows.Close()

	var sections []int
	for rows.Next() {
		var idx int
		if err := rows.Scan(&idx); err != nil {
			return nil, fmt.Errorf("failed to scan section index: %w", err)
		}
		sections = append(sections, idx)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating rows: %w", err)
	}

	return sections, nil
}

func (r *PatternProgressRepository) GetAllByUser(ctx context.Context, userID uuid.UUID) (map[string][]int, error) {
	rows, err := r.db.Pool.Query(ctx, `
		SELECT pattern_id, section_index
		FROM pattern_progress
		WHERE user_id = $1
		ORDER BY pattern_id, section_index ASC
	`, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to query all progress: %w", err)
	}
	defer rows.Close()

	result := make(map[string][]int)
	for rows.Next() {
		var patternID string
		var idx int
		if err := rows.Scan(&patternID, &idx); err != nil {
			return nil, fmt.Errorf("failed to scan progress: %w", err)
		}
		result[patternID] = append(result[patternID], idx)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating rows: %w", err)
	}

	return result, nil
}

func (r *PatternProgressRepository) BulkSync(ctx context.Context, userID uuid.UUID, progress map[string][]int) error {
	tx, err := r.db.Pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer func() {
		if err := tx.Rollback(ctx); err != nil {
			// Transaction already committed or rolled back
		}
	}()

	now := time.Now()

	for patternID, sections := range progress {
		for _, sectionIndex := range sections {
			_, err := tx.Exec(ctx, `
				INSERT INTO pattern_progress (user_id, pattern_id, section_index, completed_at)
				VALUES ($1, $2, $3, $4)
				ON CONFLICT (user_id, pattern_id, section_index) DO NOTHING
			`, userID, patternID, sectionIndex, now)
			if err != nil {
				return fmt.Errorf("failed to sync section: %w", err)
			}
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

func (r *PatternProgressRepository) BulkMarkComplete(ctx context.Context, userID uuid.UUID, patternID string, sections []int) error {
	tx, err := r.db.Pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer func() {
		if err := tx.Rollback(ctx); err != nil {
			// Transaction already committed or rolled back
		}
	}()

	now := time.Now()

	for _, sectionIndex := range sections {
		_, err := tx.Exec(ctx, `
			INSERT INTO pattern_progress (user_id, pattern_id, section_index, completed_at)
			VALUES ($1, $2, $3, $4)
			ON CONFLICT (user_id, pattern_id, section_index) DO NOTHING
		`, userID, patternID, sectionIndex, now)
		if err != nil {
			return fmt.Errorf("failed to mark section complete: %w", err)
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}
