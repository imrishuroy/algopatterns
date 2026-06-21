package services

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/imrishuroy/algopatterns/internal/config"
	"github.com/imrishuroy/algopatterns/internal/models"
	"github.com/imrishuroy/algopatterns/internal/repository"
	"github.com/rs/zerolog/log"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

var (
	ErrInvalidOAuthState     = errors.New("invalid oauth state")
	ErrOAuthStateExpired     = errors.New("oauth state expired")
	ErrProviderAlreadyLinked = errors.New("provider already linked to another account")
	ErrCannotUnlinkLastAuth  = errors.New("cannot unlink last auth method")
	ErrProviderNotLinked     = errors.New("provider not linked")
	ErrPasswordAlreadySet    = errors.New("password already set")
	ErrGoogleTokenExchange   = errors.New("google token exchange failed")
	ErrGoogleUserInfo        = errors.New("google user info failed")
)

type OAuthService struct {
	oauthRepo     repository.OAuthRepositoryInterface
	userRepo      repository.UserRepositoryInterface
	sessionRepo   repository.SessionRepositoryInterface
	googleConfig  *oauth2.Config
	authConfig    *config.AuthConfig
	stateDuration time.Duration
}

func NewOAuthService(
	oauthRepo repository.OAuthRepositoryInterface,
	userRepo repository.UserRepositoryInterface,
	sessionRepo repository.SessionRepositoryInterface,
	googleCfg *config.GoogleOAuthConfig,
	authCfg *config.AuthConfig,
) *OAuthService {
	googleOAuthConfig := &oauth2.Config{
		ClientID:     googleCfg.ClientID,
		ClientSecret: googleCfg.ClientSecret,
		RedirectURL:  googleCfg.RedirectURI,
		Scopes: []string{
			"openid",
			"https://www.googleapis.com/auth/userinfo.email",
			"https://www.googleapis.com/auth/userinfo.profile",
		},
		Endpoint: google.Endpoint,
	}

	return &OAuthService{
		oauthRepo:     oauthRepo,
		userRepo:      userRepo,
		sessionRepo:   sessionRepo,
		googleConfig:  googleOAuthConfig,
		authConfig:    authCfg,
		stateDuration: 10 * time.Minute,
	}
}

func (s *OAuthService) GenerateGoogleAuthURL(ctx context.Context) (*models.GoogleAuthURLResponse, error) {
	verifier, err := generateCodeVerifier()
	if err != nil {
		return nil, fmt.Errorf("failed to generate code verifier: %w", err)
	}

	state, err := generateSecureRandom(32)
	if err != nil {
		return nil, fmt.Errorf("failed to generate state: %w", err)
	}

	oauthState := &models.OAuthState{
		State:        state,
		CodeVerifier: verifier,
		ExpiresAt:    time.Now().Add(s.stateDuration),
	}

	if err := s.oauthRepo.CreateState(ctx, oauthState); err != nil {
		return nil, fmt.Errorf("failed to save oauth state: %w", err)
	}

	challenge := generateCodeChallenge(verifier)
	url := s.googleConfig.AuthCodeURL(
		state,
		oauth2.SetAuthURLParam("code_challenge", challenge),
		oauth2.SetAuthURLParam("code_challenge_method", "S256"),
		oauth2.AccessTypeOffline,
	)

	return &models.GoogleAuthURLResponse{
		URL:   url,
		State: state,
	}, nil
}

func (s *OAuthService) ProcessGoogleCallback(ctx context.Context, code, state string, deviceInfo *models.DeviceInfo) (*models.User, string, int64, error) {
	oauthState, err := s.oauthRepo.GetState(ctx, state)
	if err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			return nil, "", 0, ErrInvalidOAuthState
		}
		return nil, "", 0, fmt.Errorf("failed to get oauth state: %w", err)
	}

	defer s.oauthRepo.DeleteState(ctx, state)

	if time.Now().After(oauthState.ExpiresAt) {
		return nil, "", 0, ErrOAuthStateExpired
	}

	token, err := s.googleConfig.Exchange(
		ctx,
		code,
		oauth2.SetAuthURLParam("code_verifier", oauthState.CodeVerifier),
	)
	if err != nil {
		log.Error().Err(err).Msg("Google token exchange failed")
		return nil, "", 0, ErrGoogleTokenExchange
	}

	googleUser, err := s.getGoogleUserInfo(ctx, token.AccessToken)
	if err != nil {
		log.Error().Err(err).Msg("Failed to get Google user info")
		return nil, "", 0, ErrGoogleUserInfo
	}

	user, isNew, err := s.findOrCreateUser(ctx, googleUser)
	if err != nil {
		return nil, "", 0, err
	}

	accessToken, expiresIn, err := s.generateAccessToken(user)
	if err != nil {
		return nil, "", 0, fmt.Errorf("failed to generate access token: %w", err)
	}

	log.Info().
		Str("event", "oauth_login").
		Str("provider", "google").
		Str("user_id", user.ID.String()).
		Bool("new_user", isNew).
		Msg("Google OAuth login completed")

	return user, accessToken, expiresIn, nil
}

