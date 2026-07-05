package models

import (
	"time"

	"github.com/google/uuid"
)

// SearchHistory represents a search query made by a user
type SearchHistory struct {
	ID          uuid.UUID  `json:"id" db:"id"`
	UserID      *uuid.UUID `json:"userId,omitempty" db:"user_id"`
	Query       string     `json:"query" db:"query"`
	Mode        string     `json:"mode" db:"mode"`
	ResultCount int        `json:"resultCount" db:"result_count"`
	SessionID   *string    `json:"sessionId,omitempty" db:"session_id"`
	CreatedAt   time.Time  `json:"createdAt" db:"created_at"`
}

// UserFavorite represents a bookmarked content item
type UserFavorite struct {
	ID          uuid.UUID `json:"id" db:"id"`
	UserID      uuid.UUID `json:"userId" db:"user_id"`
	ContentType string    `json:"contentType" db:"content_type"`
	ContentID   string    `json:"contentId" db:"content_id"`
	CreatedAt   time.Time `json:"createdAt" db:"created_at"`
}

// UserRecentView represents recently viewed content
type UserRecentView struct {
	ID           uuid.UUID `json:"id" db:"id"`
	UserID       uuid.UUID `json:"userId" db:"user_id"`
	ContentType  string    `json:"contentType" db:"content_type"`
	ContentID    string    `json:"contentId" db:"content_id"`
	Title        string    `json:"title" db:"title"`
	URL          string    `json:"url" db:"url"`
	ViewCount    int       `json:"viewCount" db:"view_count"`
	LastViewedAt time.Time `json:"lastViewedAt" db:"last_viewed_at"`
}

// SearchResult represents a single search result item
type SearchResult struct {
	ID          string                 `json:"id"`
	Type        string                 `json:"type"`
	Title       string                 `json:"title"`
	Description string                 `json:"description"`
	Difficulty  string                 `json:"difficulty,omitempty"`
	URL         string                 `json:"url"`
	Preview     map[string]interface{} `json:"preview,omitempty"`
	Score       float64                `json:"score"`
}

// SearchResults represents grouped search results
type SearchResults struct {
	Query        string                    `json:"query"`
	Mode         string                    `json:"mode"`
	TotalResults int                       `json:"totalResults"`
	Results      map[string][]SearchResult `json:"results"`
	Suggestions  []string                  `json:"suggestions,omitempty"`
}

// ContentType constants
const (
	ContentTypePattern   = "pattern"
	ContentTypeQuestion  = "question"
	ContentTypeConcept   = "concept"
	ContentTypeArticle   = "article"
	ContentTypeSolution  = "solution"
	ContentTypeHighlight = "highlight"
)

// Search modes
const (
	SearchModeKeyword = "keyword"
	SearchModeAI      = "ai"
)

// PatternSearchResult is used for full-text search results from patterns table
type PatternSearchResult struct {
	ID              string  `db:"id"`
	Category        string  `db:"category"`
	Difficulty      string  `db:"difficulty"`
	Description     string  `db:"description"`
	TimeComplexity  string  `db:"time_complexity"`
	SpaceComplexity string  `db:"space_complexity"`
	SearchRank      float64 `db:"search_rank"`
}

// ProblemSearchResult is used for full-text search results from problems table
type ProblemSearchResult struct {
	ID          uuid.UUID `db:"id"`
	PatternID   *string   `db:"pattern_id"`
	Title       string    `db:"title"`
	Slug        string    `db:"slug"`
	Difficulty  string    `db:"difficulty"`
	Description string    `db:"description"`
	SearchRank  float64   `db:"search_rank"`
}

// HighlightSearchResult is used for search results from user highlights
type HighlightSearchResult struct {
	ID           uuid.UUID `db:"id"`
	ContentType  string    `db:"content_type"`
	ContentID    string    `db:"content_id"`
	SelectedText string    `db:"selected_text"`
	Note         *string   `db:"note"`
	Color        string    `db:"color"`
	SearchRank   float64   `db:"search_rank"`
}
