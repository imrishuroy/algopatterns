package services

import (
	"context"
	"testing"

	"github.com/imrishuroy/algopatterns/internal/models"
	"github.com/imrishuroy/algopatterns/internal/repository"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

type MockPatternRepository struct {
	mock.Mock
}

func (m *MockPatternRepository) Create(ctx context.Context, pattern *models.Pattern) error {
	args := m.Called(ctx, pattern)
	return args.Error(0)
}

func (m *MockPatternRepository) GetByID(ctx context.Context, id string) (*models.Pattern, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.Pattern), args.Error(1)
}

func (m *MockPatternRepository) List(ctx context.Context, req *models.PatternListRequest) ([]models.Pattern, int64, error) {
	args := m.Called(ctx, req)
	return args.Get(0).([]models.Pattern), args.Get(1).(int64), args.Error(2)
}

func (m *MockPatternRepository) Update(ctx context.Context, id string, updates map[string]interface{}) error {
	args := m.Called(ctx, id, updates)
	return args.Error(0)
}

func (m *MockPatternRepository) Delete(ctx context.Context, id string) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func (m *MockPatternRepository) GetCategories(ctx context.Context) ([]string, error) {
	args := m.Called(ctx)
	return args.Get(0).([]string), args.Error(1)
}

func (m *MockPatternRepository) BulkCreate(ctx context.Context, patterns []models.Pattern) (int, []string, error) {
	args := m.Called(ctx, patterns)
	return args.Int(0), args.Get(1).([]string), args.Error(2)
}

func (m *MockPatternRepository) ExportAll(ctx context.Context) ([]byte, error) {
	args := m.Called(ctx)
	return args.Get(0).([]byte), args.Error(1)
}

func TestPatternCreate_Success(t *testing.T) {
	mockRepo := new(MockPatternRepository)
	service := &PatternService{repo: mockRepo}
	ctx := context.Background()

	req := &models.CreatePatternRequest{
		ID:          "two-pointers",
		Category:    "arrays",
		Difficulty:  "medium",
		Description: "Two pointer technique",
	}

	mockRepo.On("Create", ctx, mock.AnythingOfType("*models.Pattern")).Return(nil)

	pattern, err := service.Create(ctx, req)

	assert.NoError(t, err)
	assert.NotNil(t, pattern)
	assert.Equal(t, req.ID, pattern.ID)
	assert.Equal(t, req.Category, pattern.Category)
	mockRepo.AssertExpectations(t)
}

func TestPatternCreate_Duplicate(t *testing.T) {
	mockRepo := new(MockPatternRepository)
	service := &PatternService{repo: mockRepo}
	ctx := context.Background()

	req := &models.CreatePatternRequest{
		ID:         "existing-pattern",
		Category:   "arrays",
		Difficulty: "easy",
	}

	mockRepo.On("Create", ctx, mock.AnythingOfType("*models.Pattern")).Return(repository.ErrDuplicate)

	pattern, err := service.Create(ctx, req)

	assert.Error(t, err)
	assert.Nil(t, pattern)
	mockRepo.AssertExpectations(t)
}

func TestPatternGetByID_Success(t *testing.T) {
	mockRepo := new(MockPatternRepository)
	service := &PatternService{repo: mockRepo}
	ctx := context.Background()

	expected := &models.Pattern{
		ID:          "sliding-window",
		Category:    "arrays",
		Difficulty:  "medium",
		Description: "Sliding window technique",
	}

	mockRepo.On("GetByID", ctx, "sliding-window").Return(expected, nil)

	pattern, err := service.GetByID(ctx, "sliding-window")

	assert.NoError(t, err)
	assert.Equal(t, expected, pattern)
	mockRepo.AssertExpectations(t)
}

func TestPatternGetByID_NotFound(t *testing.T) {
	mockRepo := new(MockPatternRepository)
	service := &PatternService{repo: mockRepo}
	ctx := context.Background()

	mockRepo.On("GetByID", ctx, "nonexistent").Return(nil, repository.ErrNotFound)

	pattern, err := service.GetByID(ctx, "nonexistent")

	assert.Error(t, err)
	assert.True(t, IsNotFound(err))
	assert.Nil(t, pattern)
	mockRepo.AssertExpectations(t)
}

