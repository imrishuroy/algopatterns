package services

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/imrishuroy/algopatterns/internal/config"
	"github.com/imrishuroy/algopatterns/internal/models"
	"github.com/imrishuroy/algopatterns/internal/repository"
	"github.com/rs/zerolog/log"
)

var (
	ErrSessionNotFound = errors.New("session not found")
	ErrSessionRevoked  = errors.New("session revoked")
	ErrSessionExpired  = errors.New("session expired")
)

type SessionService struct {
	sessionRepo          repository.SessionRepositoryInterface
	userRepo             repository.UserRepositoryInterface
	config               *config.AuthConfig
	singleSessionEnabled bool
}

func NewSessionService(
	sessionRepo repository.SessionRepositoryInterface,
	userRepo repository.UserRepositoryInterface,
	cfg *config.AuthConfig,
) *SessionService {
	return &SessionService{
		sessionRepo:          sessionRepo,
		userRepo:             userRepo,
		config:               cfg,
		singleSessionEnabled: cfg.SingleSessionEnabled,
	}
}

func (s *SessionService) CreateSession(ctx context.Context, userID uuid.UUID, deviceInfo *models.DeviceInfo) (*models.Session, string, error) {
	if s.singleSessionEnabled {
		count, err := s.sessionRepo.RevokeAllUserSessions(ctx, userID, "new_session")
		if err != nil {
			return nil, "", fmt.Errorf("failed to revoke existing sessions: %w", err)
		}
		if count > 0 {
			log.Info().
				Str("event", "session_revoked").
				Str("user_id", userID.String()).
				Str("reason", "new_session").
				Int64("sessions_revoked", count).
				Msg("Previous sessions revoked due to new login")
		}
	}

	rawToken, tokenHash, err := s.generateRefreshToken()
	if err != nil {
		return nil, "", err
	}

	var deviceInfoJSON json.RawMessage
	var ipHash *string
	if deviceInfo != nil {
		if data, err := json.Marshal(deviceInfo); err == nil {
			deviceInfoJSON = data
		}
		if deviceInfo.IP != "" {
			hash := hashIP(deviceInfo.IP)
			ipHash = &hash
		}
	}

	session := &models.Session{
		UserID:           userID,
		RefreshTokenHash: tokenHash,
		DeviceInfo:       deviceInfoJSON,
		IPAddressHash:    ipHash,
		ExpiresAt:        time.Now().Add(s.config.RefreshTokenDuration),
	}

	if err := s.sessionRepo.Create(ctx, session); err != nil {
		return nil, "", fmt.Errorf("failed to create session: %w", err)
	}

	return session, rawToken, nil
}

func (s *SessionService) ValidateRefreshToken(ctx context.Context, rawToken string) (*models.Session, *models.User, error) {
	tokenHash := hashToken(rawToken)

	session, err := s.sessionRepo.GetByTokenHash(ctx, tokenHash)
	if err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			return nil, nil, ErrSessionNotFound
		}
		return nil, nil, fmt.Errorf("failed to get session: %w", err)
	}

	if session.RevokedAt != nil {
		return nil, nil, ErrSessionRevoked
	}

	if time.Now().After(session.ExpiresAt) {
		return nil, nil, ErrSessionExpired
	}

	user, err := s.userRepo.GetByID(ctx, session.UserID)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to get user: %w", err)
	}

	if err := s.sessionRepo.UpdateLastUsed(ctx, session.ID); err != nil {
		log.Warn().Err(err).Msg("Failed to update session last_used_at")
	}

	return session, user, nil
}

func (s *SessionService) RevokeSession(ctx context.Context, tokenHash string, reason string) error {
	if err := s.sessionRepo.RevokeByTokenHash(ctx, tokenHash, reason); err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			return ErrSessionNotFound
		}
		return fmt.Errorf("failed to revoke session: %w", err)
	}
	return nil
}

