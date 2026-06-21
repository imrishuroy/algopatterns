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
	"golang.org/x/crypto/bcrypt"
)

type MockUserRepository struct {
	mock.Mock
}

func (m *MockUserRepository) Create(ctx context.Context, user *models.User) error {
	args := m.Called(ctx, user)
	return args.Error(0)
}

func (m *MockUserRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.User, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.User), args.Error(1)
}

func (m *MockUserRepository) GetByEmail(ctx context.Context, email string) (*models.User, error) {
	args := m.Called(ctx, email)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.User), args.Error(1)
}

func (m *MockUserRepository) Update(ctx context.Context, user *models.User) error {
	args := m.Called(ctx, user)
	return args.Error(0)
}

func (m *MockUserRepository) UpdatePassword(ctx context.Context, userID uuid.UUID, passwordHash string) error {
	args := m.Called(ctx, userID, passwordHash)
	return args.Error(0)
}

func (m *MockUserRepository) Delete(ctx context.Context, id uuid.UUID) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func (m *MockUserRepository) CreateRefreshToken(ctx context.Context, token *models.RefreshToken) error {
	args := m.Called(ctx, token)
	return args.Error(0)
}

func (m *MockUserRepository) GetRefreshToken(ctx context.Context, tokenHash string) (*models.RefreshToken, error) {
	args := m.Called(ctx, tokenHash)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.RefreshToken), args.Error(1)
}

func (m *MockUserRepository) RevokeRefreshToken(ctx context.Context, tokenHash string) error {
	args := m.Called(ctx, tokenHash)
	return args.Error(0)
}

func (m *MockUserRepository) RevokeAllUserTokens(ctx context.Context, userID uuid.UUID) error {
	args := m.Called(ctx, userID)
	return args.Error(0)
}

type MockSessionService struct {
	mock.Mock
}

func (m *MockSessionService) CreateSession(ctx context.Context, userID uuid.UUID, deviceInfo *models.DeviceInfo) (*models.Session, string, error) {
	args := m.Called(ctx, userID, deviceInfo)
	if args.Get(0) == nil {
		return nil, args.String(1), args.Error(2)
	}
	return args.Get(0).(*models.Session), args.String(1), args.Error(2)
}

func (m *MockSessionService) ValidateRefreshToken(ctx context.Context, rawToken string) (*models.Session, *models.User, error) {
	args := m.Called(ctx, rawToken)
	if args.Get(0) == nil {
		return nil, nil, args.Error(2)
	}
	return args.Get(0).(*models.Session), args.Get(1).(*models.User), args.Error(2)
}

func (m *MockSessionService) RevokeSessionByRawToken(ctx context.Context, rawToken string, reason string) error {
	args := m.Called(ctx, rawToken, reason)
	return args.Error(0)
}

func (m *MockSessionService) RevokeAllUserSessions(ctx context.Context, userID uuid.UUID, reason string) (int64, error) {
	args := m.Called(ctx, userID, reason)
	return args.Get(0).(int64), args.Error(1)
}

func newTestAuthConfig() *config.AuthConfig {
	return &config.AuthConfig{
		JWTSecret:            "test-secret-key-for-testing-purposes",
		AccessTokenDuration:  15 * time.Minute,
		RefreshTokenDuration: 7 * 24 * time.Hour,
		BCryptCost:           bcrypt.MinCost,
		SingleSessionEnabled: true,
	}
}

func TestRegister_Success(t *testing.T) {
	mockRepo := new(MockUserRepository)
	cfg := newTestAuthConfig()
	service := &AuthService{
		userRepo:       mockRepo,
		sessionService: nil,
		config:         cfg,
	}
	ctx := context.Background()

	req := &models.RegisterRequest{
		Email:    "test@example.com",
		Password: "password123",
		Name:     strPtr("Test User"),
	}

	mockRepo.On("Create", ctx, mock.AnythingOfType("*models.User")).Return(nil)

	user, err := service.Register(ctx, req)

	assert.NoError(t, err)
	assert.NotNil(t, user)
	assert.Equal(t, req.Email, user.Email)
	assert.NotNil(t, user.PasswordHash)
	assert.True(t, user.HasPassword)
	mockRepo.AssertExpectations(t)
}

