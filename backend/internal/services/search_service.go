package services

import (
	"context"
	"fmt"
	"sync"

	"github.com/google/uuid"
	"github.com/imrishuroy/algopatterns/internal/models"
	"github.com/imrishuroy/algopatterns/internal/repository"
)

// SearchService handles search-related business logic
type SearchService struct {
	searchRepo repository.SearchRepositoryInterface
}

// NewSearchService creates a new search service
func NewSearchService(searchRepo repository.SearchRepositoryInterface) *SearchService {
	return &SearchService{
		searchRepo: searchRepo,
	}
}

// Search performs a search across multiple content types
func (s *SearchService) Search(ctx context.Context, req *models.SearchRequest) (*models.SearchResults, error) {
	req.SetDefaults()

	results := &models.SearchResults{
		Query:        req.Query,
		Mode:         req.Mode,
		Results:      make(map[string][]models.SearchResult),
		TotalResults: 0,
	}

	types := req.GetTypesList()

	var wg sync.WaitGroup
	var mu sync.Mutex
	errChan := make(chan error, len(types))

	for _, contentType := range types {
		wg.Add(1)
		go func(ct string) {
			defer wg.Done()

			var items []models.SearchResult
			var err error

			switch ct {
			case models.ContentTypePattern:
				items, err = s.searchPatterns(ctx, req.Query, req.Limit)
			case models.ContentTypeQuestion:
				items, err = s.searchProblems(ctx, req.Query, req.Limit)
			case models.ContentTypeHighlight:
				if req.UserID != nil {
					items, err = s.searchHighlights(ctx, req.Query, *req.UserID, req.Limit)
				}
			default:
				// Unknown type, skip
				return
			}

			if err != nil {
				errChan <- fmt.Errorf("search %s: %w", ct, err)
				return
			}

			if len(items) > 0 {
				mu.Lock()
				results.Results[ct] = items
				results.TotalResults += len(items)
				mu.Unlock()
			}
		}(contentType)
	}

	wg.Wait()
	close(errChan)

	// Collect any errors (log them but don't fail the entire search)
	for err := range errChan {
		// In production, log these errors
		_ = err
	}

	// Generate search suggestions
	results.Suggestions = s.generateSuggestions(req.Query)

	return results, nil
}

// searchPatterns searches patterns and converts to SearchResult
func (s *SearchService) searchPatterns(ctx context.Context, query string, limit int) ([]models.SearchResult, error) {
	// Use full-text search for longer queries, prefix search for short ones
	var patterns []models.PatternSearchResult
	var err error

	if len(query) < 3 {
		patterns, err = s.searchRepo.SearchPatternsPrefix(ctx, query, limit)
	} else {
		patterns, err = s.searchRepo.SearchPatterns(ctx, query, limit)
		// If no full-text results, fall back to prefix search
		if err == nil && len(patterns) == 0 {
			patterns, err = s.searchRepo.SearchPatternsPrefix(ctx, query, limit)
		}
	}

	if err != nil {
		return nil, err
	}

	results := make([]models.SearchResult, len(patterns))
	for i, p := range patterns {
		results[i] = models.SearchResult{
			ID:          p.ID,
			Type:        models.ContentTypePattern,
			Title:       p.Category,
			Description: truncateString(p.Description, 200),
			Difficulty:  p.Difficulty,
			URL:         fmt.Sprintf("/patterns/%s", p.ID),
			Preview: map[string]interface{}{
				"timeComplexity":  p.TimeComplexity,
				"spaceComplexity": p.SpaceComplexity,
				"category":        p.Category,
			},
			Score: p.SearchRank,
		}
	}

	return results, nil
}

// searchProblems searches problems and converts to SearchResult
func (s *SearchService) searchProblems(ctx context.Context, query string, limit int) ([]models.SearchResult, error) {
	var problems []models.ProblemSearchResult
	var err error

	if len(query) < 3 {
		problems, err = s.searchRepo.SearchProblemsPrefix(ctx, query, limit)
	} else {
		problems, err = s.searchRepo.SearchProblems(ctx, query, limit)
		// If no full-text results, fall back to prefix search
		if err == nil && len(problems) == 0 {
			problems, err = s.searchRepo.SearchProblemsPrefix(ctx, query, limit)
		}
	}

	if err != nil {
		return nil, err
	}

	results := make([]models.SearchResult, len(problems))
	for i, p := range problems {
		results[i] = models.SearchResult{
			ID:          p.ID.String(),
			Type:        models.ContentTypeQuestion,
			Title:       p.Title,
			Description: truncateString(p.Description, 200),
			Difficulty:  p.Difficulty,
			URL:         fmt.Sprintf("/problems/%s", p.Slug),
			Preview: map[string]interface{}{
				"slug":      p.Slug,
				"patternId": p.PatternID,
			},
			Score: p.SearchRank,
		}
	}

	return results, nil
}

// searchHighlights searches user highlights and converts to SearchResult
func (s *SearchService) searchHighlights(ctx context.Context, query string, userID uuid.UUID, limit int) ([]models.SearchResult, error) {
	highlights, err := s.searchRepo.SearchHighlights(ctx, query, userID, limit)
	if err != nil {
		return nil, err
	}

	results := make([]models.SearchResult, len(highlights))
	for i, h := range highlights {
		description := truncateString(h.SelectedText, 150)
		if h.Note != nil && *h.Note != "" {
			description = fmt.Sprintf("%s — %s", description, truncateString(*h.Note, 50))
		}

		results[i] = models.SearchResult{
			ID:          h.ID.String(),
			Type:        models.ContentTypeHighlight,
			Title:       fmt.Sprintf("Highlight in %s", h.ContentType),
			Description: description,
			URL:         fmt.Sprintf("/patterns/%s#highlight-%s", h.ContentID, h.ID.String()),
			Preview: map[string]interface{}{
				"contentType": h.ContentType,
				"contentId":   h.ContentID,
				"color":       h.Color,
				"text":        truncateString(h.SelectedText, 100),
			},
			Score: h.SearchRank,
		}
	}

	return results, nil
}

