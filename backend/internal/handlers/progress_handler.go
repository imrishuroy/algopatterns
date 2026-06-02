package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/imrishuroy/algopatterns/internal/middleware"
	"github.com/imrishuroy/algopatterns/internal/models"
	"github.com/imrishuroy/algopatterns/internal/services"
	"github.com/imrishuroy/algopatterns/pkg/response"
)

type ProgressHandler struct {
	progressService *services.ProgressService
	authMW          *middleware.AuthMiddleware
}

func NewProgressHandler(progressService *services.ProgressService, authMW *middleware.AuthMiddleware) *ProgressHandler {
	return &ProgressHandler{
		progressService: progressService,
		authMW:          authMW,
	}
}

func (h *ProgressHandler) RegisterRoutes(rg *gin.RouterGroup) {
	progress := rg.Group("/progress")
	progress.Use(h.authMW.RequireAuth())
	{
		progress.GET("", h.ShowProgress)
		progress.POST("/toggle", h.ToggleProgress)
		progress.POST("/sync", h.SyncProgress)
	}
}

func (h *ProgressHandler) ShowProgress(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		response.Unauthorized(c, "Not authenticated")
		return
	}

	questionIDs, err := h.progressService.GetProgress(c.Request.Context(), userID)
	if err != nil {
		response.InternalError(c)
		return
	}

	if questionIDs == nil {
		questionIDs = []string{}
	}

	response.OK(c, models.ProgressResponse{
		QuestionIDs: questionIDs,
	})
}

func (h *ProgressHandler) ToggleProgress(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		response.Unauthorized(c, "Not authenticated")
		return
	}

	var req models.ToggleProgressRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, map[string]string{"error": err.Error()})
		return
	}

	err := h.progressService.ToggleProgress(c.Request.Context(), userID, req.QuestionID, req.Completed)
	if err != nil {
		response.InternalError(c)
		return
	}

	questionIDs, err := h.progressService.GetProgress(c.Request.Context(), userID)
	if err != nil {
		response.InternalError(c)
		return
	}

	if questionIDs == nil {
		questionIDs = []string{}
	}

	response.OK(c, models.ProgressResponse{
		QuestionIDs: questionIDs,
	})
}

func (h *ProgressHandler) SyncProgress(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		response.Unauthorized(c, "Not authenticated")
		return
	}

	var req models.ProgressSyncRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, map[string]string{"error": err.Error()})
		return
	}

	questionIDs, err := h.progressService.SyncProgress(c.Request.Context(), userID, req.QuestionIDs)
	if err != nil {
		response.InternalError(c)
		return
	}

	if questionIDs == nil {
		questionIDs = []string{}
	}

	response.OK(c, models.ProgressResponse{
		QuestionIDs: questionIDs,
	})
}
