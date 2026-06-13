package models

import (
	"time"

	"github.com/google/uuid"
)

type Problem struct {
	ID          uuid.UUID  `json:"id" db:"id"`
	PatternID   *string    `json:"patternId,omitempty" db:"pattern_id"`
	Title       string     `json:"title" db:"title"`
	Slug        string     `json:"slug" db:"slug"`
	Difficulty  Difficulty `json:"difficulty" db:"difficulty"`
	Description string     `json:"description" db:"description"`
	Constraints string     `json:"constraints,omitempty" db:"constraints"`
	Examples    string     `json:"examples,omitempty" db:"examples"`
	Hints       string     `json:"hints,omitempty" db:"hints"`
	CreatedAt   time.Time  `json:"createdAt" db:"created_at"`
	UpdatedAt   time.Time  `json:"updatedAt" db:"updated_at"`
}

type ProblemWithDetails struct {
	Problem
	TestCases []TestCase        `json:"testCases,omitempty"`
	Templates []ProblemTemplate `json:"templates,omitempty"`
}

type TestCase struct {
	ID             uuid.UUID `json:"id" db:"id"`
	ProblemID      uuid.UUID `json:"problemId" db:"problem_id"`
	Input          string    `json:"input" db:"input"`
	ExpectedOutput string    `json:"expectedOutput" db:"expected_output"`
	IsSample       bool      `json:"isSample" db:"is_sample"`
	OrderIndex     int       `json:"orderIndex" db:"order_index"`
	Explanation    *string   `json:"explanation,omitempty" db:"explanation"`
	CreatedAt      time.Time `json:"createdAt" db:"created_at"`
}

type Language struct {
	ID       int    `json:"id" db:"id"`
	Name     string `json:"name" db:"name"`
	Slug     string `json:"slug" db:"slug"`
	Version  string `json:"version,omitempty" db:"version"`
	IsActive bool   `json:"isActive" db:"is_active"`
}

type ProblemTemplate struct {
	ID           uuid.UUID `json:"id" db:"id"`
	ProblemID    uuid.UUID `json:"problemId" db:"problem_id"`
	LanguageID   int       `json:"languageId" db:"language_id"`
	TemplateCode string    `json:"templateCode" db:"template_code"`
	WrapperCode  string    `json:"wrapperCode" db:"wrapper_code"`
	CreatedAt    time.Time `json:"createdAt" db:"created_at"`
}

type ProblemTemplateWithLanguage struct {
	ProblemTemplate
	LanguageName string `json:"languageName" db:"language_name"`
	LanguageSlug string `json:"languageSlug" db:"language_slug"`
}

// Request/Response DTOs

type CreateProblemRequest struct {
	PatternID   *string    `json:"patternId"`
	Title       string     `json:"title" binding:"required,min=3,max=255"`
	Slug        string     `json:"slug" binding:"required,min=3,max=255"`
	Difficulty  Difficulty `json:"difficulty" binding:"required,oneof=Easy Medium Hard"`
	Description string     `json:"description" binding:"required"`
	Constraints string     `json:"constraints"`
	Examples    string     `json:"examples"`
	Hints       string     `json:"hints"`
}

type UpdateProblemRequest struct {
	PatternID   *string    `json:"patternId"`
	Title       string     `json:"title" binding:"omitempty,min=3,max=255"`
	Difficulty  Difficulty `json:"difficulty" binding:"omitempty,oneof=Easy Medium Hard"`
	Description string     `json:"description"`
	Constraints string     `json:"constraints"`
	Examples    string     `json:"examples"`
	Hints       string     `json:"hints"`
}

type CreateTestCaseRequest struct {
	Input          string  `json:"input" binding:"required"`
	ExpectedOutput string  `json:"expectedOutput" binding:"required"`
	IsSample       bool    `json:"isSample"`
	OrderIndex     int     `json:"orderIndex"`
	Explanation    *string `json:"explanation"`
}

type CreateProblemTemplateRequest struct {
	LanguageID   int    `json:"languageId" binding:"required"`
	TemplateCode string `json:"templateCode" binding:"required"`
	WrapperCode  string `json:"wrapperCode" binding:"required"`
}

type ProblemListRequest struct {
	Page       int        `form:"page" binding:"omitempty,min=1"`
	Limit      int        `form:"limit" binding:"omitempty,min=1,max=100"`
	Difficulty Difficulty `form:"difficulty" binding:"omitempty,oneof=Easy Medium Hard"`
	PatternID  string     `form:"patternId"`
	Search     string     `form:"search"`
}

type ProblemListResponse struct {
	Problems   []Problem `json:"problems"`
	Total      int       `json:"total"`
	Page       int       `json:"page"`
	Limit      int       `json:"limit"`
	TotalPages int       `json:"totalPages"`
}

type ProblemDetailResponse struct {
	Problem     Problem                       `json:"problem"`
	TestCases   []TestCase                    `json:"sampleTestCases"`
	Templates   []ProblemTemplateWithLanguage `json:"templates"`
	Languages   []Language                    `json:"languages"`
	UserSolved  bool                          `json:"userSolved"`
	Submissions int                           `json:"userSubmissions"`
}

type ProblemSolutionResponse struct {
	ProblemID   uuid.UUID `json:"problemId"`
	Title       string    `json:"title"`
	Slug        string    `json:"slug"`
	Hints       string    `json:"hints"`
	Explanation string    `json:"explanation"`
}
