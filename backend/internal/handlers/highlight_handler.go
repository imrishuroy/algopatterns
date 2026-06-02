package handlers

import (
	"errors"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/imrishuroy/algopatterns/internal/middleware"
	"github.com/imrishuroy/algopatterns/internal/models"
	"github.com/imrishuroy/algopatterns/internal/services"
	"github.com/imrishuroy/algopatterns/pkg/response"
	"github.com/rs/zerolog/log"
)

type HighlightHandler struct {
	service services.HighlightServiceInterface
	authMW  *middleware.AuthMiddleware
}

func NewHighlightHandler(service services.HighlightServiceInterface, authMW *middleware.AuthMiddleware) *HighlightHandler {
	return &HighlightHandler{
		service: service,
		authMW:  authMW,
	}
}

func (h *HighlightHandler) RegisterRoutes(rg *gin.RouterGroup) {
	highlights := rg.Group("/highlights")
	highlights.Use(h.authMW.RequireAuth())
	{
		highlights.POST("", h.Create)
		highlights.POST("/sync", h.BatchSync)
		highlights.GET("", h.List)
		highlights.GET("/:id", h.ShowByID)
		highlights.GET("/content/:contentType/:contentId", h.ShowByContent)
		highlights.PATCH("/:id", h.Update)
		highlights.DELETE("/:id", h.Delete)
	}
}

func (h *HighlightHandler) Create(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		response.Unauthorized(c, "Not authenticated")
		return
	}

	var req models.CreateHighlightRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, map[string]string{"error": err.Error()})
		return
	}

	highlight, err := h.service.Create(c.Request.Context(), userID, &req)
	if err != nil {
		if errors.Is(err, services.ErrHighlightExists) {
			response.Conflict(c, "A highlight already exists at this position")
			return
		}
		if errors.Is(err, services.ErrInvalidColor) {
			response.ValidationError(c, map[string]string{"color": "invalid color value"})
			return
		}
		log.Error().Err(err).Msg("Failed to create highlight")
		response.InternalError(c)
		return
	}

	response.Created(c, highlight)
}

func (h *HighlightHandler) ShowByID(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		response.Unauthorized(c, "Not authenticated")
		return
	}

	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.BadRequest(c, "Invalid highlight ID", nil)
		return
	}

	highlight, err := h.service.GetByID(c.Request.Context(), id, userID)
	if err != nil {
		if errors.Is(err, services.ErrHighlightNotFound) {
			response.NotFound(c, "Highlight")
			return
		}
		log.Error().Err(err).Msg("Failed to get highlight")
		response.InternalError(c)
		return
	}

	response.OK(c, highlight)
}

func (h *HighlightHandler) ShowByContent(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		response.Unauthorized(c, "Not authenticated")
		return
	}

	contentType := c.Param("contentType")
	contentID := c.Param("contentId")

	if contentType == "" || contentID == "" {
		response.BadRequest(c, "Content type and content ID are required", nil)
		return
	}

	highlights, err := h.service.GetByContent(c.Request.Context(), userID, contentType, contentID)
	if err != nil {
		log.Error().Err(err).Msg("Failed to get highlights for content")
		response.InternalError(c)
		return
	}

	response.OK(c, models.ContentHighlightsResponse{
		Highlights: highlights,
	})
}

func (h *HighlightHandler) List(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		response.Unauthorized(c, "Not authenticated")
		return
	}

	limit := 20
	if limitStr := c.Query("limit"); limitStr != "" {
		if parsed, err := strconv.Atoi(limitStr); err == nil && parsed > 0 {
			limit = parsed
		}
	}

	var cursor *time.Time
	if cursorStr := c.Query("cursor"); cursorStr != "" {
		if parsed, err := time.Parse(time.RFC3339Nano, cursorStr); err == nil {
			cursor = &parsed
		}
	}

	var contentType *string
	if ct := c.Query("content_type"); ct != "" {
		contentType = &ct
	}

	result, err := h.service.GetAllByUser(c.Request.Context(), userID, limit, cursor, contentType)
	if err != nil {
		log.Error().Err(err).Msg("Failed to list highlights")
		response.InternalError(c)
		return
	}

	response.OK(c, result)
}

func (h *HighlightHandler) Update(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		response.Unauthorized(c, "Not authenticated")
		return
	}

	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.BadRequest(c, "Invalid highlight ID", nil)
		return
	}

	var req models.UpdateHighlightRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, map[string]string{"error": err.Error()})
		return
	}

	highlight, err := h.service.Update(c.Request.Context(), id, userID, &req)
	if err != nil {
		if errors.Is(err, services.ErrHighlightNotFound) {
			response.NotFound(c, "Highlight")
			return
		}
		if errors.Is(err, services.ErrVersionConflict) {
			// Fetch current server state for conflict resolution
			current, fetchErr := h.service.GetByID(c.Request.Context(), id, userID)
			if fetchErr != nil {
				log.Error().Err(fetchErr).Msg("Failed to fetch current highlight for conflict response")
				response.Conflict(c, "Highlight was modified by another request")
				return
			}
			response.VersionConflict(c, "Highlight was modified by another request", current)
			return
		}
		if errors.Is(err, services.ErrInvalidColor) {
			response.ValidationError(c, map[string]string{"color": "invalid color value"})
			return
		}
		log.Error().Err(err).Msg("Failed to update highlight")
		response.InternalError(c)
		return
	}

	response.OK(c, highlight)
}

func (h *HighlightHandler) Delete(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		response.Unauthorized(c, "Not authenticated")
		return
	}

	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.BadRequest(c, "Invalid highlight ID", nil)
		return
	}

	if err := h.service.Delete(c.Request.Context(), id, userID); err != nil {
		if errors.Is(err, services.ErrHighlightNotFound) {
			response.NotFound(c, "Highlight")
			return
		}
		log.Error().Err(err).Msg("Failed to delete highlight")
		response.InternalError(c)
		return
	}

	c.Status(http.StatusNoContent)
}

func (h *HighlightHandler) BatchSync(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		response.Unauthorized(c, "Not authenticated")
		return
	}

	var req models.BatchSyncRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, map[string]string{"error": err.Error()})
		return
	}

	if len(req.Operations) == 0 {
		response.BadRequest(c, "No operations provided", nil)
		return
	}

	if len(req.Operations) > 50 {
		response.BadRequest(c, "Too many operations (max 50)", nil)
		return
	}

	result, err := h.service.BatchSync(c.Request.Context(), userID, &req)
	if err != nil {
		log.Error().Err(err).Msg("Failed to batch sync highlights")
		response.InternalError(c)
		return
	}

	response.OK(c, result)
}
