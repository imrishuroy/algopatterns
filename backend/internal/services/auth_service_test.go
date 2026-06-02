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

func newTestAuthService() (*AuthService, *MockUserRepository) {
	mockRepo := new(MockUserRepository)
	cfg := &config.AuthConfig{
		JWTSecret:            "test-secret-key-for-testing-purposes",
		AccessTokenDuration:  15 * time.Minute,
		RefreshTokenDuration: 7 * 24 * time.Hour,
		BCryptCost:           bcrypt.MinCost, // Low cost for faster tests
	}
	service := &AuthService{
		userRepo: nil, // We'll use the mock directly
		config:   cfg,
	}
	return service, mockRepo
}

func TestRegister_Success(t *testing.T) {
	_, mockRepo := newTestAuthService()
	cfg := &config.AuthConfig{
		JWTSecret:            "test-secret",
		AccessTokenDuration:  15 * time.Minute,
		RefreshTokenDuration: 7 * 24 * time.Hour,
		BCryptCost:           bcrypt.MinCost,
	}
	service := NewAuthService(mockRepo, cfg)
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
	assert.NotEmpty(t, user.PasswordHash)
	mockRepo.AssertExpectations(t)
}

func TestRegister_EmailExists(t *testing.T) {
	_, mockRepo := newTestAuthService()
	cfg := &config.AuthConfig{BCryptCost: 4}
	service := NewAuthService(mockRepo, cfg)
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
	_, mockRepo := newTestAuthService()
	cfg := &config.AuthConfig{BCryptCost: 4}
	service := NewAuthService(mockRepo, cfg)
	ctx := context.Background()

	password := "password123"
	hash, _ := bcrypt.GenerateFromPassword([]byte(password), bcrypt.MinCost)
	existingUser := &models.User{
		ID:           uuid.New(),
		Email:        "test@example.com",
		PasswordHash: string(hash),
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
	_, mockRepo := newTestAuthService()
	cfg := &config.AuthConfig{}
	service := NewAuthService(mockRepo, cfg)
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
	_, mockRepo := newTestAuthService()
	cfg := &config.AuthConfig{}
	service := NewAuthService(mockRepo, cfg)
	ctx := context.Background()

	hash, _ := bcrypt.GenerateFromPassword([]byte("correctpassword"), bcrypt.MinCost)
	existingUser := &models.User{
		ID:           uuid.New(),
		Email:        "test@example.com",
		PasswordHash: string(hash),
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

func TestGenerateAccessToken(t *testing.T) {
	service, _ := newTestAuthService()

	user := &models.User{
		ID:    uuid.New(),
		Email: "test@example.com",
	}

	token, expiresIn, err := service.GenerateAccessToken(user)

	assert.NoError(t, err)
	assert.NotEmpty(t, token)
	assert.Equal(t, int64(900), expiresIn) // 15 minutes in seconds
}

func TestValidateAccessToken_Success(t *testing.T) {
	service, _ := newTestAuthService()

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
	service, _ := newTestAuthService()

	claims, err := service.ValidateAccessToken("invalid-token")

	assert.ErrorIs(t, err, ErrTokenInvalid)
	assert.Nil(t, claims)
}

func TestValidateAccessToken_Expired(t *testing.T) {
	cfg := &config.AuthConfig{
		JWTSecret:           "test-secret",
		AccessTokenDuration: -1 * time.Hour, // Already expired
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
	_, mockRepo := newTestAuthService()
	cfg := &config.AuthConfig{}
	service := NewAuthService(mockRepo, cfg)
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
	_, mockRepo := newTestAuthService()
	cfg := &config.AuthConfig{}
	service := NewAuthService(mockRepo, cfg)
	ctx := context.Background()
	userID := uuid.New()

	mockRepo.On("GetByID", ctx, userID).Return(nil, repository.ErrNotFound)

	user, err := service.GetUser(ctx, userID)

	assert.ErrorIs(t, err, ErrUserNotFound)
	assert.Nil(t, user)
	mockRepo.AssertExpectations(t)
}

func TestChangePassword_Success(t *testing.T) {
	_, mockRepo := newTestAuthService()
	cfg := &config.AuthConfig{BCryptCost: 4}
	service := NewAuthService(mockRepo, cfg)
	ctx := context.Background()
	userID := uuid.New()

	currentPassword := "oldpassword"
	hash, _ := bcrypt.GenerateFromPassword([]byte(currentPassword), bcrypt.MinCost)
	existingUser := &models.User{
		ID:           userID,
		PasswordHash: string(hash),
	}

	mockRepo.On("GetByID", ctx, userID).Return(existingUser, nil)
	mockRepo.On("UpdatePassword", ctx, userID, mock.AnythingOfType("string")).Return(nil)
	mockRepo.On("RevokeAllUserTokens", ctx, userID).Return(nil)

	err := service.ChangePassword(ctx, userID, currentPassword, "newpassword")

	assert.NoError(t, err)
	mockRepo.AssertExpectations(t)
}

func TestChangePassword_WrongCurrentPassword(t *testing.T) {
	_, mockRepo := newTestAuthService()
	cfg := &config.AuthConfig{BCryptCost: 4}
	service := NewAuthService(mockRepo, cfg)
	ctx := context.Background()
	userID := uuid.New()

	hash, _ := bcrypt.GenerateFromPassword([]byte("correctpassword"), bcrypt.MinCost)
	existingUser := &models.User{
		ID:           userID,
		PasswordHash: string(hash),
	}

	mockRepo.On("GetByID", ctx, userID).Return(existingUser, nil)

	err := service.ChangePassword(ctx, userID, "wrongpassword", "newpassword")

	assert.ErrorIs(t, err, ErrInvalidCredentials)
	mockRepo.AssertExpectations(t)
}

func TestUpdateProfile_Success(t *testing.T) {
	_, mockRepo := newTestAuthService()
	cfg := &config.AuthConfig{}
	service := NewAuthService(mockRepo, cfg)
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
	_, mockRepo := newTestAuthService()
	cfg := &config.AuthConfig{}
	service := NewAuthService(mockRepo, cfg)
	ctx := context.Background()
	userID := uuid.New()

	mockRepo.On("Delete", ctx, userID).Return(nil)

	err := service.DeleteAccount(ctx, userID)

	assert.NoError(t, err)
	mockRepo.AssertExpectations(t)
}

func TestLogoutAll_Success(t *testing.T) {
	_, mockRepo := newTestAuthService()
	cfg := &config.AuthConfig{}
	service := NewAuthService(mockRepo, cfg)
	ctx := context.Background()
	userID := uuid.New()

	mockRepo.On("RevokeAllUserTokens", ctx, userID).Return(nil)

	err := service.LogoutAll(ctx, userID)

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
