package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/imrishuroy/algopatterns/internal/config"
	"github.com/imrishuroy/algopatterns/internal/middleware"
	"github.com/imrishuroy/algopatterns/internal/models"
	"github.com/imrishuroy/algopatterns/internal/repository"
	"github.com/imrishuroy/algopatterns/internal/services"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

type stubQuizService struct {
	getQuestionsResult *models.GetQuestionsResponse
	getQuestionsErr    error
	getQuestionsCalls  int
	lastPatternID      string
	lastSectionSlug    *string

	startAttemptResult *models.StartAttemptResponse
	startAttemptErr    error
	lastStartUserID    *uuid.UUID

	historyResult *models.AttemptHistoryResponse
	historyErr    error
}

func (s *stubQuizService) GetQuestions(_ context.Context, patternID string, sectionSlug *string) (*models.GetQuestionsResponse, error) {
	s.getQuestionsCalls++
	s.lastPatternID = patternID
	s.lastSectionSlug = sectionSlug
	return s.getQuestionsResult, s.getQuestionsErr
}

func (s *stubQuizService) StartAttempt(_ context.Context, userID *uuid.UUID, _ *models.StartAttemptRequest) (*models.StartAttemptResponse, error) {
	s.lastStartUserID = userID
	return s.startAttemptResult, s.startAttemptErr
}

func (s *stubQuizService) SubmitResponse(_ context.Context, _ uuid.UUID, _ *uuid.UUID, _ *models.SubmitResponseRequest) (*models.SubmitResponseResponse, error) {
	return nil, nil
}

func (s *stubQuizService) CompleteAttempt(_ context.Context, _ uuid.UUID, _ *uuid.UUID, _ *models.CompleteAttemptRequest) (*models.CompleteAttemptResponse, error) {
	return nil, nil
}

func (s *stubQuizService) GetAttemptHistory(_ context.Context, _ uuid.UUID, _ *models.AttemptHistoryRequest) (*models.AttemptHistoryResponse, error) {
	return s.historyResult, s.historyErr
}

func (s *stubQuizService) GetAttemptByID(_ context.Context, _ uuid.UUID, _ *uuid.UUID) (*models.QuizAttempt, error) {
	return nil, nil
}

func makeQuizQuestions(patternID string, n int) []models.QuizQuestion {
	questions := make([]models.QuizQuestion, n)
	for i := 0; i < n; i++ {
		questions[i] = models.QuizQuestion{
			ID:           uuid.New(),
			PatternID:    patternID,
			QuestionType: models.QuestionTypeMultipleChoice,
			Difficulty:   models.QuestionDifficultyEasy,
			QuestionText: "Question " + string(rune('A'+i)),
			DisplayOrder: i + 1,
			IsActive:     true,
		}
	}
	return questions
}

func quizAuthService() *services.AuthService {
	return services.NewAuthService(nil, nil, &config.AuthConfig{
		JWTSecret:           uuid.NewString(),
		AccessTokenDuration: 15 * time.Minute,
	})
}

func issueAccessToken(t *testing.T, auth *services.AuthService, userID uuid.UUID) string {
	t.Helper()
	token, _, err := auth.GenerateAccessToken(&models.User{
		ID:    userID,
		Email: "quiz-user@example.com",
	})
	require.NoError(t, err)
	return token
}

// setupQuizRouter registers real quiz routes (including OptionalAuth) with the given
// payment repo behavior for free vs pro feature checks.
func setupQuizRouter(stub *stubQuizService, paymentRepo services.FeatureAccessRepository) *gin.Engine {
	gin.SetMode(gin.TestMode)
	router := gin.New()

	authMW := middleware.NewAuthMiddleware(quizAuthService())
	featureAccess := services.NewFeatureAccessWithRepo(paymentRepo)
	handler := NewQuizHandler(stub, featureAccess, authMW)
	handler.RegisterRoutes(router.Group("/api/v1"))
	return router
}

