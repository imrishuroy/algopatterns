# Authentication System Design Document

## Overview

This document covers the complete authentication architecture for AlgoPatterns, including the current email/password system, Google OAuth integration, account linking, and single-session enforcement.

**Status:** Implemented (Phase 1-5 Complete)  
**Author:** System  
**Last Updated:** 2026-06-21  
**Test Coverage:** Backend (unit tests), Frontend (component + context tests)

---

## Table of Contents

1. [Current Architecture Analysis](#1-current-architecture-analysis)
2. [Goals & Requirements](#2-goals--requirements)
3. [Database Schema Changes](#3-database-schema-changes)
4. [Authentication Flows](#4-authentication-flows)
5. [Account Linking Strategy](#5-account-linking-strategy)
6. [Single Session Enforcement](#6-single-session-enforcement)
7. [API Design](#7-api-design)
8. [Security Considerations](#8-security-considerations)
9. [Implementation Plan](#9-implementation-plan)
10. [Edge Cases & Error Handling](#10-edge-cases--error-handling)

---

## 1. Current Architecture Analysis

### Existing Components

**Database Tables:**
- `users` - Core user data (email, password_hash, name, email_verified)
- `refresh_tokens` - Token rotation with hash storage
- `password_reset_tokens` - Password recovery flow
- `user_progress` - Learning progress tracking

**Authentication Flow:**
- Email/password registration and login
- JWT access tokens (15-minute expiry by default)
- Refresh tokens stored as SHA-256 hashes (7-day expiry)
- Refresh token rotation on use
- HttpOnly cookies for refresh tokens
- `LogoutAll` revokes all user's refresh tokens

**Current Strengths:**
- Secure password hashing (bcrypt, cost 12)
- Token hashing (SHA-256) prevents database leak attacks
- Token revocation support
- Clean separation (handler → service → repository)

**Current Gaps:**
- No OAuth support
- Multiple concurrent sessions allowed (no enforcement)
- No auth method tracking (password vs OAuth)
- No account linking infrastructure

---

## 2. Goals & Requirements

### Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| F1 | Google OAuth login/registration | P0 |
| F2 | Account linking (Google ↔ email/password) | P0 |
| F3 | Single active session per user | P0 |
| F4 | Force logout on new login | P0 |
| F5 | Unlink auth methods (with constraint) | P1 |
| F6 | Extensible for future OAuth providers | P2 |

### Non-Functional Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NF1 | OAuth callback latency | < 500ms |
| NF2 | Session enforcement latency overhead | < 10ms |
| NF3 | Zero downtime migration | Required |

### User Stories

1. **New user with Google:** User clicks "Sign in with Google" → redirected to Google → returns → account created → logged in
2. **Existing email user + Google:** User has account with password → clicks Google login → auto-linked → logged in
3. **Google-only user adds password:** User registered with Google → wants to add password for backup
4. **Single session:** User logged in on laptop → logs in on phone → laptop session invalidated
5. **Unlink Google:** User linked Google + has password → can remove Google auth

---

## 3. Database Schema Changes

### New Tables

```sql
-- Migration: 008_oauth_and_sessions.up.sql

-- OAuth provider connections
CREATE TABLE IF NOT EXISTS user_oauth_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,
    provider_user_id VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    name VARCHAR(255),
    avatar_url TEXT,
    raw_profile JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(provider, provider_user_id),
    UNIQUE(user_id, provider)
);

CREATE INDEX idx_oauth_provider_user ON user_oauth_providers(user_id);
CREATE INDEX idx_oauth_provider_lookup ON user_oauth_providers(provider, provider_user_id);
CREATE INDEX idx_oauth_email ON user_oauth_providers(provider, email);

-- Active sessions table (replaces unlimited refresh tokens)
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token_hash VARCHAR(255) NOT NULL UNIQUE,
    device_info JSONB,
    ip_address_hash VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_used_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    revoked_reason VARCHAR(100)
);

CREATE INDEX idx_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_sessions_token ON user_sessions(refresh_token_hash);
CREATE INDEX idx_sessions_active ON user_sessions(user_id) WHERE revoked_at IS NULL;

-- OAuth state storage (for CSRF protection and PKCE)
CREATE TABLE IF NOT EXISTS oauth_states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    state VARCHAR(255) NOT NULL UNIQUE,
    code_verifier VARCHAR(255) NOT NULL,
    redirect_uri TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_oauth_states_state ON oauth_states(state);
CREATE INDEX idx_oauth_states_expires ON oauth_states(expires_at);
```

### Schema Modifications

```sql
-- Modify users table
ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS has_password BOOLEAN DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS avatar_url TEXT;
    
-- For existing users, set has_password = TRUE (they all have passwords)
UPDATE users SET has_password = TRUE WHERE has_password IS NULL;

-- Make password_hash nullable for OAuth-only users
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- Add constraint: must have password OR at least one OAuth provider
-- (Enforced in application layer for flexibility)
```

### Migration Strategy

```sql
-- 008_oauth_and_sessions.down.sql
DROP TABLE IF EXISTS oauth_states;
DROP TABLE IF EXISTS user_sessions;
DROP TABLE IF EXISTS user_oauth_providers;
ALTER TABLE users DROP COLUMN IF EXISTS has_password;
ALTER TABLE users DROP COLUMN IF EXISTS avatar_url;
-- Note: Restoring NOT NULL will fail if OAuth-only users exist
ALTER TABLE users ALTER COLUMN password_hash SET NOT NULL;
```

### Data Migration

```sql
-- Migrate existing refresh_tokens to user_sessions (one-time)
INSERT INTO user_sessions (id, user_id, refresh_token_hash, expires_at, created_at, revoked_at)
SELECT id, user_id, token_hash, expires_at, created_at, revoked_at
FROM refresh_tokens
WHERE revoked_at IS NULL AND expires_at > NOW();

-- After verification, drop old table
-- DROP TABLE refresh_tokens;
```

---

## 4. Authentication Flows

### 4.1 Email/Password Registration (Existing)

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌────────┐
│ Client  │     │  API    │     │ Service │     │   DB   │
└────┬────┘     └────┬────┘     └────┬────┘     └────┬───┘
     │               │               │               │
     │ POST /register│               │               │
     │──────────────>│               │               │
     │               │ Validate      │               │
     │               │──────────────>│               │
     │               │               │ Hash password │
     │               │               │──────────────>│
     │               │               │               │ INSERT user
     │               │               │               │
     │               │               │<──────────────│
     │               │               │ Revoke other  │
     │               │               │ sessions      │
     │               │               │──────────────>│
     │               │               │ Create session│
     │               │               │──────────────>│
     │               │ Access token  │               │
     │<──────────────│ + Set cookie  │               │
     │               │               │               │
```

### 4.2 Google OAuth Flow

```
┌─────────┐     ┌─────────┐     ┌────────┐     ┌─────────┐     ┌────────┐
│ Client  │     │  API    │     │ Google │     │ Service │     │   DB   │
└────┬────┘     └────┬────┘     └────┬───┘     └────┬────┘     └────┬───┘
     │               │               │               │               │
     │ GET /auth/google/url          │               │               │
     │──────────────>│               │               │               │
     │               │               │               │               │
     │ {url, state}  │               │               │               │
     │<──────────────│               │               │               │
     │               │               │               │               │
     │ Redirect to Google            │               │               │
     │──────────────────────────────>│               │               │
     │               │               │               │               │
     │ User consents │               │               │               │
     │               │               │               │               │
     │ Callback with code            │               │               │
     │<──────────────────────────────│               │               │
     │               │               │               │               │
     │ POST /auth/google/callback    │               │               │
     │ {code, state} │               │               │               │
     │──────────────>│               │               │               │
     │               │ Verify state  │               │               │
     │               │ Exchange code │               │               │
     │               │──────────────>│               │               │
     │               │               │               │               │
     │               │ tokens + profile              │               │
     │               │<──────────────│               │               │
     │               │               │               │               │
     │               │ Process login │               │               │
     │               │──────────────────────────────>│               │
     │               │               │               │ Find/create   │
     │               │               │               │ user          │
     │               │               │               │──────────────>│
     │               │               │               │               │
     │               │               │               │ Link provider │
     │               │               │               │──────────────>│
     │               │               │               │               │
     │               │               │               │ Revoke other  │
     │               │               │               │ sessions      │
     │               │               │               │──────────────>│
     │               │               │               │               │
     │               │               │               │ Create session│
     │               │               │               │──────────────>│
     │               │               │               │               │
     │ Access token + Set cookie     │               │               │
     │<──────────────│               │               │               │
```

### 4.3 Token Refresh Flow

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌────────┐
│ Client  │     │  API    │     │ Service │     │   DB   │
└────┬────┘     └────┬────┘     └────┬────┘     └────┬───┘
     │               │               │               │
     │ POST /refresh │               │               │
     │ (cookie)      │               │               │
     │──────────────>│               │               │
     │               │ Extract token │               │
     │               │──────────────>│               │
     │               │               │ Hash & lookup │
     │               │               │──────────────>│
     │               │               │               │
     │               │               │ Validate:     │
     │               │               │ - Not revoked │
     │               │               │ - Not expired │
     │               │               │ - User exists │
     │               │               │               │
     │               │               │ Update        │
     │               │               │ last_used_at  │
     │               │               │──────────────>│
     │               │               │               │
     │ New access    │               │               │
     │ token         │               │               │
     │<──────────────│               │               │
```

---

## 5. Account Linking Strategy

### Decision Matrix

| Scenario | Outcome | Rationale |
|----------|---------|-----------|
| New email via Google | Create user, link Google | Standard registration |
| Existing email, Google login | Auto-link, login | Google verified the email |
| Google user adds password | Link password | Backup auth method |
| Unlink Google (has password) | Allow | Maintains auth method |
| Unlink Google (no password) | Deny | Would lock out user |
| Unlink password (has Google) | Allow | Maintains auth method |
| Unlink password (no OAuth) | Deny | Would lock out user |

### Auto-Link Logic (Google OAuth Callback)

```go
func (s *AuthService) ProcessGoogleLogin(ctx context.Context, googleUser *GoogleUserInfo) (*User, error) {
    // Step 1: Check if this Google account is already linked
    existing, err := s.oauthRepo.GetByProviderID(ctx, "google", googleUser.ID)
    if err == nil && existing != nil {
        // Known Google user - just log them in
        return s.loginExistingOAuthUser(ctx, existing.UserID)
    }

    // Step 2: Check if email already exists in users table
    user, err := s.userRepo.GetByEmail(ctx, googleUser.Email)
    if err == nil && user != nil {
        // Existing user with this email - auto-link Google
        if err := s.linkGoogleToUser(ctx, user.ID, googleUser); err != nil {
            return nil, err
        }
        return s.loginExistingUser(ctx, user)
    }

    // Step 3: New user - create account with Google
    return s.createUserFromGoogle(ctx, googleUser)
}
```

### Link/Unlink Validation

```go
func (s *AuthService) CanUnlinkProvider(ctx context.Context, userID uuid.UUID, provider string) error {
    user, err := s.userRepo.GetByID(ctx, userID)
    if err != nil {
        return err
    }

    providers, err := s.oauthRepo.GetUserProviders(ctx, userID)
    if err != nil {
        return err
    }

    // Count available auth methods
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
        return ErrCannotRemoveLastAuthMethod
    }

    return nil
}
```

---

## 6. Single Session Enforcement

### Strategy: Force Logout Previous Sessions

When a user logs in (via any method), all their existing sessions are revoked before creating a new one.

### Implementation

```go
func (s *AuthService) CreateSessionWithEnforcement(ctx context.Context, userID uuid.UUID, deviceInfo *DeviceInfo) (*Session, string, error) {
    // Step 1: Revoke all existing sessions for this user
    if err := s.sessionRepo.RevokeAllUserSessions(ctx, userID, "new_session"); err != nil {
        return nil, "", fmt.Errorf("failed to revoke existing sessions: %w", err)
    }

    // Step 2: Generate new refresh token
    rawToken, tokenHash, err := s.generateRefreshToken()
    if err != nil {
        return nil, "", err
    }

    // Step 3: Create new session
    session := &Session{
        UserID:           userID,
        RefreshTokenHash: tokenHash,
        DeviceInfo:       deviceInfo,
        IPAddressHash:    hashIP(deviceInfo.IP),
        ExpiresAt:        time.Now().Add(s.config.RefreshTokenDuration),
    }

    if err := s.sessionRepo.Create(ctx, session); err != nil {
        return nil, "", err
    }

    return session, rawToken, nil
}
```

### Real-Time Session Invalidation

Access tokens are short-lived (15 min), so revoked sessions naturally expire. For real-time invalidation:

**Option A (Recommended): Accept 15-minute window**
- Simpler implementation
- Revoked sessions can't refresh tokens
- Max exposure: 15 minutes

**Option B: Token blacklist (if needed)**
```go
// Only if real-time is critical
type TokenBlacklist interface {
    Add(tokenHash string, expiresAt time.Time) error
    IsBlacklisted(tokenHash string) bool
}
```

### Session Info for Users

```go
type SessionInfo struct {
    ID          uuid.UUID  `json:"id"`
    DeviceType  string     `json:"deviceType"`  // "mobile", "desktop", "tablet"
    Browser     string     `json:"browser"`
    LastUsed    time.Time  `json:"lastUsed"`
    CreatedAt   time.Time  `json:"createdAt"`
    IsCurrent   bool       `json:"isCurrent"`
}
```

---

## 7. API Design

### New Endpoints

#### OAuth Routes

```
GET  /api/v1/auth/google/url          → Generate OAuth URL with state
POST /api/v1/auth/google/callback     → Handle OAuth callback
```

#### Account Management Routes

```
GET    /api/v1/user/auth-methods      → List linked auth methods
POST   /api/v1/user/link/google       → Link Google to existing account
DELETE /api/v1/user/link/google       → Unlink Google (if has password)
POST   /api/v1/user/password          → Add password (for OAuth-only users)
```

#### Session Routes (Updated)

```
GET  /api/v1/user/sessions            → List all sessions (single entry)
POST /api/v1/user/logout              → Logout current session
POST /api/v1/user/logout-all          → Logout all sessions (same effect with single session)
```

### Request/Response DTOs

```go
// OAuth initiation
type GoogleAuthURLResponse struct {
    URL   string `json:"url"`
    State string `json:"state"`  // Store in session/cookie for CSRF protection
}

// OAuth callback
type GoogleCallbackRequest struct {
    Code  string `json:"code" binding:"required"`
    State string `json:"state" binding:"required"`
}

// Auth methods listing
type AuthMethodsResponse struct {
    HasPassword bool            `json:"hasPassword"`
    Providers   []ProviderInfo  `json:"providers"`
}

type ProviderInfo struct {
    Provider   string    `json:"provider"`
    Email      string    `json:"email"`
    LinkedAt   time.Time `json:"linkedAt"`
    CanUnlink  bool      `json:"canUnlink"`
}

// Link Google (from authenticated session)
type LinkGoogleRequest struct {
    Code  string `json:"code" binding:"required"`
    State string `json:"state" binding:"required"`
}

// Add password (for OAuth-only users)
type AddPasswordRequest struct {
    Password string `json:"password" binding:"required,min=8"`
}
```

### Error Responses

| Code | Error | Description |
|------|-------|-------------|
| 400 | `INVALID_OAUTH_STATE` | OAuth state mismatch (CSRF protection) |
| 400 | `OAUTH_CODE_EXPIRED` | Authorization code expired |
| 400 | `CANNOT_UNLINK_LAST_AUTH` | Would lock user out of account |
| 400 | `PASSWORD_ALREADY_SET` | User already has a password |
| 409 | `PROVIDER_ALREADY_LINKED` | Google already linked to another account |
| 409 | `EMAIL_ALREADY_EXISTS` | Email registered with different account |

---

## 8. Security Considerations

### OAuth Security

| Threat | Mitigation |
|--------|------------|
| CSRF on callback | State parameter (random, single-use) |
| Authorization code interception | PKCE (Proof Key for Code Exchange) |
| Token leakage | Store tokens encrypted, minimal scopes |
| Account takeover via email change | Email changes require re-verification |

### PKCE Implementation

```go
type OAuthState struct {
    State        string    `json:"state"`
    CodeVerifier string    `json:"code_verifier"`  // PKCE
    CreatedAt    time.Time `json:"created_at"`
    RedirectURI  string    `json:"redirect_uri"`
}

func (s *AuthService) GenerateGoogleAuthURL(ctx context.Context) (*GoogleAuthURLResponse, error) {
    // Generate PKCE verifier and challenge
    verifier := generateCodeVerifier()  // 43-128 chars, URL-safe
    challenge := sha256URLEncode(verifier)
    
    state := generateSecureRandom(32)
    
    // Store state temporarily (Redis or DB with short TTL)
    s.stateStore.Set(ctx, state, &OAuthState{
        State:        state,
        CodeVerifier: verifier,
        CreatedAt:    time.Now(),
    }, 10*time.Minute)
    
    url := s.oauthConfig.AuthCodeURL(
        state,
        oauth2.SetAuthURLParam("code_challenge", challenge),
        oauth2.SetAuthURLParam("code_challenge_method", "S256"),
    )
    
    return &GoogleAuthURLResponse{URL: url, State: state}, nil
}
```

### Session Security

| Threat | Mitigation |
|--------|------------|
| Session fixation | New session on each login |
| Session hijacking | HttpOnly cookies, secure flag in prod |
| Concurrent session abuse | Single session enforcement |
| Token theft from DB | Store hashes, not raw tokens |

### Rate Limiting

```go
// Stricter limits for auth endpoints
var authRateLimits = map[string]RateLimit{
    "/auth/login":           {RPS: 5, Burst: 10},
    "/auth/register":        {RPS: 2, Burst: 5},
    "/auth/google/callback": {RPS: 5, Burst: 10},
    "/auth/refresh":         {RPS: 10, Burst: 20},
    "/auth/forgot-password": {RPS: 1, Burst: 3},
}
```

---

## 9. Implementation Plan

### Phase 1: Database & Models ✅

1. ✅ Create migration `008_oauth_and_sessions.up.sql`
2. ✅ Add new models: `OAuthProvider`, `OAuthState`, `Session`, `DeviceInfo`, `SessionInfo`
3. ✅ Update `User` model with `HasPassword`, `AvatarURL`, nullable `PasswordHash`
4. ✅ Create `OAuthRepository` and `SessionRepository`
5. ✅ Migrate existing `refresh_tokens` to `user_sessions`

### Phase 2: Single Session Enforcement ✅

1. ✅ Create `SessionService` with configurable single-session enforcement
2. ✅ Implement session revocation on new login (`RevokeAllUserSessions`)
3. ✅ Add `RevokedReason` tracking ("new_session", "logout", "logout_all")
4. ✅ Implement `ValidateRefreshToken` to check session validity
5. ✅ Update `AuthService` to use `SessionService`

### Phase 3: Google OAuth ✅

1. ✅ Add `GoogleOAuthConfig` to `config.go`
2. ✅ Implement `OAuthService`:
   - `GenerateGoogleAuthURL()` with PKCE (code_challenge, code_verifier)
   - `ProcessGoogleCallback()` with state verification
   - Token exchange via `golang.org/x/oauth2`
3. ✅ Implement account linking logic (auto-link by email)
4. ✅ Add `OAuthHandler` with routes
5. ✅ Frontend: Google button, callback page with Suspense

### Phase 4: Account Management ✅

1. ✅ Add `GET /api/v1/auth/methods` endpoint
2. ✅ Implement `UnlinkGoogle` with validation
3. ✅ Add validation for last auth method (`ErrCannotUnlinkLastAuth`)
4. ✅ Frontend: `GoogleButton` component, `AuthContext` OAuth methods
5. ✅ Login/Register pages with Google sign-in option

### Phase 5: Testing & Hardening ✅

1. ✅ Backend unit tests:
   - `oauth_service_test.go` (OAuth URL, auth methods, unlinking)
   - `session_service_test.go` (session creation, validation, revocation)
   - `oauth_test.go`, `session_test.go` (model tests)
2. ✅ Frontend tests:
   - `GoogleButton.test.tsx` (component rendering, interactions)
   - `AuthContext.test.tsx` (OAuth methods, state management)
3. ✅ CI/CD: Added test job to `deploy-backend.yml` (tests must pass before deploy)
4. ✅ Documentation updated

---

## 10. Edge Cases & Error Handling

### Edge Case Matrix

| Scenario | Handling |
|----------|----------|
| Google returns different email than account | Use provider_user_id as source of truth |
| User changes email on Google | Next login still works (linked by provider_user_id) |
| Google token expires | Re-authenticate on next Google login |
| User deletes Google account | Can't login via Google; must use password |
| Network failure during OAuth | Retry with fresh state |
| State expired (>10 min) | Return error, restart OAuth flow |
| Same Google linked to multiple accounts | Prevent: UNIQUE(provider, provider_user_id) |
| User registers, never verifies email, then tries Google | Auto-link (Google verified the email) |
| Concurrent logins | Last one wins (race condition acceptable) |

### Error Messages (User-Facing)

```go
var userFacingErrors = map[string]string{
    "INVALID_OAUTH_STATE":       "Login session expired. Please try again.",
    "OAUTH_CODE_EXPIRED":        "Login took too long. Please try again.",
    "CANNOT_UNLINK_LAST_AUTH":   "Cannot remove your only login method. Add a password first.",
    "PROVIDER_ALREADY_LINKED":   "This Google account is already linked to another user.",
    "EMAIL_ALREADY_EXISTS":      "An account with this email already exists. Try logging in with your password.",
}
```

### Logging Strategy

```go
// Log security-relevant events
log.Info().
    Str("event", "oauth_login").
    Str("provider", "google").
    Str("user_id", userID.String()).
    Bool("new_user", isNewUser).
    Bool("account_linked", wasLinked).
    Str("ip_hash", hashIP(ip)).
    Msg("OAuth login completed")

log.Info().
    Str("event", "session_revoked").
    Str("user_id", userID.String()).
    Str("reason", "new_session").
    Int("sessions_revoked", count).
    Msg("Previous sessions revoked")
```

---

## Appendix A: Implementation Files

### Backend Files Created

| File | Purpose |
|------|---------|
| `migrations/008_oauth_and_sessions.up.sql` | Database schema for OAuth and sessions |
| `migrations/008_oauth_and_sessions.down.sql` | Rollback migration |
| `internal/models/oauth.go` | `OAuthProvider`, `OAuthState`, `GoogleUserInfo` structs |
| `internal/models/session.go` | `Session`, `DeviceInfo`, `SessionInfo` structs |
| `internal/models/oauth_dto.go` | DTOs and error codes for OAuth |
| `internal/repository/oauth_repository.go` | CRUD for OAuth providers and states |
| `internal/repository/session_repository.go` | Session management with revocation |
| `internal/services/oauth_service.go` | Google OAuth flow, account linking, PKCE |
| `internal/services/session_service.go` | Session creation with single-session enforcement |
| `internal/handlers/oauth_handler.go` | HTTP handlers for OAuth endpoints |

### Backend Files Modified

| File | Changes |
|------|---------|
| `internal/models/user.go` | Added `HasPassword`, `AvatarURL`, nullable `PasswordHash` |
| `internal/config/config.go` | Added `GoogleOAuthConfig`, `SingleSessionEnabled` |
| `internal/services/auth_service.go` | Uses `SessionService`, handles OAuth-only users |
| `internal/repository/user_repository.go` | Updated queries for new user fields |
| `internal/repository/interfaces.go` | Added `OAuthRepositoryInterface`, `SessionRepositoryInterface` |
| `cmd/server/main.go` | Wired new services and handlers |

### Frontend Files Created

| File | Purpose |
|------|---------|
| `src/components/ui/GoogleButton.tsx` | Reusable Google sign-in button with icon |
| `src/app/auth/google/callback/page.tsx` | OAuth callback handler with Suspense |

### Frontend Files Modified

| File | Changes |
|------|---------|
| `src/types/index.ts` | Added `GoogleAuthURLResponse`, `GoogleCallbackRequest` |
| `src/lib/api.ts` | Added `getGoogleAuthURL()`, `googleCallback()` |
| `src/contexts/AuthContext.tsx` | Added `loginWithGoogle()`, `handleGoogleCallback()` |
| `src/app/login/page.tsx` | Added Google button with divider |
| `src/app/register/page.tsx` | Added Google button with divider |

### Test Files Created

| File | Coverage |
|------|----------|
| `internal/services/session_service_test.go` | Session creation, validation, revocation, device parsing |
| `internal/services/oauth_service_test.go` | OAuth URL, auth methods, unlinking validation |
| `internal/models/oauth_test.go` | OAuth model structures |
| `internal/models/session_test.go` | Session model and `IsValid()` method |
| `src/__tests__/GoogleButton.test.tsx` | Component rendering, interactions, accessibility |
| `src/__tests__/AuthContext.test.tsx` | OAuth methods, state validation, error handling |

---

## Appendix B: Environment Variables

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
# Redirect URI points to FRONTEND, not backend
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback  # dev
# GOOGLE_REDIRECT_URI=https://algopatterns.in/auth/google/callback  # prod

# Session settings
SINGLE_SESSION_ENABLED=true
```

## Appendix C: Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select project
3. Go to "APIs & Services" → "OAuth consent screen" and configure
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Application type: "Web application"
6. Authorized redirect URIs (these point to the FRONTEND):
   - Development: `http://localhost:3000/auth/google/callback`
   - Production: `https://algopatterns.in/auth/google/callback`
7. Copy Client ID and Client Secret to environment variables

## Appendix D: Frontend Integration Notes

### OAuth Flow (React/Next.js)

```typescript
// 1. Get OAuth URL
const { url, state } = await api.get('/auth/google/url');
localStorage.setItem('oauth_state', state);
window.location.href = url;

// 2. Handle callback (in callback page)
const code = new URLSearchParams(window.location.search).get('code');
const state = new URLSearchParams(window.location.search).get('state');
const savedState = localStorage.getItem('oauth_state');

if (state !== savedState) {
  throw new Error('Invalid OAuth state');
}

const { accessToken, user } = await api.post('/auth/google/callback', { code, state });
localStorage.removeItem('oauth_state');
// Store accessToken, redirect to app
```

### Session Handling

```typescript
// On 401 during refresh, redirect to login
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401 && error.config.url === '/auth/refresh') {
      // Session expired or revoked
      store.dispatch(logout());
      router.push('/login?reason=session_expired');
    }
    return Promise.reject(error);
  }
);
```

---

## Appendix E: Future Considerations

### Potential Enhancements

1. **Multiple sessions per user** (configurable limit, e.g., 3)
2. **Device trust** (remember this device, skip 2FA)
3. **Login notifications** (email on new device login)
4. **Session activity log** (show user their login history)
5. **GitHub OAuth** (for developers)
6. **Apple Sign-In** (if launching iOS app)
7. **Magic link login** (passwordless option)

### Schema Ready for Extensions

The `user_oauth_providers` table supports any OAuth provider:
- GitHub: `provider = 'github'`
- Apple: `provider = 'apple'`
- LinkedIn: `provider = 'linkedin'`

No schema changes needed, just add new OAuth configs.
