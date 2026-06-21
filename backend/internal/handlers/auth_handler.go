package handlers

import (
	"errors"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/imrishuroy/algopatterns/internal/middleware"
	"github.com/imrishuroy/algopatterns/internal/models"
	"github.com/imrishuroy/algopatterns/internal/services"
	"github.com/imrishuroy/algopatterns/pkg/response"
	"github.com/rs/zerolog/log"
)

const (
	refreshTokenCookieName = "refresh_token"
	refreshTokenMaxAge     = 7 * 24 * 60 * 60 // 7 days in seconds
)

type AuthHandler struct {
	authService  *services.AuthService
	authMW       *middleware.AuthMiddleware
	secureCookie bool
}

func NewAuthHandler(authService *services.AuthService, authMW *middleware.AuthMiddleware, secureCookie bool) *AuthHandler {
	return &AuthHandler{
		authService:  authService,
		authMW:       authMW,
		secureCookie: secureCookie,
	}
}

func (h *AuthHandler) RegisterRoutes(rg *gin.RouterGroup) {
	auth := rg.Group("/auth")
	{
		auth.POST("/register", h.Register)
		auth.POST("/login", h.Login)
		auth.POST("/refresh", h.Refresh)
		auth.POST("/logout", h.Logout)
	}

	user := rg.Group("/user")
	user.Use(h.authMW.RequireAuth())
	{
		user.GET("/me", h.ShowMe)
		user.PUT("/profile", h.UpdateProfile)
		user.PUT("/password", h.ChangePassword)
		user.DELETE("/account", h.DeleteAccount)
		user.POST("/logout-all", h.LogoutAll)
	}
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req models.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, map[string]string{"error": err.Error()})
		return
	}

	user, err := h.authService.Register(c.Request.Context(), &req)
	if err != nil {
		if errors.Is(err, services.ErrEmailExists) {
			response.Conflict(c, "Email already registered")
			return
		}
		log.Error().Err(err).Msg("Failed to register user")
		response.InternalError(c)
		return
	}

	accessToken, expiresIn, err := h.authService.GenerateAccessToken(user)
	if err != nil {
		log.Error().Err(err).Msg("Failed to generate access token")
		response.InternalError(c)
		return
	}

	deviceInfo := services.ParseDeviceInfo(c.GetHeader("User-Agent"), c.ClientIP())
	refreshToken, err := h.authService.GenerateRefreshToken(c.Request.Context(), user.ID, deviceInfo)
	if err != nil {
		response.InternalError(c)
		return
	}

	h.setRefreshTokenCookie(c, refreshToken)

	response.Created(c, models.AuthResponse{
		User:        services.UserToResponse(user),
		AccessToken: accessToken,
		ExpiresIn:   expiresIn,
	})
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, map[string]string{"error": err.Error()})
		return
	}

	user, err := h.authService.Login(c.Request.Context(), &req)
	if err != nil {
		if errors.Is(err, services.ErrInvalidCredentials) {
			response.Unauthorized(c, "Invalid email or password")
			return
		}
		response.InternalError(c)
		return
	}

	accessToken, expiresIn, err := h.authService.GenerateAccessToken(user)
	if err != nil {
		response.InternalError(c)
		return
	}

	deviceInfo := services.ParseDeviceInfo(c.GetHeader("User-Agent"), c.ClientIP())
	refreshToken, err := h.authService.GenerateRefreshToken(c.Request.Context(), user.ID, deviceInfo)
	if err != nil {
		response.InternalError(c)
		return
	}

	h.setRefreshTokenCookie(c, refreshToken)

	response.OK(c, models.AuthResponse{
		User:        services.UserToResponse(user),
		AccessToken: accessToken,
		ExpiresIn:   expiresIn,
	})
}

func (h *AuthHandler) Refresh(c *gin.Context) {
	refreshToken, err := c.Cookie(refreshTokenCookieName)
	if err != nil {
		response.Unauthorized(c, "No refresh token provided")
		return
	}

	user, accessToken, expiresIn, err := h.authService.RefreshAccessToken(c.Request.Context(), refreshToken)
	if err != nil {
		h.clearRefreshTokenCookie(c)
		switch err {
		case services.ErrTokenExpired, services.ErrTokenRevoked, services.ErrTokenInvalid:
			response.Unauthorized(c, "Invalid or expired refresh token")
		default:
			response.InternalError(c)
		}
		return
	}

	response.OK(c, models.RefreshResponse{
		AccessToken: accessToken,
		ExpiresIn:   expiresIn,
	})

	_ = user // We include user in case we want to return user info later
}

