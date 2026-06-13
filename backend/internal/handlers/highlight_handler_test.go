package handlers

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/imrishuroy/algopatterns/internal/middleware"
	"github.com/imrishuroy/algopatterns/internal/models"
	"github.com/imrishuroy/algopatterns/internal/repository"
	"github.com/imrishuroy/algopatterns/internal/services"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

type MockHighlightService struct {
	mock.Mock
}

// MockPaymentRepository for FeatureAccess tests
type MockPaymentRepository struct {
	mock.Mock
}

func (m *MockPaymentRepository) GetActiveSubscriptionByUserID(ctx context.Context, userID string) (*models.Subscription, error) {
	args := m.Called(ctx, userID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.Subscription), args.Error(1)
}

func (m *MockPaymentRepository) GetPlanByID(ctx context.Context, id string) (*models.SubscriptionPlan, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.SubscriptionPlan), args.Error(1)
}

func (m *MockHighlightService) Create(ctx context.Context, userID uuid.UUID, req *models.CreateHighlightRequest) (*models.Highlight, error) {
	args := m.Called(ctx, userID, req)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.Highlight), args.Error(1)
}

func (m *MockHighlightService) GetByID(ctx context.Context, id, userID uuid.UUID) (*models.Highlight, error) {
	args := m.Called(ctx, id, userID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.Highlight), args.Error(1)
}

func (m *MockHighlightService) GetByContent(ctx context.Context, userID uuid.UUID, contentType, contentID string) ([]models.Highlight, error) {
	args := m.Called(ctx, userID, contentType, contentID)
	return args.Get(0).([]models.Highlight), args.Error(1)
}

func (m *MockHighlightService) GetAllByUser(ctx context.Context, userID uuid.UUID, limit int, cursor *time.Time, contentType *string) (*models.HighlightListResponse, error) {
	args := m.Called(ctx, userID, limit, cursor, contentType)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.HighlightListResponse), args.Error(1)
}

func (m *MockHighlightService) Update(ctx context.Context, id, userID uuid.UUID, req *models.UpdateHighlightRequest) (*models.Highlight, error) {
	args := m.Called(ctx, id, userID, req)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.Highlight), args.Error(1)
}

func (m *MockHighlightService) Delete(ctx context.Context, id, userID uuid.UUID) error {
	args := m.Called(ctx, id, userID)
	return args.Error(0)
}

func (m *MockHighlightService) BatchSync(ctx context.Context, userID uuid.UUID, req *models.BatchSyncRequest) (*models.BatchSyncResponse, error) {
	args := m.Called(ctx, userID, req)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.BatchSyncResponse), args.Error(1)
}

func setupTestRouter(mockService *MockHighlightService, userID uuid.UUID) *gin.Engine {
	return setupTestRouterWithFeatureAccess(mockService, userID, true)
}

func setupTestRouterWithFeatureAccess(mockService *MockHighlightService, userID uuid.UUID, hasHighlightingAccess bool) *gin.Engine {
	gin.SetMode(gin.TestMode)
	router := gin.New()

	// Create mock payment repository for feature access
	mockPaymentRepo := new(MockPaymentRepository)

	if hasHighlightingAccess {
		// Setup mock to return a pro subscription with highlighting access
		mockPaymentRepo.On("GetActiveSubscriptionByUserID", mock.Anything, userID.String()).Return(&models.Subscription{
			ID:     "sub-123",
			UserID: userID.String(),
			PlanID: "pro_monthly",
			Status: models.SubscriptionStatusActive,
		}, nil)
		mockPaymentRepo.On("GetPlanByID", mock.Anything, "pro_monthly").Return(&models.SubscriptionPlan{
			ID: "pro_monthly",
			Features: models.PlanFeatures{
				HasHighlighting: true,
			},
		}, nil)
	} else {
		// No subscription = free user
		mockPaymentRepo.On("GetActiveSubscriptionByUserID", mock.Anything, userID.String()).Return(nil, repository.ErrSubscriptionNotFound)
	}

	featureAccess := services.NewFeatureAccessWithRepo(mockPaymentRepo)
	handler := &HighlightHandler{service: mockService, featureAccess: featureAccess}

	highlights := router.Group("/api/v1/highlights")
	highlights.Use(func(c *gin.Context) {
		c.Set(middleware.ContextUserID, userID)
		c.Next()
	})
	{
		highlights.POST("", handler.Create)
		highlights.POST("/sync", handler.BatchSync)
		highlights.GET("", handler.List)
		highlights.GET("/:id", handler.ShowByID)
		highlights.GET("/content/:contentType/:contentId", handler.ShowByContent)
		highlights.PATCH("/:id", handler.Update)
		highlights.DELETE("/:id", handler.Delete)
	}

	return router
}

