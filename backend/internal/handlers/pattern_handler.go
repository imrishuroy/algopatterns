package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/imrishuroy/algopatterns/internal/middleware"
	"github.com/imrishuroy/algopatterns/internal/models"
	"github.com/imrishuroy/algopatterns/internal/services"
	"github.com/imrishuroy/algopatterns/pkg/response"
)

type PatternHandler struct {
	service       services.PatternServiceInterface
	featureAccess *services.FeatureAccess
	authMW        *middleware.AuthMiddleware
}

func NewPatternHandler(service services.PatternServiceInterface, featureAccess *services.FeatureAccess, authMW *middleware.AuthMiddleware) *PatternHandler {
	return &PatternHandler{
		service:       service,
		featureAccess: featureAccess,
		authMW:        authMW,
	}
}

func (h *PatternHandler) RegisterRoutes(rg *gin.RouterGroup) {
	patterns := rg.Group("/patterns")
	patterns.Use(h.authMW.OptionalAuth())
	{
		patterns.GET("", h.List)
		patterns.POST("", h.Create)
		patterns.GET("/categories", h.ListCategories)
		patterns.GET("/export", h.Export)
		patterns.GET("/search", h.Search)
		patterns.GET("/:id", h.ShowByID)
		patterns.PUT("/:id", h.Update)
		patterns.DELETE("/:id", h.Delete)
	}
}

func (h *PatternHandler) List(c *gin.Context) {
	var req models.PatternListRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		response.ValidationError(c, parseValidationErrors(err))
		return
	}

	result, err := h.service.List(c.Request.Context(), &req)
	if err != nil {
		response.InternalError(c)
		return
	}

	userID := ""
	if uid, ok := middleware.GetUserID(c); ok {
		userID = uid.String()
	}

	features, isPro, _ := h.featureAccess.GetUserFeatures(c.Request.Context(), userID)

	type PatternWithAccess struct {
		models.Pattern
		IsLocked bool `json:"is_locked"`
	}

	patternsWithAccess := make([]PatternWithAccess, 0, len(result.Patterns))
	for _, p := range result.Patterns {
		isLocked := !isPro && !services.IsFreePattern(p.ID) && features.MaxPatterns != -1
		patternsWithAccess = append(patternsWithAccess, PatternWithAccess{
			Pattern:  p,
			IsLocked: isLocked,
		})
	}

	response.OK(c, gin.H{
		"patterns":         patternsWithAccess,
		"pagination":       result.Pagination,
		"is_pro":           isPro,
		"free_visualizers": h.featureAccess.GetFreeVisualizerIDs(),
	})
}

func (h *PatternHandler) ShowByID(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.BadRequest(c, "Pattern ID is required", nil)
		return
	}

	userID := ""
	if uid, ok := middleware.GetUserID(c); ok {
		userID = uid.String()
	}

	canAccess, err := h.featureAccess.CanAccessPattern(c.Request.Context(), userID, id)
	if err != nil {
		response.InternalError(c)
		return
	}

	if !canAccess {
		response.Forbidden(c, "Upgrade to Pro to access this pattern")
		return
	}

	pattern, err := h.service.GetByID(c.Request.Context(), id)
	if err != nil {
		if services.IsNotFound(err) {
			response.NotFound(c, "Pattern")
			return
		}
		response.InternalError(c)
		return
	}

	// Get user features to include visualizer access info
	_, isPro, _ := h.featureAccess.GetUserFeatures(c.Request.Context(), userID)

	response.OK(c, gin.H{
		"pattern":          pattern,
		"is_pro":           isPro,
		"free_visualizers": h.featureAccess.GetFreeVisualizerIDs(),
	})
}

func (h *PatternHandler) Create(c *gin.Context) {
	var req models.CreatePatternRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, parseValidationErrors(err))
		return
	}

	pattern, err := h.service.Create(c.Request.Context(), &req)
	if err != nil {
		if services.IsDuplicate(err) {
			response.Conflict(c, "Pattern with this ID already exists")
			return
		}
		response.InternalError(c)
		return
	}

	response.Created(c, pattern)
}

func (h *PatternHandler) Update(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.BadRequest(c, "Pattern ID is required", nil)
		return
	}

	var req models.UpdatePatternRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, parseValidationErrors(err))
		return
	}

	pattern, err := h.service.Update(c.Request.Context(), id, &req)
	if err != nil {
		if services.IsNotFound(err) {
			response.NotFound(c, "Pattern")
			return
		}
		response.InternalError(c)
		return
	}

	response.OK(c, pattern)
}

func (h *PatternHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.BadRequest(c, "Pattern ID is required", nil)
		return
	}

	if err := h.service.Delete(c.Request.Context(), id); err != nil {
		if services.IsNotFound(err) {
			response.NotFound(c, "Pattern")
			return
		}
		response.InternalError(c)
		return
	}

	response.NoContent(c)
}

func (h *PatternHandler) ListCategories(c *gin.Context) {
	categories, err := h.service.GetCategories(c.Request.Context())
	if err != nil {
		response.InternalError(c)
		return
	}

	response.OK(c, models.CategoriesResponse{Categories: categories})
}

func (h *PatternHandler) BulkImport(c *gin.Context) {
	var req models.BulkImportRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, parseValidationErrors(err))
		return
	}

	result, err := h.service.BulkImport(c.Request.Context(), &req)
	if err != nil {
		response.InternalError(c)
		return
	}

	response.OK(c, result)
}

func (h *PatternHandler) Export(c *gin.Context) {
	data, err := h.service.Export(c.Request.Context())
	if err != nil {
		response.InternalError(c)
		return
	}

	c.Header("Content-Disposition", "attachment; filename=patterns-export.json")
	c.Data(200, "application/json", data)
}

func (h *PatternHandler) Search(c *gin.Context) {
	query := c.Query("q")
	if query == "" {
		response.BadRequest(c, "Search query is required", nil)
		return
	}

	patterns, err := h.service.Search(c.Request.Context(), query)
	if err != nil {
		response.InternalError(c)
		return
	}

	response.OK(c, gin.H{"patterns": patterns})
}

func parseValidationErrors(err error) map[string]string {
	errors := make(map[string]string)
	if validationErrors, ok := err.(validator.ValidationErrors); ok {
		for _, e := range validationErrors {
			field := e.Field()
			switch e.Tag() {
			case "required":
				errors[field] = field + " is required"
			case "min":
				errors[field] = field + " must be at least " + e.Param()
			case "max":
				errors[field] = field + " must be at most " + e.Param()
			case "oneof":
				errors[field] = field + " must be one of: " + e.Param()
			default:
				errors[field] = field + " is invalid"
			}
		}
	} else {
		errors["body"] = "Invalid request body"
	}
	return errors
}
