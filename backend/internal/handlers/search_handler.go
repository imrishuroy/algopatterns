package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/imrishuroy/algopatterns/internal/middleware"
	"github.com/imrishuroy/algopatterns/internal/models"
	"github.com/imrishuroy/algopatterns/internal/services"
	"github.com/imrishuroy/algopatterns/pkg/response"
)

// SearchHandler handles search-related HTTP requests
type SearchHandler struct {
	searchService *services.SearchService
	authMW        *middleware.AuthMiddleware
}

// NewSearchHandler creates a new search handler
func NewSearchHandler(searchService *services.SearchService, authMW *middleware.AuthMiddleware) *SearchHandler {
	return &SearchHandler{
		searchService: searchService,
		authMW:        authMW,
	}
}

// RegisterRoutes registers search routes
func (h *SearchHandler) RegisterRoutes(r *gin.RouterGroup) {
	search := r.Group("/search")
	{
		// Public search endpoint (auth optional for user-specific results)
		search.GET("", h.authMW.OptionalAuth(), h.Search)

		// Authenticated endpoints
		search.GET("/history", h.authMW.RequireAuth(), h.ListHistory)
		search.POST("/history", h.authMW.RequireAuth(), h.AddToHistory)
		search.DELETE("/history", h.authMW.RequireAuth(), h.ClearHistory)

		search.GET("/recent", h.authMW.RequireAuth(), h.ListRecentViews)
		search.POST("/track-view", h.authMW.RequireAuth(), h.TrackView)
		search.DELETE("/recent", h.authMW.RequireAuth(), h.ClearRecentViews)

		search.GET("/favorites", h.authMW.RequireAuth(), h.ListFavorites)
		search.POST("/favorites", h.authMW.RequireAuth(), h.AddFavorite)
		search.DELETE("/favorites/:id", h.authMW.RequireAuth(), h.RemoveFavorite)
		search.GET("/favorites/check", h.authMW.RequireAuth(), h.CheckFavorite)
	}
}

// Search performs a global search
func (h *SearchHandler) Search(c *gin.Context) {
	var req models.SearchRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		response.BadRequest(c, "Invalid search query", map[string]string{
			"error": err.Error(),
		})
		return
	}

	// Get user ID if authenticated (for highlight search)
	if userID, ok := middleware.GetUserID(c); ok {
		req.UserID = &userID
	}

	results, err := h.searchService.Search(c.Request.Context(), &req)
	if err != nil {
		response.InternalError(c)
		return
	}

	response.OK(c, results)
}

// ListHistory returns search history for the authenticated user
func (h *SearchHandler) ListHistory(c *gin.Context) {
	userID := getUserID(c)
	if userID == nil {
		response.Unauthorized(c, "Authentication required")
		return
	}

	var req models.SearchHistoryRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		response.BadRequest(c, "Invalid request", map[string]string{
			"error": err.Error(),
		})
		return
	}
	req.SetDefaults()

	history, err := h.searchService.GetHistory(c.Request.Context(), *userID, req.Limit)
	if err != nil {
		response.InternalError(c)
		return
	}

	response.OK(c, models.SearchHistoryResponse{
		History: history,
	})
}

// AddToHistory adds a search query to history
func (h *SearchHandler) AddToHistory(c *gin.Context) {
	userID := getUserID(c)
	if userID == nil {
		response.Unauthorized(c, "Authentication required")
		return
	}

	var req models.AddToHistoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request", map[string]string{
			"error": err.Error(),
		})
		return
	}

	if req.Mode == "" {
		req.Mode = models.SearchModeKeyword
	}

	if err := h.searchService.AddToHistory(c.Request.Context(), *userID, req.Query, req.Mode, req.ResultCount); err != nil {
		response.InternalError(c)
		return
	}

	response.OK(c, gin.H{"added": true})
}

// ClearHistory clears search history for the authenticated user
func (h *SearchHandler) ClearHistory(c *gin.Context) {
	userID := getUserID(c)
	if userID == nil {
		response.Unauthorized(c, "Authentication required")
		return
	}

	if err := h.searchService.ClearHistory(c.Request.Context(), *userID); err != nil {
		response.InternalError(c)
		return
	}

	response.NoContent(c)
}

// ListRecentViews returns recently viewed content
func (h *SearchHandler) ListRecentViews(c *gin.Context) {
	userID := getUserID(c)
	if userID == nil {
		response.Unauthorized(c, "Authentication required")
		return
	}

	var req models.RecentViewsRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		response.BadRequest(c, "Invalid request", map[string]string{
			"error": err.Error(),
		})
		return
	}
	req.SetDefaults()

	views, err := h.searchService.GetRecentViews(c.Request.Context(), *userID, req.Limit)
	if err != nil {
		response.InternalError(c)
		return
	}

	response.OK(c, models.RecentViewsResponse{
		Recent: views,
	})
}

// TrackView records a content view
func (h *SearchHandler) TrackView(c *gin.Context) {
	userID := getUserID(c)
	if userID == nil {
		response.Unauthorized(c, "Authentication required")
		return
	}

	var req models.TrackViewRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request", map[string]string{
			"error": err.Error(),
		})
		return
	}

	if err := h.searchService.TrackView(c.Request.Context(), *userID, req.ContentType, req.ContentID, req.Title, req.URL); err != nil {
		response.InternalError(c)
		return
	}

	response.OK(c, gin.H{"tracked": true})
}