func freePaymentRepo() *MockPaymentRepository {
	repo := new(MockPaymentRepository)
	// Empty userID (anonymous) and any free user → no subscription
	repo.On("GetActiveSubscriptionByUserID", mock.Anything, mock.Anything).
		Return(nil, repository.ErrSubscriptionNotFound)
	return repo
}

func proPaymentRepo(userID string) *MockPaymentRepository {
	repo := new(MockPaymentRepository)
	repo.On("GetActiveSubscriptionByUserID", mock.Anything, userID).Return(&models.Subscription{
		ID:     "sub-pro",
		UserID: userID,
		PlanID: "pro_monthly",
		Status: models.SubscriptionStatusActive,
	}, nil)
	// Anonymous / other users fall back to free
	repo.On("GetActiveSubscriptionByUserID", mock.Anything, mock.Anything).
		Return(nil, repository.ErrSubscriptionNotFound)
	repo.On("GetPlanByID", mock.Anything, "pro_monthly").Return(&models.SubscriptionPlan{
		ID: "pro_monthly",
		Features: models.PlanFeatures{
			QuizQuestionsPerPattern: -1,
			HasQuizHistory:          true,
			MaxPatterns:             -1,
			MaxVisualizers:          -1,
		},
	}, nil)
	return repo
}

func freeUserPaymentRepo(userID string) *MockPaymentRepository {
	repo := new(MockPaymentRepository)
	repo.On("GetActiveSubscriptionByUserID", mock.Anything, userID).
		Return(nil, repository.ErrSubscriptionNotFound)
	repo.On("GetActiveSubscriptionByUserID", mock.Anything, mock.Anything).
		Return(nil, repository.ErrSubscriptionNotFound)
	return repo
}

func parseQuizQuestionsResponse(t *testing.T, body []byte) models.GetQuestionsResponse {
	t.Helper()
	var envelope struct {
		Success bool                        `json:"success"`
		Data    models.GetQuestionsResponse `json:"data"`
	}
	require.NoError(t, json.Unmarshal(body, &envelope))
	require.True(t, envelope.Success)
	return envelope.Data
}

