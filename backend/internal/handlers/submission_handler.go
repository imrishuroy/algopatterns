package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/imrishuroy/algopatterns/internal/middleware"
	"github.com/imrishuroy/algopatterns/internal/models"
	"github.com/imrishuroy/algopatterns/internal/services"
	"github.com/imrishuroy/algopatterns/pkg/response"
)

type SubmissionHandler struct {
	service *services.SubmissionService
	authMW  *middleware.AuthMiddleware
}

func NewSubmissionHandler(service *services.SubmissionService, authMW *middleware.AuthMiddleware) *SubmissionHandler {
	return &SubmissionHandler{
		service: service,
		authMW:  authMW,
	}
}

func (h *SubmissionHandler) RegisterRoutes(rg *gin.RouterGroup) {
	submissions := rg.Group("/submissions")
	submissions.Use(h.authMW.RequireAuth())
	{
		submissions.POST("", h.Submit)
		submissions.POST("/run", h.RunCode)
		submissions.GET("", h.List)
		submissions.GET("/:id", h.ShowByID)
	}
}

func (h *SubmissionHandler) Submit(c *gin.Context) {
	userID, exists := middleware.GetUserID(c)
	if !exists {
		response.Unauthorized(c, "Authentication required")
		return
	}

	var req models.SubmitCodeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, parseValidationErrors(err))
		return
	}

	result, err := h.service.Submit(c.Request.Context(), userID, &req)
	if err != nil {
		if services.IsNotFound(err) {
			response.NotFound(c, "Problem or language")
			return
		}
		response.BadRequest(c, err.Error(), nil)
		return
	}

	response.OK(c, result)
}

func (h *SubmissionHandler) RunCode(c *gin.Context) {
	userID, exists := middleware.GetUserID(c)
	if !exists {
		response.Unauthorized(c, "Authentication required")
		return
	}

	var req models.RunCodeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, parseValidationErrors(err))
		return
	}

	result, err := h.service.RunCode(c.Request.Context(), userID, &req)
	if err != nil {
		if services.IsNotFound(err) {
			response.NotFound(c, "Problem or language")
			return
		}
		response.BadRequest(c, err.Error(), nil)
		return
	}

	response.OK(c, result)
}

func (h *SubmissionHandler) ShowByID(c *gin.Context) {
	userID, exists := middleware.GetUserID(c)
	if !exists {
		response.Unauthorized(c, "Authentication required")
		return
	}

	idStr := c.Param("id")
	submissionID, err := uuid.Parse(idStr)
	if err != nil {
		response.BadRequest(c, "Invalid submission ID", nil)
		return
	}

	result, err := h.service.GetByID(c.Request.Context(), userID, submissionID)
	if err != nil {
		if services.IsNotFound(err) {
			response.NotFound(c, "Submission")
			return
		}
		response.InternalError(c)
		return
	}

	response.OK(c, result)
}

func (h *SubmissionHandler) List(c *gin.Context) {
	userID, exists := middleware.GetUserID(c)
	if !exists {
		response.Unauthorized(c, "Authentication required")
		return
	}

	var req models.SubmissionListRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		response.ValidationError(c, parseValidationErrors(err))
		return
	}

	result, err := h.service.ListByUser(c.Request.Context(), userID, &req)
	if err != nil {
		response.InternalError(c)
		return
	}

	response.OK(c, result)
}
