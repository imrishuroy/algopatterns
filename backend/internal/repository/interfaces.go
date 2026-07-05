package repository

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/imrishuroy/algopatterns/internal/models"
)

type HighlightRepositoryInterface interface {
	Create(ctx context.Context, h *models.Highlight) error
	GetByID(ctx context.Context, id, userID uuid.UUID) (*models.Highlight, error)
	GetByContent(ctx context.Context, userID uuid.UUID, contentType, contentID string) ([]models.Highlight, error)
	GetAllByUser(ctx context.Context, userID uuid.UUID, limit int, cursor *time.Time, contentType *string) ([]models.Highlight, int, error)
	Update(ctx context.Context, h *models.Highlight, expectedVersion int) error
	Delete(ctx context.Context, id, userID uuid.UUID) error
	GetChangesSince(ctx context.Context, userID uuid.UUID, since time.Time) ([]models.Highlight, error)
}

type QuizRepositoryInterface interface {
	// Questions
	GetQuestionsByPattern(ctx context.Context, patternID string, sectionSlug *string) ([]models.QuizQuestion, error)
	GetQuestionByID(ctx context.Context, id uuid.UUID) (*models.QuizQuestion, error)

	// Attempts
	CreateAttempt(ctx context.Context, a *models.QuizAttempt) error
	GetAttemptByID(ctx context.Context, id uuid.UUID) (*models.QuizAttempt, error)
	UpdateAttempt(ctx context.Context, a *models.QuizAttempt) error
	GetAttemptsByUser(ctx context.Context, userID uuid.UUID, patternID *string, sectionSlug *string, limit int, cursor *time.Time) ([]models.QuizAttempt, int, error)
	GetBestScore(ctx context.Context, userID uuid.UUID, patternID string, sectionSlug *string) (*float64, error)

	// Responses
	CreateResponse(ctx context.Context, resp *models.QuizResponse) error
	GetResponsesByAttempt(ctx context.Context, attemptID uuid.UUID) ([]models.QuizResponse, error)
	CountCorrectResponses(ctx context.Context, attemptID uuid.UUID) (int, error)
}

type OAuthRepositoryInterface interface {
	CreateProvider(ctx context.Context, provider *models.OAuthProvider) error
	GetByProviderID(ctx context.Context, provider string, providerUserID string) (*models.OAuthProvider, error)
	GetUserProviders(ctx context.Context, userID uuid.UUID) ([]*models.OAuthProvider, error)
	GetUserProvider(ctx context.Context, userID uuid.UUID, provider string) (*models.OAuthProvider, error)
	DeleteProvider(ctx context.Context, userID uuid.UUID, provider string) error
	CreateState(ctx context.Context, state *models.OAuthState) error
	GetState(ctx context.Context, state string) (*models.OAuthState, error)
	DeleteState(ctx context.Context, state string) error
	CleanupExpiredStates(ctx context.Context) (int64, error)
}

type SessionRepositoryInterface interface {
	Create(ctx context.Context, session *models.Session) error
	GetByTokenHash(ctx context.Context, tokenHash string) (*models.Session, error)
	GetByID(ctx context.Context, id uuid.UUID) (*models.Session, error)
	GetUserSessions(ctx context.Context, userID uuid.UUID) ([]*models.Session, error)
	UpdateLastUsed(ctx context.Context, id uuid.UUID) error
	Revoke(ctx context.Context, id uuid.UUID, reason string) error
	RevokeByTokenHash(ctx context.Context, tokenHash string, reason string) error
	RevokeAllUserSessions(ctx context.Context, userID uuid.UUID, reason string) (int64, error)
	CleanupExpired(ctx context.Context) (int64, error)
}

type SearchRepositoryInterface interface {
	// Search history
	AddSearchHistory(ctx context.Context, h *models.SearchHistory) error
	GetSearchHistory(ctx context.Context, userID uuid.UUID, limit int) ([]models.SearchHistory, error)
	ClearSearchHistory(ctx context.Context, userID uuid.UUID) error

	// Recent views
	UpsertRecentView(ctx context.Context, view *models.UserRecentView) error
	GetRecentViews(ctx context.Context, userID uuid.UUID, limit int) ([]models.UserRecentView, error)
	ClearRecentViews(ctx context.Context, userID uuid.UUID) error

	// Favorites
	AddFavorite(ctx context.Context, f *models.UserFavorite) error
	GetFavorites(ctx context.Context, userID uuid.UUID, limit int) ([]models.UserFavorite, error)
	GetFavorite(ctx context.Context, userID uuid.UUID, contentType, contentID string) (*models.UserFavorite, error)
	DeleteFavorite(ctx context.Context, id, userID uuid.UUID) error
	IsFavorite(ctx context.Context, userID uuid.UUID, contentType, contentID string) (bool, error)

	// Full-text search
	SearchPatterns(ctx context.Context, query string, limit int) ([]models.PatternSearchResult, error)
	SearchProblems(ctx context.Context, query string, limit int) ([]models.ProblemSearchResult, error)
	SearchHighlights(ctx context.Context, query string, userID uuid.UUID, limit int) ([]models.HighlightSearchResult, error)

	// Prefix search (for autocomplete)
	SearchPatternsPrefix(ctx context.Context, query string, limit int) ([]models.PatternSearchResult, error)
	SearchProblemsPrefix(ctx context.Context, query string, limit int) ([]models.ProblemSearchResult, error)
}
