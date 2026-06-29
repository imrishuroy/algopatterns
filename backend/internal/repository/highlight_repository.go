package repository

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/imrishuroy/algopatterns/internal/models"
	"github.com/jackc/pgx/v5"
)

var (
	ErrHighlightExists   = errors.New("highlight already exists at this position")
	ErrVersionConflict   = errors.New("highlight was modified by another request")
	ErrHighlightNotFound = errors.New("highlight not found")
)

type HighlightRepository struct {
	db *Database
}

func NewHighlightRepository(db *Database) *HighlightRepository {
	return &HighlightRepository{db: db}
}

func (r *HighlightRepository) Create(ctx context.Context, h *models.Highlight) error {
	now := time.Now()
	h.CreatedAt = now
	h.UpdatedAt = now
	h.Version = 1
	if h.ID == uuid.Nil {
		h.ID = uuid.New()
	}

	_, err := r.db.Pool.Exec(ctx, `
		INSERT INTO highlights (
			id, user_id, content_type, content_id,
			start_offset, end_offset, start_line, end_line,
			selected_text, content_hash, color, note,
			created_at, updated_at, version
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
	`, h.ID, h.UserID, h.ContentType, h.ContentID,
		h.StartOffset, h.EndOffset, h.StartLine, h.EndLine,
		h.SelectedText, h.ContentHash, h.Color, h.Note,
		h.CreatedAt, h.UpdatedAt, h.Version)

	if err != nil {
		if strings.Contains(err.Error(), "duplicate key") || strings.Contains(err.Error(), "unique constraint") {
			return ErrHighlightExists
		}
		return fmt.Errorf("failed to create highlight: %w", err)
	}
	return nil
}

func (r *HighlightRepository) GetByID(ctx context.Context, id, userID uuid.UUID) (*models.Highlight, error) {
	h := &models.Highlight{}
	err := r.db.Pool.QueryRow(ctx, `
		SELECT id, user_id, content_type, content_id,
			start_offset, end_offset, start_line, end_line,
			selected_text, content_hash, color, note,
			created_at, updated_at, version
		FROM highlights
		WHERE id = $1 AND user_id = $2
	`, id, userID).Scan(
		&h.ID, &h.UserID, &h.ContentType, &h.ContentID,
		&h.StartOffset, &h.EndOffset, &h.StartLine, &h.EndLine,
		&h.SelectedText, &h.ContentHash, &h.Color, &h.Note,
		&h.CreatedAt, &h.UpdatedAt, &h.Version)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrHighlightNotFound
		}
		return nil, fmt.Errorf("failed to get highlight: %w", err)
	}
	return h, nil
}

func (r *HighlightRepository) GetByContent(ctx context.Context, userID uuid.UUID, contentType, contentID string) ([]models.Highlight, error) {
	rows, err := r.db.Pool.Query(ctx, `
		SELECT id, user_id, content_type, content_id,
			start_offset, end_offset, start_line, end_line,
			selected_text, content_hash, color, note,
			created_at, updated_at, version
		FROM highlights
		WHERE user_id = $1 AND content_type = $2 AND content_id = $3
		ORDER BY start_offset ASC
	`, userID, contentType, contentID)
	if err != nil {
		return nil, fmt.Errorf("failed to query highlights: %w", err)
	}
	defer rows.Close()

	var highlights []models.Highlight
	for rows.Next() {
		var h models.Highlight
		if err := rows.Scan(
			&h.ID, &h.UserID, &h.ContentType, &h.ContentID,
			&h.StartOffset, &h.EndOffset, &h.StartLine, &h.EndLine,
			&h.SelectedText, &h.ContentHash, &h.Color, &h.Note,
			&h.CreatedAt, &h.UpdatedAt, &h.Version); err != nil {
			return nil, fmt.Errorf("failed to scan highlight: %w", err)
		}
		highlights = append(highlights, h)
	}

	if highlights == nil {
		highlights = []models.Highlight{}
	}
	return highlights, nil
}

