package models

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID              uuid.UUID  `json:"id" db:"id"`
	Email           string     `json:"email" db:"email"`
	PasswordHash    *string    `json:"-" db:"password_hash"`
	Name            *string    `json:"name,omitempty" db:"name"`
	EmailVerified   bool       `json:"emailVerified" db:"email_verified"`
	EmailVerifiedAt *time.Time `json:"emailVerifiedAt,omitempty" db:"email_verified_at"`
	HasPassword     bool       `json:"hasPassword" db:"has_password"`
	AvatarURL       *string    `json:"avatarUrl,omitempty" db:"avatar_url"`
	CreatedAt       time.Time  `json:"createdAt" db:"created_at"`
	UpdatedAt       time.Time  `json:"updatedAt" db:"updated_at"`
}

type RefreshToken struct {
	ID        uuid.UUID  `db:"id"`
	UserID    uuid.UUID  `db:"user_id"`
	TokenHash string     `db:"token_hash"`
	ExpiresAt time.Time  `db:"expires_at"`
	CreatedAt time.Time  `db:"created_at"`
	RevokedAt *time.Time `db:"revoked_at"`
}

type UserProgress struct {
	ID          uuid.UUID `json:"id" db:"id"`
	UserID      uuid.UUID `json:"userId" db:"user_id"`
	QuestionID  string    `json:"questionId" db:"question_id"`
	CompletedAt time.Time `json:"completedAt" db:"completed_at"`
}

type PasswordResetToken struct {
	ID        uuid.UUID  `db:"id"`
	UserID    uuid.UUID  `db:"user_id"`
	TokenHash string     `db:"token_hash"`
	ExpiresAt time.Time  `db:"expires_at"`
	UsedAt    *time.Time `db:"used_at"`
	CreatedAt time.Time  `db:"created_at"`
}