func (s *SessionService) RevokeSessionByRawToken(ctx context.Context, rawToken string, reason string) error {
	tokenHash := hashToken(rawToken)
	return s.RevokeSession(ctx, tokenHash, reason)
}

func (s *SessionService) RevokeAllUserSessions(ctx context.Context, userID uuid.UUID, reason string) (int64, error) {
	count, err := s.sessionRepo.RevokeAllUserSessions(ctx, userID, reason)
	if err != nil {
		return 0, fmt.Errorf("failed to revoke user sessions: %w", err)
	}
	return count, nil
}

func (s *SessionService) GetUserSessions(ctx context.Context, userID uuid.UUID, currentTokenHash string) ([]*models.SessionInfo, error) {
	sessions, err := s.sessionRepo.GetUserSessions(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user sessions: %w", err)
	}

	result := make([]*models.SessionInfo, 0, len(sessions))
	for _, session := range sessions {
		info := &models.SessionInfo{
			ID:         session.ID,
			LastUsedAt: session.LastUsedAt,
			CreatedAt:  session.CreatedAt,
			IsCurrent:  session.RefreshTokenHash == currentTokenHash,
		}

		if session.DeviceInfo != nil {
			var deviceInfo models.DeviceInfo
			if err := json.Unmarshal(session.DeviceInfo, &deviceInfo); err == nil {
				info.DeviceType = deviceInfo.DeviceType
				info.Browser = deviceInfo.Browser
				info.OS = deviceInfo.OS
			}
		}

		result = append(result, info)
	}

	return result, nil
}

func (s *SessionService) generateRefreshToken() (string, string, error) {
	tokenBytes := make([]byte, 32)
	if _, err := rand.Read(tokenBytes); err != nil {
		return "", "", fmt.Errorf("failed to generate random token: %w", err)
	}
	rawToken := base64.URLEncoding.EncodeToString(tokenBytes)
	tokenHash := hashToken(rawToken)
	return rawToken, tokenHash, nil
}

func hashToken(token string) string {
	hash := sha256.Sum256([]byte(token))
	return base64.URLEncoding.EncodeToString(hash[:])
}

func hashIP(ip string) string {
	hash := sha256.Sum256([]byte(ip))
	return base64.URLEncoding.EncodeToString(hash[:])
}

func ParseDeviceInfo(userAgent string, ip string) *models.DeviceInfo {
	info := &models.DeviceInfo{
		UserAgent: userAgent,
		IP:        ip,
	}

	ua := strings.ToLower(userAgent)

	switch {
	case strings.Contains(ua, "tablet") || strings.Contains(ua, "ipad"):
		info.DeviceType = "tablet"
	case strings.Contains(ua, "mobile") || strings.Contains(ua, "android") || strings.Contains(ua, "iphone"):
		info.DeviceType = "mobile"
	default:
		info.DeviceType = "desktop"
	}

	switch {
	case strings.Contains(ua, "chrome") && !strings.Contains(ua, "edg"):
		info.Browser = "Chrome"
	case strings.Contains(ua, "firefox"):
		info.Browser = "Firefox"
	case strings.Contains(ua, "safari") && !strings.Contains(ua, "chrome"):
		info.Browser = "Safari"
	case strings.Contains(ua, "edg"):
		info.Browser = "Edge"
	default:
		info.Browser = "Unknown"
	}

	switch {
	case strings.Contains(ua, "android"):
		info.OS = "Android"
	case strings.Contains(ua, "iphone") || strings.Contains(ua, "ipad"):
		info.OS = "iOS"
	case strings.Contains(ua, "windows"):
		info.OS = "Windows"
	case strings.Contains(ua, "mac os") || strings.Contains(ua, "macos"):
		info.OS = "macOS"
	case strings.Contains(ua, "linux"):
		info.OS = "Linux"
	default:
		info.OS = "Unknown"
	}

	return info
}
