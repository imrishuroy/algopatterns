package repository

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/imrishuroy/algopatterns/internal/models"
	"github.com/jackc/pgx/v5"
)

var (
	ErrQuestionNotFound        = errors.New("question not found")
	ErrAttemptNotFound         = errors.New("attempt not found")
	ErrResponseAlreadyExists   = errors.New("response already exists for this question")
	ErrAttemptAlreadyCompleted = errors.New("attempt is already completed")
)

type QuizRepository struct {
	db *Database
}

func NewQuizRepository(db *Database) *QuizRepository {
	return &QuizRepository{db: db}
}

// Questions

func (r *QuizRepository) GetQuestionsByPattern(ctx context.Context, patternID string, sectionSlug *string) ([]models.QuizQuestion, error) {
	var query string
	var args []interface{}

	if sectionSlug != nil {
		query = `
			SELECT id, pattern_id, section_slug, question_type, difficulty,
				question_text, code_snippet, options, correct_answer,
				acceptable_answers, explanation, display_order, is_active,
				created_at, updated_at
			FROM quiz_questions
			WHERE pattern_id = $1 AND section_slug = $2 AND is_active = true
			ORDER BY display_order ASC`
		args = []interface{}{patternID, *sectionSlug}
	} else {
		// No section specified: return ALL questions for this pattern
		query = `
			SELECT id, pattern_id, section_slug, question_type, difficulty,
				question_text, code_snippet, options, correct_answer,
				acceptable_answers, explanation, display_order, is_active,
				created_at, updated_at
			FROM quiz_questions
			WHERE pattern_id = $1 AND is_active = true
			ORDER BY display_order ASC`
		args = []interface{}{patternID}
	}

	rows, err := r.db.Pool.Query(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to query questions: %w", err)
	}
	defer rows.Close()

	var questions []models.QuizQuestion
	for rows.Next() {
		var q models.QuizQuestion
		if err := rows.Scan(
			&q.ID, &q.PatternID, &q.SectionSlug, &q.QuestionType, &q.Difficulty,
			&q.QuestionText, &q.CodeSnippet, &q.Options, &q.CorrectAnswer,
			&q.AcceptableAnswers, &q.Explanation, &q.DisplayOrder, &q.IsActive,
			&q.CreatedAt, &q.UpdatedAt); err != nil {
			return nil, fmt.Errorf("failed to scan question: %w", err)
		}
		questions = append(questions, q)
	}

	if questions == nil {
		questions = []models.QuizQuestion{}
	}
	return questions, nil
}

func (r *QuizRepository) GetQuestionByID(ctx context.Context, id uuid.UUID) (*models.QuizQuestion, error) {
	q := &models.QuizQuestion{}
	err := r.db.Pool.QueryRow(ctx, `
		SELECT id, pattern_id, section_slug, question_type, difficulty,
			question_text, code_snippet, options, correct_answer,
			acceptable_answers, explanation, display_order, is_active,
			created_at, updated_at
		FROM quiz_questions
		WHERE id = $1 AND is_active = true
	`, id).Scan(
		&q.ID, &q.PatternID, &q.SectionSlug, &q.QuestionType, &q.Difficulty,
		&q.QuestionText, &q.CodeSnippet, &q.Options, &q.CorrectAnswer,
		&q.AcceptableAnswers, &q.Explanation, &q.DisplayOrder, &q.IsActive,
		&q.CreatedAt, &q.UpdatedAt)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrQuestionNotFound
		}
		return nil, fmt.Errorf("failed to get question: %w", err)
	}
	return q, nil
}

// Attempts

func (r *QuizRepository) CreateAttempt(ctx context.Context, a *models.QuizAttempt) error {
	now := time.Now()
	a.StartedAt = now
	a.CreatedAt = now
	a.Status = models.AttemptStatusInProgress
	if a.ID == uuid.Nil {
		a.ID = uuid.New()
	}

	_, err := r.db.Pool.Exec(ctx, `
		INSERT INTO quiz_attempts (
			id, user_id, pattern_id, section_slug,
			total_questions, correct_count, score_percentage,
			started_at, completed_at, time_taken_seconds, status, created_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
	`, a.ID, a.UserID, a.PatternID, a.SectionSlug,
		a.TotalQuestions, a.CorrectCount, a.ScorePercentage,
		a.StartedAt, a.CompletedAt, a.TimeTakenSeconds, a.Status, a.CreatedAt)

	if err != nil {
		return fmt.Errorf("failed to create attempt: %w", err)
	}
	return nil
}

