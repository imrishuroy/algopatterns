package services

import (
	"context"

	"github.com/google/uuid"
	"github.com/imrishuroy/algopatterns/internal/repository"
)

type PatternProgressService struct {
	repo *repository.PatternProgressRepository
}

func NewPatternProgressService(repo *repository.PatternProgressRepository) *PatternProgressService {
	return &PatternProgressService{repo: repo}
}

func (s *PatternProgressService) MarkComplete(ctx context.Context, userID uuid.UUID, patternID string, sectionIndex int) error {
	return s.repo.MarkComplete(ctx, userID, patternID, sectionIndex)
}

func (s *PatternProgressService) MarkIncomplete(ctx context.Context, userID uuid.UUID, patternID string, sectionIndex int) error {
	return s.repo.MarkIncomplete(ctx, userID, patternID, sectionIndex)
}

func (s *PatternProgressService) GetByPattern(ctx context.Context, userID uuid.UUID, patternID string) ([]int, error) {
	return s.repo.GetByPattern(ctx, userID, patternID)
}

func (s *PatternProgressService) GetAllByUser(ctx context.Context, userID uuid.UUID) (map[string][]int, error) {
	return s.repo.GetAllByUser(ctx, userID)
}

func (s *PatternProgressService) BulkSync(ctx context.Context, userID uuid.UUID, progress map[string][]int) error {
	return s.repo.BulkSync(ctx, userID, progress)
}

func (s *PatternProgressService) BulkMarkComplete(ctx context.Context, userID uuid.UUID, patternID string, sections []int) error {
	return s.repo.BulkMarkComplete(ctx, userID, patternID, sections)
}