func TestListQuestions_Anonymous_LimitsToFreeTier(t *testing.T) {
	questions := makeQuizQuestions("dynamic-programming", 10)
	stub := &stubQuizService{
		getQuestionsResult: &models.GetQuestionsResponse{
			PatternID:      "dynamic-programming",
			TotalQuestions: len(questions),
			Questions:      questions,
		},
	}
	router := setupQuizRouter(stub, freePaymentRepo())

	req := httptest.NewRequest(http.MethodGet, "/api/v1/quiz/questions/dynamic-programming", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	require.Equal(t, http.StatusOK, w.Code)
	data := parseQuizQuestionsResponse(t, w.Body.Bytes())

	assert.Equal(t, "dynamic-programming", data.PatternID)
	assert.Equal(t, 10, data.TotalQuestions, "full catalog size must be preserved")
	assert.Len(t, data.Questions, 3, "free tier returns only first 3 questions")
	assert.True(t, data.IsLimited)
	assert.Equal(t, "Upgrade to Pro to access all quiz questions", data.LimitReason)
	assert.Equal(t, 1, stub.getQuestionsCalls)
	assert.Equal(t, "dynamic-programming", stub.lastPatternID)
}

func TestListQuestions_ProUser_WithBearerToken_ReturnsAll(t *testing.T) {
	userID := uuid.New()
	auth := quizAuthService()
	token := issueAccessToken(t, auth, userID)

	questions := makeQuizQuestions("dynamic-programming", 10)
	stub := &stubQuizService{
		getQuestionsResult: &models.GetQuestionsResponse{
			PatternID:      "dynamic-programming",
			TotalQuestions: len(questions),
			Questions:      questions,
		},
	}

	// Router must use the same JWT secret as token generation
	gin.SetMode(gin.TestMode)
	router := gin.New()
	authMW := middleware.NewAuthMiddleware(auth)
	featureAccess := services.NewFeatureAccessWithRepo(proPaymentRepo(userID.String()))
	handler := NewQuizHandler(stub, featureAccess, authMW)
	handler.RegisterRoutes(router.Group("/api/v1"))

	req := httptest.NewRequest(http.MethodGet, "/api/v1/quiz/questions/dynamic-programming", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	require.Equal(t, http.StatusOK, w.Code)
	data := parseQuizQuestionsResponse(t, w.Body.Bytes())

	assert.Equal(t, 10, data.TotalQuestions)
	assert.Len(t, data.Questions, 10)
	assert.False(t, data.IsLimited)
	assert.Empty(t, data.LimitReason)
}

func TestListQuestions_FreeUser_WithBearerToken_StillLimited(t *testing.T) {
	userID := uuid.New()
	auth := quizAuthService()
	token := issueAccessToken(t, auth, userID)

	questions := makeQuizQuestions("hash-map", 8)
	stub := &stubQuizService{
		getQuestionsResult: &models.GetQuestionsResponse{
			PatternID:      "hash-map",
			TotalQuestions: len(questions),
			Questions:      questions,
		},
	}

	gin.SetMode(gin.TestMode)
	router := gin.New()
	authMW := middleware.NewAuthMiddleware(auth)
	featureAccess := services.NewFeatureAccessWithRepo(freeUserPaymentRepo(userID.String()))
	handler := NewQuizHandler(stub, featureAccess, authMW)
	handler.RegisterRoutes(router.Group("/api/v1"))

	req := httptest.NewRequest(http.MethodGet, "/api/v1/quiz/questions/hash-map", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	require.Equal(t, http.StatusOK, w.Code)
	data := parseQuizQuestionsResponse(t, w.Body.Bytes())

	assert.Equal(t, 8, data.TotalQuestions)
	assert.Len(t, data.Questions, 3)
	assert.True(t, data.IsLimited)
}

func TestListQuestions_DoesNotLimitWhenAtOrBelowFreeCap(t *testing.T) {
	questions := makeQuizQuestions("binary-search", 2)
	stub := &stubQuizService{
		getQuestionsResult: &models.GetQuestionsResponse{
			PatternID:      "binary-search",
			TotalQuestions: 2,
			Questions:      questions,
		},
	}
	router := setupQuizRouter(stub, freePaymentRepo())

	req := httptest.NewRequest(http.MethodGet, "/api/v1/quiz/questions/binary-search", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	require.Equal(t, http.StatusOK, w.Code)
	data := parseQuizQuestionsResponse(t, w.Body.Bytes())

	assert.Equal(t, 2, data.TotalQuestions)
	assert.Len(t, data.Questions, 2)
	assert.False(t, data.IsLimited)
	assert.Empty(t, data.LimitReason)
}

func TestListQuestions_PassesSectionQuery(t *testing.T) {
	stub := &stubQuizService{
		getQuestionsResult: &models.GetQuestionsResponse{
			PatternID:      "trees",
			TotalQuestions: 0,
			Questions:      []models.QuizQuestion{},
		},
	}
	router := setupQuizRouter(stub, freePaymentRepo())

	req := httptest.NewRequest(http.MethodGet, "/api/v1/quiz/questions/trees?section=bfs", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	require.Equal(t, http.StatusOK, w.Code)
	require.NotNil(t, stub.lastSectionSlug)
	assert.Equal(t, "bfs", *stub.lastSectionSlug)
}

func TestListQuestions_ServiceError_Returns500(t *testing.T) {
	stub := &stubQuizService{
		getQuestionsErr: assert.AnError,
	}
	router := setupQuizRouter(stub, freePaymentRepo())

	req := httptest.NewRequest(http.MethodGet, "/api/v1/quiz/questions/dynamic-programming", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusInternalServerError, w.Code)
}

func TestListQuestions_InvalidBearer_StillTreatsAsAnonymous(t *testing.T) {
	questions := makeQuizQuestions("stack", 5)
	stub := &stubQuizService{
		getQuestionsResult: &models.GetQuestionsResponse{
			PatternID:      "stack",
			TotalQuestions: 5,
			Questions:      questions,
		},
	}
	router := setupQuizRouter(stub, freePaymentRepo())

	req := httptest.NewRequest(http.MethodGet, "/api/v1/quiz/questions/stack", nil)
	req.Header.Set("Authorization", "Bearer not-a-valid-jwt")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	// OptionalAuth ignores invalid tokens; free limit still applies
	require.Equal(t, http.StatusOK, w.Code)
	data := parseQuizQuestionsResponse(t, w.Body.Bytes())
	assert.Len(t, data.Questions, 3)
	assert.True(t, data.IsLimited)
	assert.Equal(t, 5, data.TotalQuestions)
}

func TestStartAttempt_OptionalAuth_AssociatesProUser(t *testing.T) {
	userID := uuid.New()
	auth := quizAuthService()
	token := issueAccessToken(t, auth, userID)

	stub := &stubQuizService{
		startAttemptResult: &models.StartAttemptResponse{
			AttemptID: uuid.New(),
			StartedAt: time.Now(),
		},
	}

	gin.SetMode(gin.TestMode)
	router := gin.New()
	authMW := middleware.NewAuthMiddleware(auth)
	featureAccess := services.NewFeatureAccessWithRepo(proPaymentRepo(userID.String()))
	handler := NewQuizHandler(stub, featureAccess, authMW)
	handler.RegisterRoutes(router.Group("/api/v1"))

	body := `{"patternId":"dynamic-programming","totalQuestions":10}`
	req := httptest.NewRequest(http.MethodPost, "/api/v1/quiz/attempts", jsonReader(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	require.Equal(t, http.StatusCreated, w.Code)
	require.NotNil(t, stub.lastStartUserID)
	assert.Equal(t, userID, *stub.lastStartUserID)
}

func TestListAttemptHistory_RequiresAuth(t *testing.T) {
	stub := &stubQuizService{}
	router := setupQuizRouter(stub, freePaymentRepo())

	req := httptest.NewRequest(http.MethodGet, "/api/v1/quiz/attempts", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

func TestListAttemptHistory_FreeUser_Forbidden(t *testing.T) {
	userID := uuid.New()
	auth := quizAuthService()
	token := issueAccessToken(t, auth, userID)

	stub := &stubQuizService{}
	gin.SetMode(gin.TestMode)
	router := gin.New()
	authMW := middleware.NewAuthMiddleware(auth)
	featureAccess := services.NewFeatureAccessWithRepo(freeUserPaymentRepo(userID.String()))
	handler := NewQuizHandler(stub, featureAccess, authMW)
	handler.RegisterRoutes(router.Group("/api/v1"))

	req := httptest.NewRequest(http.MethodGet, "/api/v1/quiz/attempts", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusForbidden, w.Code)
}

func TestListAttemptHistory_ProUser_OK(t *testing.T) {
	userID := uuid.New()
	auth := quizAuthService()
	token := issueAccessToken(t, auth, userID)

	stub := &stubQuizService{
		historyResult: &models.AttemptHistoryResponse{
			Attempts:      []models.QuizAttempt{},
			TotalAttempts: 0,
		},
	}
	gin.SetMode(gin.TestMode)
	router := gin.New()
	authMW := middleware.NewAuthMiddleware(auth)
	featureAccess := services.NewFeatureAccessWithRepo(proPaymentRepo(userID.String()))
	handler := NewQuizHandler(stub, featureAccess, authMW)
	handler.RegisterRoutes(router.Group("/api/v1"))

	req := httptest.NewRequest(http.MethodGet, "/api/v1/quiz/attempts", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	require.Equal(t, http.StatusOK, w.Code)
}

// jsonReader is a small helper so tests avoid importing bytes when only body strings are needed.
func jsonReader(s string) *jsonStringReader {
	return &jsonStringReader{s: s}
}

type jsonStringReader struct {
	s string
	i int
}

func (r *jsonStringReader) Read(p []byte) (int, error) {
	if r.i >= len(r.s) {
		return 0, jsonEOF
	}
	n := copy(p, r.s[r.i:])
	r.i += n
	return n, nil
}

var jsonEOF = errEOF{}

type errEOF struct{}

func (errEOF) Error() string { return "EOF" }
