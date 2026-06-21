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

var ErrEmailExists = errors.New("email already exists")

type UserRepository struct {
	db *Database
}

func NewUserRepository(db *Database) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) Create(ctx context.Context, user *models.User) error {
	now := time.Now()
	user.CreatedAt = now
	user.UpdatedAt = now
	if user.ID == uuid.Nil {
		user.ID = uuid.New()
	}

	_, err := r.db.Pool.Exec(ctx, `
		INSERT INTO users (id, email, password_hash, name, email_verified, has_password, avatar_url, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
	`, user.ID, user.Email, user.PasswordHash, user.Name, user.EmailVerified, user.HasPassword, user.AvatarURL, user.CreatedAt, user.UpdatedAt)
	if err != nil {
		if strings.Contains(err.Error(), "duplicate key") || strings.Contains(err.Error(), "unique constraint") {
			return ErrEmailExists
		}
		return fmt.Errorf("failed to create user: %w", err)
	}

	return nil
}

func (r *UserRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.User, error) {
	user := &models.User{}
	err := r.db.Pool.QueryRow(ctx, `
		SELECT id, email, password_hash, name, email_verified, email_verified_at, has_password, avatar_url, created_at, updated_at
		FROM users WHERE id = $1
	`, id).Scan(&user.ID, &user.Email, &user.PasswordHash, &user.Name, &user.EmailVerified, &user.EmailVerifiedAt, &user.HasPassword, &user.AvatarURL, &user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("failed to get user: %w", err)
	}
	return user, nil
}

func (r *UserRepository) GetByEmail(ctx context.Context, email string) (*models.User, error) {
	user := &models.User{}
	err := r.db.Pool.QueryRow(ctx, `
		SELECT id, email, password_hash, name, email_verified, email_verified_at, has_password, avatar_url, created_at, updated_at
		FROM users WHERE email = $1
	`, email).Scan(&user.ID, &user.Email, &user.PasswordHash, &user.Name, &user.EmailVerified, &user.EmailVerifiedAt, &user.HasPassword, &user.AvatarURL, &user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("failed to get user by email: %w", err)
	}
	return user, nil
}

func (r *UserRepository) Update(ctx context.Context, user *models.User) error {
	user.UpdatedAt = time.Now()
	result, err := r.db.Pool.Exec(ctx, `
		UPDATE users SET name = $1, email_verified = $2, email_verified_at = $3, has_password = $4, avatar_url = $5, updated_at = $6
		WHERE id = $7
	`, user.Name, user.EmailVerified, user.EmailVerifiedAt, user.HasPassword, user.AvatarURL, user.UpdatedAt, user.ID)
	if err != nil {
		return fmt.Errorf("failed to update user: %w", err)
	}
	if result.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}

func (r *UserRepository) UpdatePassword(ctx context.Context, userID uuid.UUID, passwordHash string) error {
	result, err := r.db.Pool.Exec(ctx, `
		UPDATE users SET password_hash = $1, updated_at = $2 WHERE id = $3
	`, passwordHash, time.Now(), userID)
	if err != nil {
		return fmt.Errorf("failed to update password: %w", err)
	}
	if result.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}

func (r *UserRepository) Delete(ctx context.Context, id uuid.UUID) error {
	result, err := r.db.Pool.Exec(ctx, "DELETE FROM users WHERE id = $1", id)
	if err != nil {
		return fmt.Errorf("failed to delete user: %w", err)
	}
	if result.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}

// Refresh token operations
func (r *UserRepository) CreateRefreshToken(ctx context.Context, token *models.RefreshToken) error {
	if token.ID == uuid.Nil {
		token.ID = uuid.New()
	}
	token.CreatedAt = time.Now()

	_, err := r.db.Pool.Exec(ctx, `
		INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at, created_at)
		VALUES ($1, $2, $3, $4, $5)
	`, token.ID, token.UserID, token.TokenHash, token.ExpiresAt, token.CreatedAt)
	if err != nil {
		return fmt.Errorf("failed to create refresh token: %w", err)
	}
	return nil
}

func (r *UserRepository) GetRefreshToken(ctx context.Context, tokenHash string) (*models.RefreshToken, error) {
	token := &models.RefreshToken{}
	err := r.db.Pool.QueryRow(ctx, `
		SELECT id, user_id, token_hash, expires_at, created_at, revoked_at
		FROM refresh_tokens WHERE token_hash = $1
	`, tokenHash).Scan(&token.ID, &token.UserID, &token.TokenHash, &token.ExpiresAt, &token.CreatedAt, &token.RevokedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("failed to get refresh token: %w", err)
	}
	return token, nil
}

