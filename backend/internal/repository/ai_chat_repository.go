package repository

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5"
)

type AIChatRepository struct {
	db *Database
}

func NewAIChatRepository(db *Database) *AIChatRepository {
	return &AIChatRepository{db: db}
}

type AISession struct {
	ID            string    `json:"id"`
	UserID        string    `json:"user_id"`
	ProblemID     *string   `json:"problem_id,omitempty"`
	ProblemSlug   *string   `json:"problem_slug,omitempty"`
	PatternID     *string   `json:"pattern_id,omitempty"`
	Title         *string   `json:"title,omitempty"`
	IsArchived    bool      `json:"is_archived"`
	StartedAt     time.Time `json:"started_at"`
	LastMessageAt time.Time `json:"last_message_at"`
	MessageCount  int       `json:"message_count"`
	TotalTokens   int       `json:"total_tokens"`
}

type AIMessage struct {
	ID           string    `json:"id"`
	SessionID    string    `json:"session_id"`
	Role         string    `json:"role"`
	Content      string    `json:"content"`
	MessageType  *string   `json:"message_type,omitempty"`
	TokensUsed   *int      `json:"tokens_used,omitempty"`
	ModelUsed    *string   `json:"model_used,omitempty"`
	ProviderUsed *string   `json:"provider_used,omitempty"`
	LatencyMs    *int      `json:"latency_ms,omitempty"`
	CreatedAt    time.Time `json:"created_at"`
}

// GetOrCreateSession gets existing session or creates a new one for user+problem
func (r *AIChatRepository) GetOrCreateSession(ctx context.Context, userID string, problemSlug *string, patternID *string) (*AISession, error) {
	// First, resolve problem slug to ID if provided
	var problemID *string
	if problemSlug != nil && *problemSlug != "" {
		var pid string
		err := r.db.Pool.QueryRow(ctx, "SELECT id FROM problems WHERE slug = $1", *problemSlug).Scan(&pid)
		if err == nil {
			problemID = &pid
		}
	}

	// Try to find recent non-archived session (within last 24 hours)
	var session AISession
	query := `
		SELECT id, user_id, problem_id, pattern_id, title, is_archived, started_at, last_message_at, message_count, total_tokens
		FROM ai_sessions
		WHERE user_id = $1
		AND ($2::UUID IS NULL AND problem_id IS NULL OR problem_id = $2)
		AND ($3::VARCHAR IS NULL AND pattern_id IS NULL OR pattern_id = $3)
		AND is_archived = false
		AND last_message_at > now() - INTERVAL '24 hours'
		ORDER BY last_message_at DESC
		LIMIT 1
	`

	err := r.db.Pool.QueryRow(ctx, query, userID, problemID, patternID).Scan(
		&session.ID, &session.UserID, &session.ProblemID, &session.PatternID,
		&session.Title, &session.IsArchived, &session.StartedAt, &session.LastMessageAt,
		&session.MessageCount, &session.TotalTokens,
	)

	if err == nil {
		return &session, nil
	}

	if err != pgx.ErrNoRows {
		return nil, err
	}

	// Create new session
	createQuery := `
		INSERT INTO ai_sessions (user_id, problem_id, pattern_id)
		VALUES ($1, $2, $3)
		RETURNING id, user_id, problem_id, pattern_id, title, is_archived, started_at, last_message_at, message_count, total_tokens
	`

	err = r.db.Pool.QueryRow(ctx, createQuery, userID, problemID, patternID).Scan(
		&session.ID, &session.UserID, &session.ProblemID, &session.PatternID,
		&session.Title, &session.IsArchived, &session.StartedAt, &session.LastMessageAt,
		&session.MessageCount, &session.TotalTokens,
	)

	return &session, err
}

// GetSession retrieves a session by ID
func (r *AIChatRepository) GetSession(ctx context.Context, sessionID string, userID string) (*AISession, error) {
	var session AISession
	query := `
		SELECT id, user_id, problem_id, pattern_id, title, is_archived, started_at, last_message_at, message_count, total_tokens
		FROM ai_sessions
		WHERE id = $1 AND user_id = $2
	`

	err := r.db.Pool.QueryRow(ctx, query, sessionID, userID).Scan(
		&session.ID, &session.UserID, &session.ProblemID, &session.PatternID,
		&session.Title, &session.IsArchived, &session.StartedAt, &session.LastMessageAt,
		&session.MessageCount, &session.TotalTokens,
	)

	if err == pgx.ErrNoRows {
		return nil, nil
	}

	return &session, err
}

