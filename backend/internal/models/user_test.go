package models

import (
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func TestUser_Structure(t *testing.T) {
	name := "Test User"
	passwordHash := "hashed_password"
	now := time.Now()

	user := User{
		Email:         "test@example.com",
		PasswordHash:  &passwordHash,
		Name:          &name,
		EmailVerified: true,
		HasPassword:   true,
		CreatedAt:     now,
		UpdatedAt:     now,
	}

	assert.Equal(t, "test@example.com", user.Email)
	assert.Equal(t, "hashed_password", *user.PasswordHash)
	assert.NotNil(t, user.Name)
	assert.Equal(t, "Test User", *user.Name)
	assert.True(t, user.EmailVerified)
	assert.True(t, user.HasPassword)
	assert.Equal(t, now, user.CreatedAt)
	assert.Equal(t, now, user.UpdatedAt)
}

func TestRefreshToken_Structure(t *testing.T) {
	userID := uuid.New()
	now := time.Now()
	expiresAt := now.Add(7 * 24 * time.Hour)

	token := RefreshToken{
		UserID:    userID,
		TokenHash: "token_hash_value",
		ExpiresAt: expiresAt,
		CreatedAt: now,
		RevokedAt: nil,
	}

	assert.Equal(t, userID, token.UserID)
	assert.NotEmpty(t, token.TokenHash)
	assert.Equal(t, expiresAt, token.ExpiresAt)
	assert.Equal(t, now, token.CreatedAt)
	assert.Nil(t, token.RevokedAt)
}

func TestRefreshToken_Revoked(t *testing.T) {
	now := time.Now()
	revokedAt := now

	token := RefreshToken{
		TokenHash: "token_hash",
		ExpiresAt: now.Add(time.Hour),
		CreatedAt: now.Add(-time.Hour),
		RevokedAt: &revokedAt,
	}

	assert.NotEmpty(t, token.TokenHash)
	assert.True(t, token.ExpiresAt.After(now))
	assert.True(t, token.CreatedAt.Before(now))
	assert.NotNil(t, token.RevokedAt)
	assert.Equal(t, revokedAt, *token.RevokedAt)
}

func TestUserProgress_Structure(t *testing.T) {
	userID := uuid.New()
	now := time.Now()

	progress := UserProgress{
		UserID:      userID,
		QuestionID:  "two-sum",
		CompletedAt: now,
	}

	assert.Equal(t, userID, progress.UserID)
	assert.Equal(t, "two-sum", progress.QuestionID)
	assert.Equal(t, now, progress.CompletedAt)
}
