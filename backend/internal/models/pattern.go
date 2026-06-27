package models

import (
	"time"

	"github.com/google/uuid"
)

type Difficulty string

const (
	DifficultyEasy       Difficulty = "Easy"
	DifficultyMedium     Difficulty = "Medium"
	DifficultyHard       Difficulty = "Hard"
	DifficultyEasyMedium Difficulty = "Easy-Medium"
	DifficultyMediumHard Difficulty = "Medium-Hard"
)

type CodeTemplates struct {
	JavaScript string `json:"javascript"`
	Java       string `json:"java,omitempty"`
	Python     string `json:"python,omitempty"`
	Cpp        string `json:"cpp,omitempty"`
	Go         string `json:"go,omitempty"`
}

type VariationTemplate struct {
	JavaScript string `json:"javascript,omitempty"`
	Java       string `json:"java,omitempty"`
}

type PatternVariation struct {
	ID       uuid.UUID          `json:"id" db:"id"`
	Name     string             `json:"name" db:"name"`
	Desc     string             `json:"desc" db:"description"`
	When     string             `json:"when,omitempty" db:"when_to_use"`
	Template *VariationTemplate `json:"template,omitempty"`
	Problems []string           `json:"problems,omitempty"`
}

type Pattern struct {
	ID              string             `json:"id" db:"id"`
	Category        string             `json:"category" db:"category"`
	Difficulty      Difficulty         `json:"difficulty" db:"difficulty"`
	Description     string             `json:"description" db:"description"`
	WhenToUse       []string           `json:"whenToUse"`
	CodeTemplates   CodeTemplates      `json:"codeTemplates"`
	KeyInsights     []string           `json:"keyInsights"`
	CommonMistakes  []string           `json:"commonMistakes,omitempty"`
	Variations      []PatternVariation `json:"variations"`
	CommonProblems  []string           `json:"commonProblems"`
	TimeComplexity  string             `json:"timeComplexity" db:"time_complexity"`
	SpaceComplexity string             `json:"spaceComplexity" db:"space_complexity"`
	CreatedAt       time.Time          `json:"createdAt" db:"created_at"`
	UpdatedAt       time.Time          `json:"updatedAt" db:"updated_at"`
}

type PatternDB struct {
	ID              string    `db:"id"`
	Category        string    `db:"category"`
	Difficulty      string    `db:"difficulty"`
	Description     string    `db:"description"`
	TimeComplexity  string    `db:"time_complexity"`
	SpaceComplexity string    `db:"space_complexity"`
	CreatedAt       time.Time `db:"created_at"`
	UpdatedAt       time.Time `db:"updated_at"`
}

type PatternWhenToUse struct {
	ID         uuid.UUID `db:"id"`
	PatternID  string    `db:"pattern_id"`
	UseCase    string    `db:"use_case"`
	OrderIndex int       `db:"order_index"`
}

type PatternCodeTemplate struct {
	ID        uuid.UUID `db:"id"`
	PatternID string    `db:"pattern_id"`
	Language  string    `db:"language"`
	Code      string    `db:"code"`
}

type PatternInsight struct {
	ID         uuid.UUID `db:"id"`
	PatternID  string    `db:"pattern_id"`
	Insight    string    `db:"insight"`
	OrderIndex int       `db:"order_index"`
}

type PatternMistake struct {
	ID         uuid.UUID `db:"id"`
	PatternID  string    `db:"pattern_id"`
	Mistake    string    `db:"mistake"`
	OrderIndex int       `db:"order_index"`
}

type PatternVariationDB struct {
	ID          uuid.UUID `db:"id"`
	PatternID   string    `db:"pattern_id"`
	Name        string    `db:"name"`
	Description string    `db:"description"`
	WhenToUse   string    `db:"when_to_use"`
	OrderIndex  int       `db:"order_index"`
}

type VariationCodeTemplate struct {
	ID          uuid.UUID `db:"id"`
	VariationID uuid.UUID `db:"variation_id"`
	Language    string    `db:"language"`
	Code        string    `db:"code"`
}

type VariationProblem struct {
	ID          uuid.UUID `db:"id"`
	VariationID uuid.UUID `db:"variation_id"`
	ProblemName string    `db:"problem_name"`
}

type PatternProblem struct {
	ID          uuid.UUID `db:"id"`
	PatternID   string    `db:"pattern_id"`
	ProblemName string    `db:"problem_name"`
	LeetcodeURL string    `db:"leetcode_url"`
}