func (s *OAuthService) findOrCreateUser(ctx context.Context, googleUser *models.GoogleUserInfo) (*models.User, bool, error) {
	existing, err := s.oauthRepo.GetByProviderID(ctx, "google", googleUser.ID)
	if err == nil && existing != nil {
		user, err := s.userRepo.GetByID(ctx, existing.UserID)
		if err != nil {
			return nil, false, fmt.Errorf("failed to get user: %w", err)
		}
		return user, false, nil
	}

	user, err := s.userRepo.GetByEmail(ctx, googleUser.Email)
	if err == nil && user != nil {
		if err := s.linkGoogleToUser(ctx, user.ID, googleUser); err != nil {
			return nil, false, err
		}

		if googleUser.VerifiedEmail && !user.EmailVerified {
			now := time.Now()
			user.EmailVerified = true
			user.EmailVerifiedAt = &now
			if err := s.userRepo.Update(ctx, user); err != nil {
				log.Warn().Err(err).Msg("Failed to update email verified status")
			}
		}

		return user, false, nil
	}

	if err != nil && !errors.Is(err, repository.ErrNotFound) {
		return nil, false, fmt.Errorf("failed to check existing user: %w", err)
	}

	return s.createUserFromGoogle(ctx, googleUser)
}

func (s *OAuthService) createUserFromGoogle(ctx context.Context, googleUser *models.GoogleUserInfo) (*models.User, bool, error) {
	var emailVerifiedAt *time.Time
	if googleUser.VerifiedEmail {
		now := time.Now()
		emailVerifiedAt = &now
	}

	user := &models.User{
		ID:              uuid.New(),
		Email:           googleUser.Email,
		Name:            &googleUser.Name,
		EmailVerified:   googleUser.VerifiedEmail,
		EmailVerifiedAt: emailVerifiedAt,
		HasPassword:     false,
		AvatarURL:       &googleUser.Picture,
	}

	if err := s.userRepo.Create(ctx, user); err != nil {
		if errors.Is(err, repository.ErrEmailExists) {
			return nil, false, ErrEmailExists
		}
		return nil, false, fmt.Errorf("failed to create user: %w", err)
	}

	if err := s.linkGoogleToUser(ctx, user.ID, googleUser); err != nil {
		return nil, false, err
	}

	return user, true, nil
}

func (s *OAuthService) linkGoogleToUser(ctx context.Context, userID uuid.UUID, googleUser *models.GoogleUserInfo) error {
	rawProfile, _ := json.Marshal(googleUser)

	provider := &models.OAuthProvider{
		UserID:         userID,
		Provider:       "google",
		ProviderUserID: googleUser.ID,
		Email:          &googleUser.Email,
		Name:           &googleUser.Name,
		AvatarURL:      &googleUser.Picture,
		RawProfile:     rawProfile,
	}

	if err := s.oauthRepo.CreateProvider(ctx, provider); err != nil {
		return fmt.Errorf("failed to link google: %w", err)
	}

	return nil
}