func TestHandler_Create_Success(t *testing.T) {
	mockService := new(MockHighlightService)
	userID := uuid.New()
	router := setupTestRouter(mockService, userID)

	reqBody := models.CreateHighlightRequest{
		ContentType:  "pattern_code",
		ContentID:    "sliding-window:python",
		StartOffset:  10,
		EndOffset:    50,
		SelectedText: "for i in range(n):",
		Color:        "yellow",
	}

	created := &models.Highlight{
		ID:           uuid.New(),
		UserID:       userID,
		ContentType:  reqBody.ContentType,
		ContentID:    reqBody.ContentID,
		StartOffset:  reqBody.StartOffset,
		EndOffset:    reqBody.EndOffset,
		SelectedText: reqBody.SelectedText,
		Color:        reqBody.Color,
		Version:      1,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	mockService.On("Create", mock.Anything, userID, mock.AnythingOfType("*models.CreateHighlightRequest")).Return(created, nil)

	body, _ := json.Marshal(reqBody)
	req, _ := http.NewRequest("POST", "/api/v1/highlights", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusCreated, w.Code)

	var resp map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &resp)
	assert.True(t, resp["success"].(bool))
	mockService.AssertExpectations(t)
}

func TestHandler_Create_InvalidColor(t *testing.T) {
	mockService := new(MockHighlightService)
	userID := uuid.New()
	router := setupTestRouter(mockService, userID)

	mockService.On("Create", mock.Anything, userID, mock.AnythingOfType("*models.CreateHighlightRequest")).Return(nil, services.ErrInvalidColor)

	reqBody := `{"contentType":"pattern_code","contentId":"test","startOffset":0,"endOffset":10,"selectedText":"test","color":"yellow"}`
	req, _ := http.NewRequest("POST", "/api/v1/highlights", bytes.NewBufferString(reqBody))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
	mockService.AssertExpectations(t)
}

func TestHandler_Create_Conflict(t *testing.T) {
	mockService := new(MockHighlightService)
	userID := uuid.New()
	router := setupTestRouter(mockService, userID)

	mockService.On("Create", mock.Anything, userID, mock.AnythingOfType("*models.CreateHighlightRequest")).Return(nil, services.ErrHighlightExists)

	reqBody := `{"contentType":"pattern_code","contentId":"test","startOffset":0,"endOffset":10,"selectedText":"test","color":"yellow"}`
	req, _ := http.NewRequest("POST", "/api/v1/highlights", bytes.NewBufferString(reqBody))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusConflict, w.Code)
	mockService.AssertExpectations(t)
}

func TestHandler_GetByID_Success(t *testing.T) {
	mockService := new(MockHighlightService)
	userID := uuid.New()
	highlightID := uuid.New()
	router := setupTestRouter(mockService, userID)

	highlight := &models.Highlight{
		ID:          highlightID,
		UserID:      userID,
		ContentType: "pattern_code",
		Color:       "blue",
		Version:     1,
	}

	mockService.On("GetByID", mock.Anything, highlightID, userID).Return(highlight, nil)

	req, _ := http.NewRequest("GET", "/api/v1/highlights/"+highlightID.String(), nil)

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	mockService.AssertExpectations(t)
}

func TestHandler_GetByID_NotFound(t *testing.T) {
	mockService := new(MockHighlightService)
	userID := uuid.New()
	highlightID := uuid.New()
	router := setupTestRouter(mockService, userID)

	mockService.On("GetByID", mock.Anything, highlightID, userID).Return(nil, services.ErrHighlightNotFound)

	req, _ := http.NewRequest("GET", "/api/v1/highlights/"+highlightID.String(), nil)

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusNotFound, w.Code)
	mockService.AssertExpectations(t)
}

