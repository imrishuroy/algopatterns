package models

import (
	"encoding/json"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func TestSession_Structure(t *testing.T) {
	userID := uuid.New()
	now := time.Now()
	expiresAt := now.Add(7 * 24 * time.Hour)
	ipHash := "hashed-ip-address"

	deviceInfo := DeviceInfo{
		UserAgent:  "Mozilla/5.0",
		DeviceType: "desktop",
		Browser:    "Chrome",
		OS:         "macOS",
	}
	deviceInfoJSON, _ := json.Marshal(deviceInfo)

	session := Session{
		ID:               uuid.New(),
		UserID:           userID,
		RefreshTokenHash: "hashed-refresh-token",
		DeviceInfo:       deviceInfoJSON,
		IPAddressHash:    &ipHash,
		CreatedAt:        now,
		LastUsedAt:       now,
		ExpiresAt:        expiresAt,
		RevokedAt:        nil,
		RevokedReason:    nil,
	}

	assert.NotEqual(t, uuid.Nil, session.ID)
	assert.Equal(t, userID, session.UserID)
	assert.Equal(t, "hashed-refresh-token", session.RefreshTokenHash)
	assert.NotNil(t, session.DeviceInfo)
	assert.Equal(t, "hashed-ip-address", *session.IPAddressHash)
	assert.Equal(t, now, session.CreatedAt)
	assert.Equal(t, now, session.LastUsedAt)
	assert.Equal(t, expiresAt, session.ExpiresAt)
	assert.Nil(t, session.RevokedAt)
	assert.Nil(t, session.RevokedReason)
}

func TestSession_IsValid_ValidSession(t *testing.T) {
	session := Session{
		ExpiresAt: time.Now().Add(time.Hour),
		RevokedAt: nil,
	}

	assert.True(t, session.IsValid())
}

func TestSession_IsValid_ExpiredSession(t *testing.T) {
	session := Session{
		ExpiresAt: time.Now().Add(-time.Hour),
		RevokedAt: nil,
	}

	assert.False(t, session.IsValid())
}

func TestSession_IsValid_RevokedSession(t *testing.T) {
	revokedAt := time.Now()
	session := Session{
		ExpiresAt: time.Now().Add(time.Hour),
		RevokedAt: &revokedAt,
	}

	assert.False(t, session.IsValid())
}

func TestSession_IsValid_ExpiredAndRevoked(t *testing.T) {
	revokedAt := time.Now()
	session := Session{
		ExpiresAt: time.Now().Add(-time.Hour),
		RevokedAt: &revokedAt,
	}

	assert.False(t, session.IsValid())
}

func TestDeviceInfo_Structure(t *testing.T) {
	info := DeviceInfo{
		UserAgent:  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
		DeviceType: "desktop",
		Browser:    "Chrome",
		OS:         "macOS",
		IP:         "192.168.1.1",
	}

	assert.Equal(t, "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", info.UserAgent)
	assert.Equal(t, "desktop", info.DeviceType)
	assert.Equal(t, "Chrome", info.Browser)
	assert.Equal(t, "macOS", info.OS)
	assert.Equal(t, "192.168.1.1", info.IP)
}

func TestDeviceInfo_JSONSerialization(t *testing.T) {
	info := DeviceInfo{
		UserAgent:  "Mozilla/5.0",
		DeviceType: "mobile",
		Browser:    "Safari",
		OS:         "iOS",
		IP:         "10.0.0.1",
	}

	jsonData, err := json.Marshal(info)
	assert.NoError(t, err)

	var decoded DeviceInfo
	err = json.Unmarshal(jsonData, &decoded)
	assert.NoError(t, err)

	assert.Equal(t, info.DeviceType, decoded.DeviceType)
	assert.Equal(t, info.Browser, decoded.Browser)
	assert.Equal(t, info.OS, decoded.OS)
	assert.Empty(t, decoded.IP)
}

func TestSessionInfo_Structure(t *testing.T) {
	sessionID := uuid.New()
	now := time.Now()
	createdAt := now.Add(-time.Hour)

	info := SessionInfo{
		ID:         sessionID,
		DeviceType: "desktop",
		Browser:    "Firefox",
		OS:         "Windows",
		LastUsedAt: now,
		CreatedAt:  createdAt,
		IsCurrent:  true,
	}

	assert.Equal(t, sessionID, info.ID)
	assert.Equal(t, "desktop", info.DeviceType)
	assert.Equal(t, "Firefox", info.Browser)
	assert.Equal(t, "Windows", info.OS)
	assert.Equal(t, now, info.LastUsedAt)
	assert.Equal(t, createdAt, info.CreatedAt)
	assert.True(t, info.IsCurrent)
}

func TestSession_RevokedWithReason(t *testing.T) {
	revokedAt := time.Now()
	reason := "new_session"

	session := Session{
		ID:               uuid.New(),
		UserID:           uuid.New(),
		RefreshTokenHash: "hash",
		ExpiresAt:        time.Now().Add(time.Hour),
		RevokedAt:        &revokedAt,
		RevokedReason:    &reason,
	}

	assert.NotNil(t, session.RevokedAt)
	assert.Equal(t, revokedAt, *session.RevokedAt)
	assert.Equal(t, "new_session", *session.RevokedReason)
	assert.False(t, session.IsValid())
}

func TestSession_NullableFields(t *testing.T) {
	session := Session{
		ID:               uuid.New(),
		UserID:           uuid.New(),
		RefreshTokenHash: "hash",
		DeviceInfo:       nil,
		IPAddressHash:    nil,
		ExpiresAt:        time.Now().Add(time.Hour),
		RevokedAt:        nil,
		RevokedReason:    nil,
	}

	assert.Nil(t, session.DeviceInfo)
	assert.Nil(t, session.IPAddressHash)
	assert.Nil(t, session.RevokedAt)
	assert.Nil(t, session.RevokedReason)
	assert.True(t, session.IsValid())
}
