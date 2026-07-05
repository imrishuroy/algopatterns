package models

import "github.com/google/uuid"

// SearchRequest represents a search API request
type SearchRequest struct {
	Query  string     `form:"q" binding:"required,min=2,max=200"`
	Mode   string     `form:"mode" binding:"omitempty,oneof=keyword ai"`
	Types  string     `form:"types"` // comma-separated: pattern,question,concept,article,highlight
	Limit  int        `form:"limit" binding:"omitempty,min=1,max=20"`
	UserID *uuid.UUID `json:"-"` // Set from auth middleware
}

// SetDefaults sets default values for search request
func (r *SearchRequest) SetDefaults() {
	if r.Mode == "" {
		r.Mode = SearchModeKeyword
	}
	if r.Types == "" {
		r.Types = "pattern,question"
	}
	if r.Limit == 0 {
		r.Limit = 5
	}
}

// GetTypesList returns the search types as a slice
func (r *SearchRequest) GetTypesList() []string {
	if r.Types == "" {
		return []string{ContentTypePattern, ContentTypeQuestion}
	}

	types := make([]string, 0)
	current := ""
	for _, c := range r.Types {
		if c == ',' {
			if current != "" {
				types = append(types, current)
				current = ""
			}
		} else {
			current += string(c)
		}
	}
	if current != "" {
		types = append(types, current)
	}
	return types
}

// SearchHistoryRequest represents request for search history
type SearchHistoryRequest struct {
	Limit int `form:"limit" binding:"omitempty,min=1,max=50"`
}

// SetDefaults sets default values
func (r *SearchHistoryRequest) SetDefaults() {
	if r.Limit == 0 {
		r.Limit = 10
	}
}

// SearchHistoryResponse represents response for search history
type SearchHistoryResponse struct {
	History []SearchHistory `json:"history"`
}

// AddToHistoryRequest represents request to add search to history
type AddToHistoryRequest struct {
	Query       string `json:"query" binding:"required,min=2,max=200"`
	Mode        string `json:"mode" binding:"omitempty,oneof=keyword ai"`
	ResultCount int    `json:"resultCount" binding:"min=0"`
}

// RecentViewsRequest represents request for recent views
type RecentViewsRequest struct {
	Limit int `form:"limit" binding:"omitempty,min=1,max=50"`
}

// SetDefaults sets default values
func (r *RecentViewsRequest) SetDefaults() {
	if r.Limit == 0 {
		r.Limit = 10
	}
}

// RecentViewsResponse represents response for recent views
type RecentViewsResponse struct {
	Recent []UserRecentView `json:"recent"`
}

// TrackViewRequest represents request to track a content view
type TrackViewRequest struct {
	ContentType string `json:"contentType" binding:"required,oneof=pattern question concept article solution"`
	ContentID   string `json:"contentId" binding:"required,min=1,max=100"`
	Title       string `json:"title" binding:"required,min=1,max=255"`
	URL         string `json:"url" binding:"required,min=1,max=500"`
}

// FavoritesRequest represents request for favorites list
type FavoritesRequest struct {
	Limit int `form:"limit" binding:"omitempty,min=1,max=50"`
}

// SetDefaults sets default values
func (r *FavoritesRequest) SetDefaults() {
	if r.Limit == 0 {
		r.Limit = 20
	}
}

// FavoritesResponse represents response for favorites list
type FavoritesResponse struct {
	Favorites []FavoriteWithDetails `json:"favorites"`
}

// FavoriteWithDetails includes favorite with content details
type FavoriteWithDetails struct {
	ID          uuid.UUID `json:"id"`
	ContentType string    `json:"contentType"`
	ContentID   string    `json:"contentId"`
	Title       string    `json:"title"`
	URL         string    `json:"url"`
	CreatedAt   string    `json:"createdAt"`
}

// AddFavoriteRequest represents request to add a favorite
type AddFavoriteRequest struct {
	ContentType string `json:"contentType" binding:"required,oneof=pattern question concept article solution"`
	ContentID   string `json:"contentId" binding:"required,min=1,max=100"`
}

// AddFavoriteResponse represents response after adding a favorite
type AddFavoriteResponse struct {
	ID          uuid.UUID `json:"id"`
	ContentType string    `json:"contentType"`
	ContentID   string    `json:"contentId"`
	CreatedAt   string    `json:"createdAt"`
}

// Error codes for search
const (
	ErrCodeSearchFailed     = "SEARCH_FAILED"
	ErrCodeInvalidQuery     = "INVALID_QUERY"
	ErrCodeFavoriteExists   = "FAVORITE_EXISTS"
	ErrCodeFavoriteNotFound = "FAVORITE_NOT_FOUND"
)