// ClearRecentViews clears recent views for the authenticated user
func (h *SearchHandler) ClearRecentViews(c *gin.Context) {
	userID := getUserID(c)
	if userID == nil {
		response.Unauthorized(c, "Authentication required")
		return
	}

	if err := h.searchService.ClearRecentViews(c.Request.Context(), *userID); err != nil {
		response.InternalError(c)
		return
	}

	response.NoContent(c)
}

// ListFavorites returns favorites for the authenticated user
func (h *SearchHandler) ListFavorites(c *gin.Context) {
	userID := getUserID(c)
	if userID == nil {
		response.Unauthorized(c, "Authentication required")
		return
	}

	var req models.FavoritesRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		response.BadRequest(c, "Invalid request", map[string]string{
			"error": err.Error(),
		})
		return
	}
	req.SetDefaults()

	favorites, err := h.searchService.GetFavorites(c.Request.Context(), *userID, req.Limit)
	if err != nil {
		response.InternalError(c)
		return
	}

	// Convert to response format with details
	result := make([]models.FavoriteWithDetails, len(favorites))
	for i, f := range favorites {
		result[i] = models.FavoriteWithDetails{
			ID:          f.ID,
			ContentType: f.ContentType,
			ContentID:   f.ContentID,
			Title:       getTitleForContent(f.ContentType, f.ContentID),
			URL:         getURLForContent(f.ContentType, f.ContentID),
			CreatedAt:   f.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		}
	}

	response.OK(c, models.FavoritesResponse{
		Favorites: result,
	})
}

// AddFavorite adds a content item to favorites
func (h *SearchHandler) AddFavorite(c *gin.Context) {
	userID := getUserID(c)
	if userID == nil {
		response.Unauthorized(c, "Authentication required")
		return
	}

	var req models.AddFavoriteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request", map[string]string{
			"error": err.Error(),
		})
		return
	}

	favorite, err := h.searchService.AddFavorite(c.Request.Context(), *userID, req.ContentType, req.ContentID)
	if err != nil {
		response.InternalError(c)
		return
	}

	response.Created(c, models.AddFavoriteResponse{
		ID:          favorite.ID,
		ContentType: favorite.ContentType,
		ContentID:   favorite.ContentID,
		CreatedAt:   favorite.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
	})
}

// RemoveFavorite removes a favorite
func (h *SearchHandler) RemoveFavorite(c *gin.Context) {
	userID := getUserID(c)
	if userID == nil {
		response.Unauthorized(c, "Authentication required")
		return
	}

	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.BadRequest(c, "Invalid favorite ID", nil)
		return
	}

	if err := h.searchService.RemoveFavorite(c.Request.Context(), id, *userID); err != nil {
		response.NotFound(c, "Favorite")
		return
	}

	response.NoContent(c)
}

// CheckFavorite checks if content is favorited
func (h *SearchHandler) CheckFavorite(c *gin.Context) {
	userID := getUserID(c)
	if userID == nil {
		response.Unauthorized(c, "Authentication required")
		return
	}

	contentType := c.Query("contentType")
	contentID := c.Query("contentId")

	if contentType == "" || contentID == "" {
		response.BadRequest(c, "contentType and contentId are required", nil)
		return
	}

	isFavorite, err := h.searchService.IsFavorite(c.Request.Context(), *userID, contentType, contentID)
	if err != nil {
		response.InternalError(c)
		return
	}

	response.OK(c, gin.H{"isFavorite": isFavorite})
}

// getUserID extracts user ID from context
func getUserID(c *gin.Context) *uuid.UUID {
	if userID, ok := middleware.GetUserID(c); ok {
		return &userID
	}
	return nil
}

// getTitleForContent generates a title for content based on type and ID
func getTitleForContent(contentType, contentID string) string {
	// This is a fallback - ideally the client provides the title when favoriting
	switch contentType {
	case models.ContentTypePattern:
		return formatPatternID(contentID)
	case models.ContentTypeQuestion:
		return formatProblemSlug(contentID)
	default:
		return contentID
	}
}

// getURLForContent generates a URL for content based on type and ID
func getURLForContent(contentType, contentID string) string {
	switch contentType {
	case models.ContentTypePattern:
		return "/patterns/" + contentID
	case models.ContentTypeQuestion:
		return "/problems/" + contentID
	case models.ContentTypeConcept:
		return "/concepts/" + contentID
	case models.ContentTypeArticle:
		return "/articles/" + contentID
	case models.ContentTypeSolution:
		return "/solutions/" + contentID
	default:
		return "/"
	}
}

// formatPatternID formats a pattern ID into a readable title
func formatPatternID(id string) string {
	// Convert "two-pointers" to "Two Pointers"
	result := ""
	capitalizeNext := true
	for _, c := range id {
		if c == '-' {
			result += " "
			capitalizeNext = true
		} else if capitalizeNext {
			if c >= 'a' && c <= 'z' {
				result += string(c - 32)
			} else {
				result += string(c)
			}
			capitalizeNext = false
		} else {
			result += string(c)
		}
	}
	return result
}

// formatProblemSlug formats a problem slug into a readable title
func formatProblemSlug(slug string) string {
	return formatPatternID(slug)
}
