package models

import (
	"time"

	"github.com/google/uuid"
)

type HighlightColor string

const (
	HighlightColorYellow HighlightColor = "yellow"
	HighlightColorGreen  HighlightColor = "green"
	HighlightColorBlue   HighlightColor = "blue"
	HighlightColorPink   HighlightColor = "pink"
	HighlightColorPurple HighlightColor = "purple"
)

func (c HighlightColor) IsValid() bool {
	switch c {
	case HighlightColorYellow, HighlightColorGreen, HighlightColorBlue, HighlightColorPink, HighlightColorPurple:
		return true
	}
	return false
}

type Highlight struct {
	ID           uuid.UUID `json:"id" db:"id"`
	UserID       uuid.UUID `json:"userId" db:"user_id"`
	ContentType  string    `json:"contentType" db:"content_type"`
	ContentID    string    `json:"contentId" db:"content_id"`
	StartOffset  int       `json:"startOffset" db:"start_offset"`
	EndOffset    int       `json:"endOffset" db:"end_offset"`
	StartLine    *int      `json:"startLine,omitempty" db:"start_line"`
	EndLine      *int      `json:"endLine,omitempty" db:"end_line"`
	SelectedText string    `json:"selectedText" db:"selected_text"`
	ContentHash  *string   `json:"contentHash,omitempty" db:"content_hash"`
	Color        string    `json:"color" db:"color"`
	Note         *string   `json:"note,omitempty" db:"note"`
	CreatedAt    time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt    time.Time `json:"updatedAt" db:"updated_at"`
	Version      int       `json:"version" db:"version"`
}

type CreateHighlightRequest struct {
	ContentType  string  `json:"contentType" binding:"required,max=50"`
	ContentID    string  `json:"contentId" binding:"required,max=100"`
	StartOffset  int     `json:"startOffset" binding:"gte=0"`
	EndOffset    int     `json:"endOffset" binding:"gtfield=StartOffset"`
	StartLine    *int    `json:"startLine,omitempty"`
	EndLine      *int    `json:"endLine,omitempty"`
	SelectedText string  `json:"selectedText" binding:"required,max=5000"`
	ContentHash  *string `json:"contentHash,omitempty"`
	Color        string  `json:"color" binding:"required,oneof=yellow green blue pink purple"`
	Note         *string `json:"note,omitempty" binding:"omitempty,max=1000"`
}

type UpdateHighlightRequest struct {
	Color   *string `json:"color,omitempty" binding:"omitempty,oneof=yellow green blue pink purple"`
	Note    *string `json:"note,omitempty" binding:"omitempty,max=1000"`
	Version int     `json:"version" binding:"required,gte=1"`
}

type HighlightListResponse struct {
	Highlights []Highlight `json:"highlights"`
	NextCursor *string     `json:"nextCursor,omitempty"`
	TotalCount int         `json:"totalCount"`
}

type ContentHighlightsResponse struct {
	Highlights  []Highlight `json:"highlights"`
	ContentHash string      `json:"contentHash,omitempty"`
}

// Batch sync models for offline support

type SyncOperationType string

const (
	SyncOpCreate SyncOperationType = "create"
	SyncOpUpdate SyncOperationType = "update"
	SyncOpDelete SyncOperationType = "delete"
)

type SyncOperation struct {
	Op       SyncOperationType       `json:"op" binding:"required,oneof=create update delete"`
	ClientID string                  `json:"clientId,omitempty"`
	ID       *uuid.UUID              `json:"id,omitempty"`
	Data     *CreateHighlightRequest `json:"data,omitempty"`
	Update   *UpdateHighlightRequest `json:"update,omitempty"`
}

type BatchSyncRequest struct {
	Operations []SyncOperation `json:"operations" binding:"required,dive"`
	LastSyncAt *time.Time      `json:"lastSyncAt,omitempty"`
}

type SyncOperationResult struct {
	Op        SyncOperationType `json:"op"`
	ClientID  string            `json:"clientId,omitempty"`
	ID        *uuid.UUID        `json:"id,omitempty"`
	Success   bool              `json:"success"`
	Error     string            `json:"error,omitempty"`
	Highlight *Highlight        `json:"highlight,omitempty"`
}

type BatchSyncResponse struct {
	Results       []SyncOperationResult `json:"results"`
	ServerChanges []Highlight           `json:"serverChanges,omitempty"`
}
