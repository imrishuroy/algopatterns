package repository

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/imrishuroy/algopatterns/internal/models"
	"github.com/jackc/pgx/v5"
)

type SessionRepository struct {
	db *Database
}

func NewSessionRepository(db *Database) *SessionRepository {
	return &SessionRepository{db: db}
}

func (r *SessionRepository) Create(ctx context.Context, session *models.Session) error {
	if session.ID == uuid.Nil {
		session.ID = uuid.New()
	}
	session.CreatedAt = time.Now()
	session.LastUsedAt = session.CreatedAt

	_, err := r.db.Pool.Exec(ctx, `
		INSERT INTO user_sessions (id, user_id, refresh_token_hash, device_info, ip_address_hash, created_at, last_used_at, expires_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`, session.ID, session.UserID, session.RefreshTokenHash, session.DeviceInfo, session.IPAddressHash, session.CreatedAt, session.LastUsedAt, session.ExpiresAt)
	if err != nil {
		return fmt.Errorf("failed to create session: %w", err)
	}
	return nil
}

func (r *SessionRepository) GetByTokenHash(ctx context.Context, tokenHash string) (*models.Session, error) {
	session := &models.Session{}
	err := r.db.Pool.QueryRow(ctx, `
		SELECT id, user_id, refresh_token_hash, device_info, ip_address_hash, created_at, last_used_at, expires_at, revoked_at, revoked_reason
		FROM user_sessions WHERE refresh_token_hash = $1
	`, tokenHash).Scan(
		&session.ID, &session.UserID, &session.RefreshTokenHash, &session.DeviceInfo,
		&session.IPAddressHash, &session.CreatedAt, &session.LastUsedAt, &session.ExpiresAt,
		&session.RevokedAt, &session.RevokedReason,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("failed to get session: %w", err)
	}
	return session, nil
}

func (r *SessionRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.Session, error) {
	session := &models.Session{}
	err := r.db.Pool.QueryRow(ctx, `
		SELECT id, user_id, refresh_token_hash, device_info, ip_address_hash, created_at, last_used_at, expires_at, revoked_at, revoked_reason
		FROM user_sessions WHERE id = $1
	`, id).Scan(
		&session.ID, &session.UserID, &session.RefreshTokenHash, &session.DeviceInfo,
		&session.IPAddressHash, &session.CreatedAt, &session.LastUsedAt, &session.ExpiresAt,
		&session.RevokedAt, &session.RevokedReason,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("failed to get session: %w", err)
	}
	return session, nil
}

func (r *SessionRepository) GetUserSessions(ctx context.Context, userID uuid.UUID) ([]*models.Session, error) {
	rows, err := r.db.Pool.Query(ctx, `
		SELECT id, user_id, refresh_token_hash, device_info, ip_address_hash, created_at, last_used_at, expires_at, revoked_at, revoked_reason
		FROM user_sessions
		WHERE user_id = $1 AND revoked_at IS NULL AND expires_at > NOW()
		ORDER BY last_used_at DESC
	`, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user sessions: %w", err)
	}
	defer rows.Close()

	var sessions []*models.Session
	for rows.Next() {
		session := &models.Session{}
		if err := rows.Scan(
			&session.ID, &session.UserID, &session.RefreshTokenHash, &session.DeviceInfo,
			&session.IPAddressHash, &session.CreatedAt, &session.LastUsedAt, &session.ExpiresAt,
			&session.RevokedAt, &session.RevokedReason,
		); err != nil {
			return nil, fmt.Errorf("failed to scan session: %w", err)
		}
		sessions = append(sessions, session)
	}
	return sessions, nil
}

func (r *SessionRepository) UpdateLastUsed(ctx context.Context, id uuid.UUID) error {
	_, err := r.db.Pool.Exec(ctx, `
		UPDATE user_sessions SET last_used_at = $1 WHERE id = $2
	`, time.Now(), id)
	if err != nil {
		return fmt.Errorf("failed to update session last_used_at: %w", err)
	}
	return nil
}

func (r *SessionRepository) Revoke(ctx context.Context, id uuid.UUID, reason string) error {
	now := time.Now()
	result, err := r.db.Pool.Exec(ctx, `
		UPDATE user_sessions SET revoked_at = $1, revoked_reason = $2 WHERE id = $3 AND revoked_at IS NULL
	`, now, reason, id)
	if err != nil {
		return fmt.Errorf("failed to revoke session: %w", err)
	}
	if result.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}

func (r *SessionRepository) RevokeByTokenHash(ctx context.Context, tokenHash string, reason string) error {
	now := time.Now()
	result, err := r.db.Pool.Exec(ctx, `
		UPDATE user_sessions SET revoked_at = $1, revoked_reason = $2 WHERE refresh_token_hash = $3 AND revoked_at IS NULL
	`, now, reason, tokenHash)
	if err != nil {
		return fmt.Errorf("failed to revoke session: %w", err)
	}
	if result.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}

func (r *SessionRepository) RevokeAllUserSessions(ctx context.Context, userID uuid.UUID, reason string) (int64, error) {
	now := time.Now()
	result, err := r.db.Pool.Exec(ctx, `
		UPDATE user_sessions SET revoked_at = $1, revoked_reason = $2 WHERE user_id = $3 AND revoked_at IS NULL
	`, now, reason, userID)
	if err != nil {
		return 0, fmt.Errorf("failed to revoke user sessions: %w", err)
	}
	return result.RowsAffected(), nil
}

func (r *SessionRepository) CleanupExpired(ctx context.Context) (int64, error) {
	result, err := r.db.Pool.Exec(ctx, `
		DELETE FROM user_sessions WHERE expires_at < $1 OR (revoked_at IS NOT NULL AND revoked_at < $2)
	`, time.Now(), time.Now().Add(-24*time.Hour))
	if err != nil {
		return 0, fmt.Errorf("failed to cleanup sessions: %w", err)
	}
	return result.RowsAffected(), nil
}
