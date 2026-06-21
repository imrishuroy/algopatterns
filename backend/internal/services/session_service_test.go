package services

import (
	"context"
	"encoding/json"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/imrishuroy/algopatterns/internal/config"
	"github.com/imrishuroy/algopatterns/internal/models"
	"github.com/imrishuroy/algopatterns/internal/repository"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

type MockSessionRepository struct {
	mock.Mock
}

var _ repository.SessionRepositoryInterface = (*MockSessionRepository)(nil)

func (m *MockSessionRepository) Create(ctx context.Context, session *models.Session) error {
	args := m.Called(ctx, session)
	return args.Error(0)
}

func (m *MockSessionRepository) GetByTokenHash(ctx context.Context, tokenHash string) (*models.Session, error) {
	args := m.Called(ctx, tokenHash)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.Session), args.Error(1)
}

func (m *MockSessionRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.Session, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.Session), args.Error(1)
}

func (m *MockSessionRepository) GetUserSessions(ctx context.Context, userID uuid.UUID) ([]*models.Session, error) {
	args := m.Called(ctx, userID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]*models.Session), args.Error(1)
}

func (m *MockSessionRepository) UpdateLastUsed(ctx context.Context, id uuid.UUID) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func (m *MockSessionRepository) Revoke(ctx context.Context, id uuid.UUID, reason string) error {
	args := m.Called(ctx, id, reason)
	return args.Error(0)
}

func (m *MockSessionRepository) RevokeByTokenHash(ctx context.Context, tokenHash string, reason string) error {
	args := m.Called(ctx, tokenHash, reason)
	return args.Error(0)
}

func (m *MockSessionRepository) RevokeAllUserSessions(ctx context.Context, userID uuid.UUID, reason string) (int64, error) {
	args := m.Called(ctx, userID, reason)
	return args.Get(0).(int64), args.Error(1)
}

func (m *MockSessionRepository) CleanupExpired(ctx context.Context) (int64, error) {
	args := m.Called(ctx)
	return args.Get(0).(int64), args.Error(1)
}

func TestCreateSession_SingleSessionEnabled_RevokesExisting(t *testing.T) {
	mockSessionRepo := new(MockSessionRepository)
	mockUserRepo := new(MockUserRepository)
	cfg := &config.AuthConfig{
		RefreshTokenDuration: 7 * 24 * time.Hour,
		SingleSessionEnabled: true,
	}

	service := NewSessionService(mockSessionRepo, mockUserRepo, cfg)
	ctx := context.Background()
	userID := uuid.New()

	deviceInfo := &models.DeviceInfo{
		UserAgent:  "Mozilla/5.0",
		DeviceType: "desktop",
		Browser:    "Chrome",
		OS:         "macOS",
		IP:         "192.168.1.1",
	}

	mockSessionRepo.On("RevokeAllUserSessions", ctx, userID, "new_session").Return(int64(2), nil)
	mockSessionRepo.On("Create", ctx, mock.AnythingOfType("*models.Session")).Return(nil)

	session, rawToken, err := service.CreateSession(ctx, userID, deviceInfo)

	assert.NoError(t, err)
	assert.NotNil(t, session)
	assert.NotEmpty(t, rawToken)
	assert.Equal(t, userID, session.UserID)
	mockSessionRepo.AssertExpectations(t)
}

func TestCreateSession_SingleSessionDisabled_NoRevoke(t *testing.T) {
	mockSessionRepo := new(MockSessionRepository)
	mockUserRepo := new(MockUserRepository)
	cfg := &config.AuthConfig{
		RefreshTokenDuration: 7 * 24 * time.Hour,
		SingleSessionEnabled: false,
	}

	service := NewSessionService(mockSessionRepo, mockUserRepo, cfg)
	ctx := context.Background()
	userID := uuid.New()

	mockSessionRepo.On("Create", ctx, mock.AnythingOfType("*models.Session")).Return(nil)

	session, rawToken, err := service.CreateSession(ctx, userID, nil)

	assert.NoError(t, err)
	assert.NotNil(t, session)
	assert.NotEmpty(t, rawToken)
	mockSessionRepo.AssertNotCalled(t, "RevokeAllUserSessions")
	mockSessionRepo.AssertExpectations(t)
}

