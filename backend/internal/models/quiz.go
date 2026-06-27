package models

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

type QuestionType string

const (
	QuestionTypeMultipleChoice QuestionType = "multiple-choice"
	QuestionTypeTrueFalse      QuestionType = "true-false"
	QuestionTypeCodeOutput     QuestionType = "code-output"
	QuestionTypeFillBlank      QuestionType = "fill-blank"
	QuestionTypeIdentifyBug    QuestionType = "identify-bug"
	QuestionTypeCodeTrace      QuestionType = "code-trace"
	QuestionTypeOrdering       QuestionType = "ordering"
)

func (t QuestionType) IsValid() bool {
	switch t {
	case QuestionTypeMultipleChoice, QuestionTypeTrueFalse, QuestionTypeCodeOutput,
		QuestionTypeFillBlank, QuestionTypeIdentifyBug, QuestionTypeCodeTrace, QuestionTypeOrdering:
		return true
	}
	return false
}

type QuestionDifficulty string

const (
	QuestionDifficultyEasy   QuestionDifficulty = "easy"
	QuestionDifficultyMedium QuestionDifficulty = "medium"
	QuestionDifficultyHard   QuestionDifficulty = "hard"
)

func (d QuestionDifficulty) IsValid() bool {
	switch d {
	case QuestionDifficultyEasy, QuestionDifficultyMedium, QuestionDifficultyHard:
		return true
	}
	return false
}

type AttemptStatus string

const (
	AttemptStatusInProgress AttemptStatus = "in_progress"
	AttemptStatusCompleted  AttemptStatus = "completed"
	AttemptStatusAbandoned  AttemptStatus = "abandoned"
)

// QuizQuestion represents a quiz question in the database
type QuizQuestion struct {
	ID                uuid.UUID          `json:"id" db:"id"`
	PatternID         string             `json:"patternId" db:"pattern_id"`
	SectionSlug       *string            `json:"sectionSlug,omitempty" db:"section_slug"`
	QuestionType      QuestionType       `json:"type" db:"question_type"`
	Difficulty        QuestionDifficulty `json:"difficulty" db:"difficulty"`
	QuestionText      string             `json:"questionText" db:"question_text"`
	CodeSnippet       *string            `json:"codeSnippet,omitempty" db:"code_snippet"`
	Options           json.RawMessage    `json:"options,omitempty" db:"options"`
	CorrectAnswer     json.RawMessage    `json:"-" db:"correct_answer"`
	AcceptableAnswers json.RawMessage    `json:"-" db:"acceptable_answers"`
	Explanation       string             `json:"-" db:"explanation"`
	DisplayOrder      int                `json:"displayOrder" db:"display_order"`
	IsActive          bool               `json:"-" db:"is_active"`
	CreatedAt         time.Time          `json:"-" db:"created_at"`
	UpdatedAt         time.Time          `json:"-" db:"updated_at"`
}

// QuizQuestionWithAnswer includes the answer fields (for response after submission)
type QuizQuestionWithAnswer struct {
	QuizQuestion
	CorrectAnswer     json.RawMessage `json:"correctAnswer"`
	AcceptableAnswers json.RawMessage `json:"acceptableAnswers,omitempty"`
	Explanation       string          `json:"explanation"`
}

// QuizAttempt represents a quiz session
type QuizAttempt struct {
	ID               uuid.UUID     `json:"id" db:"id"`
	UserID           *uuid.UUID    `json:"userId,omitempty" db:"user_id"`
	PatternID        string        `json:"patternId" db:"pattern_id"`
	SectionSlug      *string       `json:"sectionSlug,omitempty" db:"section_slug"`
	TotalQuestions   int           `json:"totalQuestions" db:"total_questions"`
	CorrectCount     int           `json:"correctCount" db:"correct_count"`
	ScorePercentage  *float64      `json:"scorePercentage,omitempty" db:"score_percentage"`
	StartedAt        time.Time     `json:"startedAt" db:"started_at"`
	CompletedAt      *time.Time    `json:"completedAt,omitempty" db:"completed_at"`
	TimeTakenSeconds *int          `json:"timeTakenSeconds,omitempty" db:"time_taken_seconds"`
	Status           AttemptStatus `json:"status" db:"status"`
	CreatedAt        time.Time     `json:"-" db:"created_at"`
}

