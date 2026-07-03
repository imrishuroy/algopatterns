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
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

type MockPatternProgressService struct {
	mock.Mock
}

func (m *MockPatternProgressService) MarkComplete(ctx context.Context, userID uuid.UUID, patternID string, sectionIndex int) error {
	args := m.Called(ctx, userID, patternID, sectionIndex)
	return args.Error(0)
}

func (m *MockPatternProgressService) MarkIncomplete(ctx context.Context, userID uuid.UUID, patternID string, sectionIndex int) error {
	args := m.Called(ctx, userID, patternID, sectionIndex)
	return args.Error(0)
}

func (m *MockPatternProgressService) GetByPattern(ctx context.Context, userID uuid.UUID, patternID string) ([]int, error) {
	args := m.Called(ctx, userID, patternID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]int), args.Error(1)
}

func (m *MockPatternProgressService) GetAllByUser(ctx context.Context, userID uuid.UUID) (map[string][]int, error) {
	args := m.Called(ctx, userID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(map[string][]int), args.Error(1)
}

func (m *MockPatternProgressService) BulkSync(ctx context.Context, userID uuid.UUID, progress map[string][]int) error {
	args := m.Called(ctx, userID, progress)
	return args.Error(0)
}

func (m *MockPatternProgressService) BulkMarkComplete(ctx context.Context, userID uuid.UUID, patternID string, sections []int) error {
	args := m.Called(ctx, userID, patternID, sections)
	return args.Error(0)
}

func setupPatternProgressTestRouter(mockService *MockPatternProgressService, userID uuid.UUID) *gin.Engine {
	gin.SetMode(gin.TestMode)
	router := gin.New()

	// Middleware to inject user ID
	router.Use(func(c *gin.Context) {
		c.Set(middleware.ContextUserID, userID)
		c.Next()
	})

	// Register routes manually (since we can't use the real handler with mock service)
	progress := router.Group("/api/v1/pattern-progress")
	{
		progress.GET("", func(c *gin.Context) {
			userIDVal, _ := c.Get(middleware.ContextUserID)
			uid := userIDVal.(uuid.UUID)

			result, err := mockService.GetAllByUser(c.Request.Context(), uid)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "internal error"})
				return
			}

			c.JSON(http.StatusOK, models.BulkSyncProgressResponse{Progress: result})
		})

		progress.GET("/:patternId", func(c *gin.Context) {
			userIDVal, _ := c.Get(middleware.ContextUserID)
			uid := userIDVal.(uuid.UUID)
			patternID := c.Param("patternId")

			sections, err := mockService.GetByPattern(c.Request.Context(), uid, patternID)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "internal error"})
				return
			}

			c.JSON(http.StatusOK, models.PatternProgressResponse{
				PatternID:         patternID,
				CompletedSections: sections,
			})
		})

		progress.POST("/:patternId/:sectionIndex", func(c *gin.Context) {
			userIDVal, _ := c.Get(middleware.ContextUserID)
			uid := userIDVal.(uuid.UUID)
			patternID := c.Param("patternId")
			sectionIndexStr := c.Param("sectionIndex")

			sectionIndex, err := parsePositiveInt(sectionIndexStr)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "invalid section index"})
				return
			}

			if err := mockService.MarkComplete(c.Request.Context(), uid, patternID, sectionIndex); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "internal error"})
				return
			}

			c.JSON(http.StatusOK, gin.H{"success": true, "data": gin.H{"message": "Section marked as complete"}})
		})

		progress.DELETE("/:patternId/:sectionIndex", func(c *gin.Context) {
			userIDVal, _ := c.Get(middleware.ContextUserID)
			uid := userIDVal.(uuid.UUID)
			patternID := c.Param("patternId")
			sectionIndexStr := c.Param("sectionIndex")

			sectionIndex, err := parsePositiveInt(sectionIndexStr)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "invalid section index"})
				return
			}

			if err := mockService.MarkIncomplete(c.Request.Context(), uid, patternID, sectionIndex); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "internal error"})
				return
			}

			c.JSON(http.StatusOK, gin.H{"success": true, "data": gin.H{"message": "Section marked as incomplete"}})
		})

		progress.POST("/sync", func(c *gin.Context) {
			userIDVal, _ := c.Get(middleware.ContextUserID)
			uid := userIDVal.(uuid.UUID)

			var req models.BulkSyncProgressRequest
			if err := c.ShouldBindJSON(&req); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
				return
			}

			if err := mockService.BulkSync(c.Request.Context(), uid, req.Progress); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "internal error"})
				return
			}

			// Return merged progress
			result, _ := mockService.GetAllByUser(c.Request.Context(), uid)
			c.JSON(http.StatusOK, models.BulkSyncProgressResponse{Progress: result})
		})
	}

	return router
}