func TestPatternList_Success(t *testing.T) {
	mockRepo := new(MockPatternRepository)
	service := &PatternService{repo: mockRepo}
	ctx := context.Background()

	patterns := []models.Pattern{
		{ID: "pattern-1", Category: "arrays"},
		{ID: "pattern-2", Category: "trees"},
	}

	mockRepo.On("List", ctx, mock.AnythingOfType("*models.PatternListRequest")).Return(patterns, int64(2), nil)

	req := &models.PatternListRequest{Page: 1, PageSize: 10}
	result, err := service.List(ctx, req)

	assert.NoError(t, err)
	assert.Len(t, result.Patterns, 2)
	assert.Equal(t, int64(2), result.Pagination.TotalItems)
	mockRepo.AssertExpectations(t)
}

func TestPatternList_Pagination(t *testing.T) {
	mockRepo := new(MockPatternRepository)
	service := &PatternService{repo: mockRepo}
	ctx := context.Background()

	patterns := make([]models.Pattern, 10)
	for i := 0; i < 10; i++ {
		patterns[i] = models.Pattern{ID: "pattern"}
	}

	mockRepo.On("List", ctx, mock.AnythingOfType("*models.PatternListRequest")).Return(patterns, int64(25), nil)

	req := &models.PatternListRequest{Page: 1, PageSize: 10}
	result, err := service.List(ctx, req)

	assert.NoError(t, err)
	assert.Equal(t, 3, result.Pagination.TotalPages) // 25/10 = 3 pages
	mockRepo.AssertExpectations(t)
}

func TestPatternUpdate_Success(t *testing.T) {
	mockRepo := new(MockPatternRepository)
	service := &PatternService{repo: mockRepo}
	ctx := context.Background()

	existing := &models.Pattern{
		ID:         "sliding-window",
		Category:   "arrays",
		Difficulty: "medium",
	}

	mockRepo.On("GetByID", ctx, "sliding-window").Return(existing, nil)
	mockRepo.On("Update", ctx, "sliding-window", mock.AnythingOfType("map[string]interface {}")).Return(nil)

	newCategory := "advanced"
	req := &models.UpdatePatternRequest{Category: &newCategory}

	pattern, err := service.Update(ctx, "sliding-window", req)

	assert.NoError(t, err)
	assert.Equal(t, newCategory, pattern.Category)
	mockRepo.AssertExpectations(t)
}

func TestPatternUpdate_NotFound(t *testing.T) {
	mockRepo := new(MockPatternRepository)
	service := &PatternService{repo: mockRepo}
	ctx := context.Background()

	mockRepo.On("GetByID", ctx, "nonexistent").Return(nil, repository.ErrNotFound)

	req := &models.UpdatePatternRequest{}
	pattern, err := service.Update(ctx, "nonexistent", req)

	assert.Error(t, err)
	assert.Nil(t, pattern)
	mockRepo.AssertExpectations(t)
}

func TestPatternUpdate_NoChanges(t *testing.T) {
	mockRepo := new(MockPatternRepository)
	service := &PatternService{repo: mockRepo}
	ctx := context.Background()

	existing := &models.Pattern{
		ID:         "sliding-window",
		Category:   "arrays",
		Difficulty: "medium",
	}

	mockRepo.On("GetByID", ctx, "sliding-window").Return(existing, nil)

	req := &models.UpdatePatternRequest{} // No fields to update

	pattern, err := service.Update(ctx, "sliding-window", req)

	assert.NoError(t, err)
	assert.Equal(t, existing, pattern)
	mockRepo.AssertExpectations(t)
}

func TestPatternDelete_Success(t *testing.T) {
	mockRepo := new(MockPatternRepository)
	service := &PatternService{repo: mockRepo}
	ctx := context.Background()

	mockRepo.On("Delete", ctx, "sliding-window").Return(nil)

	err := service.Delete(ctx, "sliding-window")

	assert.NoError(t, err)
	mockRepo.AssertExpectations(t)
}

