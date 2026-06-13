package services

import (
	"context"

	"github.com/google/uuid"
	"github.com/imrishuroy/algopatterns/internal/models"
	"github.com/imrishuroy/algopatterns/internal/repository"
)

type ProblemService struct {
	problemRepo    *repository.ProblemRepository
	submissionRepo *repository.SubmissionRepository
}

func NewProblemService(problemRepo *repository.ProblemRepository, submissionRepo *repository.SubmissionRepository) *ProblemService {
	return &ProblemService{
		problemRepo:    problemRepo,
		submissionRepo: submissionRepo,
	}
}

func (s *ProblemService) Create(ctx context.Context, req *models.CreateProblemRequest) (*models.Problem, error) {
	problem := &models.Problem{
		PatternID:   req.PatternID,
		Title:       req.Title,
		Slug:        req.Slug,
		Difficulty:  req.Difficulty,
		Description: req.Description,
		Constraints: req.Constraints,
		Examples:    req.Examples,
		Hints:       req.Hints,
	}

	if err := s.problemRepo.Create(ctx, problem); err != nil {
		return nil, err
	}

	return problem, nil
}

func (s *ProblemService) GetByID(ctx context.Context, id uuid.UUID) (*models.Problem, error) {
	return s.problemRepo.GetByID(ctx, id)
}

func (s *ProblemService) GetBySlug(ctx context.Context, slug string, userID *uuid.UUID) (*models.ProblemDetailResponse, error) {
	problem, err := s.problemRepo.GetBySlug(ctx, slug)
	if err != nil {
		return nil, err
	}

	sampleTestCases, err := s.problemRepo.GetTestCases(ctx, problem.ID, true)
	if err != nil {
		return nil, err
	}

	templates, err := s.problemRepo.GetTemplates(ctx, problem.ID)
	if err != nil {
		return nil, err
	}

	languages, err := s.problemRepo.GetLanguages(ctx)
	if err != nil {
		return nil, err
	}

	response := &models.ProblemDetailResponse{
		Problem:   *problem,
		TestCases: sampleTestCases,
		Templates: templates,
		Languages: languages,
	}

	if userID != nil {
		solved, _ := s.submissionRepo.HasAcceptedSubmission(ctx, *userID, problem.ID)
		response.UserSolved = solved

		count, _ := s.submissionRepo.CountByProblem(ctx, *userID, problem.ID)
		response.Submissions = count
	}

	return response, nil
}

func (s *ProblemService) List(ctx context.Context, req *models.ProblemListRequest) (*models.ProblemListResponse, error) {
	problems, total, err := s.problemRepo.List(ctx, req)
	if err != nil {
		return nil, err
	}

	if req.Limit <= 0 {
		req.Limit = 20
	}
	totalPages := (total + req.Limit - 1) / req.Limit

	return &models.ProblemListResponse{
		Problems:   problems,
		Total:      total,
		Page:       req.Page,
		Limit:      req.Limit,
		TotalPages: totalPages,
	}, nil
}

func (s *ProblemService) Update(ctx context.Context, id uuid.UUID, req *models.UpdateProblemRequest) (*models.Problem, error) {
	if err := s.problemRepo.Update(ctx, id, req); err != nil {
		return nil, err
	}
	return s.problemRepo.GetByID(ctx, id)
}

func (s *ProblemService) Delete(ctx context.Context, id uuid.UUID) error {
	return s.problemRepo.Delete(ctx, id)
}

func (s *ProblemService) CreateTestCase(ctx context.Context, problemID uuid.UUID, req *models.CreateTestCaseRequest) (*models.TestCase, error) {
	tc := &models.TestCase{
		Input:          req.Input,
		ExpectedOutput: req.ExpectedOutput,
		IsSample:       req.IsSample,
		OrderIndex:     req.OrderIndex,
		Explanation:    req.Explanation,
	}

	if err := s.problemRepo.CreateTestCase(ctx, problemID, tc); err != nil {
		return nil, err
	}

	return tc, nil
}

func (s *ProblemService) GetTestCases(ctx context.Context, problemID uuid.UUID, sampleOnly bool) ([]models.TestCase, error) {
	return s.problemRepo.GetTestCases(ctx, problemID, sampleOnly)
}

func (s *ProblemService) DeleteTestCase(ctx context.Context, id uuid.UUID) error {
	return s.problemRepo.DeleteTestCase(ctx, id)
}

func (s *ProblemService) CreateTemplate(ctx context.Context, problemID uuid.UUID, req *models.CreateProblemTemplateRequest) (*models.ProblemTemplate, error) {
	tmpl := &models.ProblemTemplate{
		LanguageID:   req.LanguageID,
		TemplateCode: req.TemplateCode,
		WrapperCode:  req.WrapperCode,
	}

	if err := s.problemRepo.CreateTemplate(ctx, problemID, tmpl); err != nil {
		return nil, err
	}

	return tmpl, nil
}

func (s *ProblemService) GetTemplates(ctx context.Context, problemID uuid.UUID) ([]models.ProblemTemplateWithLanguage, error) {
	return s.problemRepo.GetTemplates(ctx, problemID)
}

func (s *ProblemService) GetLanguages(ctx context.Context) ([]models.Language, error) {
	return s.problemRepo.GetLanguages(ctx)
}

// GetSolution returns the solution/hints for a problem
func (s *ProblemService) GetSolution(ctx context.Context, slug string) (*models.ProblemSolutionResponse, error) {
	problem, err := s.problemRepo.GetBySlug(ctx, slug)
	if err != nil {
		return nil, err
	}

	return &models.ProblemSolutionResponse{
		ProblemID:   problem.ID,
		Title:       problem.Title,
		Slug:        problem.Slug,
		Hints:       problem.Hints,
		Explanation: problem.Examples,
	}, nil
}
