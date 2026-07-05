package repository

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/imrishuroy/algopatterns/internal/models"
)

// SearchRepository handles database operations for search-related features
type SearchRepository struct {
	db *Database
}

// NewSearchRepository creates a new search repository
func NewSearchRepository(db *Database) *SearchRepository {
	return &SearchRepository{db: db}
}

// Search History Operations

// AddSearchHistory adds a search query to history
func (r *SearchRepository) AddSearchHistory(ctx context.Context, h *models.SearchHistory) error {
	query := `
		INSERT INTO search_history (id, user_id, query, mode, result_count, session_id, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`

	h.ID = uuid.New()
	h.CreatedAt = time.Now()

	_, err := r.db.Pool.Exec(ctx, query,
		h.ID,
		h.UserID,
		h.Query,
		h.Mode,
		h.ResultCount,
		h.SessionID,
		h.CreatedAt,
	)
	return err
}

// GetSearchHistory returns search history for a user
func (r *SearchRepository) GetSearchHistory(ctx context.Context, userID uuid.UUID, limit int) ([]models.SearchHistory, error) {
	query := `
		SELECT id, user_id, query, mode, result_count, session_id, created_at
		FROM search_history
		WHERE user_id = $1
		ORDER BY created_at DESC
		LIMIT $2
	`

	rows, err := r.db.Pool.Query(ctx, query, userID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var history []models.SearchHistory
	for rows.Next() {
		var h models.SearchHistory
		if err := rows.Scan(
			&h.ID,
			&h.UserID,
			&h.Query,
			&h.Mode,
			&h.ResultCount,
			&h.SessionID,
			&h.CreatedAt,
		); err != nil {
			return nil, err
		}
		history = append(history, h)
	}

	return history, rows.Err()
}

// ClearSearchHistory clears search history for a user
func (r *SearchRepository) ClearSearchHistory(ctx context.Context, userID uuid.UUID) error {
	query := `DELETE FROM search_history WHERE user_id = $1`
	_, err := r.db.Pool.Exec(ctx, query, userID)
	return err
}

// Recent Views Operations

// UpsertRecentView adds or updates a recent view
func (r *SearchRepository) UpsertRecentView(ctx context.Context, view *models.UserRecentView) error {
	query := `
		INSERT INTO user_recent_views (id, user_id, content_type, content_id, title, url, view_count, last_viewed_at)
		VALUES ($1, $2, $3, $4, $5, $6, 1, $7)
		ON CONFLICT (user_id, content_type, content_id)
		DO UPDATE SET 
			title = EXCLUDED.title,
			url = EXCLUDED.url,
			view_count = user_recent_views.view_count + 1,
			last_viewed_at = EXCLUDED.last_viewed_at
	`

	view.ID = uuid.New()
	view.LastViewedAt = time.Now()

	_, err := r.db.Pool.Exec(ctx, query,
		view.ID,
		view.UserID,
		view.ContentType,
		view.ContentID,
		view.Title,
		view.URL,
		view.LastViewedAt,
	)
	return err
}

// GetRecentViews returns recently viewed content for a user
func (r *SearchRepository) GetRecentViews(ctx context.Context, userID uuid.UUID, limit int) ([]models.UserRecentView, error) {
	query := `
		SELECT id, user_id, content_type, content_id, title, url, view_count, last_viewed_at
		FROM user_recent_views
		WHERE user_id = $1
		ORDER BY last_viewed_at DESC
		LIMIT $2
	`

	rows, err := r.db.Pool.Query(ctx, query, userID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var views []models.UserRecentView
	for rows.Next() {
		var v models.UserRecentView
		if err := rows.Scan(
			&v.ID,
			&v.UserID,
			&v.ContentType,
			&v.ContentID,
			&v.Title,
			&v.URL,
			&v.ViewCount,
			&v.LastViewedAt,
		); err != nil {
			return nil, err
		}
		views = append(views, v)
	}

	return views, rows.Err()
}

// ClearRecentViews clears recent views for a user
func (r *SearchRepository) ClearRecentViews(ctx context.Context, userID uuid.UUID) error {
	query := `DELETE FROM user_recent_views WHERE user_id = $1`
	_, err := r.db.Pool.Exec(ctx, query, userID)
	return err
}

// Favorites Operations

// AddFavorite adds a content item to favorites
func (r *SearchRepository) AddFavorite(ctx context.Context, f *models.UserFavorite) error {
	query := `
		INSERT INTO user_favorites (id, user_id, content_type, content_id, created_at)
		VALUES ($1, $2, $3, $4, $5)
	`

	f.ID = uuid.New()
	f.CreatedAt = time.Now()

	_, err := r.db.Pool.Exec(ctx, query,
		f.ID,
		f.UserID,
		f.ContentType,
		f.ContentID,
		f.CreatedAt,
	)
	return err
}

// GetFavorites returns favorites for a user
func (r *SearchRepository) GetFavorites(ctx context.Context, userID uuid.UUID, limit int) ([]models.UserFavorite, error) {
	query := `
		SELECT id, user_id, content_type, content_id, created_at
		FROM user_favorites
		WHERE user_id = $1
		ORDER BY created_at DESC
		LIMIT $2
	`

	rows, err := r.db.Pool.Query(ctx, query, userID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var favorites []models.UserFavorite
	for rows.Next() {
		var f models.UserFavorite
		if err := rows.Scan(
			&f.ID,
			&f.UserID,
			&f.ContentType,
			&f.ContentID,
			&f.CreatedAt,
		); err != nil {
			return nil, err
		}
		favorites = append(favorites, f)
	}

	return favorites, rows.Err()
}

// GetFavorite returns a specific favorite
func (r *SearchRepository) GetFavorite(ctx context.Context, userID uuid.UUID, contentType, contentID string) (*models.UserFavorite, error) {
	query := `
		SELECT id, user_id, content_type, content_id, created_at
		FROM user_favorites
		WHERE user_id = $1 AND content_type = $2 AND content_id = $3
	`

	var f models.UserFavorite
	err := r.db.Pool.QueryRow(ctx, query, userID, contentType, contentID).Scan(
		&f.ID,
		&f.UserID,
		&f.ContentType,
		&f.ContentID,
		&f.CreatedAt,
	)
	if err != nil {
		return nil, err
	}

	return &f, nil
}

// DeleteFavorite removes a favorite
func (r *SearchRepository) DeleteFavorite(ctx context.Context, id, userID uuid.UUID) error {
	query := `DELETE FROM user_favorites WHERE id = $1 AND user_id = $2`
	result, err := r.db.Pool.Exec(ctx, query, id, userID)
	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}

// IsFavorite checks if content is favorited
func (r *SearchRepository) IsFavorite(ctx context.Context, userID uuid.UUID, contentType, contentID string) (bool, error) {
	query := `
		SELECT EXISTS(
			SELECT 1 FROM user_favorites 
			WHERE user_id = $1 AND content_type = $2 AND content_id = $3
		)
	`

	var exists bool
	err := r.db.Pool.QueryRow(ctx, query, userID, contentType, contentID).Scan(&exists)
	return exists, err
}

// Full-Text Search Operations

// SearchPatterns performs full-text search on patterns
func (r *SearchRepository) SearchPatterns(ctx context.Context, query string, limit int) ([]models.PatternSearchResult, error) {
	sql := `
		SELECT 
			id,
			category,
			difficulty,
			description,
			time_complexity,
			space_complexity,
			ts_rank(search_vector, plainto_tsquery('english', $1)) as search_rank
		FROM patterns
		WHERE search_vector @@ plainto_tsquery('english', $1)
		ORDER BY search_rank DESC
		LIMIT $2
	`

	rows, err := r.db.Pool.Query(ctx, sql, query, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []models.PatternSearchResult
	for rows.Next() {
		var p models.PatternSearchResult
		if err := rows.Scan(
			&p.ID,
			&p.Category,
			&p.Difficulty,
			&p.Description,
			&p.TimeComplexity,
			&p.SpaceComplexity,
			&p.SearchRank,
		); err != nil {
			return nil, err
		}
		results = append(results, p)
	}

	return results, rows.Err()
}

// SearchProblems performs full-text search on problems
func (r *SearchRepository) SearchProblems(ctx context.Context, query string, limit int) ([]models.ProblemSearchResult, error) {
	sql := `
		SELECT 
			id,
			pattern_id,
			title,
			slug,
			difficulty,
			description,
			ts_rank(search_vector, plainto_tsquery('english', $1)) as search_rank
		FROM problems
		WHERE search_vector @@ plainto_tsquery('english', $1)
		ORDER BY search_rank DESC
		LIMIT $2
	`

	rows, err := r.db.Pool.Query(ctx, sql, query, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []models.ProblemSearchResult
	for rows.Next() {
		var p models.ProblemSearchResult
		if err := rows.Scan(
			&p.ID,
			&p.PatternID,
			&p.Title,
			&p.Slug,
			&p.Difficulty,
			&p.Description,
			&p.SearchRank,
		); err != nil {
			return nil, err
		}
		results = append(results, p)
	}

	return results, rows.Err()
}

// SearchHighlights performs search on user highlights
func (r *SearchRepository) SearchHighlights(ctx context.Context, query string, userID uuid.UUID, limit int) ([]models.HighlightSearchResult, error) {
	sql := `
		SELECT 
			id,
			content_type,
			content_id,
			selected_text,
			note,
			color,
			ts_rank(to_tsvector('english', selected_text || ' ' || COALESCE(note, '')), plainto_tsquery('english', $1)) as search_rank
		FROM user_highlights
		WHERE user_id = $2 
			AND to_tsvector('english', selected_text || ' ' || COALESCE(note, '')) @@ plainto_tsquery('english', $1)
		ORDER BY search_rank DESC
		LIMIT $3
	`

	rows, err := r.db.Pool.Query(ctx, sql, query, userID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []models.HighlightSearchResult
	for rows.Next() {
		var h models.HighlightSearchResult
		if err := rows.Scan(
			&h.ID,
			&h.ContentType,
			&h.ContentID,
			&h.SelectedText,
			&h.Note,
			&h.Color,
			&h.SearchRank,
		); err != nil {
			return nil, err
		}
		results = append(results, h)
	}

	return results, rows.Err()
}

// Prefix Search (for autocomplete)

// SearchPatternsPrefix performs prefix search on patterns (for autocomplete)
func (r *SearchRepository) SearchPatternsPrefix(ctx context.Context, query string, limit int) ([]models.PatternSearchResult, error) {
	// Use ILIKE for prefix matching when query is short
	sql := `
		SELECT 
			id,
			category,
			difficulty,
			description,
			time_complexity,
			space_complexity,
			1.0 as search_rank
		FROM patterns
		WHERE 
			id ILIKE $1 || '%'
			OR category ILIKE $1 || '%'
			OR description ILIKE '%' || $1 || '%'
		ORDER BY 
			CASE WHEN id ILIKE $1 || '%' THEN 0 ELSE 1 END,
			CASE WHEN category ILIKE $1 || '%' THEN 0 ELSE 1 END,
			category
		LIMIT $2
	`

	rows, err := r.db.Pool.Query(ctx, sql, query, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []models.PatternSearchResult
	for rows.Next() {
		var p models.PatternSearchResult
		if err := rows.Scan(
			&p.ID,
			&p.Category,
			&p.Difficulty,
			&p.Description,
			&p.TimeComplexity,
			&p.SpaceComplexity,
			&p.SearchRank,
		); err != nil {
			return nil, err
		}
		results = append(results, p)
	}

	return results, rows.Err()
}

// SearchProblemsPrefix performs prefix search on problems (for autocomplete)
func (r *SearchRepository) SearchProblemsPrefix(ctx context.Context, query string, limit int) ([]models.ProblemSearchResult, error) {
	sql := `
		SELECT 
			id,
			pattern_id,
			title,
			slug,
			difficulty,
			description,
			1.0 as search_rank
		FROM problems
		WHERE 
			title ILIKE $1 || '%'
			OR slug ILIKE $1 || '%'
			OR description ILIKE '%' || $1 || '%'
		ORDER BY 
			CASE WHEN title ILIKE $1 || '%' THEN 0 ELSE 1 END,
			CASE WHEN slug ILIKE $1 || '%' THEN 0 ELSE 1 END,
			title
		LIMIT $2
	`

	rows, err := r.db.Pool.Query(ctx, sql, query, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []models.ProblemSearchResult
	for rows.Next() {
		var p models.ProblemSearchResult
		if err := rows.Scan(
			&p.ID,
			&p.PatternID,
			&p.Title,
			&p.Slug,
			&p.Difficulty,
			&p.Description,
			&p.SearchRank,
		); err != nil {
			return nil, err
		}
		results = append(results, p)
	}

	return results, rows.Err()
}