func TestPatternDelete_NotFound(t *testing.T) {
	mockRepo := new(MockPatternRepository)
	service := &PatternService{repo: mockRepo}
	ctx := context.Background()

	mockRepo.On("Delete", ctx, "nonexistent").Return(repository.ErrNotFound)

	err := service.Delete(ctx, "nonexistent")

	assert.Error(t, err)
	mockRepo.AssertExpectations(t)
}

func TestPatternGetCategories_Success(t *testing.T) {
	mockRepo := new(MockPatternRepository)
	service := &PatternService{repo: mockRepo}
	ctx := context.Background()

	categories := []string{"arrays", "trees", "graphs", "dynamic-programming"}

	mockRepo.On("GetCategories", ctx).Return(categories, nil)

	result, err := service.GetCategories(ctx)

	assert.NoError(t, err)
	assert.Equal(t, categories, result)
	mockRepo.AssertExpectations(t)
}

func TestPatternBulkImport_Success(t *testing.T) {
	mockRepo := new(MockPatternRepository)
	service := &PatternService{repo: mockRepo}
	ctx := context.Background()

	req := &models.BulkImportRequest{
		Patterns: []models.CreatePatternRequest{
			{ID: "pattern-1", Category: "arrays"},
			{ID: "pattern-2", Category: "trees"},
		},
	}

	mockRepo.On("BulkCreate", ctx, mock.AnythingOfType("[]models.Pattern")).Return(2, []string{}, nil)

	result, err := service.BulkImport(ctx, req)

	assert.NoError(t, err)
	assert.Equal(t, 2, result.Imported)
	assert.Equal(t, 0, result.Failed)
	mockRepo.AssertExpectations(t)
}

func TestPatternBulkImport_PartialFailure(t *testing.T) {
	mockRepo := new(MockPatternRepository)
	service := &PatternService{repo: mockRepo}
	ctx := context.Background()

	req := &models.BulkImportRequest{
		Patterns: []models.CreatePatternRequest{
			{ID: "pattern-1", Category: "arrays"},
			{ID: "duplicate", Category: "trees"},
		},
	}

	mockRepo.On("BulkCreate", ctx, mock.AnythingOfType("[]models.Pattern")).Return(1, []string{"duplicate: already exists"}, nil)

	result, err := service.BulkImport(ctx, req)

	assert.NoError(t, err)
	assert.Equal(t, 1, result.Imported)
	assert.Equal(t, 1, result.Failed)
	assert.Len(t, result.Errors, 1)
	mockRepo.AssertExpectations(t)
}

func TestPatternExport_Success(t *testing.T) {
	mockRepo := new(MockPatternRepository)
	service := &PatternService{repo: mockRepo}
	ctx := context.Background()

	exportData := []byte(`[{"id":"pattern-1"},{"id":"pattern-2"}]`)

	mockRepo.On("ExportAll", ctx).Return(exportData, nil)

	result, err := service.Export(ctx)

	assert.NoError(t, err)
	assert.Equal(t, exportData, result)
	mockRepo.AssertExpectations(t)
}

func TestPatternSearch_Success(t *testing.T) {
	mockRepo := new(MockPatternRepository)
	service := &PatternService{repo: mockRepo}
	ctx := context.Background()

	patterns := []models.Pattern{
		{ID: "sliding-window", Description: "Sliding window technique"},
	}

	mockRepo.On("List", ctx, mock.AnythingOfType("*models.PatternListRequest")).Return(patterns, int64(1), nil)

	result, err := service.Search(ctx, "sliding")

	assert.NoError(t, err)
	assert.Len(t, result, 1)
	mockRepo.AssertExpectations(t)
}

func TestIsNotFound(t *testing.T) {
	assert.True(t, IsNotFound(repository.ErrNotFound))
	assert.False(t, IsNotFound(repository.ErrDuplicate))
	assert.False(t, IsNotFound(nil))
}

func TestIsDuplicate(t *testing.T) {
	assert.True(t, IsDuplicate(repository.ErrDuplicate))
	assert.False(t, IsDuplicate(repository.ErrNotFound))
	assert.False(t, IsDuplicate(nil))
}