// generateSuggestions generates search suggestions based on the query
func (s *SearchService) generateSuggestions(query string) []string {
	// Common DSA-related suggestions based on query patterns
	suggestions := []string{}

	commonTerms := map[string][]string{
		"two":    {"two pointers", "two sum"},
		"binary": {"binary search", "binary tree"},
		"linked": {"linked list", "linked list cycle"},
		"tree":   {"binary tree", "tree traversal", "tree dfs"},
		"graph":  {"graph bfs", "graph dfs", "graph shortest path"},
		"dp":     {"dynamic programming", "dp memoization"},
		"stack":  {"stack", "monotonic stack"},
		"queue":  {"queue", "priority queue"},
		"array":  {"array", "subarray sum"},
		"string": {"string manipulation", "string matching"},
		"hash":   {"hash map", "hash set"},
		"sort":   {"sorting", "merge sort", "quick sort"},
		"slide":  {"sliding window"},
		"window": {"sliding window"},
	}

	queryLower := ""
	for _, c := range query {
		if c >= 'A' && c <= 'Z' {
			queryLower += string(c + 32)
		} else {
			queryLower += string(c)
		}
	}

	for prefix, terms := range commonTerms {
		if len(queryLower) >= len(prefix) && queryLower[:len(prefix)] == prefix {
			for _, term := range terms {
				if term != query && len(suggestions) < 3 {
					suggestions = append(suggestions, term)
				}
			}
		}
	}

	return suggestions
}

// Search History Operations

// AddToHistory adds a search query to user history
func (s *SearchService) AddToHistory(ctx context.Context, userID uuid.UUID, query, mode string, resultCount int) error {
	h := &models.SearchHistory{
		UserID:      &userID,
		Query:       query,
		Mode:        mode,
		ResultCount: resultCount,
	}
	return s.searchRepo.AddSearchHistory(ctx, h)
}

// GetHistory returns search history for a user
func (s *SearchService) GetHistory(ctx context.Context, userID uuid.UUID, limit int) ([]models.SearchHistory, error) {
	if limit <= 0 {
		limit = 10
	}
	return s.searchRepo.GetSearchHistory(ctx, userID, limit)
}

// ClearHistory clears search history for a user
func (s *SearchService) ClearHistory(ctx context.Context, userID uuid.UUID) error {
	return s.searchRepo.ClearSearchHistory(ctx, userID)
}

// Recent Views Operations

// TrackView records a content view
func (s *SearchService) TrackView(ctx context.Context, userID uuid.UUID, contentType, contentID, title, url string) error {
	view := &models.UserRecentView{
		UserID:      userID,
		ContentType: contentType,
		ContentID:   contentID,
		Title:       title,
		URL:         url,
	}
	return s.searchRepo.UpsertRecentView(ctx, view)
}

// GetRecentViews returns recently viewed content
func (s *SearchService) GetRecentViews(ctx context.Context, userID uuid.UUID, limit int) ([]models.UserRecentView, error) {
	if limit <= 0 {
		limit = 10
	}
	return s.searchRepo.GetRecentViews(ctx, userID, limit)
}

// ClearRecentViews clears recent views for a user
func (s *SearchService) ClearRecentViews(ctx context.Context, userID uuid.UUID) error {
	return s.searchRepo.ClearRecentViews(ctx, userID)
}

// Favorites Operations

// AddFavorite adds a content item to favorites
func (s *SearchService) AddFavorite(ctx context.Context, userID uuid.UUID, contentType, contentID string) (*models.UserFavorite, error) {
	// Check if already favorited
	exists, err := s.searchRepo.IsFavorite(ctx, userID, contentType, contentID)
	if err != nil {
		return nil, err
	}
	if exists {
		// Return existing favorite
		return s.searchRepo.GetFavorite(ctx, userID, contentType, contentID)
	}

	f := &models.UserFavorite{
		UserID:      userID,
		ContentType: contentType,
		ContentID:   contentID,
	}
	if err := s.searchRepo.AddFavorite(ctx, f); err != nil {
		return nil, err
	}
	return f, nil
}

// GetFavorites returns favorites for a user
func (s *SearchService) GetFavorites(ctx context.Context, userID uuid.UUID, limit int) ([]models.UserFavorite, error) {
	if limit <= 0 {
		limit = 20
	}
	return s.searchRepo.GetFavorites(ctx, userID, limit)
}

// RemoveFavorite removes a favorite
func (s *SearchService) RemoveFavorite(ctx context.Context, id, userID uuid.UUID) error {
	return s.searchRepo.DeleteFavorite(ctx, id, userID)
}

// IsFavorite checks if content is favorited
func (s *SearchService) IsFavorite(ctx context.Context, userID uuid.UUID, contentType, contentID string) (bool, error) {
	return s.searchRepo.IsFavorite(ctx, userID, contentType, contentID)
}

// truncateString truncates a string to maxLen characters, adding ellipsis if needed
func truncateString(s string, maxLen int) string {
	if len(s) <= maxLen {
		return s
	}
	if maxLen <= 3 {
		return s[:maxLen]
	}
	return s[:maxLen-3] + "..."
}