func TestValidateRefreshToken_Success(t *testing.T) {
	mockSessionRepo := new(MockSessionRepository)
	mockUserRepo := new(MockUserRepository)
	cfg := &config.AuthConfig{
		RefreshTokenDuration: 7 * 24 * time.Hour,
		SingleSessionEnabled: true,
	}

	service := NewSessionService(mockSessionRepo, mockUserRepo, cfg)
	ctx := context.Background()
	userID := uuid.New()
	sessionID := uuid.New()

	existingSession := &models.Session{
		ID:               sessionID,
		UserID:           userID,
		RefreshTokenHash: "somehash",
		ExpiresAt:        time.Now().Add(time.Hour),
	}

	existingUser := &models.User{
		ID:    userID,
		Email: "test@example.com",
	}

	mockSessionRepo.On("GetByTokenHash", ctx, mock.AnythingOfType("string")).Return(existingSession, nil)
	mockUserRepo.On("GetByID", ctx, userID).Return(existingUser, nil)
	mockSessionRepo.On("UpdateLastUsed", ctx, sessionID).Return(nil)

	session, user, err := service.ValidateRefreshToken(ctx, "somerawtoken")

	assert.NoError(t, err)
	assert.NotNil(t, session)
	assert.NotNil(t, user)
	assert.Equal(t, userID, user.ID)
	mockSessionRepo.AssertExpectations(t)
	mockUserRepo.AssertExpectations(t)
}

func TestValidateRefreshToken_NotFound(t *testing.T) {
	mockSessionRepo := new(MockSessionRepository)
	mockUserRepo := new(MockUserRepository)
	cfg := &config.AuthConfig{
		RefreshTokenDuration: 7 * 24 * time.Hour,
		SingleSessionEnabled: true,
	}

	service := NewSessionService(mockSessionRepo, mockUserRepo, cfg)
	ctx := context.Background()

	mockSessionRepo.On("GetByTokenHash", ctx, mock.AnythingOfType("string")).Return(nil, repository.ErrNotFound)

	session, user, err := service.ValidateRefreshToken(ctx, "invalidtoken")

	assert.ErrorIs(t, err, ErrSessionNotFound)
	assert.Nil(t, session)
	assert.Nil(t, user)
	mockSessionRepo.AssertExpectations(t)
}

func TestValidateRefreshToken_Revoked(t *testing.T) {
	mockSessionRepo := new(MockSessionRepository)
	mockUserRepo := new(MockUserRepository)
	cfg := &config.AuthConfig{
		RefreshTokenDuration: 7 * 24 * time.Hour,
		SingleSessionEnabled: true,
	}

	service := NewSessionService(mockSessionRepo, mockUserRepo, cfg)
	ctx := context.Background()

	revokedAt := time.Now()
	existingSession := &models.Session{
		ID:               uuid.New(),
		UserID:           uuid.New(),
		RefreshTokenHash: "somehash",
		ExpiresAt:        time.Now().Add(time.Hour),
		RevokedAt:        &revokedAt,
	}

	mockSessionRepo.On("GetByTokenHash", ctx, mock.AnythingOfType("string")).Return(existingSession, nil)

	session, user, err := service.ValidateRefreshToken(ctx, "revokedtoken")

	assert.ErrorIs(t, err, ErrSessionRevoked)
	assert.Nil(t, session)
	assert.Nil(t, user)
	mockSessionRepo.AssertExpectations(t)
}

func TestValidateRefreshToken_Expired(t *testing.T) {
	mockSessionRepo := new(MockSessionRepository)
	mockUserRepo := new(MockUserRepository)
	cfg := &config.AuthConfig{
		RefreshTokenDuration: 7 * 24 * time.Hour,
		SingleSessionEnabled: true,
	}

	service := NewSessionService(mockSessionRepo, mockUserRepo, cfg)
	ctx := context.Background()

	existingSession := &models.Session{
		ID:               uuid.New(),
		UserID:           uuid.New(),
		RefreshTokenHash: "somehash",
		ExpiresAt:        time.Now().Add(-time.Hour),
	}

	mockSessionRepo.On("GetByTokenHash", ctx, mock.AnythingOfType("string")).Return(existingSession, nil)

	session, user, err := service.ValidateRefreshToken(ctx, "expiredtoken")

	assert.ErrorIs(t, err, ErrSessionExpired)
	assert.Nil(t, session)
	assert.Nil(t, user)
	mockSessionRepo.AssertExpectations(t)
}