// QuizResponse represents a user's answer to a single question
type QuizResponse struct {
	ID             uuid.UUID       `json:"id" db:"id"`
	AttemptID      uuid.UUID       `json:"attemptId" db:"attempt_id"`
	QuestionID     uuid.UUID       `json:"questionId" db:"question_id"`
	SelectedAnswer json.RawMessage `json:"selectedAnswer" db:"selected_answer"`
	IsCorrect      bool            `json:"isCorrect" db:"is_correct"`
	TimeTakenMs    *int            `json:"timeTakenMs,omitempty" db:"time_taken_ms"`
	AnsweredAt     time.Time       `json:"answeredAt" db:"answered_at"`
}

// Request/Response DTOs

type GetQuestionsRequest struct {
	PatternID   string  `form:"pattern_id" binding:"required"`
	SectionSlug *string `form:"section_slug"`
}

type GetQuestionsResponse struct {
	PatternID      string         `json:"patternId"`
	SectionSlug    *string        `json:"sectionSlug,omitempty"`
	TotalQuestions int            `json:"totalQuestions"`
	Questions      []QuizQuestion `json:"questions"`
	IsLimited      bool           `json:"isLimited,omitempty"`
	LimitReason    string         `json:"limitReason,omitempty"`
}

type StartAttemptRequest struct {
	PatternID      string  `json:"patternId" binding:"required,max=50"`
	SectionSlug    *string `json:"sectionSlug,omitempty" binding:"omitempty,max=100"`
	TotalQuestions int     `json:"totalQuestions" binding:"required,min=1,max=100"`
}

type StartAttemptResponse struct {
	AttemptID uuid.UUID `json:"attemptId"`
	StartedAt time.Time `json:"startedAt"`
}

type SubmitResponseRequest struct {
	QuestionID     uuid.UUID       `json:"questionId" binding:"required"`
	SelectedAnswer json.RawMessage `json:"selectedAnswer" binding:"required"`
	TimeTakenMs    *int            `json:"timeTakenMs,omitempty" binding:"omitempty,min=0"`
}

type SubmitResponseResponse struct {
	IsCorrect         bool            `json:"isCorrect"`
	CorrectAnswer     json.RawMessage `json:"correctAnswer"`
	AcceptableAnswers json.RawMessage `json:"acceptableAnswers,omitempty"`
	Explanation       string          `json:"explanation"`
}

type CompleteAttemptRequest struct {
	TimeTakenSeconds *int `json:"timeTakenSeconds,omitempty" binding:"omitempty,min=0"`
}

type CompleteAttemptResponse struct {
	AttemptID        uuid.UUID `json:"attemptId"`
	TotalQuestions   int       `json:"totalQuestions"`
	CorrectCount     int       `json:"correctCount"`
	ScorePercentage  float64   `json:"scorePercentage"`
	TimeTakenSeconds *int      `json:"timeTakenSeconds,omitempty"`
	CompletedAt      time.Time `json:"completedAt"`
}

type AttemptHistoryRequest struct {
	PatternID   *string `form:"pattern_id"`
	SectionSlug *string `form:"section_slug"`
	Limit       int     `form:"limit,default=10"`
	Cursor      *string `form:"cursor"`
}

type AttemptHistoryResponse struct {
	Attempts      []QuizAttempt `json:"attempts"`
	BestScore     *float64      `json:"bestScore,omitempty"`
	TotalAttempts int           `json:"totalAttempts"`
	NextCursor    *string       `json:"nextCursor,omitempty"`
}

// QuestionAnalytics for admin dashboard
type QuestionAnalytics struct {
	QuestionID     uuid.UUID `json:"questionId"`
	TotalAttempts  int       `json:"totalAttempts"`
	CorrectCount   int       `json:"correctCount"`
	CorrectRate    float64   `json:"correctRate"`
	AvgTimeTakenMs *int      `json:"avgTimeTakenMs,omitempty"`
}