func (r *QuizRepository) GetAttemptByID(ctx context.Context, id uuid.UUID) (*models.QuizAttempt, error) {
	a := &models.QuizAttempt{}
	err := r.db.Pool.QueryRow(ctx, `
		SELECT id, user_id, pattern_id, section_slug,
			total_questions, correct_count, score_percentage,
			started_at, completed_at, time_taken_seconds, status, created_at
		FROM quiz_attempts
		WHERE id = $1
	`, id).Scan(
		&a.ID, &a.UserID, &a.PatternID, &a.SectionSlug,
		&a.TotalQuestions, &a.CorrectCount, &a.ScorePercentage,
		&a.StartedAt, &a.CompletedAt, &a.TimeTakenSeconds, &a.Status, &a.CreatedAt)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrAttemptNotFound
		}
		return nil, fmt.Errorf("failed to get attempt: %w", err)
	}
	return a, nil
}

func (r *QuizRepository) UpdateAttempt(ctx context.Context, a *models.QuizAttempt) error {
	_, err := r.db.Pool.Exec(ctx, `
		UPDATE quiz_attempts
		SET correct_count = $1, score_percentage = $2,
			completed_at = $3, time_taken_seconds = $4, status = $5
		WHERE id = $6
	`, a.CorrectCount, a.ScorePercentage, a.CompletedAt,
		a.TimeTakenSeconds, a.Status, a.ID)

	if err != nil {
		return fmt.Errorf("failed to update attempt: %w", err)
	}
	return nil
}

func (r *QuizRepository) GetAttemptsByUser(ctx context.Context, userID uuid.UUID, patternID *string, sectionSlug *string, limit int, cursor *time.Time) ([]models.QuizAttempt, int, error) {
	// Build count query
	countQuery := `SELECT COUNT(*) FROM quiz_attempts WHERE user_id = $1`
	var countArgs []interface{}
	countArgs = append(countArgs, userID)
	argIdx := 2

	if patternID != nil {
		countQuery += fmt.Sprintf(" AND pattern_id = $%d", argIdx)
		countArgs = append(countArgs, *patternID)
		argIdx++
	}
	if sectionSlug != nil {
		countQuery += fmt.Sprintf(" AND section_slug = $%d", argIdx)
		countArgs = append(countArgs, *sectionSlug)
		argIdx++
	}

	var totalCount int
	if err := r.db.Pool.QueryRow(ctx, countQuery, countArgs...).Scan(&totalCount); err != nil {
		return nil, 0, fmt.Errorf("failed to count attempts: %w", err)
	}

	// Build select query
	selectQuery := `
		SELECT id, user_id, pattern_id, section_slug,
			total_questions, correct_count, score_percentage,
			started_at, completed_at, time_taken_seconds, status, created_at
		FROM quiz_attempts
		WHERE user_id = $1`
	var args []interface{}
	args = append(args, userID)
	argIdx = 2

	if patternID != nil {
		selectQuery += fmt.Sprintf(" AND pattern_id = $%d", argIdx)
		args = append(args, *patternID)
		argIdx++
	}
	if sectionSlug != nil {
		selectQuery += fmt.Sprintf(" AND section_slug = $%d", argIdx)
		args = append(args, *sectionSlug)
		argIdx++
	}
	if cursor != nil {
		selectQuery += fmt.Sprintf(" AND created_at < $%d", argIdx)
		args = append(args, *cursor)
		argIdx++
	}

	selectQuery += fmt.Sprintf(" ORDER BY created_at DESC LIMIT $%d", argIdx)
	args = append(args, limit)

	rows, err := r.db.Pool.Query(ctx, selectQuery, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to query attempts: %w", err)
	}
	defer rows.Close()

	var attempts []models.QuizAttempt
	for rows.Next() {
		var a models.QuizAttempt
		if err := rows.Scan(
			&a.ID, &a.UserID, &a.PatternID, &a.SectionSlug,
			&a.TotalQuestions, &a.CorrectCount, &a.ScorePercentage,
			&a.StartedAt, &a.CompletedAt, &a.TimeTakenSeconds, &a.Status, &a.CreatedAt); err != nil {
			return nil, 0, fmt.Errorf("failed to scan attempt: %w", err)
		}
		attempts = append(attempts, a)
	}

	if attempts == nil {
		attempts = []models.QuizAttempt{}
	}
	return attempts, totalCount, nil
}