func (r *HighlightRepository) GetAllByUser(ctx context.Context, userID uuid.UUID, limit int, cursor *time.Time, contentType *string) ([]models.Highlight, int, error) {
	var countQuery string
	var countArgs []interface{}

	if contentType != nil {
		countQuery = `SELECT COUNT(*) FROM highlights WHERE user_id = $1 AND content_type = $2`
		countArgs = []interface{}{userID, *contentType}
	} else {
		countQuery = `SELECT COUNT(*) FROM highlights WHERE user_id = $1`
		countArgs = []interface{}{userID}
	}

	var totalCount int
	if err := r.db.Pool.QueryRow(ctx, countQuery, countArgs...).Scan(&totalCount); err != nil {
		return nil, 0, fmt.Errorf("failed to count highlights: %w", err)
	}

	var query string
	var args []interface{}

	if cursor != nil {
		if contentType != nil {
			query = `
				SELECT id, user_id, content_type, content_id,
					start_offset, end_offset, start_line, end_line,
					selected_text, content_hash, color, note,
					created_at, updated_at, version
				FROM highlights
				WHERE user_id = $1 AND content_type = $2 AND created_at < $3
				ORDER BY created_at DESC
				LIMIT $4`
			args = []interface{}{userID, *contentType, *cursor, limit}
		} else {
			query = `
				SELECT id, user_id, content_type, content_id,
					start_offset, end_offset, start_line, end_line,
					selected_text, content_hash, color, note,
					created_at, updated_at, version
				FROM highlights
				WHERE user_id = $1 AND created_at < $2
				ORDER BY created_at DESC
				LIMIT $3`
			args = []interface{}{userID, *cursor, limit}
		}
	} else {
		if contentType != nil {
			query = `
				SELECT id, user_id, content_type, content_id,
					start_offset, end_offset, start_line, end_line,
					selected_text, content_hash, color, note,
					created_at, updated_at, version
				FROM highlights
				WHERE user_id = $1 AND content_type = $2
				ORDER BY created_at DESC
				LIMIT $3`
			args = []interface{}{userID, *contentType, limit}
		} else {
			query = `
				SELECT id, user_id, content_type, content_id,
					start_offset, end_offset, start_line, end_line,
					selected_text, content_hash, color, note,
					created_at, updated_at, version
				FROM highlights
				WHERE user_id = $1
				ORDER BY created_at DESC
				LIMIT $2`
			args = []interface{}{userID, limit}
		}
	}

	rows, err := r.db.Pool.Query(ctx, query, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to query highlights: %w", err)
	}
	defer rows.Close()

	var highlights []models.Highlight
	for rows.Next() {
		var h models.Highlight
		if err := rows.Scan(
			&h.ID, &h.UserID, &h.ContentType, &h.ContentID,
			&h.StartOffset, &h.EndOffset, &h.StartLine, &h.EndLine,
			&h.SelectedText, &h.ContentHash, &h.Color, &h.Note,
			&h.CreatedAt, &h.UpdatedAt, &h.Version); err != nil {
			return nil, 0, fmt.Errorf("failed to scan highlight: %w", err)
		}
		highlights = append(highlights, h)
	}

	if highlights == nil {
		highlights = []models.Highlight{}
	}
	return highlights, totalCount, nil
}

func (r *HighlightRepository) Update(ctx context.Context, h *models.Highlight, expectedVersion int) error {
	h.UpdatedAt = time.Now()
	h.Version = expectedVersion + 1

	result, err := r.db.Pool.Exec(ctx, `
		UPDATE highlights
		SET color = $1, note = $2, updated_at = $3, version = $4
		WHERE id = $5 AND user_id = $6 AND version = $7
	`, h.Color, h.Note, h.UpdatedAt, h.Version, h.ID, h.UserID, expectedVersion)

	if err != nil {
		return fmt.Errorf("failed to update highlight: %w", err)
	}
	if result.RowsAffected() == 0 {
		existing, err := r.GetByID(ctx, h.ID, h.UserID)
		if err != nil {
			if errors.Is(err, ErrHighlightNotFound) {
				return ErrHighlightNotFound
			}
			return err
		}
		if existing.Version != expectedVersion {
			return ErrVersionConflict
		}
		return ErrHighlightNotFound
	}
	return nil
}

func (r *HighlightRepository) Delete(ctx context.Context, id, userID uuid.UUID) error {
	result, err := r.db.Pool.Exec(ctx, `
		DELETE FROM highlights WHERE id = $1 AND user_id = $2
	`, id, userID)
	if err != nil {
		return fmt.Errorf("failed to delete highlight: %w", err)
	}
	if result.RowsAffected() == 0 {
		return ErrHighlightNotFound
	}
	return nil
}

func (r *HighlightRepository) GetChangesSince(ctx context.Context, userID uuid.UUID, since time.Time) ([]models.Highlight, error) {
	rows, err := r.db.Pool.Query(ctx, `
		SELECT id, user_id, content_type, content_id,
			start_offset, end_offset, start_line, end_line,
			selected_text, content_hash, color, note,
			created_at, updated_at, version
		FROM highlights
		WHERE user_id = $1 AND updated_at > $2
		ORDER BY updated_at ASC
	`, userID, since)
	if err != nil {
		return nil, fmt.Errorf("failed to query highlight changes: %w", err)
	}
	defer rows.Close()

	var highlights []models.Highlight
	for rows.Next() {
		var h models.Highlight
		if err := rows.Scan(
			&h.ID, &h.UserID, &h.ContentType, &h.ContentID,
			&h.StartOffset, &h.EndOffset, &h.StartLine, &h.EndLine,
			&h.SelectedText, &h.ContentHash, &h.Color, &h.Note,
			&h.CreatedAt, &h.UpdatedAt, &h.Version); err != nil {
			return nil, fmt.Errorf("failed to scan highlight: %w", err)
		}
		highlights = append(highlights, h)
	}

	if highlights == nil {
		highlights = []models.Highlight{}
	}
	return highlights, nil
}