func (r *UserRepository) RevokeRefreshToken(ctx context.Context, tokenHash string) error {
	now := time.Now()
	result, err := r.db.Pool.Exec(ctx, `
		UPDATE refresh_tokens SET revoked_at = $1 WHERE token_hash = $2
	`, now, tokenHash)
	if err != nil {
		return fmt.Errorf("failed to revoke refresh token: %w", err)
	}
	if result.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}

func (r *UserRepository) RevokeAllUserTokens(ctx context.Context, userID uuid.UUID) error {
	now := time.Now()
	_, err := r.db.Pool.Exec(ctx, `
		UPDATE refresh_tokens SET revoked_at = $1 WHERE user_id = $2 AND revoked_at IS NULL
	`, now, userID)
	if err != nil {
		return fmt.Errorf("failed to revoke user tokens: %w", err)
	}
	return nil
}

func (r *UserRepository) CleanupExpiredTokens(ctx context.Context) error {
	_, err := r.db.Pool.Exec(ctx, `
		DELETE FROM refresh_tokens WHERE expires_at < $1 OR revoked_at IS NOT NULL
	`, time.Now())
	if err != nil {
		return fmt.Errorf("failed to cleanup tokens: %w", err)
	}
	return nil
}

// User progress operations
func (r *UserRepository) GetProgress(ctx context.Context, userID uuid.UUID) ([]string, error) {
	rows, err := r.db.Pool.Query(ctx, `
		SELECT question_id FROM user_progress WHERE user_id = $1
	`, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get progress: %w", err)
	}
	defer rows.Close()

	var questionIDs []string
	for rows.Next() {
		var qid string
		if err := rows.Scan(&qid); err != nil {
			return nil, err
		}
		questionIDs = append(questionIDs, qid)
	}
	return questionIDs, nil
}

func (r *UserRepository) SetProgress(ctx context.Context, userID uuid.UUID, questionID string, completed bool) error {
	if completed {
		_, err := r.db.Pool.Exec(ctx, `
			INSERT INTO user_progress (id, user_id, question_id, completed_at)
			VALUES ($1, $2, $3, $4)
			ON CONFLICT (user_id, question_id) DO NOTHING
		`, uuid.New(), userID, questionID, time.Now())
		if err != nil {
			return fmt.Errorf("failed to add progress: %w", err)
		}
	} else {
		_, err := r.db.Pool.Exec(ctx, `
			DELETE FROM user_progress WHERE user_id = $1 AND question_id = $2
		`, userID, questionID)
		if err != nil {
			return fmt.Errorf("failed to remove progress: %w", err)
		}
	}
	return nil
}

func (r *UserRepository) SyncProgress(ctx context.Context, userID uuid.UUID, questionIDs []string) error {
	tx, err := r.db.Pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	now := time.Now()
	for _, qid := range questionIDs {
		_, err := tx.Exec(ctx, `
			INSERT INTO user_progress (id, user_id, question_id, completed_at)
			VALUES ($1, $2, $3, $4)
			ON CONFLICT (user_id, question_id) DO NOTHING
		`, uuid.New(), userID, qid, now)
		if err != nil {
			return fmt.Errorf("failed to sync progress: %w", err)
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}
	return nil
}

// Password reset token operations
func (r *UserRepository) CreatePasswordResetToken(ctx context.Context, token *models.PasswordResetToken) error {
	if token.ID == uuid.Nil {
		token.ID = uuid.New()
	}
	token.CreatedAt = time.Now()

	_, err := r.db.Pool.Exec(ctx, `
		INSERT INTO password_reset_tokens (id, user_id, token_hash, expires_at, created_at)
		VALUES ($1, $2, $3, $4, $5)
	`, token.ID, token.UserID, token.TokenHash, token.ExpiresAt, token.CreatedAt)
	if err != nil {
		return fmt.Errorf("failed to create password reset token: %w", err)
	}
	return nil
}

func (r *UserRepository) GetPasswordResetToken(ctx context.Context, tokenHash string) (*models.PasswordResetToken, error) {
	token := &models.PasswordResetToken{}
	err := r.db.Pool.QueryRow(ctx, `
		SELECT id, user_id, token_hash, expires_at, used_at, created_at
		FROM password_reset_tokens WHERE token_hash = $1
	`, tokenHash).Scan(&token.ID, &token.UserID, &token.TokenHash, &token.ExpiresAt, &token.UsedAt, &token.CreatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("failed to get password reset token: %w", err)
	}
	return token, nil
}

func (r *UserRepository) MarkPasswordResetTokenUsed(ctx context.Context, tokenHash string) error {
	now := time.Now()
	result, err := r.db.Pool.Exec(ctx, `
		UPDATE password_reset_tokens SET used_at = $1 WHERE token_hash = $2
	`, now, tokenHash)
	if err != nil {
		return fmt.Errorf("failed to mark token used: %w", err)
	}
	if result.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}