func TestRegister_EmailExists(t *testing.T) {
	mockRepo := new(MockUserRepository)
	cfg := newTestAuthConfig()
	service := &AuthService{
		userRepo:       mockRepo,
		sessionService: nil,
		config:         cfg,
	}
	ctx := context.Background()

	req := &models.RegisterRequest{
		Email:    "existing@example.com",
		Password: "password123",
	}

	mockRepo.On("Create", ctx, mock.AnythingOfType("*models.User")).Return(repository.ErrEmailExists)

	user, err := service.Register(ctx, req)

	assert.ErrorIs(t, err, ErrEmailExists)
	assert.Nil(t, user)
	mockRepo.AssertExpectations(t)
}

func TestLogin_Success(t *testing.T) {
	mockRepo := new(MockUserRepository)
	cfg := newTestAuthConfig()
	service := &AuthService{
		userRepo:       mockRepo,
		sessionService: nil,
		config:         cfg,
	}
	ctx := context.Background()

	password := "password123"
	hash, _ := bcrypt.GenerateFromPassword([]byte(password), bcrypt.MinCost)
	hashStr := string(hash)
	existingUser := &models.User{
		ID:           uuid.New(),
		Email:        "test@example.com",
		PasswordHash: &hashStr,
		HasPassword:  true,
	}

	mockRepo.On("GetByEmail", ctx, "test@example.com").Return(existingUser, nil)

	req := &models.LoginRequest{
		Email:    "test@example.com",
		Password: password,
	}

	user, err := service.Login(ctx, req)

	assert.NoError(t, err)
	assert.Equal(t, existingUser.ID, user.ID)
	mockRepo.AssertExpectations(t)
}

func TestLogin_UserNotFound(t *testing.T) {
	mockRepo := new(MockUserRepository)
	cfg := newTestAuthConfig()
	service := &AuthService{
		userRepo:       mockRepo,
		sessionService: nil,
		config:         cfg,
	}
	ctx := context.Background()

	mockRepo.On("GetByEmail", ctx, "notfound@example.com").Return(nil, repository.ErrNotFound)

	req := &models.LoginRequest{
		Email:    "notfound@example.com",
		Password: "password123",
	}

	user, err := service.Login(ctx, req)

	assert.ErrorIs(t, err, ErrInvalidCredentials)
	assert.Nil(t, user)
	mockRepo.AssertExpectations(t)
}

func TestLogin_WrongPassword(t *testing.T) {
	mockRepo := new(MockUserRepository)
	cfg := newTestAuthConfig()
	service := &AuthService{
		userRepo:       mockRepo,
		sessionService: nil,
		config:         cfg,
	}
	ctx := context.Background()

	hash, _ := bcrypt.GenerateFromPassword([]byte("correctpassword"), bcrypt.MinCost)
	hashStr := string(hash)
	existingUser := &models.User{
		ID:           uuid.New(),
		Email:        "test@example.com",
		PasswordHash: &hashStr,
		HasPassword:  true,
	}

	mockRepo.On("GetByEmail", ctx, "test@example.com").Return(existingUser, nil)

	req := &models.LoginRequest{
		Email:    "test@example.com",
		Password: "wrongpassword",
	}

	user, err := service.Login(ctx, req)

	assert.ErrorIs(t, err, ErrInvalidCredentials)
	assert.Nil(t, user)
	mockRepo.AssertExpectations(t)
}

func TestLogin_OAuthOnlyUser(t *testing.T) {
	mockRepo := new(MockUserRepository)
	cfg := newTestAuthConfig()
	service := &AuthService{
		userRepo:       mockRepo,
		sessionService: nil,
		config:         cfg,
	}
	ctx := context.Background()

	existingUser := &models.User{
		ID:          uuid.New(),
		Email:       "oauth@example.com",
		HasPassword: false,
	}

	mockRepo.On("GetByEmail", ctx, "oauth@example.com").Return(existingUser, nil)

	req := &models.LoginRequest{
		Email:    "oauth@example.com",
		Password: "anypassword",
	}

	user, err := service.Login(ctx, req)

	assert.ErrorIs(t, err, ErrInvalidCredentials)
	assert.Nil(t, user)
	mockRepo.AssertExpectations(t)
}

func TestGenerateAccessToken(t *testing.T) {
	cfg := newTestAuthConfig()
	service := &AuthService{config: cfg}

	user := &models.User{
		ID:    uuid.New(),
		Email: "test@example.com",
	}

	token, expiresIn, err := service.GenerateAccessToken(user)

	assert.NoError(t, err)
	assert.NotEmpty(t, token)
	assert.Equal(t, int64(900), expiresIn)
}