func (h *AuthHandler) Logout(c *gin.Context) {
	refreshToken, err := c.Cookie(refreshTokenCookieName)
	if err == nil && refreshToken != "" {
		_ = h.authService.Logout(c.Request.Context(), refreshToken)
	}

	h.clearRefreshTokenCookie(c)
	response.OK(c, gin.H{"message": "Logged out successfully"})
}

func (h *AuthHandler) ShowMe(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		response.Unauthorized(c, "Not authenticated")
		return
	}

	user, err := h.authService.GetUser(c.Request.Context(), userID)
	if err != nil {
		if errors.Is(err, services.ErrUserNotFound) {
			response.NotFound(c, "User")
			return
		}
		response.InternalError(c)
		return
	}

	response.OK(c, services.UserToResponse(user))
}

func (h *AuthHandler) UpdateProfile(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		response.Unauthorized(c, "Not authenticated")
		return
	}

	var req models.UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, map[string]string{"error": err.Error()})
		return
	}

	user, err := h.authService.UpdateProfile(c.Request.Context(), userID, &req)
	if err != nil {
		response.InternalError(c)
		return
	}

	response.OK(c, services.UserToResponse(user))
}

func (h *AuthHandler) ChangePassword(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		response.Unauthorized(c, "Not authenticated")
		return
	}

	var req models.ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, map[string]string{"error": err.Error()})
		return
	}

	err := h.authService.ChangePassword(c.Request.Context(), userID, req.CurrentPassword, req.NewPassword)
	if err != nil {
		if errors.Is(err, services.ErrInvalidCredentials) {
			response.BadRequest(c, "Current password is incorrect", nil)
			return
		}
		response.InternalError(c)
		return
	}

	h.clearRefreshTokenCookie(c)
	response.OK(c, gin.H{"message": "Password changed successfully. Please login again."})
}

func (h *AuthHandler) DeleteAccount(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		response.Unauthorized(c, "Not authenticated")
		return
	}

	err := h.authService.DeleteAccount(c.Request.Context(), userID)
	if err != nil {
		response.InternalError(c)
		return
	}

	h.clearRefreshTokenCookie(c)
	response.OK(c, gin.H{"message": "Account deleted successfully"})
}

func (h *AuthHandler) LogoutAll(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		response.Unauthorized(c, "Not authenticated")
		return
	}

	err := h.authService.LogoutAll(c.Request.Context(), userID)
	if err != nil {
		response.InternalError(c)
		return
	}

	h.clearRefreshTokenCookie(c)
	response.OK(c, gin.H{"message": "Logged out from all devices"})
}

func (h *AuthHandler) setRefreshTokenCookie(c *gin.Context, token string) {
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie(
		refreshTokenCookieName,
		token,
		refreshTokenMaxAge,
		"/",
		"",
		h.secureCookie,
		true, // httpOnly
	)
}

func (h *AuthHandler) clearRefreshTokenCookie(c *gin.Context) {
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie(
		refreshTokenCookieName,
		"",
		-1,
		"/",
		"",
		h.secureCookie,
		true,
	)
}

// For stricter rate limiting on auth endpoints
func AuthRateLimiter() gin.HandlerFunc {
	return func(c *gin.Context) {
		// This can be enhanced with a stricter rate limit for auth endpoints
		c.Next()
	}
}

// Utility to check token expiry without full validation (for frontend)
func (h *AuthHandler) CheckToken(c *gin.Context) {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		response.OK(c, gin.H{"valid": false, "reason": "no_token"})
		return
	}

	// Extract token
	var tokenString string
	if len(authHeader) > 7 && authHeader[:7] == "Bearer " {
		tokenString = authHeader[7:]
	} else {
		response.OK(c, gin.H{"valid": false, "reason": "invalid_format"})
		return
	}

	claims, err := h.authService.ValidateAccessToken(tokenString)
	if err != nil {
		reason := "invalid"
		if errors.Is(err, services.ErrTokenExpired) {
			reason = "expired"
		}
		response.OK(c, gin.H{"valid": false, "reason": reason})
		return
	}

	response.OK(c, gin.H{
		"valid":     true,
		"userId":    claims.UserID,
		"email":     claims.Email,
		"expiresAt": claims.ExpiresAt.Time.Format(time.RFC3339),
	})
}
