package models

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

type Session struct {
	ID               uuid.UUID       `json:"id" db:"id"`
	UserID           uuid.UUID       `json:"userId" db:"user_id"`
	RefreshTokenHash string          `json:"-" db:"refresh_token_hash"`
	DeviceInfo       json.RawMessage `json:"deviceInfo,omitempty" db:"device_info"`
	IPAddressHash    *string         `json:"-" db:"ip_address_hash"`
	CreatedAt        time.Time       `json:"createdAt" db:"created_at"`
	LastUsedAt       time.Time       `json:"lastUsedAt" db:"last_used_at"`
	ExpiresAt        time.Time       `json:"expiresAt" db:"expires_at"`
	RevokedAt        *time.Time      `json:"-" db:"revoked_at"`
	RevokedReason    *string         `json:"-" db:"revoked_reason"`
}

type DeviceInfo struct {
	UserAgent  string `json:"userAgent,omitempty"`
	DeviceType string `json:"deviceType,omitempty"`
	Browser    string `json:"browser,omitempty"`
	OS         string `json:"os,omitempty"`
	IP         string `json:"-"`
}

type SessionInfo struct {
	ID         uuid.UUID `json:"id"`
	DeviceType string    `json:"deviceType"`
	Browser    string    `json:"browser"`
	OS         string    `json:"os"`
	LastUsedAt time.Time `json:"lastUsedAt"`
	CreatedAt  time.Time `json:"createdAt"`
	IsCurrent  bool      `json:"isCurrent"`
}

func (s *Session) IsValid() bool {
	if s.RevokedAt != nil {
		return false
	}
	if time.Now().After(s.ExpiresAt) {
		return false
	}
	return true
}