func TestValidateAccessToken_Success(t *testing.T) {
	cfg := newTestAuthConfig()
	service := &AuthService{config: cfg}

	user := &models.User{
		ID:    uuid.New(),
		Email: "test@example.com",
	}

	token, _, err := service.GenerateAccessToken(user)
	assert.NoError(t, err)

	claims, err := service.ValidateAccessToken(token)

	assert.NoError(t, err)
	assert.Equal(t, user.ID.String(), claims.UserID)
	assert.Equal(t, user.Email, claims.Email)
}

func TestValidateAccessToken_Invalid(t *testing.T) {
	cfg := newTestAuthConfig()
	service := &AuthService{config: cfg}

	claims, err := service.ValidateAccessToken("invalid-token")

	assert.ErrorIs(t, err, ErrTokenInvalid)
	assert.Nil(t, claims)
}

func TestValidateAccessToken_Expired(t *testing.T) {
	cfg := &config.AuthConfig{
		JWTSecret:           "test-secret",
		AccessTokenDuration: -1 * time.Hour,
	}
	service := &AuthService{config: cfg}

	user := &models.User{
		ID:    uuid.New(),
		Email: "test@example.com",
	}

	token, _, _ := service.GenerateAccessToken(user)

	claims, err := service.ValidateAccessToken(token)

	assert.ErrorIs(t, err, ErrTokenExpired)
	assert.Nil(t, claims)
}

func TestGetUser_Success(t *testing.T) {
	mockRepo := new(MockUserRepository)
	cfg := newTestAuthConfig()
	service := &AuthService{
		userRepo:       mockRepo,
		sessionService: nil,
		config:         cfg,
	}
	ctx := context.Background()
	userID := uuid.New()

	existingUser := &models.User{
		ID:    userID,
		Email: "test@example.com",
	}

	mockRepo.On("GetByID", ctx, userID).Return(existingUser, nil)

	user, err := service.GetUser(ctx, userID)

	assert.NoError(t, err)
	assert.Equal(t, existingUser, user)
	mockRepo.AssertExpectations(t)
}

func TestGetUser_NotFound(t *testing.T) {
	mockRepo := new(MockUserRepository)
	cfg := newTestAuthConfig()
	service := &AuthService{
		userRepo:       mockRepo,
		sessionService: nil,
		config:         cfg,
	}
	ctx := context.Background()
	userID := uuid.New()

	mockRepo.On("GetByID", ctx, userID).Return(nil, repository.ErrNotFound)

	user, err := service.GetUser(ctx, userID)

	assert.ErrorIs(t, err, ErrUserNotFound)
	assert.Nil(t, user)
	mockRepo.AssertExpectations(t)
}

func TestUpdateProfile_Success(t *testing.T) {
	mockRepo := new(MockUserRepository)
	cfg := newTestAuthConfig()
	service := &AuthService{
		userRepo:       mockRepo,
		sessionService: nil,
		config:         cfg,
	}
	ctx := context.Background()
	userID := uuid.New()

	existingUser := &models.User{
		ID:    userID,
		Email: "test@example.com",
		Name:  strPtr("Old Name"),
	}

	mockRepo.On("GetByID", ctx, userID).Return(existingUser, nil)
	mockRepo.On("Update", ctx, mock.AnythingOfType("*models.User")).Return(nil)

	newName := "New Name"
	req := &models.UpdateProfileRequest{Name: &newName}

	user, err := service.UpdateProfile(ctx, userID, req)

	assert.NoError(t, err)
	assert.Equal(t, &newName, user.Name)
	mockRepo.AssertExpectations(t)
}

func TestDeleteAccount_Success(t *testing.T) {
	mockRepo := new(MockUserRepository)
	cfg := newTestAuthConfig()
	service := &AuthService{
		userRepo:       mockRepo,
		sessionService: nil,
		config:         cfg,
	}
	ctx := context.Background()
	userID := uuid.New()

	mockRepo.On("Delete", ctx, userID).Return(nil)

	err := service.DeleteAccount(ctx, userID)

	assert.NoError(t, err)
	mockRepo.AssertExpectations(t)
}

func TestUserToResponse(t *testing.T) {
	name := "Test User"
	user := &models.User{
		ID:            uuid.New(),
		Email:         "test@example.com",
		Name:          &name,
		EmailVerified: true,
	}

	resp := UserToResponse(user)

	assert.Equal(t, user.ID.String(), resp.ID)
	assert.Equal(t, user.Email, resp.Email)
	assert.Equal(t, user.Name, resp.Name)
	assert.Equal(t, user.EmailVerified, resp.EmailVerified)
}

func strPtr(s string) *string {
	return &s
}