func (s *OAuthService) LinkGoogleToExistingUser(ctx context.Context, userID uuid.UUID, code, state string) error {
	oauthState, err := s.oauthRepo.GetState(ctx, state)
	if err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			return ErrInvalidOAuthState
		}
		return fmt.Errorf("failed to get oauth state: %w", err)
	}

	defer s.oauthRepo.DeleteState(ctx, state)

	if time.Now().After(oauthState.ExpiresAt) {
		return ErrOAuthStateExpired
	}

	token, err := s.googleConfig.Exchange(
		ctx,
		code,
		oauth2.SetAuthURLParam("code_verifier", oauthState.CodeVerifier),
	)
	if err != nil {
		return ErrGoogleTokenExchange
	}

	googleUser, err := s.getGoogleUserInfo(ctx, token.AccessToken)
	if err != nil {
		return ErrGoogleUserInfo
	}

	existing, err := s.oauthRepo.GetByProviderID(ctx, "google", googleUser.ID)
	if err == nil && existing != nil {
		if existing.UserID != userID {
			return ErrProviderAlreadyLinked
		}
		return nil
	}

	return s.linkGoogleToUser(ctx, userID, googleUser)
}

func (s *OAuthService) UnlinkGoogle(ctx context.Context, userID uuid.UUID) error {
	if err := s.canUnlinkProvider(ctx, userID, "google"); err != nil {
		return err
	}

	if err := s.oauthRepo.DeleteProvider(ctx, userID, "google"); err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			return ErrProviderNotLinked
		}
		return fmt.Errorf("failed to unlink google: %w", err)
	}

	return nil
}

func (s *OAuthService) canUnlinkProvider(ctx context.Context, userID uuid.UUID, provider string) error {
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return err
	}

	providers, err := s.oauthRepo.GetUserProviders(ctx, userID)
	if err != nil {
		return err
	}

	authMethods := 0
	if user.HasPassword {
		authMethods++
	}
	for _, p := range providers {
		if p.Provider != provider {
			authMethods++
		}
	}

	if authMethods == 0 {
		return ErrCannotUnlinkLastAuth
	}

	return nil
}

func (s *OAuthService) GetAuthMethods(ctx context.Context, userID uuid.UUID) (*models.AuthMethodsResponse, error) {
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return nil, err
	}

	providers, err := s.oauthRepo.GetUserProviders(ctx, userID)
	if err != nil && !errors.Is(err, repository.ErrNotFound) {
		return nil, err
	}

	totalMethods := 0
	if user.HasPassword {
		totalMethods++
	}
	totalMethods += len(providers)

	resp := &models.AuthMethodsResponse{
		HasPassword: user.HasPassword,
		Providers:   make([]models.ProviderInfo, 0, len(providers)),
	}

	for _, p := range providers {
		email := ""
		if p.Email != nil {
			email = *p.Email
		}
		resp.Providers = append(resp.Providers, models.ProviderInfo{
			Provider:  p.Provider,
			Email:     email,
			LinkedAt:  p.CreatedAt,
			CanUnlink: totalMethods > 1,
		})
	}

	return resp, nil
}

func (s *OAuthService) getGoogleUserInfo(ctx context.Context, accessToken string) (*models.GoogleUserInfo, error) {
	req, err := http.NewRequestWithContext(ctx, "GET", "https://www.googleapis.com/oauth2/v2/userinfo", nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+accessToken)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("google api returned status %d: %s", resp.StatusCode, string(body))
	}

	var userInfo models.GoogleUserInfo
	if err := json.NewDecoder(resp.Body).Decode(&userInfo); err != nil {
		return nil, err
	}

	return &userInfo, nil
}

func (s *OAuthService) generateAccessToken(user *models.User) (string, int64, error) {
	expiresAt := time.Now().Add(s.authConfig.AccessTokenDuration)
	claims := JWTClaims{
		UserID: user.ID.String(),
		Email:  user.Email,
	}
	claims.ExpiresAt = jwt.NewNumericDate(expiresAt)
	claims.IssuedAt = jwt.NewNumericDate(time.Now())
	claims.Subject = user.ID.String()

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(s.authConfig.JWTSecret))
	if err != nil {
		return "", 0, fmt.Errorf("failed to sign token: %w", err)
	}

	return tokenString, int64(s.authConfig.AccessTokenDuration.Seconds()), nil
}

func generateCodeVerifier() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(b), nil
}

func generateCodeChallenge(verifier string) string {
	h := sha256.Sum256([]byte(verifier))
	return base64.RawURLEncoding.EncodeToString(h[:])
}

func generateSecureRandom(length int) (string, error) {
	b := make([]byte, length)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(b), nil
}
