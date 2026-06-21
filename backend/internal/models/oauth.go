package models

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

type OAuthProvider struct {
	ID             uuid.UUID       `json:"id" db:"id"`
	UserID         uuid.UUID       `json:"userId" db:"user_id"`
	Provider       string          `json:"provider" db:"provider"`
	ProviderUserID string          `json:"providerUserId" db:"provider_user_id"`
	Email          *string         `json:"email,omitempty" db:"email"`
	Name           *string         `json:"name,omitempty" db:"name"`
	AvatarURL      *string         `json:"avatarUrl,omitempty" db:"avatar_url"`
	RawProfile     json.RawMessage `json:"-" db:"raw_profile"`
	CreatedAt      time.Time       `json:"createdAt" db:"created_at"`
	UpdatedAt      time.Time       `json:"updatedAt" db:"updated_at"`
}

type OAuthState struct {
	ID           uuid.UUID `db:"id"`
	State        string    `db:"state"`
	CodeVerifier string    `db:"code_verifier"`
	RedirectURI  *string   `db:"redirect_uri"`
	CreatedAt    time.Time `db:"created_at"`
	ExpiresAt    time.Time `db:"expires_at"`
}

type GoogleUserInfo struct {
	ID            string `json:"id"`
	Email         string `json:"email"`
	VerifiedEmail bool   `json:"verified_email"`
	Name          string `json:"name"`
	GivenName     string `json:"given_name"`
	FamilyName    string `json:"family_name"`
	Picture       string `json:"picture"`
	Locale        string `json:"locale"`
}
