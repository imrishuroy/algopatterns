package services

import (
	"context"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/imrishuroy/algopatterns/internal/config"
	"github.com/imrishuroy/algopatterns/internal/models"
	"github.com/imrishuroy/algopatterns/internal/repository"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

type MockOAuthRepository struct {
	mock.Mock
}

var _ repository.OAuthRepositoryInterface = (*MockOAuthRepository)(nil)

func (m *MockOAuthRepository) CreateProvider(ctx context.Context, provider *models.OAuthProvider) error {
	args := m.Called(ctx, provider)
	return args.Error(0)
}

func (m *MockOAuthRepository) GetByProviderID(ctx context.Context, provider string, providerUserID string) (*models.OAuthProvider, error) {
	args := m.Called(ctx, provider, providerUserID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.OAuthProvider), args.Error(1)
}

func (m *MockOAuthRepository) GetUserProviders(ctx context.Context, userID uuid.UUID) ([]*models.OAuthProvider, error) {
	args := m.Called(ctx, userID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]*models.OAuthProvider), args.Error(1)
}

func (m *MockOAuthRepository) GetUserProvider(ctx context.Context, userID uuid.UUID, provider string) (*models.OAuthProvider, error) {
	args := m.Called(ctx, userID, provider)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.OAuthProvider), args.Error(1)
}

func (m *MockOAuthRepository) DeleteProvider(ctx context.Context, userID uuid.UUID, provider string) error {
	args := m.Called(ctx, userID, provider)
	return args.Error(0)
}

func (m *MockOAuthRepository) CreateState(ctx context.Context, state *models.OAuthState) error {
	args := m.Called(ctx, state)
	return args.Error(0)
}

func (m *MockOAuthRepository) GetState(ctx context.Context, state string) (*models.OAuthState, error) {
	args := m.Called(ctx, state)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.OAuthState), args.Error(1)
}

func (m *MockOAuthRepository) DeleteState(ctx context.Context, state string) error {
	args := m.Called(ctx, state)
	return args.Error(0)
}

func (m *MockOAuthRepository) CleanupExpiredStates(ctx context.Context) (int64, error) {
	args := m.Called(ctx)
	return args.Get(0).(int64), args.Error(1)
}

func TestGenerateGoogleAuthURL_Success(t *testing.T) {
	mockOAuthRepo := new(MockOAuthRepository)
	mockUserRepo := new(MockUserRepository)
	mockSessionRepo := new(MockSessionRepository)

	googleCfg := &config.GoogleOAuthConfig{
		ClientID:     "test-client-id",
		ClientSecret: "test-client-secret",
		RedirectURI:  "http://localhost:3000/auth/google/callback",
	}
	authCfg := &config.AuthConfig{
		JWTSecret:            "test-secret",
		AccessTokenDuration:  15 * time.Minute,
		SingleSessionEnabled: true,
	}

	service := NewOAuthService(mockOAuthRepo, mockUserRepo, mockSessionRepo, googleCfg, authCfg)
	ctx := context.Background()

	mockOAuthRepo.On("CreateState", ctx, mock.AnythingOfType("*models.OAuthState")).Return(nil)

	resp, err := service.GenerateGoogleAuthURL(ctx)

	assert.NoError(t, err)
	assert.NotNil(t, resp)
	assert.Contains(t, resp.URL, "accounts.google.com")
	assert.Contains(t, resp.URL, "client_id=test-client-id")
	assert.Contains(t, resp.URL, "code_challenge")
	assert.NotEmpty(t, resp.State)
	mockOAuthRepo.AssertExpectations(t)
}