// GetSessionMessages retrieves all messages for a session
func (r *AIChatRepository) GetSessionMessages(ctx context.Context, sessionID string, userID string) ([]AIMessage, error) {
	query := `
		SELECT m.id, m.session_id, m.role, m.content, m.message_type, m.tokens_used, m.model_used, m.provider_used, m.latency_ms, m.created_at
		FROM ai_messages m
		JOIN ai_sessions s ON m.session_id = s.id
		WHERE m.session_id = $1 AND s.user_id = $2
		ORDER BY m.created_at ASC
	`

	rows, err := r.db.Pool.Query(ctx, query, sessionID, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var messages []AIMessage
	for rows.Next() {
		var msg AIMessage
		if err := rows.Scan(
			&msg.ID, &msg.SessionID, &msg.Role, &msg.Content, &msg.MessageType,
			&msg.TokensUsed, &msg.ModelUsed, &msg.ProviderUsed, &msg.LatencyMs, &msg.CreatedAt,
		); err != nil {
			return nil, err
		}
		messages = append(messages, msg)
	}

	return messages, nil
}

// AddMessage adds a message to a session
func (r *AIChatRepository) AddMessage(ctx context.Context, sessionID string, role string, content string, messageType *string, tokensUsed *int, modelUsed *string) (*AIMessage, error) {
	var msg AIMessage
	query := `
		INSERT INTO ai_messages (session_id, role, content, message_type, tokens_used, model_used)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, session_id, role, content, message_type, tokens_used, model_used, provider_used, latency_ms, created_at
	`

	err := r.db.Pool.QueryRow(ctx, query, sessionID, role, content, messageType, tokensUsed, modelUsed).Scan(
		&msg.ID, &msg.SessionID, &msg.Role, &msg.Content, &msg.MessageType,
		&msg.TokensUsed, &msg.ModelUsed, &msg.ProviderUsed, &msg.LatencyMs, &msg.CreatedAt,
	)
	if err != nil {
		return nil, err
	}

	// Update session stats
	updateQuery := `
		UPDATE ai_sessions
		SET last_message_at = now(),
			message_count = message_count + 1,
			total_tokens = total_tokens + COALESCE($2, 0)
		WHERE id = $1
	`
	_, err = r.db.Pool.Exec(ctx, updateQuery, sessionID, tokensUsed)

	return &msg, err
}

// GetUserSessions retrieves recent sessions for a user (active sessions only by default)
func (r *AIChatRepository) GetUserSessions(ctx context.Context, userID string, limit int) ([]AISession, error) {
	return r.GetUserSessionsWithArchived(ctx, userID, limit, false)
}

// GetUserSessionsWithArchived retrieves sessions for a user with archive filter
func (r *AIChatRepository) GetUserSessionsWithArchived(ctx context.Context, userID string, limit int, includeArchived bool) ([]AISession, error) {
	if limit <= 0 {
		limit = 10
	}

	query := `
		SELECT s.id, s.user_id, s.problem_id, p.slug, s.pattern_id, s.title, s.is_archived, s.started_at, s.last_message_at, s.message_count, s.total_tokens
		FROM ai_sessions s
		LEFT JOIN problems p ON s.problem_id = p.id
		WHERE s.user_id = $1
		AND ($3 = true OR s.is_archived = false)
		ORDER BY s.last_message_at DESC
		LIMIT $2
	`

	rows, err := r.db.Pool.Query(ctx, query, userID, limit, includeArchived)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var sessions []AISession
	for rows.Next() {
		var s AISession
		if err := rows.Scan(
			&s.ID, &s.UserID, &s.ProblemID, &s.ProblemSlug, &s.PatternID,
			&s.Title, &s.IsArchived, &s.StartedAt, &s.LastMessageAt, &s.MessageCount, &s.TotalTokens,
		); err != nil {
			return nil, err
		}
		sessions = append(sessions, s)
	}

	return sessions, nil
}

// GetArchivedSessionsForProblem retrieves archived sessions for a specific problem
func (r *AIChatRepository) GetArchivedSessionsForProblem(ctx context.Context, userID string, problemSlug string, limit int) ([]AISession, error) {
	if limit <= 0 {
		limit = 10
	}

	query := `
		SELECT s.id, s.user_id, s.problem_id, p.slug, s.pattern_id, s.title, s.is_archived, s.started_at, s.last_message_at, s.message_count, s.total_tokens
		FROM ai_sessions s
		LEFT JOIN problems p ON s.problem_id = p.id
		WHERE s.user_id = $1
		AND p.slug = $2
		AND s.is_archived = true
		ORDER BY s.last_message_at DESC
		LIMIT $3
	`

	rows, err := r.db.Pool.Query(ctx, query, userID, problemSlug, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var sessions []AISession
	for rows.Next() {
		var s AISession
		if err := rows.Scan(
			&s.ID, &s.UserID, &s.ProblemID, &s.ProblemSlug, &s.PatternID,
			&s.Title, &s.IsArchived, &s.StartedAt, &s.LastMessageAt, &s.MessageCount, &s.TotalTokens,
		); err != nil {
			return nil, err
		}
		sessions = append(sessions, s)
	}

	return sessions, nil
}

// GetArchivedSessionsForPattern retrieves archived sessions for a specific pattern
func (r *AIChatRepository) GetArchivedSessionsForPattern(ctx context.Context, userID string, patternID string, limit int) ([]AISession, error) {
	if limit <= 0 {
		limit = 10
	}

	query := `
		SELECT s.id, s.user_id, s.problem_id, p.slug, s.pattern_id, s.title, s.is_archived, s.started_at, s.last_message_at, s.message_count, s.total_tokens
		FROM ai_sessions s
		LEFT JOIN problems p ON s.problem_id = p.id
		WHERE s.user_id = $1
		AND s.pattern_id = $2
		AND s.is_archived = true
		ORDER BY s.last_message_at DESC
		LIMIT $3
	`

	rows, err := r.db.Pool.Query(ctx, query, userID, patternID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var sessions []AISession
	for rows.Next() {
		var s AISession
		if err := rows.Scan(
			&s.ID, &s.UserID, &s.ProblemID, &s.ProblemSlug, &s.PatternID,
			&s.Title, &s.IsArchived, &s.StartedAt, &s.LastMessageAt, &s.MessageCount, &s.TotalTokens,
		); err != nil {
			return nil, err
		}
		sessions = append(sessions, s)
	}

	return sessions, nil
}

// ClearSession deletes all messages in a session
func (r *AIChatRepository) ClearSession(ctx context.Context, sessionID string, userID string) error {
	// Verify ownership first
	var count int
	err := r.db.Pool.QueryRow(ctx, "SELECT COUNT(*) FROM ai_sessions WHERE id = $1 AND user_id = $2", sessionID, userID).Scan(&count)
	if err != nil || count == 0 {
		return err
	}

	_, err = r.db.Pool.Exec(ctx, "DELETE FROM ai_messages WHERE session_id = $1", sessionID)
	if err != nil {
		return err
	}

	_, err = r.db.Pool.Exec(ctx, "UPDATE ai_sessions SET message_count = 0, total_tokens = 0 WHERE id = $1", sessionID)
	return err
}

// ArchiveSession archives a session and optionally sets a title
func (r *AIChatRepository) ArchiveSession(ctx context.Context, sessionID string, userID string, title *string) error {
	query := `
		UPDATE ai_sessions
		SET is_archived = true, title = COALESCE($3, title)
		WHERE id = $1 AND user_id = $2
	`
	result, err := r.db.Pool.Exec(ctx, query, sessionID, userID, title)
	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return pgx.ErrNoRows
	}
	return nil
}

// UpdateSessionTitle updates a session's title
func (r *AIChatRepository) UpdateSessionTitle(ctx context.Context, sessionID string, userID string, title string) error {
	query := `UPDATE ai_sessions SET title = $3 WHERE id = $1 AND user_id = $2`
	result, err := r.db.Pool.Exec(ctx, query, sessionID, userID, title)
	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return pgx.ErrNoRows
	}
	return nil
}