func TestHandler_GetByID_InvalidID(t *testing.T) {
	mockService := new(MockHighlightService)
	userID := uuid.New()
	router := setupTestRouter(mockService, userID)

	req, _ := http.NewRequest("GET", "/api/v1/highlights/invalid-uuid", nil)

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestHandler_GetByContent_Success(t *testing.T) {
	mockService := new(MockHighlightService)
	userID := uuid.New()
	router := setupTestRouter(mockService, userID)

	highlights := []models.Highlight{
		{ID: uuid.New(), UserID: userID, Color: "yellow"},
		{ID: uuid.New(), UserID: userID, Color: "blue"},
	}

	mockService.On("GetByContent", mock.Anything, userID, "pattern_code", "sliding-window:python").Return(highlights, nil)

	req, _ := http.NewRequest("GET", "/api/v1/highlights/content/pattern_code/sliding-window:python", nil)

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var resp map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &resp)
	data := resp["data"].(map[string]interface{})
	assert.Len(t, data["highlights"], 2)
	mockService.AssertExpectations(t)
}

func TestHandler_List_Success(t *testing.T) {
	mockService := new(MockHighlightService)
	userID := uuid.New()
	router := setupTestRouter(mockService, userID)

	response := &models.HighlightListResponse{
		Highlights: []models.Highlight{
			{ID: uuid.New(), UserID: userID, Color: "yellow"},
		},
		TotalCount: 1,
	}

	mockService.On("GetAllByUser", mock.Anything, userID, 20, (*time.Time)(nil), (*string)(nil)).Return(response, nil)

	req, _ := http.NewRequest("GET", "/api/v1/highlights", nil)

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	mockService.AssertExpectations(t)
}

func TestHandler_List_WithQueryParams(t *testing.T) {
	mockService := new(MockHighlightService)
	userID := uuid.New()
	router := setupTestRouter(mockService, userID)

	contentType := "pattern_code"
	response := &models.HighlightListResponse{
		Highlights: []models.Highlight{},
		TotalCount: 0,
	}

	mockService.On("GetAllByUser", mock.Anything, userID, 10, (*time.Time)(nil), &contentType).Return(response, nil)

	req, _ := http.NewRequest("GET", "/api/v1/highlights?limit=10&content_type=pattern_code", nil)

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	mockService.AssertExpectations(t)
}

func TestHandler_Update_Success(t *testing.T) {
	mockService := new(MockHighlightService)
	userID := uuid.New()
	highlightID := uuid.New()
	router := setupTestRouter(mockService, userID)

	updated := &models.Highlight{
		ID:      highlightID,
		UserID:  userID,
		Color:   "green",
		Version: 2,
	}

	mockService.On("Update", mock.Anything, highlightID, userID, mock.AnythingOfType("*models.UpdateHighlightRequest")).Return(updated, nil)

	reqBody := `{"color":"green","version":1}`
	req, _ := http.NewRequest("PATCH", "/api/v1/highlights/"+highlightID.String(), bytes.NewBufferString(reqBody))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	mockService.AssertExpectations(t)
}

func TestHandler_Update_VersionConflict(t *testing.T) {
	mockService := new(MockHighlightService)
	userID := uuid.New()
	highlightID := uuid.New()
	router := setupTestRouter(mockService, userID)

	currentHighlight := &models.Highlight{
		ID:      highlightID,
		UserID:  userID,
		Color:   "blue",
		Version: 3,
	}

	mockService.On("Update", mock.Anything, highlightID, userID, mock.AnythingOfType("*models.UpdateHighlightRequest")).Return(nil, services.ErrVersionConflict)
	mockService.On("GetByID", mock.Anything, highlightID, userID).Return(currentHighlight, nil)

	reqBody := `{"color":"green","version":1}`
	req, _ := http.NewRequest("PATCH", "/api/v1/highlights/"+highlightID.String(), bytes.NewBufferString(reqBody))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusConflict, w.Code)

	var resp map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &resp)
	assert.NotNil(t, resp["data"])
	assert.Equal(t, "VERSION_CONFLICT", resp["error"].(map[string]interface{})["code"])
	mockService.AssertExpectations(t)
}

