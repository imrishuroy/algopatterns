package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/imrishuroy/algopatterns/internal/middleware"
	"github.com/imrishuroy/algopatterns/internal/models"
	"github.com/imrishuroy/algopatterns/internal/services"
	"github.com/imrishuroy/algopatterns/pkg/response"
)

type ProblemHandler struct {
	service       *services.ProblemService
	featureAccess *services.FeatureAccess
	authMW        *middleware.AuthMiddleware
}

func NewProblemHandler(service *services.ProblemService, featureAccess *services.FeatureAccess, authMW *middleware.AuthMiddleware) *ProblemHandler {
	return &ProblemHandler{
		service:       service,
		featureAccess: featureAccess,
		authMW:        authMW,
	}
}

func (h *ProblemHandler) RegisterRoutes(rg *gin.RouterGroup) {
	problems := rg.Group("/problems")
	{
		problems.GET("", h.List)
		problems.GET("/languages", h.ListLanguages)
		problems.GET("/:slug", h.ShowBySlug)
		problems.GET("/:slug/solution", h.GetSolution)

		admin := problems.Group("")
		admin.Use(h.authMW.RequireAuth())
		{
			admin.POST("", h.Create)
			admin.PUT("/:id", h.Update)
			admin.DELETE("/:id", h.Delete)
			admin.POST("/:id/test-cases", h.CreateTestCase)
			admin.DELETE("/test-cases/:testCaseId", h.DeleteTestCase)
			admin.POST("/:id/templates", h.CreateTemplate)
		}
	}
}

func (h *ProblemHandler) List(c *gin.Context) {
	var req models.ProblemListRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		response.ValidationError(c, parseValidationErrors(err))
		return
	}

	result, err := h.service.List(c.Request.Context(), &req)
	if err != nil {
		response.InternalError(c)
		return
	}

	response.OK(c, result)
}

func (h *ProblemHandler) ShowBySlug(c *gin.Context) {
	slug := c.Param("slug")
	if slug == "" {
		response.BadRequest(c, "Problem slug is required", nil)
		return
	}

	var userID *uuid.UUID
	if id, exists := middleware.GetUserID(c); exists {
		userID = &id
	}

	problem, err := h.service.GetBySlug(c.Request.Context(), slug, userID)
	if err != nil {
		if services.IsNotFound(err) {
			response.NotFound(c, "Problem")
			return
		}
		response.InternalError(c)
		return
	}

	response.OK(c, problem)
}

func (h *ProblemHandler) Create(c *gin.Context) {
	var req models.CreateProblemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, parseValidationErrors(err))
		return
	}

	problem, err := h.service.Create(c.Request.Context(), &req)
	if err != nil {
		if services.IsDuplicate(err) {
			response.Conflict(c, "Problem with this slug already exists")
			return
		}
		response.InternalError(c)
		return
	}

	response.Created(c, problem)
}

func (h *ProblemHandler) Update(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.BadRequest(c, "Invalid problem ID", nil)
		return
	}

	var req models.UpdateProblemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, parseValidationErrors(err))
		return
	}

	problem, err := h.service.Update(c.Request.Context(), id, &req)
	if err != nil {
		if services.IsNotFound(err) {
			response.NotFound(c, "Problem")
			return
		}
		response.InternalError(c)
		return
	}

	response.OK(c, problem)
}

func (h *ProblemHandler) Delete(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.BadRequest(c, "Invalid problem ID", nil)
		return
	}

	if err := h.service.Delete(c.Request.Context(), id); err != nil {
		if services.IsNotFound(err) {
			response.NotFound(c, "Problem")
			return
		}
		response.InternalError(c)
		return
	}

	response.NoContent(c)
}

func (h *ProblemHandler) CreateTestCase(c *gin.Context) {
	idStr := c.Param("id")
	problemID, err := uuid.Parse(idStr)
	if err != nil {
		response.BadRequest(c, "Invalid problem ID", nil)
		return
	}

	var req models.CreateTestCaseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, parseValidationErrors(err))
		return
	}

	tc, err := h.service.CreateTestCase(c.Request.Context(), problemID, &req)
	if err != nil {
		if services.IsNotFound(err) {
			response.NotFound(c, "Problem")
			return
		}
		response.InternalError(c)
		return
	}

	response.Created(c, tc)
}

func (h *ProblemHandler) DeleteTestCase(c *gin.Context) {
	idStr := c.Param("testCaseId")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.BadRequest(c, "Invalid test case ID", nil)
		return
	}

	if err := h.service.DeleteTestCase(c.Request.Context(), id); err != nil {
		if services.IsNotFound(err) {
			response.NotFound(c, "Test case")
			return
		}
		response.InternalError(c)
		return
	}

	response.NoContent(c)
}

func (h *ProblemHandler) CreateTemplate(c *gin.Context) {
	idStr := c.Param("id")
	problemID, err := uuid.Parse(idStr)
	if err != nil {
		response.BadRequest(c, "Invalid problem ID", nil)
		return
	}

	var req models.CreateProblemTemplateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, parseValidationErrors(err))
		return
	}

	tmpl, err := h.service.CreateTemplate(c.Request.Context(), problemID, &req)
	if err != nil {
		if services.IsNotFound(err) {
			response.NotFound(c, "Problem")
			return
		}
		response.InternalError(c)
		return
	}

	response.Created(c, tmpl)
}

func (h *ProblemHandler) ListLanguages(c *gin.Context) {
	languages, err := h.service.GetLanguages(c.Request.Context())
	if err != nil {
		response.InternalError(c)
		return
	}

	response.OK(c, gin.H{"languages": languages})
}

// GetSolution returns the solution/hints for a problem (Pro feature)
// skipcq: RVV-A0006 - HTTP handler writes to response, doesn't return value
func (h *ProblemHandler) GetSolution(c *gin.Context) {
	slug := c.Param("slug")
	if slug == "" {
		response.BadRequest(c, "Problem slug is required", nil)
		return
	}

	// Check if user has access to solutions
	var userID string
	if uid, ok := middleware.GetUserID(c); ok {
		userID = uid.String()
	}

	canAccess, err := h.featureAccess.CanAccessSolutions(c.Request.Context(), userID)
	if err != nil {
		response.InternalError(c)
		return
	}
	if !canAccess {
		response.Forbidden(c, "Upgrade to Pro to access problem solutions")
		return
	}

	solution, err := h.service.GetSolution(c.Request.Context(), slug)
	if err != nil {
		if services.IsNotFound(err) {
			response.NotFound(c, "Problem")
			return
		}
		response.InternalError(c)
		return
	}

	response.OK(c, solution)
}
