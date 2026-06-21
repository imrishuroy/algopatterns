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

type OAuthRepository struct {
	db *Database
}

func NewOAuthRepository(db *Database) *OAuthRepository {
	return &OAuthRepository{db: db}
}

func (r *OAuthRepository) CreateProvider(ctx context.Context, provider *models.OAuthProvider) error {
	if provider.ID == uuid.Nil {
		provider.ID = uuid.New()
	}
	now := time.Now()
	provider.CreatedAt = now
	provider.UpdatedAt = now

	_, err := r.db.Pool.Exec(ctx, `
		INSERT INTO user_oauth_providers (id, user_id, provider, provider_user_id, email, name, avatar_url, raw_profile, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
	`, provider.ID, provider.UserID, provider.Provider, provider.ProviderUserID, provider.Email, provider.Name, provider.AvatarURL, provider.RawProfile, provider.CreatedAt, provider.UpdatedAt)
	if err != nil {
		return fmt.Errorf("failed to create oauth provider: %w", err)
	}
	return nil
}

func (r *OAuthRepository) GetByProviderID(ctx context.Context, provider string, providerUserID string) (*models.OAuthProvider, error) {
	op := &models.OAuthProvider{}
	err := r.db.Pool.QueryRow(ctx, `
		SELECT id, user_id, provider, provider_user_id, email, name, avatar_url, raw_profile, created_at, updated_at
		FROM user_oauth_providers WHERE provider = $1 AND provider_user_id = $2
	`, provider, providerUserID).Scan(
		&op.ID, &op.UserID, &op.Provider, &op.ProviderUserID, &op.Email,
		&op.Name, &op.AvatarURL, &op.RawProfile, &op.CreatedAt, &op.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("failed to get oauth provider: %w", err)
	}
	return op, nil
}

func (r *OAuthRepository) GetUserProviders(ctx context.Context, userID uuid.UUID) ([]*models.OAuthProvider, error) {
	rows, err := r.db.Pool.Query(ctx, `
		SELECT id, user_id, provider, provider_user_id, email, name, avatar_url, raw_profile, created_at, updated_at
		FROM user_oauth_providers WHERE user_id = $1
	`, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user oauth providers: %w", err)
	}
	defer rows.Close()

	var providers []*models.OAuthProvider
	for rows.Next() {
		op := &models.OAuthProvider{}
		if err := rows.Scan(
			&op.ID, &op.UserID, &op.Provider, &op.ProviderUserID, &op.Email,
			&op.Name, &op.AvatarURL, &op.RawProfile, &op.CreatedAt, &op.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan oauth provider: %w", err)
		}
		providers = append(providers, op)
	}
	return providers, nil
}

func (r *OAuthRepository) GetUserProvider(ctx context.Context, userID uuid.UUID, provider string) (*models.OAuthProvider, error) {
	op := &models.OAuthProvider{}
	err := r.db.Pool.QueryRow(ctx, `
		SELECT id, user_id, provider, provider_user_id, email, name, avatar_url, raw_profile, created_at, updated_at
		FROM user_oauth_providers WHERE user_id = $1 AND provider = $2
	`, userID, provider).Scan(
		&op.ID, &op.UserID, &op.Provider, &op.ProviderUserID, &op.Email,
		&op.Name, &op.AvatarURL, &op.RawProfile, &op.CreatedAt, &op.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("failed to get user oauth provider: %w", err)
	}
	return op, nil
}

func (r *OAuthRepository) DeleteProvider(ctx context.Context, userID uuid.UUID, provider string) error {
	result, err := r.db.Pool.Exec(ctx, `
		DELETE FROM user_oauth_providers WHERE user_id = $1 AND provider = $2
	`, userID, provider)
	if err != nil {
		return fmt.Errorf("failed to delete oauth provider: %w", err)
	}
	if result.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}

func (r *OAuthRepository) CreateState(ctx context.Context, state *models.OAuthState) error {
	if state.ID == uuid.Nil {
		state.ID = uuid.New()
	}
	state.CreatedAt = time.Now()

	_, err := r.db.Pool.Exec(ctx, `
		INSERT INTO oauth_states (id, state, code_verifier, redirect_uri, created_at, expires_at)
		VALUES ($1, $2, $3, $4, $5, $6)
	`, state.ID, state.State, state.CodeVerifier, state.RedirectURI, state.CreatedAt, state.ExpiresAt)
	if err != nil {
		return fmt.Errorf("failed to create oauth state: %w", err)
	}
	return nil
}

func (r *OAuthRepository) GetState(ctx context.Context, state string) (*models.OAuthState, error) {
	os := &models.OAuthState{}
	err := r.db.Pool.QueryRow(ctx, `
		SELECT id, state, code_verifier, redirect_uri, created_at, expires_at
		FROM oauth_states WHERE state = $1
	`, state).Scan(&os.ID, &os.State, &os.CodeVerifier, &os.RedirectURI, &os.CreatedAt, &os.ExpiresAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("failed to get oauth state: %w", err)
	}
	return os, nil
}

func (r *OAuthRepository) DeleteState(ctx context.Context, state string) error {
	_, err := r.db.Pool.Exec(ctx, `DELETE FROM oauth_states WHERE state = $1`, state)
	if err != nil {
		return fmt.Errorf("failed to delete oauth state: %w", err)
	}
	return nil
}

func (r *OAuthRepository) CleanupExpiredStates(ctx context.Context) (int64, error) {
	result, err := r.db.Pool.Exec(ctx, `DELETE FROM oauth_states WHERE expires_at < $1`, time.Now())
	if err != nil {
		return 0, fmt.Errorf("failed to cleanup oauth states: %w", err)
	}
	return result.RowsAffected(), nil
}
