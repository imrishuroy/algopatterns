package handlers

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/imrishuroy/algopatterns/internal/middleware"
	"github.com/imrishuroy/algopatterns/internal/models"
	"github.com/imrishuroy/algopatterns/internal/repository"
	"github.com/imrishuroy/algopatterns/internal/services"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// MockPatternPaymentRepo mocks the payment repository for pattern handler tests
type MockPatternPaymentRepo struct {
	mock.Mock
}

func (m *MockPatternPaymentRepo) GetActiveSubscriptionByUserID(ctx context.Context, userID string) (*models.Subscription, error) {
	args := m.Called(ctx, userID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.Subscription), args.Error(1)
}

func (m *MockPatternPaymentRepo) GetPlanByID(ctx context.Context, id string) (*models.SubscriptionPlan, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.SubscriptionPlan), args.Error(1)
}

type stubPatternService struct {
	createResult    *models.Pattern
	createErr       error
	getByIDResult   *models.Pattern
	getByIDErr      error
	listResult      *models.PatternListResponse
	listErr         error
	updateResult    *models.Pattern
	updateErr       error
	deleteErr       error
	categoriesResult []string
	categoriesErr   error
	bulkImportResult *models.BulkImportResponse
	bulkImportErr   error
	exportResult    []byte
	exportErr       error
	searchResult    []models.Pattern
	searchErr       error
}

func (s *stubPatternService) Create(_ context.Context, _ *models.CreatePatternRequest) (*models.Pattern, error) {
	return s.createResult, s.createErr
}

func (s *stubPatternService) GetByID(_ context.Context, _ string) (*models.Pattern, error) {
	return s.getByIDResult, s.getByIDErr
}

func (s *stubPatternService) List(_ context.Context, _ *models.PatternListRequest) (*models.PatternListResponse, error) {
	return s.listResult, s.listErr
}

func (s *stubPatternService) Update(_ context.Context, _ string, _ *models.UpdatePatternRequest) (*models.Pattern, error) {
	return s.updateResult, s.updateErr
}

func (s *stubPatternService) Delete(_ context.Context, _ string) error {
	return s.deleteErr
}

func (s *stubPatternService) GetCategories(_ context.Context) ([]string, error) {
	return s.categoriesResult, s.categoriesErr
}

func (s *stubPatternService) BulkImport(_ context.Context, _ *models.BulkImportRequest) (*models.BulkImportResponse, error) {
	return s.bulkImportResult, s.bulkImportErr
}

func (s *stubPatternService) Export(_ context.Context) ([]byte, error) {
	return s.exportResult, s.exportErr
}

func (s *stubPatternService) Search(_ context.Context, _ string) ([]models.Pattern, error) {
	return s.searchResult, s.searchErr
}

func setupPatternRouter(stub *stubPatternService) *gin.Engine {
	gin.SetMode(gin.TestMode)
	router := gin.New()

	// Create mock payment repository that grants access to all patterns
	mockPaymentRepo := new(MockPatternPaymentRepo)
	mockPaymentRepo.On("GetActiveSubscriptionByUserID", mock.Anything, mock.Anything).Return(&models.Subscription{
		ID:     "sub-123",
		UserID: "test-user",
		PlanID: "pro_monthly",
		Status: models.SubscriptionStatusActive,
	}, nil)
	mockPaymentRepo.On("GetPlanByID", mock.Anything, "pro_monthly").Return(&models.SubscriptionPlan{
		ID: "pro_monthly",
		Features: models.PlanFeatures{
			MaxPatterns:    -1,
			MaxVisualizers: -1,
		},
	}, nil)

	featureAccess := services.NewFeatureAccessWithRepo(mockPaymentRepo)
	handler := &PatternHandler{service: stub, featureAccess: featureAccess}

	patterns := router.Group("/api/v1/patterns")
	// Add middleware to set a test user for all requests
	testUserID := uuid.MustParse("550e8400-e29b-41d4-a716-446655440000")
	patterns.Use(func(c *gin.Context) {
		c.Set(middleware.ContextUserID, testUserID)
		c.Next()
	})
	{
		patterns.GET("", handler.List)
		patterns.POST("", handler.Create)
		patterns.GET("/categories", handler.ListCategories)
		patterns.GET("/export", handler.Export)
		patterns.POST("/bulk", handler.BulkImport)
		patterns.GET("/search", handler.Search)
		patterns.GET("/:id", handler.ShowByID)
		patterns.PUT("/:id", handler.Update)
		patterns.DELETE("/:id", handler.Delete)
	}

	return router
}

