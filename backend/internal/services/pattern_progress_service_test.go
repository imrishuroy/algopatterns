package services

import (
	"context"
	"errors"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

type MockPatternProgressRepository struct {
	mock.Mock
}

func (m *MockPatternProgressRepository) MarkComplete(ctx context.Context, userID uuid.UUID, patternID string, sectionIndex int) error {
	args := m.Called(ctx, userID, patternID, sectionIndex)
	return args.Error(0)
}

func (m *MockPatternProgressRepository) MarkIncomplete(ctx context.Context, userID uuid.UUID, patternID string, sectionIndex int) error {
	args := m.Called(ctx, userID, patternID, sectionIndex)
	return args.Error(0)
}

func (m *MockPatternProgressRepository) GetByPattern(ctx context.Context, userID uuid.UUID, patternID string) ([]int, error) {
	args := m.Called(ctx, userID, patternID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]int), args.Error(1)
}

func (m *MockPatternProgressRepository) GetAllByUser(ctx context.Context, userID uuid.UUID) (map[string][]int, error) {
	args := m.Called(ctx, userID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(map[string][]int), args.Error(1)
}

func (m *MockPatternProgressRepository) BulkSync(ctx context.Context, userID uuid.UUID, progress map[string][]int) error {
	args := m.Called(ctx, userID, progress)
	return args.Error(0)
}

func (m *MockPatternProgressRepository) BulkMarkComplete(ctx context.Context, userID uuid.UUID, patternID string, sections []int) error {
	args := m.Called(ctx, userID, patternID, sections)
	return args.Error(0)
}

type patternProgressRepoInterface interface {
	MarkComplete(ctx context.Context, userID uuid.UUID, patternID string, sectionIndex int) error
	MarkIncomplete(ctx context.Context, userID uuid.UUID, patternID string, sectionIndex int) error
	GetByPattern(ctx context.Context, userID uuid.UUID, patternID string) ([]int, error)
	GetAllByUser(ctx context.Context, userID uuid.UUID) (map[string][]int, error)
	BulkSync(ctx context.Context, userID uuid.UUID, progress map[string][]int) error
	BulkMarkComplete(ctx context.Context, userID uuid.UUID, patternID string, sections []int) error
}

type testPatternProgressService struct {
	repo patternProgressRepoInterface
}

func newTestPatternProgressService() (*testPatternProgressService, *MockPatternProgressRepository) {
	mockRepo := new(MockPatternProgressRepository)
	service := &testPatternProgressService{repo: mockRepo}
	return service, mockRepo
}

func (s *testPatternProgressService) MarkComplete(ctx context.Context, userID uuid.UUID, patternID string, sectionIndex int) error {
	return s.repo.MarkComplete(ctx, userID, patternID, sectionIndex)
}

func (s *testPatternProgressService) MarkIncomplete(ctx context.Context, userID uuid.UUID, patternID string, sectionIndex int) error {
	return s.repo.MarkIncomplete(ctx, userID, patternID, sectionIndex)
}

func (s *testPatternProgressService) GetByPattern(ctx context.Context, userID uuid.UUID, patternID string) ([]int, error) {
	return s.repo.GetByPattern(ctx, userID, patternID)
}

func (s *testPatternProgressService) GetAllByUser(ctx context.Context, userID uuid.UUID) (map[string][]int, error) {
	return s.repo.GetAllByUser(ctx, userID)
}

func (s *testPatternProgressService) BulkSync(ctx context.Context, userID uuid.UUID, progress map[string][]int) error {
	return s.repo.BulkSync(ctx, userID, progress)
}

func (s *testPatternProgressService) BulkMarkComplete(ctx context.Context, userID uuid.UUID, patternID string, sections []int) error {
	return s.repo.BulkMarkComplete(ctx, userID, patternID, sections)
}

func TestPatternProgressService_MarkComplete_Success(t *testing.T) {
	service, mockRepo := newTestPatternProgressService()
	ctx := context.Background()
	userID := uuid.New()
	patternID := "sliding-window"
	sectionIndex := 2

	mockRepo.On("MarkComplete", ctx, userID, patternID, sectionIndex).Return(nil)

	err := service.MarkComplete(ctx, userID, patternID, sectionIndex)

	assert.NoError(t, err)
	mockRepo.AssertExpectations(t)
}

func TestPatternProgressService_MarkComplete_Error(t *testing.T) {
	service, mockRepo := newTestPatternProgressService()
	ctx := context.Background()
	userID := uuid.New()
	patternID := "sliding-window"
	sectionIndex := 2

	mockRepo.On("MarkComplete", ctx, userID, patternID, sectionIndex).Return(errors.New("db error"))

	err := service.MarkComplete(ctx, userID, patternID, sectionIndex)

	assert.Error(t, err)
	mockRepo.AssertExpectations(t)
}

func TestPatternProgressService_MarkIncomplete_Success(t *testing.T) {
	service, mockRepo := newTestPatternProgressService()
	ctx := context.Background()
	userID := uuid.New()
	patternID := "two-pointers"
	sectionIndex := 1

	mockRepo.On("MarkIncomplete", ctx, userID, patternID, sectionIndex).Return(nil)

	err := service.MarkIncomplete(ctx, userID, patternID, sectionIndex)

	assert.NoError(t, err)
	mockRepo.AssertExpectations(t)
}

func TestPatternProgressService_MarkIncomplete_Error(t *testing.T) {
	service, mockRepo := newTestPatternProgressService()
	ctx := context.Background()
	userID := uuid.New()
	patternID := "two-pointers"
	sectionIndex := 1

	mockRepo.On("MarkIncomplete", ctx, userID, patternID, sectionIndex).Return(errors.New("db error"))

	err := service.MarkIncomplete(ctx, userID, patternID, sectionIndex)

	assert.Error(t, err)
	mockRepo.AssertExpectations(t)
}

func TestPatternProgressService_GetByPattern_Success(t *testing.T) {
	service, mockRepo := newTestPatternProgressService()
	ctx := context.Background()
	userID := uuid.New()
	patternID := "dp-basics"

	expectedSections := []int{0, 1, 3, 5}
	mockRepo.On("GetByPattern", ctx, userID, patternID).Return(expectedSections, nil)

	sections, err := service.GetByPattern(ctx, userID, patternID)

	assert.NoError(t, err)
	assert.Equal(t, expectedSections, sections)
	mockRepo.AssertExpectations(t)
}

func TestPatternProgressService_GetByPattern_Empty(t *testing.T) {
	service, mockRepo := newTestPatternProgressService()
	ctx := context.Background()
	userID := uuid.New()
	patternID := "dp-basics"

	mockRepo.On("GetByPattern", ctx, userID, patternID).Return([]int{}, nil)

	sections, err := service.GetByPattern(ctx, userID, patternID)

	assert.NoError(t, err)
	assert.Empty(t, sections)
	mockRepo.AssertExpectations(t)
}

func TestPatternProgressService_GetByPattern_Error(t *testing.T) {
	service, mockRepo := newTestPatternProgressService()
	ctx := context.Background()
	userID := uuid.New()
	patternID := "dp-basics"

	mockRepo.On("GetByPattern", ctx, userID, patternID).Return(nil, errors.New("db error"))

	sections, err := service.GetByPattern(ctx, userID, patternID)

	assert.Error(t, err)
	assert.Nil(t, sections)
	mockRepo.AssertExpectations(t)
}

func TestPatternProgressService_GetAllByUser_Success(t *testing.T) {
	service, mockRepo := newTestPatternProgressService()
	ctx := context.Background()
	userID := uuid.New()

	expectedProgress := map[string][]int{
		"sliding-window": {0, 1, 2},
		"two-pointers":   {0, 3},
		"dp-basics":      {1, 2, 4},
	}
	mockRepo.On("GetAllByUser", ctx, userID).Return(expectedProgress, nil)

	progress, err := service.GetAllByUser(ctx, userID)

	assert.NoError(t, err)
	assert.Equal(t, expectedProgress, progress)
	mockRepo.AssertExpectations(t)
}

func TestPatternProgressService_GetAllByUser_Empty(t *testing.T) {
	service, mockRepo := newTestPatternProgressService()
	ctx := context.Background()
	userID := uuid.New()

	mockRepo.On("GetAllByUser", ctx, userID).Return(map[string][]int{}, nil)

	progress, err := service.GetAllByUser(ctx, userID)

	assert.NoError(t, err)
	assert.Empty(t, progress)
	mockRepo.AssertExpectations(t)
}

func TestPatternProgressService_GetAllByUser_Error(t *testing.T) {
	service, mockRepo := newTestPatternProgressService()
	ctx := context.Background()
	userID := uuid.New()

	mockRepo.On("GetAllByUser", ctx, userID).Return(nil, errors.New("db error"))

	progress, err := service.GetAllByUser(ctx, userID)

	assert.Error(t, err)
	assert.Nil(t, progress)
	mockRepo.AssertExpectations(t)
}

func TestPatternProgressService_BulkSync_Success(t *testing.T) {
	service, mockRepo := newTestPatternProgressService()
	ctx := context.Background()
	userID := uuid.New()

	progress := map[string][]int{
		"sliding-window": {0, 1, 2},
		"two-pointers":   {0, 3},
	}
	mockRepo.On("BulkSync", ctx, userID, progress).Return(nil)

	err := service.BulkSync(ctx, userID, progress)

	assert.NoError(t, err)
	mockRepo.AssertExpectations(t)
}

func TestPatternProgressService_BulkSync_EmptyProgress(t *testing.T) {
	service, mockRepo := newTestPatternProgressService()
	ctx := context.Background()
	userID := uuid.New()

	progress := map[string][]int{}
	mockRepo.On("BulkSync", ctx, userID, progress).Return(nil)

	err := service.BulkSync(ctx, userID, progress)

	assert.NoError(t, err)
	mockRepo.AssertExpectations(t)
}

func TestPatternProgressService_BulkSync_Error(t *testing.T) {
	service, mockRepo := newTestPatternProgressService()
	ctx := context.Background()
	userID := uuid.New()

	progress := map[string][]int{
		"sliding-window": {0, 1},
	}
	mockRepo.On("BulkSync", ctx, userID, progress).Return(errors.New("transaction failed"))

	err := service.BulkSync(ctx, userID, progress)

	assert.Error(t, err)
	mockRepo.AssertExpectations(t)
}

func TestPatternProgressService_BulkMarkComplete_Success(t *testing.T) {
	service, mockRepo := newTestPatternProgressService()
	ctx := context.Background()
	userID := uuid.New()
	patternID := "dp-basics"
	sections := []int{0, 1, 2, 3}

	mockRepo.On("BulkMarkComplete", ctx, userID, patternID, sections).Return(nil)

	err := service.BulkMarkComplete(ctx, userID, patternID, sections)

	assert.NoError(t, err)
	mockRepo.AssertExpectations(t)
}

func TestPatternProgressService_BulkMarkComplete_Error(t *testing.T) {
	service, mockRepo := newTestPatternProgressService()
	ctx := context.Background()
	userID := uuid.New()
	patternID := "dp-basics"
	sections := []int{0, 1, 2}

	mockRepo.On("BulkMarkComplete", ctx, userID, patternID, sections).Return(errors.New("transaction failed"))

	err := service.BulkMarkComplete(ctx, userID, patternID, sections)

	assert.Error(t, err)
	mockRepo.AssertExpectations(t)
}