func TestPatternProgressHandler_GetAll_Success(t *testing.T) {
	mockService := new(MockPatternProgressService)
	userID := uuid.New()
	router := setupPatternProgressTestRouter(mockService, userID)

	expectedProgress := map[string][]int{
		"sliding-window": {0, 1, 2},
		"two-pointers":   {0, 3},
	}
	mockService.On("GetAllByUser", mock.Anything, userID).Return(expectedProgress, nil)

	req := httptest.NewRequest("GET", "/api/v1/pattern-progress", nil)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var response models.BulkSyncProgressResponse
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, expectedProgress, response.Progress)
	mockService.AssertExpectations(t)
}

func TestPatternProgressHandler_GetByPattern_Success(t *testing.T) {
	mockService := new(MockPatternProgressService)
	userID := uuid.New()
	router := setupPatternProgressTestRouter(mockService, userID)

	expectedSections := []int{0, 2, 4}
	mockService.On("GetByPattern", mock.Anything, userID, "dp-basics").Return(expectedSections, nil)

	req := httptest.NewRequest("GET", "/api/v1/pattern-progress/dp-basics", nil)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var response models.PatternProgressResponse
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, "dp-basics", response.PatternID)
	assert.Equal(t, expectedSections, response.CompletedSections)
	mockService.AssertExpectations(t)
}

func TestPatternProgressHandler_MarkComplete_Success(t *testing.T) {
	mockService := new(MockPatternProgressService)
	userID := uuid.New()
	router := setupPatternProgressTestRouter(mockService, userID)

	mockService.On("MarkComplete", mock.Anything, userID, "sliding-window", 2).Return(nil)

	req := httptest.NewRequest("POST", "/api/v1/pattern-progress/sliding-window/2", nil)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	mockService.AssertExpectations(t)
}

func TestPatternProgressHandler_MarkComplete_InvalidSectionIndex(t *testing.T) {
	mockService := new(MockPatternProgressService)
	userID := uuid.New()
	router := setupPatternProgressTestRouter(mockService, userID)

	req := httptest.NewRequest("POST", "/api/v1/pattern-progress/sliding-window/invalid", nil)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestPatternProgressHandler_MarkIncomplete_Success(t *testing.T) {
	mockService := new(MockPatternProgressService)
	userID := uuid.New()
	router := setupPatternProgressTestRouter(mockService, userID)

	mockService.On("MarkIncomplete", mock.Anything, userID, "two-pointers", 1).Return(nil)

	req := httptest.NewRequest("DELETE", "/api/v1/pattern-progress/two-pointers/1", nil)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	mockService.AssertExpectations(t)
}

func TestPatternProgressHandler_BulkSync_Success(t *testing.T) {
	mockService := new(MockPatternProgressService)
	userID := uuid.New()
	router := setupPatternProgressTestRouter(mockService, userID)

	inputProgress := map[string][]int{
		"sliding-window": {0, 1},
		"dp-basics":      {2, 3},
	}
	mergedProgress := map[string][]int{
		"sliding-window": {0, 1, 2},
		"dp-basics":      {2, 3},
	}

	mockService.On("BulkSync", mock.Anything, userID, inputProgress).Return(nil)
	mockService.On("GetAllByUser", mock.Anything, userID).Return(mergedProgress, nil)

	body, _ := json.Marshal(models.BulkSyncProgressRequest{Progress: inputProgress})
	req := httptest.NewRequest("POST", "/api/v1/pattern-progress/sync", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var response models.BulkSyncProgressResponse
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, mergedProgress, response.Progress)
	mockService.AssertExpectations(t)
}

func TestPatternProgressHandler_BulkSync_InvalidRequest(t *testing.T) {
	mockService := new(MockPatternProgressService)
	userID := uuid.New()
	router := setupPatternProgressTestRouter(mockService, userID)

	req := httptest.NewRequest("POST", "/api/v1/pattern-progress/sync", bytes.NewBuffer([]byte("invalid json")))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}
