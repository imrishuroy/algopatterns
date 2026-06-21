package models

import (
	"encoding/json"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func TestOAuthProvider_Structure(t *testing.T) {
	userID := uuid.New()
	email := "test@gmail.com"
	name := "Test User"
	avatar := "https://example.com/avatar.jpg"
	now := time.Now()

	provider := OAuthProvider{
		ID:             uuid.New(),
		UserID:         userID,
		Provider:       "google",
		ProviderUserID: "google-123456",
		Email:          &email,
		Name:           &name,
		AvatarURL:      &avatar,
		RawProfile:     json.RawMessage(`{"id": "123"}`),
		CreatedAt:      now,
		UpdatedAt:      now,
	}

	assert.NotEqual(t, uuid.Nil, provider.ID)
	assert.Equal(t, userID, provider.UserID)
	assert.Equal(t, "google", provider.Provider)
	assert.Equal(t, "google-123456", provider.ProviderUserID)
	assert.Equal(t, "test@gmail.com", *provider.Email)
	assert.Equal(t, "Test User", *provider.Name)
	assert.Equal(t, "https://example.com/avatar.jpg", *provider.AvatarURL)
	assert.NotNil(t, provider.RawProfile)
	assert.Equal(t, now, provider.CreatedAt)
	assert.Equal(t, now, provider.UpdatedAt)
}

func TestOAuthState_Structure(t *testing.T) {
	now := time.Now()
	expiresAt := now.Add(10 * time.Minute)
	redirectURI := "http://localhost:3000/callback"

	state := OAuthState{
		ID:           uuid.New(),
		State:        "random-state-string",
		CodeVerifier: "code-verifier-for-pkce",
		RedirectURI:  &redirectURI,
		CreatedAt:    now,
		ExpiresAt:    expiresAt,
	}

	assert.NotEqual(t, uuid.Nil, state.ID)
	assert.Equal(t, "random-state-string", state.State)
	assert.Equal(t, "code-verifier-for-pkce", state.CodeVerifier)
	assert.Equal(t, "http://localhost:3000/callback", *state.RedirectURI)
	assert.Equal(t, now, state.CreatedAt)
	assert.Equal(t, expiresAt, state.ExpiresAt)
}

func TestGoogleUserInfo_Structure(t *testing.T) {
	userInfo := GoogleUserInfo{
		ID:            "google-user-id-123",
		Email:         "user@gmail.com",
		VerifiedEmail: true,
		Name:          "John Doe",
		GivenName:     "John",
		FamilyName:    "Doe",
		Picture:       "https://lh3.googleusercontent.com/photo.jpg",
		Locale:        "en",
	}

	assert.Equal(t, "google-user-id-123", userInfo.ID)
	assert.Equal(t, "user@gmail.com", userInfo.Email)
	assert.True(t, userInfo.VerifiedEmail)
	assert.Equal(t, "John Doe", userInfo.Name)
	assert.Equal(t, "John", userInfo.GivenName)
	assert.Equal(t, "Doe", userInfo.FamilyName)
	assert.Contains(t, userInfo.Picture, "googleusercontent.com")
	assert.Equal(t, "en", userInfo.Locale)
}

func TestGoogleUserInfo_JSON(t *testing.T) {
	jsonData := `{
		"id": "123456789",
		"email": "test@gmail.com",
		"verified_email": true,
		"name": "Test User",
		"given_name": "Test",
		"family_name": "User",
		"picture": "https://example.com/photo.jpg",
		"locale": "en"
	}`

	var userInfo GoogleUserInfo
	err := json.Unmarshal([]byte(jsonData), &userInfo)

	assert.NoError(t, err)
	assert.Equal(t, "123456789", userInfo.ID)
	assert.Equal(t, "test@gmail.com", userInfo.Email)
	assert.True(t, userInfo.VerifiedEmail)
	assert.Equal(t, "Test User", userInfo.Name)
}

func TestOAuthProvider_NullableFields(t *testing.T) {
	providerID := uuid.New()
	userID := uuid.New()
	provider := OAuthProvider{
		ID:             providerID,
		UserID:         userID,
		Provider:       "google",
		ProviderUserID: "123",
		Email:          nil,
		Name:           nil,
		AvatarURL:      nil,
	}

	assert.Equal(t, providerID, provider.ID)
	assert.Equal(t, userID, provider.UserID)
	assert.Equal(t, "google", provider.Provider)
	assert.Equal(t, "123", provider.ProviderUserID)
	assert.Nil(t, provider.Email)
	assert.Nil(t, provider.Name)
	assert.Nil(t, provider.AvatarURL)
}