func TestGetAuthMethods_PasswordOnly(t *testing.T) {
	mockOAuthRepo := new(MockOAuthRepository)
	mockUserRepo := new(MockUserRepository)
	mockSessionRepo := new(MockSessionRepository)

	googleCfg := &config.GoogleOAuthConfig{
		ClientID:     "test-client-id",
		ClientSecret: "test-client-secret",
		RedirectURI:  "http://localhost:3000/auth/google/callback",
	}
	authCfg := &config.AuthConfig{
		JWTSecret:            "test-secret",
		AccessTokenDuration:  15 * time.Minute,
		SingleSessionEnabled: true,
	}

	service := NewOAuthService(mockOAuthRepo, mockUserRepo, mockSessionRepo, googleCfg, authCfg)
	ctx := context.Background()
	userID := uuid.New()

	user := &models.User{
		ID:          userID,
		Email:       "test@example.com",
		HasPassword: true,
	}

	mockUserRepo.On("GetByID", ctx, userID).Return(user, nil)
	mockOAuthRepo.On("GetUserProviders", ctx, userID).Return([]*models.OAuthProvider{}, nil)

	methods, err := service.GetAuthMethods(ctx, userID)

	assert.NoError(t, err)
	assert.True(t, methods.HasPassword)
	assert.Empty(t, methods.Providers)
	mockUserRepo.AssertExpectations(t)
	mockOAuthRepo.AssertExpectations(t)
}

func TestGetAuthMethods_WithGoogleLinked(t *testing.T) {
	mockOAuthRepo := new(MockOAuthRepository)
	mockUserRepo := new(MockUserRepository)
	mockSessionRepo := new(MockSessionRepository)

	googleCfg := &config.GoogleOAuthConfig{
		ClientID:     "test-client-id",
		ClientSecret: "test-client-secret",
		RedirectURI:  "http://localhost:3000/auth/google/callback",
	}
	authCfg := &config.AuthConfig{
		JWTSecret:            "test-secret",
		AccessTokenDuration:  15 * time.Minute,
		SingleSessionEnabled: true,
	}

	service := NewOAuthService(mockOAuthRepo, mockUserRepo, mockSessionRepo, googleCfg, authCfg)
	ctx := context.Background()
	userID := uuid.New()

	user := &models.User{
		ID:          userID,
		Email:       "test@example.com",
		HasPassword: true,
	}

	googleEmail := "test@gmail.com"
	providers := []*models.OAuthProvider{
		{
			ID:             uuid.New(),
			UserID:         userID,
			Provider:       "google",
			ProviderUserID: "google-123",
			Email:          &googleEmail,
			CreatedAt:      time.Now(),
		},
	}

	mockUserRepo.On("GetByID", ctx, userID).Return(user, nil)
	mockOAuthRepo.On("GetUserProviders", ctx, userID).Return(providers, nil)

	methods, err := service.GetAuthMethods(ctx, userID)

	assert.NoError(t, err)
	assert.True(t, methods.HasPassword)
	assert.Len(t, methods.Providers, 1)
	assert.Equal(t, "google", methods.Providers[0].Provider)
	assert.Equal(t, "test@gmail.com", methods.Providers[0].Email)
	assert.True(t, methods.Providers[0].CanUnlink)
	mockUserRepo.AssertExpectations(t)
	mockOAuthRepo.AssertExpectations(t)
}

func TestGetAuthMethods_GoogleOnlyCannotUnlink(t *testing.T) {
	mockOAuthRepo := new(MockOAuthRepository)
	mockUserRepo := new(MockUserRepository)
	mockSessionRepo := new(MockSessionRepository)

	googleCfg := &config.GoogleOAuthConfig{
		ClientID:     "test-client-id",
		ClientSecret: "test-client-secret",
		RedirectURI:  "http://localhost:3000/auth/google/callback",
	}
	authCfg := &config.AuthConfig{
		JWTSecret:            "test-secret",
		AccessTokenDuration:  15 * time.Minute,
		SingleSessionEnabled: true,
	}

	service := NewOAuthService(mockOAuthRepo, mockUserRepo, mockSessionRepo, googleCfg, authCfg)
	ctx := context.Background()
	userID := uuid.New()

	user := &models.User{
		ID:          userID,
		Email:       "test@example.com",
		HasPassword: false,
	}

	googleEmail := "test@gmail.com"
	providers := []*models.OAuthProvider{
		{
			ID:             uuid.New(),
			UserID:         userID,
			Provider:       "google",
			ProviderUserID: "google-123",
			Email:          &googleEmail,
			CreatedAt:      time.Now(),
		},
	}

	mockUserRepo.On("GetByID", ctx, userID).Return(user, nil)
	mockOAuthRepo.On("GetUserProviders", ctx, userID).Return(providers, nil)

	methods, err := service.GetAuthMethods(ctx, userID)

	assert.NoError(t, err)
	assert.False(t, methods.HasPassword)
	assert.Len(t, methods.Providers, 1)
	assert.False(t, methods.Providers[0].CanUnlink)
	mockUserRepo.AssertExpectations(t)
	mockOAuthRepo.AssertExpectations(t)
}

