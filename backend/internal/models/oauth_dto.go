package models

import "time"

type GoogleAuthURLResponse struct {
	URL   string `json:"url"`
	State string `json:"state"`
}

type GoogleCallbackRequest struct {
	Code  string `json:"code" binding:"required"`
	State string `json:"state" binding:"required"`
}

type AuthMethodsResponse struct {
	HasPassword bool           `json:"hasPassword"`
	Providers   []ProviderInfo `json:"providers"`
}

type ProviderInfo struct {
	Provider  string    `json:"provider"`
	Email     string    `json:"email,omitempty"`
	LinkedAt  time.Time `json:"linkedAt"`
	CanUnlink bool      `json:"canUnlink"`
}

type LinkGoogleRequest struct {
	Code  string `json:"code" binding:"required"`
	State string `json:"state" binding:"required"`
}

type AddPasswordRequest struct {
	Password string `json:"password" binding:"required,min=8"`
}

type OAuthErrorCode string

const (
	OAuthErrInvalidState        OAuthErrorCode = "INVALID_OAUTH_STATE"
	OAuthErrCodeExpired         OAuthErrorCode = "OAUTH_CODE_EXPIRED"
	OAuthErrCannotUnlinkLast    OAuthErrorCode = "CANNOT_UNLINK_LAST_AUTH"
	OAuthErrPasswordAlreadySet  OAuthErrorCode = "PASSWORD_ALREADY_SET"
	OAuthErrProviderLinked      OAuthErrorCode = "PROVIDER_ALREADY_LINKED"
	OAuthErrEmailExists         OAuthErrorCode = "EMAIL_ALREADY_EXISTS"
	OAuthErrProviderNotLinked   OAuthErrorCode = "PROVIDER_NOT_LINKED"
	OAuthErrGoogleTokenExchange OAuthErrorCode = "GOOGLE_TOKEN_EXCHANGE_FAILED"
	OAuthErrGoogleUserInfo      OAuthErrorCode = "GOOGLE_USER_INFO_FAILED"
)

var OAuthErrorMessages = map[OAuthErrorCode]string{
	OAuthErrInvalidState:        "Login session expired. Please try again.",
	OAuthErrCodeExpired:         "Login took too long. Please try again.",
	OAuthErrCannotUnlinkLast:    "Cannot remove your only login method. Add a password first.",
	OAuthErrProviderLinked:      "This Google account is already linked to another user.",
	OAuthErrEmailExists:         "An account with this email already exists. Try logging in with your password.",
	OAuthErrPasswordAlreadySet:  "You already have a password set.",
	OAuthErrProviderNotLinked:   "This provider is not linked to your account.",
	OAuthErrGoogleTokenExchange: "Failed to authenticate with Google. Please try again.",
	OAuthErrGoogleUserInfo:      "Failed to get user info from Google. Please try again.",
}
