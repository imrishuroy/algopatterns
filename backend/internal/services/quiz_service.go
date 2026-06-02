package services

import (
	"context"
	"encoding/json"
	"errors"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/imrishuroy/algopatterns/internal/models"
	"github.com/imrishuroy/algopatterns/internal/repository"
)

var (
	ErrQuestionNotFound        = errors.New("question not found")
	ErrAttemptNotFound         = errors.New("attempt not found")
	ErrResponseAlreadyExists   = errors.New("response already exists for this question")
	ErrAttemptAlreadyCompleted = errors.New("attempt is already completed")
	ErrUnauthorizedAttempt     = errors.New("unauthorized access to attempt")
)

type QuizService struct {
	repo repository.QuizRepositoryInterface
}

func NewQuizService(repo repository.QuizRepositoryInterface) *QuizService {
	return &QuizService{repo: repo}
}

// GetQuestions returns all questions for a pattern/section (without answers)
func (s *QuizService) GetQuestions(ctx context.Context, patternID string, sectionSlug *string) (*models.GetQuestionsResponse, error) {
	questions, err := s.repo.GetQuestionsByPattern(ctx, patternID, sectionSlug)
	if err != nil {
		return nil, err
	}

	return &models.GetQuestionsResponse{
		PatternID:      patternID,
		SectionSlug:    sectionSlug,
		TotalQuestions: len(questions),
		Questions:      questions,
	}, nil
}

// StartAttempt creates a new quiz attempt
func (s *QuizService) StartAttempt(ctx context.Context, userID *uuid.UUID, req *models.StartAttemptRequest) (*models.StartAttemptResponse, error) {
	attempt := &models.QuizAttempt{
		UserID:         userID,
		PatternID:      req.PatternID,
		SectionSlug:    req.SectionSlug,
		TotalQuestions: req.TotalQuestions,
		CorrectCount:   0,
		Status:         models.AttemptStatusInProgress,
	}

	if err := s.repo.CreateAttempt(ctx, attempt); err != nil {
		return nil, err
	}

	return &models.StartAttemptResponse{
		AttemptID: attempt.ID,
		StartedAt: attempt.StartedAt,
	}, nil
}

// SubmitResponse validates and stores a user's answer
func (s *QuizService) SubmitResponse(ctx context.Context, attemptID uuid.UUID, userID *uuid.UUID, req *models.SubmitResponseRequest) (*models.SubmitResponseResponse, error) {
	// Verify attempt exists and belongs to user
	attempt, err := s.repo.GetAttemptByID(ctx, attemptID)
	if err != nil {
		if errors.Is(err, repository.ErrAttemptNotFound) {
			return nil, ErrAttemptNotFound
		}
		return nil, err
	}

	// Check ownership (if user is authenticated)
	if userID != nil && attempt.UserID != nil && *attempt.UserID != *userID {
		return nil, ErrUnauthorizedAttempt
	}

	// Check if attempt is still in progress
	if attempt.Status != models.AttemptStatusInProgress {
		return nil, ErrAttemptAlreadyCompleted
	}

	// Get question with correct answer
	question, err := s.repo.GetQuestionByID(ctx, req.QuestionID)
	if err != nil {
		if errors.Is(err, repository.ErrQuestionNotFound) {
			return nil, ErrQuestionNotFound
		}
		return nil, err
	}

	// Validate answer
	isCorrect := s.validateAnswer(question, req.SelectedAnswer)

	// Store response
	response := &models.QuizResponse{
		AttemptID:      attemptID,
		QuestionID:     req.QuestionID,
		SelectedAnswer: req.SelectedAnswer,
		IsCorrect:      isCorrect,
		TimeTakenMs:    req.TimeTakenMs,
	}

	if err := s.repo.CreateResponse(ctx, response); err != nil {
		if errors.Is(err, repository.ErrResponseAlreadyExists) {
			return nil, ErrResponseAlreadyExists
		}
		return nil, err
	}

	return &models.SubmitResponseResponse{
		IsCorrect:         isCorrect,
		CorrectAnswer:     question.CorrectAnswer,
		AcceptableAnswers: question.AcceptableAnswers,
		Explanation:       question.Explanation,
	}, nil
}

// CompleteAttempt marks an attempt as completed and calculates score
func (s *QuizService) CompleteAttempt(ctx context.Context, attemptID uuid.UUID, userID *uuid.UUID, req *models.CompleteAttemptRequest) (*models.CompleteAttemptResponse, error) {
	// Verify attempt exists and belongs to user
	attempt, err := s.repo.GetAttemptByID(ctx, attemptID)
	if err != nil {
		if errors.Is(err, repository.ErrAttemptNotFound) {
			return nil, ErrAttemptNotFound
		}
		return nil, err
	}

	// Check ownership
	if userID != nil && attempt.UserID != nil && *attempt.UserID != *userID {
		return nil, ErrUnauthorizedAttempt
	}

	// Check if already completed
	if attempt.Status == models.AttemptStatusCompleted {
		return nil, ErrAttemptAlreadyCompleted
	}

	// Count correct responses
	correctCount, err := s.repo.CountCorrectResponses(ctx, attemptID)
	if err != nil {
		return nil, err
	}

	// Calculate score
	now := time.Now()
	scorePercentage := float64(correctCount) / float64(attempt.TotalQuestions) * 100

	attempt.CorrectCount = correctCount
	attempt.ScorePercentage = &scorePercentage
	attempt.CompletedAt = &now
	attempt.TimeTakenSeconds = req.TimeTakenSeconds
	attempt.Status = models.AttemptStatusCompleted

	if err := s.repo.UpdateAttempt(ctx, attempt); err != nil {
		return nil, err
	}

	return &models.CompleteAttemptResponse{
		AttemptID:        attempt.ID,
		TotalQuestions:   attempt.TotalQuestions,
		CorrectCount:     correctCount,
		ScorePercentage:  scorePercentage,
		TimeTakenSeconds: attempt.TimeTakenSeconds,
		CompletedAt:      now,
	}, nil
}