func TestPatternHandler_List_Success(t *testing.T) {
	stub := &stubPatternService{
		listResult: &models.PatternListResponse{
			Patterns: []models.Pattern{
				{ID: "sliding-window", Category: "arrays"},
			},
			Pagination: models.Pagination{TotalItems: 1},
		},
	}
	router := setupPatternRouter(stub)

	req, _ := http.NewRequest("GET", "/api/v1/patterns", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
}

func TestPatternHandler_GetByID_Success(t *testing.T) {
	stub := &stubPatternService{
		getByIDResult: &models.Pattern{
			ID:          "sliding-window",
			Category:    "arrays",
			Description: "Sliding window technique",
		},
	}
	router := setupPatternRouter(stub)

	req, _ := http.NewRequest("GET", "/api/v1/patterns/sliding-window", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
}

func TestPatternHandler_GetByID_NotFound(t *testing.T) {
	stub := &stubPatternService{
		getByIDErr: repository.ErrNotFound,
	}
	router := setupPatternRouter(stub)

	req, _ := http.NewRequest("GET", "/api/v1/patterns/nonexistent", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusNotFound, w.Code)
}

func TestPatternHandler_Create_Success(t *testing.T) {
	stub := &stubPatternService{
		createResult: &models.Pattern{
			ID:          "two-pointers",
			Category:    "arrays",
			Difficulty:  models.DifficultyMedium,
			Description: "Two pointer technique",
		},
	}
	router := setupPatternRouter(stub)

	body := `{
		"id":"two-pointers",
		"category":"arrays",
		"difficulty":"Medium",
		"description":"Two pointer technique",
		"whenToUse":["When you need to find pairs"],
		"codeTemplates":{"javascript":"// code here"},
		"keyInsights":["Use two pointers"],
		"commonProblems":["Two Sum"],
		"timeComplexity":"O(n)",
		"spaceComplexity":"O(1)"
	}`
	req, _ := http.NewRequest("POST", "/api/v1/patterns", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusCreated, w.Code)
}

func TestPatternHandler_Create_Duplicate(t *testing.T) {
	stub := &stubPatternService{
		createErr: repository.ErrDuplicate,
	}
	router := setupPatternRouter(stub)

	body := `{
		"id":"existing",
		"category":"arrays",
		"difficulty":"Easy",
		"description":"test",
		"whenToUse":["test"],
		"codeTemplates":{"javascript":"// code"},
		"keyInsights":["insight"],
		"commonProblems":["problem"],
		"timeComplexity":"O(n)",
		"spaceComplexity":"O(1)"
	}`
	req, _ := http.NewRequest("POST", "/api/v1/patterns", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusConflict, w.Code)
}

func TestPatternHandler_Update_Success(t *testing.T) {
	stub := &stubPatternService{
		updateResult: &models.Pattern{
			ID:         "sliding-window",
			Category:   "advanced",
			Difficulty: models.DifficultyHard,
		},
	}
	router := setupPatternRouter(stub)

	body := `{"category":"advanced","difficulty":"Hard"}`
	req, _ := http.NewRequest("PUT", "/api/v1/patterns/sliding-window", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
}

func TestPatternHandler_Update_NotFound(t *testing.T) {
	stub := &stubPatternService{
		updateErr: repository.ErrNotFound,
	}
	router := setupPatternRouter(stub)

	body := `{"category":"advanced"}`
	req, _ := http.NewRequest("PUT", "/api/v1/patterns/nonexistent", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusNotFound, w.Code)
}

func TestPatternHandler_Delete_Success(t *testing.T) {
	stub := &stubPatternService{}
	router := setupPatternRouter(stub)

	req, _ := http.NewRequest("DELETE", "/api/v1/patterns/sliding-window", nil)

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusNoContent, w.Code)
}

func TestPatternHandler_Delete_NotFound(t *testing.T) {
	stub := &stubPatternService{
		deleteErr: repository.ErrNotFound,
	}
	router := setupPatternRouter(stub)

	req, _ := http.NewRequest("DELETE", "/api/v1/patterns/nonexistent", nil)

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusNotFound, w.Code)
}

func TestPatternHandler_GetCategories_Success(t *testing.T) {
	stub := &stubPatternService{
		categoriesResult: []string{"arrays", "trees", "graphs"},
	}
	router := setupPatternRouter(stub)

	req, _ := http.NewRequest("GET", "/api/v1/patterns/categories", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var resp map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &resp)
	data := resp["data"].(map[string]interface{})
	assert.Len(t, data["categories"], 3)
}

func TestPatternHandler_Export_Success(t *testing.T) {
	stub := &stubPatternService{
		exportResult: []byte(`[{"id":"pattern-1"}]`),
	}
	router := setupPatternRouter(stub)

	req, _ := http.NewRequest("GET", "/api/v1/patterns/export", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.Equal(t, "application/json", w.Header().Get("Content-Type"))
	assert.Contains(t, w.Header().Get("Content-Disposition"), "attachment")
}

func TestPatternHandler_BulkImport_Success(t *testing.T) {
	stub := &stubPatternService{
		bulkImportResult: &models.BulkImportResponse{
			Imported: 2,
			Failed:   0,
		},
	}
	router := setupPatternRouter(stub)

	body := `{"patterns":[
		{"id":"p1","category":"arrays","difficulty":"Easy","description":"test","whenToUse":["use"],"codeTemplates":{"javascript":"//"},"keyInsights":["insight"],"commonProblems":["prob"],"timeComplexity":"O(n)","spaceComplexity":"O(1)"},
		{"id":"p2","category":"trees","difficulty":"Medium","description":"test2","whenToUse":["use"],"codeTemplates":{"javascript":"//"},"keyInsights":["insight"],"commonProblems":["prob"],"timeComplexity":"O(n)","spaceComplexity":"O(1)"}
	]}`
	req, _ := http.NewRequest("POST", "/api/v1/patterns/bulk", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
}

func TestPatternHandler_Search_Success(t *testing.T) {
	stub := &stubPatternService{
		searchResult: []models.Pattern{
			{ID: "sliding-window", Description: "Sliding window"},
		},
	}
	router := setupPatternRouter(stub)

	req, _ := http.NewRequest("GET", "/api/v1/patterns/search?q=sliding", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
}

func TestPatternHandler_Search_MissingQuery(t *testing.T) {
	stub := &stubPatternService{}
	router := setupPatternRouter(stub)

	req, _ := http.NewRequest("GET", "/api/v1/patterns/search", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestParseValidationErrors(t *testing.T) {
	errors := parseValidationErrors(assert.AnError)
	assert.Equal(t, "Invalid request body", errors["body"])
}