func TestUnlinkGoogle_Success(t *testing.T) {
	mockOAuthRepo := new(MockOAuthRepository)
	mockUserRepo := new(MockUserRepository)
	mockSessionRepo := new(MockSessionRepository)

	googleCfg := &config.GoogleOAuthConfig{
		ClientID:     "test-client-id",
		ClientSecret: "test-client-secret",
		RedirectURI:  "http://localhost:3000/auth/google/callback",
	}
	authCfg := &config.AuthConfig{
		JWTSecret:            "test-secret",
		AccessTokenDuration:  15 * time.Minute,
		SingleSessionEnabled: true,
	}

	service := NewOAuthService(mockOAuthRepo, mockUserRepo, mockSessionRepo, googleCfg, authCfg)
	ctx := context.Background()
	userID := uuid.New()

	user := &models.User{
		ID:          userID,
		Email:       "test@example.com",
		HasPassword: true,
	}

	mockUserRepo.On("GetByID", ctx, userID).Return(user, nil)
	mockOAuthRepo.On("GetUserProviders", ctx, userID).Return([]*models.OAuthProvider{
		{Provider: "google"},
	}, nil)
	mockOAuthRepo.On("DeleteProvider", ctx, userID, "google").Return(nil)

	err := service.UnlinkGoogle(ctx, userID)

	assert.NoError(t, err)
	mockOAuthRepo.AssertExpectations(t)
}

func TestUnlinkGoogle_CannotUnlinkLastAuth(t *testing.T) {
	mockOAuthRepo := new(MockOAuthRepository)
	mockUserRepo := new(MockUserRepository)
	mockSessionRepo := new(MockSessionRepository)

	googleCfg := &config.GoogleOAuthConfig{
		ClientID:     "test-client-id",
		ClientSecret: "test-client-secret",
		RedirectURI:  "http://localhost:3000/auth/google/callback",
	}
	authCfg := &config.AuthConfig{
		JWTSecret:            "test-secret",
		AccessTokenDuration:  15 * time.Minute,
		SingleSessionEnabled: true,
	}

	service := NewOAuthService(mockOAuthRepo, mockUserRepo, mockSessionRepo, googleCfg, authCfg)
	ctx := context.Background()
	userID := uuid.New()

	user := &models.User{
		ID:          userID,
		Email:       "test@example.com",
		HasPassword: false,
	}

	mockUserRepo.On("GetByID", ctx, userID).Return(user, nil)
	mockOAuthRepo.On("GetUserProviders", ctx, userID).Return([]*models.OAuthProvider{
		{Provider: "google"},
	}, nil)

	err := service.UnlinkGoogle(ctx, userID)

	assert.ErrorIs(t, err, ErrCannotUnlinkLastAuth)
	mockOAuthRepo.AssertNotCalled(t, "DeleteProvider")
}