// GetAttemptHistory returns user's quiz history
func (s *QuizService) GetAttemptHistory(ctx context.Context, userID uuid.UUID, req *models.AttemptHistoryRequest) (*models.AttemptHistoryResponse, error) {
	limit := req.Limit
	if limit <= 0 || limit > 50 {
		limit = 10
	}

	var cursor *time.Time
	if req.Cursor != nil {
		if parsed, err := time.Parse(time.RFC3339Nano, *req.Cursor); err == nil {
			cursor = &parsed
		}
	}

	attempts, totalCount, err := s.repo.GetAttemptsByUser(ctx, userID, req.PatternID, req.SectionSlug, limit, cursor)
	if err != nil {
		return nil, err
	}

	response := &models.AttemptHistoryResponse{
		Attempts:      attempts,
		TotalAttempts: totalCount,
	}

	// Get best score if filtering by pattern
	if req.PatternID != nil {
		bestScore, err := s.repo.GetBestScore(ctx, userID, *req.PatternID, req.SectionSlug)
		if err == nil {
			response.BestScore = bestScore
		}
	}

	// Set next cursor if there are more results
	if len(attempts) == limit {
		lastCreatedAt := attempts[len(attempts)-1].CreatedAt.Format(time.RFC3339Nano)
		response.NextCursor = &lastCreatedAt
	}

	return response, nil
}

// GetAttemptByID returns a specific attempt
func (s *QuizService) GetAttemptByID(ctx context.Context, attemptID uuid.UUID, userID *uuid.UUID) (*models.QuizAttempt, error) {
	attempt, err := s.repo.GetAttemptByID(ctx, attemptID)
	if err != nil {
		if errors.Is(err, repository.ErrAttemptNotFound) {
			return nil, ErrAttemptNotFound
		}
		return nil, err
	}

	// Check ownership
	if userID != nil && attempt.UserID != nil && *attempt.UserID != *userID {
		return nil, ErrUnauthorizedAttempt
	}

	return attempt, nil
}

// validateAnswer checks if the submitted answer is correct
func (*QuizService) validateAnswer(question *models.QuizQuestion, selectedAnswer json.RawMessage) bool {
	switch question.QuestionType {
	case models.QuestionTypeMultipleChoice, models.QuestionTypeCodeOutput,
		models.QuestionTypeIdentifyBug, models.QuestionTypeCodeTrace:
		return validateIntAnswer(selectedAnswer, question.CorrectAnswer)
	case models.QuestionTypeTrueFalse:
		return validateBoolAnswer(selectedAnswer, question.CorrectAnswer)
	case models.QuestionTypeFillBlank:
		return validateFillBlankAnswer(selectedAnswer, question.CorrectAnswer, question.AcceptableAnswers)
	case models.QuestionTypeOrdering:
		return validateOrderingAnswer(selectedAnswer, question.CorrectAnswer)
	default:
		return false
	}
}

// validateIntAnswer compares answers as integers (index-based questions)
func validateIntAnswer(selectedAnswer, correctAnswer json.RawMessage) bool {
	var selected, correct int
	if err := json.Unmarshal(selectedAnswer, &selected); err != nil {
		return false
	}
	if err := json.Unmarshal(correctAnswer, &correct); err != nil {
		return false
	}
	return selected == correct
}

// validateBoolAnswer compares answers as booleans (true/false questions)
func validateBoolAnswer(selectedAnswer, correctAnswer json.RawMessage) bool {
	var selected, correct bool
	if err := json.Unmarshal(selectedAnswer, &selected); err != nil {
		return false
	}
	if err := json.Unmarshal(correctAnswer, &correct); err != nil {
		return false
	}
	return selected == correct
}

// validateFillBlankAnswer compares string answers case-insensitively with acceptable alternatives
func validateFillBlankAnswer(selectedAnswer, correctAnswer, acceptableAnswers json.RawMessage) bool {
	var selected, correct string
	if err := json.Unmarshal(selectedAnswer, &selected); err != nil {
		return false
	}
	if err := json.Unmarshal(correctAnswer, &correct); err != nil {
		return false
	}

	selected = strings.TrimSpace(strings.ToLower(selected))
	correct = strings.TrimSpace(strings.ToLower(correct))

	if selected == correct {
		return true
	}

	return checkAcceptableAnswers(selected, acceptableAnswers)
}

// checkAcceptableAnswers checks if selected matches any acceptable answer
func checkAcceptableAnswers(selected string, acceptableAnswers json.RawMessage) bool {
	if acceptableAnswers == nil {
		return false
	}
	var acceptable []string
	if err := json.Unmarshal(acceptableAnswers, &acceptable); err != nil {
		return false
	}
	for _, ans := range acceptable {
		if strings.TrimSpace(strings.ToLower(ans)) == selected {
			return true
		}
	}
	return false
}

// validateOrderingAnswer compares answers as integer arrays
func validateOrderingAnswer(selectedAnswer, correctAnswer json.RawMessage) bool {
	var selected, correct []int
	if err := json.Unmarshal(selectedAnswer, &selected); err != nil {
		return false
	}
	if err := json.Unmarshal(correctAnswer, &correct); err != nil {
		return false
	}

	if len(selected) != len(correct) {
		return false
	}
	for i := range selected {
		if selected[i] != correct[i] {
			return false
		}
	}
	return true
}