func TestRevokeAllUserSessions(t *testing.T) {
	mockSessionRepo := new(MockSessionRepository)
	mockUserRepo := new(MockUserRepository)
	cfg := &config.AuthConfig{
		RefreshTokenDuration: 7 * 24 * time.Hour,
		SingleSessionEnabled: true,
	}

	service := NewSessionService(mockSessionRepo, mockUserRepo, cfg)
	ctx := context.Background()
	userID := uuid.New()

	mockSessionRepo.On("RevokeAllUserSessions", ctx, userID, "logout_all").Return(int64(3), nil)

	count, err := service.RevokeAllUserSessions(ctx, userID, "logout_all")

	assert.NoError(t, err)
	assert.Equal(t, int64(3), count)
	mockSessionRepo.AssertExpectations(t)
}

func TestGetUserSessions(t *testing.T) {
	mockSessionRepo := new(MockSessionRepository)
	mockUserRepo := new(MockUserRepository)
	cfg := &config.AuthConfig{
		RefreshTokenDuration: 7 * 24 * time.Hour,
		SingleSessionEnabled: true,
	}

	service := NewSessionService(mockSessionRepo, mockUserRepo, cfg)
	ctx := context.Background()
	userID := uuid.New()

	deviceInfo := models.DeviceInfo{
		DeviceType: "desktop",
		Browser:    "Chrome",
		OS:         "macOS",
	}
	deviceInfoJSON, _ := json.Marshal(deviceInfo)

	sessions := []*models.Session{
		{
			ID:               uuid.New(),
			UserID:           userID,
			RefreshTokenHash: "hash1",
			DeviceInfo:       deviceInfoJSON,
			LastUsedAt:       time.Now(),
			CreatedAt:        time.Now().Add(-time.Hour),
		},
	}

	mockSessionRepo.On("GetUserSessions", ctx, userID).Return(sessions, nil)

	result, err := service.GetUserSessions(ctx, userID, "hash1")

	assert.NoError(t, err)
	assert.Len(t, result, 1)
	assert.True(t, result[0].IsCurrent)
	assert.Equal(t, "desktop", result[0].DeviceType)
	assert.Equal(t, "Chrome", result[0].Browser)
	mockSessionRepo.AssertExpectations(t)
}

func TestParseDeviceInfo(t *testing.T) {
	tests := []struct {
		name            string
		userAgent       string
		expectedDevice  string
		expectedBrowser string
		expectedOS      string
	}{
		{
			name:            "Chrome on macOS",
			userAgent:       "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
			expectedDevice:  "desktop",
			expectedBrowser: "Chrome",
			expectedOS:      "macOS",
		},
		{
			name:            "Safari on iPhone",
			userAgent:       "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1",
			expectedDevice:  "mobile",
			expectedBrowser: "Safari",
			expectedOS:      "iOS",
		},
		{
			name:            "Firefox on Windows",
			userAgent:       "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0",
			expectedDevice:  "desktop",
			expectedBrowser: "Firefox",
			expectedOS:      "Windows",
		},
		{
			name:            "Chrome on Android",
			userAgent:       "Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36",
			expectedDevice:  "mobile",
			expectedBrowser: "Chrome",
			expectedOS:      "Android",
		},
		{
			name:            "Edge on Windows",
			userAgent:       "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59",
			expectedDevice:  "desktop",
			expectedBrowser: "Edge",
			expectedOS:      "Windows",
		},
		{
			name:            "iPad Safari",
			userAgent:       "Mozilla/5.0 (iPad; CPU OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1",
			expectedDevice:  "tablet",
			expectedBrowser: "Safari",
			expectedOS:      "iOS",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			info := ParseDeviceInfo(tt.userAgent, "192.168.1.1")

			assert.Equal(t, tt.expectedDevice, info.DeviceType)
			assert.Equal(t, tt.expectedBrowser, info.Browser)
			assert.Equal(t, tt.expectedOS, info.OS)
			assert.Equal(t, "192.168.1.1", info.IP)
		})
	}
}

func TestSession_IsValid(t *testing.T) {
	tests := []struct {
		name     string
		session  *models.Session
		expected bool
	}{
		{
			name: "Valid session",
			session: &models.Session{
				ExpiresAt: time.Now().Add(time.Hour),
				RevokedAt: nil,
			},
			expected: true,
		},
		{
			name: "Expired session",
			session: &models.Session{
				ExpiresAt: time.Now().Add(-time.Hour),
				RevokedAt: nil,
			},
			expected: false,
		},
		{
			name: "Revoked session",
			session: &models.Session{
				ExpiresAt: time.Now().Add(time.Hour),
				RevokedAt: func() *time.Time { t := time.Now(); return &t }(),
			},
			expected: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.expected, tt.session.IsValid())
		})
	}
}
