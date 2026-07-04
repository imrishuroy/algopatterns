package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/imrishuroy/algopatterns/internal/middleware"
	"github.com/imrishuroy/algopatterns/internal/models"
	"github.com/imrishuroy/algopatterns/internal/services"
	"github.com/imrishuroy/algopatterns/pkg/response"
	"github.com/rs/zerolog/log"
)

type PatternProgressHandler struct {
	service *services.PatternProgressService
	authMW  *middleware.AuthMiddleware
}

func NewPatternProgressHandler(service *services.PatternProgressService, authMW *middleware.AuthMiddleware) *PatternProgressHandler {
	return &PatternProgressHandler{
		service: service,
		authMW:  authMW,
	}
}

func (h *PatternProgressHandler) RegisterRoutes(rg *gin.RouterGroup) {
	progress := rg.Group("/pattern-progress")
	progress.Use(h.authMW.RequireAuth())
	{
		progress.GET("", h.ListAll)
		progress.GET("/:patternId", h.ListByPattern)
		progress.POST("/:patternId/:sectionIndex", h.MarkComplete)
		progress.DELETE("/:patternId/:sectionIndex", h.MarkIncomplete)
		progress.POST("/:patternId/bulk", h.BulkMarkComplete)
		progress.POST("/sync", h.BulkSync)
	}
}

func (h *PatternProgressHandler) ListAll(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		response.Unauthorized(c, "Not authenticated")
		return
	}

	progress, err := h.service.GetAllByUser(c.Request.Context(), userID)
	if err != nil {
		log.Error().Err(err).Msg("Failed to get all progress")
		response.InternalError(c)
		return
	}

	response.OK(c, models.BulkSyncProgressResponse{Progress: progress})
}

func (h *PatternProgressHandler) ListByPattern(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		response.Unauthorized(c, "Not authenticated")
		return
	}

	patternID := c.Param("patternId")
	if patternID == "" {
		response.BadRequest(c, "Pattern ID is required", nil)
		return
	}

	sections, err := h.service.GetByPattern(c.Request.Context(), userID, patternID)
	if err != nil {
		log.Error().Err(err).Str("patternId", patternID).Msg("Failed to get pattern progress")
		response.InternalError(c)
		return
	}

	response.OK(c, models.PatternProgressResponse{
		PatternID:         patternID,
		CompletedSections: sections,
	})
}

func (h *PatternProgressHandler) MarkComplete(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		response.Unauthorized(c, "Not authenticated")
		return
	}

	patternID := c.Param("patternId")
	sectionIndexStr := c.Param("sectionIndex")

	if patternID == "" {
		response.BadRequest(c, "Pattern ID is required", nil)
		return
	}

	sectionIndex, err := parsePositiveInt(sectionIndexStr)
	if err != nil {
		response.BadRequest(c, "Invalid section index", nil)
		return
	}

	if err := h.service.MarkComplete(c.Request.Context(), userID, patternID, sectionIndex); err != nil {
		log.Error().Err(err).Str("patternId", patternID).Int("sectionIndex", sectionIndex).Msg("Failed to mark complete")
		response.InternalError(c)
		return
	}

	response.OK(c, gin.H{"message": "Section marked as complete"})
}

func (h *PatternProgressHandler) MarkIncomplete(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		response.Unauthorized(c, "Not authenticated")
		return
	}

	patternID := c.Param("patternId")
	sectionIndexStr := c.Param("sectionIndex")

	if patternID == "" {
		response.BadRequest(c, "Pattern ID is required", nil)
		return
	}

	sectionIndex, err := parsePositiveInt(sectionIndexStr)
	if err != nil {
		response.BadRequest(c, "Invalid section index", nil)
		return
	}

	if err := h.service.MarkIncomplete(c.Request.Context(), userID, patternID, sectionIndex); err != nil {
		log.Error().Err(err).Str("patternId", patternID).Int("sectionIndex", sectionIndex).Msg("Failed to mark incomplete")
		response.InternalError(c)
		return
	}

	response.OK(c, gin.H{"message": "Section marked as incomplete"})
}

func (h *PatternProgressHandler) BulkMarkComplete(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		response.Unauthorized(c, "Not authenticated")
		return
	}

	patternID := c.Param("patternId")
	if patternID == "" {
		response.BadRequest(c, "Pattern ID is required", nil)
		return
	}

	var req models.BulkProgressRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, map[string]string{"error": err.Error()})
		return
	}

	if err := h.service.BulkMarkComplete(c.Request.Context(), userID, patternID, req.Sections); err != nil {
		log.Error().Err(err).Str("patternId", patternID).Msg("Failed to bulk mark complete")
		response.InternalError(c)
		return
	}

	response.OK(c, gin.H{"message": "Sections marked as complete"})
}

func (h *PatternProgressHandler) BulkSync(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		response.Unauthorized(c, "Not authenticated")
		return
	}

	var req models.BulkSyncProgressRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, map[string]string{"error": err.Error()})
		return
	}

	if err := h.service.BulkSync(c.Request.Context(), userID, req.Progress); err != nil {
		log.Error().Err(err).Msg("Failed to bulk sync progress")
		response.InternalError(c)
		return
	}

	// Return the synced progress
	progress, err := h.service.GetAllByUser(c.Request.Context(), userID)
	if err != nil {
		log.Error().Err(err).Msg("Failed to get progress after sync")
		response.InternalError(c)
		return
	}

	response.OK(c, models.BulkSyncProgressResponse{Progress: progress})
}

func parsePositiveInt(s string) (int, error) {
	var n int
	for _, c := range s {
		if c < '0' || c > '9' {
			return 0, errInvalidInt
		}
		n = n*10 + int(c-'0')
	}
	return n, nil
}

var errInvalidInt = &invalidIntError{}

type invalidIntError struct{}

func (e *invalidIntError) Error() string {
	return "invalid integer"
}
