package models

import (
	"time"

	"github.com/google/uuid"
)

type PatternProgress struct {
	ID           uuid.UUID `json:"id" db:"id"`
	UserID       uuid.UUID `json:"userId" db:"user_id"`
	PatternID    string    `json:"patternId" db:"pattern_id"`
	SectionIndex int       `json:"sectionIndex" db:"section_index"`
	CompletedAt  time.Time `json:"completedAt" db:"completed_at"`
}

type MarkProgressRequest struct {
	SectionIndex int `json:"sectionIndex" binding:"gte=0"`
}

type PatternProgressResponse struct {
	PatternID         string `json:"patternId"`
	CompletedSections []int  `json:"completedSections"`
}

type BulkProgressRequest struct {
	Sections []int `json:"sections" binding:"required"`
}

type BulkSyncProgressRequest struct {
	Progress map[string][]int `json:"progress" binding:"required"`
}

type BulkSyncProgressResponse struct {
	Progress map[string][]int `json:"progress"`
}