func (r *QuizRepository) GetBestScore(ctx context.Context, userID uuid.UUID, patternID string, sectionSlug *string) (*float64, error) {
	var query string
	var args []interface{}

	if sectionSlug != nil {
		query = `
			SELECT MAX(score_percentage)
			FROM quiz_attempts
			WHERE user_id = $1 AND pattern_id = $2 AND section_slug = $3
				AND status = 'completed'`
		args = []interface{}{userID, patternID, *sectionSlug}
	} else {
		query = `
			SELECT MAX(score_percentage)
			FROM quiz_attempts
			WHERE user_id = $1 AND pattern_id = $2 AND section_slug IS NULL
				AND status = 'completed'`
		args = []interface{}{userID, patternID}
	}

	var bestScore *float64
	err := r.db.Pool.QueryRow(ctx, query, args...).Scan(&bestScore)
	if err != nil {
		return nil, fmt.Errorf("failed to get best score: %w", err)
	}
	return bestScore, nil
}

// Responses

func (r *QuizRepository) CreateResponse(ctx context.Context, resp *models.QuizResponse) error {
	now := time.Now()
	resp.AnsweredAt = now
	if resp.ID == uuid.Nil {
		resp.ID = uuid.New()
	}

	_, err := r.db.Pool.Exec(ctx, `
		INSERT INTO quiz_responses (
			id, attempt_id, question_id, selected_answer,
			is_correct, time_taken_ms, answered_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7)
	`, resp.ID, resp.AttemptID, resp.QuestionID, resp.SelectedAnswer,
		resp.IsCorrect, resp.TimeTakenMs, resp.AnsweredAt)

	if err != nil {
		if isUniqueViolation(err) {
			return ErrResponseAlreadyExists
		}
		return fmt.Errorf("failed to create response: %w", err)
	}
	return nil
}

func (r *QuizRepository) GetResponsesByAttempt(ctx context.Context, attemptID uuid.UUID) ([]models.QuizResponse, error) {
	rows, err := r.db.Pool.Query(ctx, `
		SELECT id, attempt_id, question_id, selected_answer,
			is_correct, time_taken_ms, answered_at
		FROM quiz_responses
		WHERE attempt_id = $1
		ORDER BY answered_at ASC
	`, attemptID)
	if err != nil {
		return nil, fmt.Errorf("failed to query responses: %w", err)
	}
	defer rows.Close()

	var responses []models.QuizResponse
	for rows.Next() {
		var r models.QuizResponse
		if err := rows.Scan(
			&r.ID, &r.AttemptID, &r.QuestionID, &r.SelectedAnswer,
			&r.IsCorrect, &r.TimeTakenMs, &r.AnsweredAt); err != nil {
			return nil, fmt.Errorf("failed to scan response: %w", err)
		}
		responses = append(responses, r)
	}

	if responses == nil {
		responses = []models.QuizResponse{}
	}
	return responses, nil
}

func (r *QuizRepository) CountCorrectResponses(ctx context.Context, attemptID uuid.UUID) (int, error) {
	var count int
	err := r.db.Pool.QueryRow(ctx, `
		SELECT COUNT(*) FROM quiz_responses
		WHERE attempt_id = $1 AND is_correct = true
	`, attemptID).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("failed to count correct responses: %w", err)
	}
	return count, nil
}

// Helper function
func isUniqueViolation(err error) bool {
	return err != nil && (contains(err.Error(), "duplicate key") || contains(err.Error(), "unique constraint"))
}

func contains(s, substr string) bool {
	return len(s) >= len(substr) && (s == substr || len(s) > 0 && containsHelper(s, substr))
}

func containsHelper(s, substr string) bool {
	for i := 0; i <= len(s)-len(substr); i++ {
		if s[i:i+len(substr)] == substr {
			return true
		}
	}
	return false
}
