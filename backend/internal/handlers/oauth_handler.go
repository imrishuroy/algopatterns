package handlers

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/imrishuroy/algopatterns/internal/middleware"
	"github.com/imrishuroy/algopatterns/internal/models"
	"github.com/imrishuroy/algopatterns/internal/services"
	"github.com/imrishuroy/algopatterns/pkg/response"
	"github.com/rs/zerolog/log"
)

type OAuthHandler struct {
	oauthService   *services.OAuthService
	authService    *services.AuthService
	sessionService *services.SessionService
	authMW         *middleware.AuthMiddleware
	secureCookie   bool
}

func NewOAuthHandler(
	oauthService *services.OAuthService,
	authService *services.AuthService,
	sessionService *services.SessionService,
	authMW *middleware.AuthMiddleware,
	secureCookie bool,
) *OAuthHandler {
	return &OAuthHandler{
		oauthService:   oauthService,
		authService:    authService,
		sessionService: sessionService,
		authMW:         authMW,
		secureCookie:   secureCookie,
	}
}

func (h *OAuthHandler) RegisterRoutes(rg *gin.RouterGroup) {
	oauth := rg.Group("/auth")
	{
		oauth.GET("/google/url", h.GoogleAuthURL)
		oauth.POST("/google/callback", h.GoogleCallback)
	}

	user := rg.Group("/user")
	user.Use(h.authMW.RequireAuth())
	{
		user.GET("/auth-methods", h.GetAuthMethods)
		user.POST("/link/google", h.LinkGoogle)
		user.DELETE("/link/google", h.UnlinkGoogle)
		user.POST("/password", h.AddPassword)
	}
}

func (h *OAuthHandler) GoogleAuthURL(c *gin.Context) {
	resp, err := h.oauthService.GenerateGoogleAuthURL(c.Request.Context())
	if err != nil {
		log.Error().Err(err).Msg("Failed to generate Google auth URL")
		response.InternalError(c)
		return
	}

	response.OK(c, resp)
}

func (h *OAuthHandler) GoogleCallback(c *gin.Context) {
	var req models.GoogleCallbackRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, map[string]string{"error": err.Error()})
		return
	}

	user, accessToken, expiresIn, err := h.oauthService.ProcessGoogleCallback(c.Request.Context(), req.Code, req.State)
	if err != nil {
		h.handleOAuthError(c, err)
		return
	}

	deviceInfo := services.ParseDeviceInfo(c.GetHeader("User-Agent"), c.ClientIP())
	refreshToken, err := h.authService.GenerateRefreshToken(c.Request.Context(), user.ID, deviceInfo)
	if err != nil {
		log.Error().Err(err).Msg("Failed to generate refresh token")
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

func (h *OAuthHandler) GetAuthMethods(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		response.Unauthorized(c, "Not authenticated")
		return
	}

	methods, err := h.oauthService.GetAuthMethods(c.Request.Context(), userID)
	if err != nil {
		log.Error().Err(err).Msg("Failed to get auth methods")
		response.InternalError(c)
		return
	}

	response.OK(c, methods)
}

func (h *OAuthHandler) LinkGoogle(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		response.Unauthorized(c, "Not authenticated")
		return
	}

	var req models.LinkGoogleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, map[string]string{"error": err.Error()})
		return
	}

	if err := h.oauthService.LinkGoogleToExistingUser(c.Request.Context(), userID, req.Code, req.State); err != nil {
		h.handleOAuthError(c, err)
		return
	}

	response.OK(c, gin.H{"message": "Google account linked successfully"})
}

func (h *OAuthHandler) UnlinkGoogle(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		response.Unauthorized(c, "Not authenticated")
		return
	}

	if err := h.oauthService.UnlinkGoogle(c.Request.Context(), userID); err != nil {
		h.handleOAuthError(c, err)
		return
	}

	response.OK(c, gin.H{"message": "Google account unlinked successfully"})
}

func (h *OAuthHandler) AddPassword(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		response.Unauthorized(c, "Not authenticated")
		return
	}

	var req models.AddPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, map[string]string{"error": err.Error()})
		return
	}

	if err := h.authService.AddPassword(c.Request.Context(), userID, req.Password); err != nil {
		if errors.Is(err, services.ErrPasswordAlreadySet) {
			response.BadRequest(c, models.OAuthErrorMessages[models.OAuthErrPasswordAlreadySet], nil)
			return
		}
		log.Error().Err(err).Msg("Failed to add password")
		response.InternalError(c)
		return
	}

	response.OK(c, gin.H{"message": "Password added successfully"})
}

func (h *OAuthHandler) handleOAuthError(c *gin.Context, err error) {
	switch {
	case errors.Is(err, services.ErrInvalidOAuthState):
		response.BadRequest(c, models.OAuthErrorMessages[models.OAuthErrInvalidState], nil)
	case errors.Is(err, services.ErrOAuthStateExpired):
		response.BadRequest(c, models.OAuthErrorMessages[models.OAuthErrCodeExpired], nil)
	case errors.Is(err, services.ErrProviderAlreadyLinked):
		response.Conflict(c, models.OAuthErrorMessages[models.OAuthErrProviderLinked])
	case errors.Is(err, services.ErrCannotUnlinkLastAuth):
		response.BadRequest(c, models.OAuthErrorMessages[models.OAuthErrCannotUnlinkLast], nil)
	case errors.Is(err, services.ErrProviderNotLinked):
		response.BadRequest(c, models.OAuthErrorMessages[models.OAuthErrProviderNotLinked], nil)
	case errors.Is(err, services.ErrGoogleTokenExchange):
		response.BadRequest(c, models.OAuthErrorMessages[models.OAuthErrGoogleTokenExchange], nil)
	case errors.Is(err, services.ErrGoogleUserInfo):
		response.BadRequest(c, models.OAuthErrorMessages[models.OAuthErrGoogleUserInfo], nil)
	case errors.Is(err, services.ErrEmailExists):
		response.Conflict(c, models.OAuthErrorMessages[models.OAuthErrEmailExists])
	default:
		log.Error().Err(err).Msg("OAuth error")
		response.InternalError(c)
	}
}

func (h *OAuthHandler) setRefreshTokenCookie(c *gin.Context, token string) {
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie(
		refreshTokenCookieName,
		token,
		refreshTokenMaxAge,
		"/",
		"",
		h.secureCookie,
		true,
	)
}