func TestHandler_Update_NotFound(t *testing.T) {
	mockService := new(MockHighlightService)
	userID := uuid.New()
	highlightID := uuid.New()
	router := setupTestRouter(mockService, userID)

	mockService.On("Update", mock.Anything, highlightID, userID, mock.AnythingOfType("*models.UpdateHighlightRequest")).Return(nil, services.ErrHighlightNotFound)

	reqBody := `{"color":"green","version":1}`
	req, _ := http.NewRequest("PATCH", "/api/v1/highlights/"+highlightID.String(), bytes.NewBufferString(reqBody))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusNotFound, w.Code)
	mockService.AssertExpectations(t)
}

func TestHandler_Delete_Success(t *testing.T) {
	mockService := new(MockHighlightService)
	userID := uuid.New()
	highlightID := uuid.New()
	router := setupTestRouter(mockService, userID)

	mockService.On("Delete", mock.Anything, highlightID, userID).Return(nil)

	req, _ := http.NewRequest("DELETE", "/api/v1/highlights/"+highlightID.String(), nil)

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusNoContent, w.Code)
	mockService.AssertExpectations(t)
}

func TestHandler_Delete_NotFound(t *testing.T) {
	mockService := new(MockHighlightService)
	userID := uuid.New()
	highlightID := uuid.New()
	router := setupTestRouter(mockService, userID)

	mockService.On("Delete", mock.Anything, highlightID, userID).Return(services.ErrHighlightNotFound)

	req, _ := http.NewRequest("DELETE", "/api/v1/highlights/"+highlightID.String(), nil)

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusNotFound, w.Code)
	mockService.AssertExpectations(t)
}

func TestHandler_BatchSync_Success(t *testing.T) {
	mockService := new(MockHighlightService)
	userID := uuid.New()
	router := setupTestRouter(mockService, userID)

	response := &models.BatchSyncResponse{
		Results: []models.SyncOperationResult{
			{
				Op:       models.SyncOpCreate,
				ClientID: "client-1",
				Success:  true,
			},
		},
	}

	mockService.On("BatchSync", mock.Anything, userID, mock.AnythingOfType("*models.BatchSyncRequest")).Return(response, nil)

	reqBody := `{"operations":[{"op":"create","clientId":"client-1","data":{"contentType":"pattern_code","contentId":"test","startOffset":0,"endOffset":10,"selectedText":"test","color":"yellow"}}]}`
	req, _ := http.NewRequest("POST", "/api/v1/highlights/sync", bytes.NewBufferString(reqBody))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	mockService.AssertExpectations(t)
}

func TestHandler_BatchSync_EmptyOperations(t *testing.T) {
	mockService := new(MockHighlightService)
	userID := uuid.New()
	router := setupTestRouter(mockService, userID)

	reqBody := `{"operations":[]}`
	req, _ := http.NewRequest("POST", "/api/v1/highlights/sync", bytes.NewBufferString(reqBody))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestHandler_BatchSync_TooManyOperations(t *testing.T) {
	mockService := new(MockHighlightService)
	userID := uuid.New()
	router := setupTestRouter(mockService, userID)

	ops := make([]map[string]interface{}, 51)
	for i := 0; i < 51; i++ {
		ops[i] = map[string]interface{}{
			"op": "delete",
			"id": uuid.New().String(),
		}
	}
	body, _ := json.Marshal(map[string]interface{}{"operations": ops})

	req, _ := http.NewRequest("POST", "/api/v1/highlights/sync", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestHandler_BatchSync_WithLastSyncAt(t *testing.T) {
	mockService := new(MockHighlightService)
	userID := uuid.New()
	router := setupTestRouter(mockService, userID)

	response := &models.BatchSyncResponse{
		Results: []models.SyncOperationResult{
			{Op: models.SyncOpCreate, Success: true},
		},
		ServerChanges: []models.Highlight{
			{ID: uuid.New(), UserID: userID, Color: "pink"},
		},
	}

	mockService.On("BatchSync", mock.Anything, userID, mock.AnythingOfType("*models.BatchSyncRequest")).Return(response, nil)

	reqBody := `{"operations":[{"op":"create","data":{"contentType":"test","contentId":"test","startOffset":0,"endOffset":5,"selectedText":"x","color":"yellow"}}],"lastSyncAt":"2024-01-01T00:00:00Z"}`
	req, _ := http.NewRequest("POST", "/api/v1/highlights/sync", bytes.NewBufferString(reqBody))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var resp map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &resp)
	data := resp["data"].(map[string]interface{})
	assert.NotNil(t, data["serverChanges"])
	mockService.AssertExpectations(t)
}