func TestUnlinkGoogle_ProviderNotLinked(t *testing.T) {
	mockOAuthRepo := new(MockOAuthRepository)
	mockUserRepo := new(MockUserRepository)
	mockSessionRepo := new(MockSessionRepository)

	googleCfg := &config.GoogleOAuthConfig{
		ClientID:     "test-client-id",
		ClientSecret: "test-client-secret",
		RedirectURI:  "http://localhost:3000/auth/google/callback",
	}
	authCfg := &config.AuthConfig{
		JWTSecret:            "test-secret",
		AccessTokenDuration:  15 * time.Minute,
		SingleSessionEnabled: true,
	}

	service := NewOAuthService(mockOAuthRepo, mockUserRepo, mockSessionRepo, googleCfg, authCfg)
	ctx := context.Background()
	userID := uuid.New()

	user := &models.User{
		ID:          userID,
		Email:       "test@example.com",
		HasPassword: true,
	}

	mockUserRepo.On("GetByID", ctx, userID).Return(user, nil)
	mockOAuthRepo.On("GetUserProviders", ctx, userID).Return([]*models.OAuthProvider{}, nil)
	mockOAuthRepo.On("DeleteProvider", ctx, userID, "google").Return(repository.ErrNotFound)

	err := service.UnlinkGoogle(ctx, userID)

	assert.ErrorIs(t, err, ErrProviderNotLinked)
}

func TestOAuthState_Expired(t *testing.T) {
	mockOAuthRepo := new(MockOAuthRepository)
	mockUserRepo := new(MockUserRepository)
	mockSessionRepo := new(MockSessionRepository)

	googleCfg := &config.GoogleOAuthConfig{
		ClientID:     "test-client-id",
		ClientSecret: "test-client-secret",
		RedirectURI:  "http://localhost:3000/auth/google/callback",
	}
	authCfg := &config.AuthConfig{
		JWTSecret:            "test-secret",
		AccessTokenDuration:  15 * time.Minute,
		SingleSessionEnabled: true,
	}

	service := NewOAuthService(mockOAuthRepo, mockUserRepo, mockSessionRepo, googleCfg, authCfg)
	ctx := context.Background()

	expiredState := &models.OAuthState{
		State:        "expired-state",
		CodeVerifier: "verifier",
		ExpiresAt:    time.Now().Add(-time.Hour),
	}

	mockOAuthRepo.On("GetState", ctx, "expired-state").Return(expiredState, nil)
	mockOAuthRepo.On("DeleteState", ctx, "expired-state").Return(nil)

	_, _, _, err := service.ProcessGoogleCallback(ctx, "code", "expired-state")

	assert.ErrorIs(t, err, ErrOAuthStateExpired)
}

func TestOAuthState_Invalid(t *testing.T) {
	mockOAuthRepo := new(MockOAuthRepository)
	mockUserRepo := new(MockUserRepository)
	mockSessionRepo := new(MockSessionRepository)

	googleCfg := &config.GoogleOAuthConfig{
		ClientID:     "test-client-id",
		ClientSecret: "test-client-secret",
		RedirectURI:  "http://localhost:3000/auth/google/callback",
	}
	authCfg := &config.AuthConfig{
		JWTSecret:            "test-secret",
		AccessTokenDuration:  15 * time.Minute,
		SingleSessionEnabled: true,
	}

	service := NewOAuthService(mockOAuthRepo, mockUserRepo, mockSessionRepo, googleCfg, authCfg)
	ctx := context.Background()

	mockOAuthRepo.On("GetState", ctx, "invalid-state").Return(nil, repository.ErrNotFound)

	_, _, _, err := service.ProcessGoogleCallback(ctx, "code", "invalid-state")

	assert.ErrorIs(t, err, ErrInvalidOAuthState)
}

func TestGoogleUserInfo_Structure(t *testing.T) {
	info := &models.GoogleUserInfo{
		ID:            "12345",
		Email:         "test@gmail.com",
		VerifiedEmail: true,
		Name:          "Test User",
		GivenName:     "Test",
		FamilyName:    "User",
		Picture:       "https://example.com/photo.jpg",
		Locale:        "en",
	}

	assert.Equal(t, "12345", info.ID)
	assert.Equal(t, "test@gmail.com", info.Email)
	assert.True(t, info.VerifiedEmail)
	assert.Equal(t, "Test User", info.Name)
	assert.Equal(t, "Test", info.GivenName)
	assert.Equal(t, "User", info.FamilyName)
	assert.Equal(t, "https://example.com/photo.jpg", info.Picture)
	assert.Equal(t, "en", info.Locale)
}
