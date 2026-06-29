package handlers

import (
	"io"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/imrishuroy/algopatterns/internal/ai"
	"github.com/imrishuroy/algopatterns/internal/middleware"
	"github.com/imrishuroy/algopatterns/internal/repository"
	"github.com/imrishuroy/algopatterns/pkg/response"
	"github.com/rs/zerolog/log"
)

// Handler handles AI-related HTTP requests
type Handler struct {
	service  *ai.Service
	authMW   *middleware.AuthMiddleware
	chatRepo *repository.AIChatRepository
}

// NewHandler creates a new AI handler
func NewHandler(service *ai.Service, authMW *middleware.AuthMiddleware, chatRepo *repository.AIChatRepository) *Handler {
	return &Handler{
		service:  service,
		authMW:   authMW,
		chatRepo: chatRepo,
	}
}

// RegisterRoutes registers AI routes
func (h *Handler) RegisterRoutes(rg *gin.RouterGroup) {
	aiGroup := rg.Group("/ai")
	aiGroup.Use(h.authMW.RequireAuth())
	{
		aiGroup.POST("/chat", h.Chat)
		aiGroup.POST("/chat/stream", h.ChatStream)
		aiGroup.POST("/hint", h.GetHint)
		aiGroup.POST("/review", h.ReviewCode)
		aiGroup.POST("/explain", h.ExplainError)
		aiGroup.GET("/status", h.Status)

		// Session/history endpoints
		aiGroup.GET("/sessions", h.GetSessions)
		aiGroup.GET("/sessions/:sessionId/messages", h.GetSessionMessages)
		aiGroup.DELETE("/sessions/:sessionId", h.ClearSession)
		aiGroup.POST("/sessions/:sessionId/archive", h.ArchiveSession)
		aiGroup.GET("/sessions/archived", h.GetArchivedSessions)
	}
}

// ConversationMessage represents a message in conversation history
type ConversationMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

// ChatRequestBody is the request body for chat endpoint
type ChatRequestBody struct {
	Message            string                `json:"message" binding:"required"`
	SessionID          string                `json:"session_id"`
	ProblemSlug        string                `json:"problem_slug"`
	ProblemTitle       string                `json:"problem_title"`
	ProblemDescription string                `json:"problem_description"`
	PatternID          string                `json:"pattern_id"`
	PatternName        string                `json:"pattern_name"`
	PatternDifficulty  string                `json:"pattern_difficulty"`
	TimeComplexity     string                `json:"time_complexity"`
	SpaceComplexity    string                `json:"space_complexity"`
	SectionContent     string                `json:"section_content"`
	ActiveSection      string                `json:"active_section"`
	ContextType        string                `json:"context_type"`
	Code               string                `json:"code"`
	Language           string                `json:"language"`
	History            []ConversationMessage `json:"history"`
	ErrorMessage       string                `json:"error_message"`
}

// Chat handles chat requests
func (h *Handler) Chat(c *gin.Context) {
	var req ChatRequestBody
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, map[string]string{"body": "Invalid request body"})
		return
	}

	userID, ok := middleware.GetUserID(c)
	if !ok {
		response.Unauthorized(c, "User not authenticated")
		return
	}
	userIDStr := userID.String()

	// Get or create session for persistence
	var problemSlug *string
	if req.ProblemSlug != "" {
		problemSlug = &req.ProblemSlug
	}
	var patternID *string
	if req.PatternID != "" {
		patternID = &req.PatternID
	}

	session, err := h.chatRepo.GetOrCreateSession(c.Request.Context(), userIDStr, problemSlug, patternID)
	if err != nil {
		log.Error().Err(err).Str("userID", userIDStr).Msg("Chat: Failed to get/create session")
		h.handleError(c, err)
		return
	}

	// Save user message
	msgType := "chat"
	_, err = h.chatRepo.AddMessage(c.Request.Context(), session.ID, "user", req.Message, &msgType, nil, nil)
	if err != nil {
		log.Error().Err(err).Str("sessionID", session.ID).Msg("Chat: Failed to save user message")
		h.handleError(c, err)
		return
	}

	// Convert history to service format
	var history []ai.ConversationMessage
	for _, msg := range req.History {
		history = append(history, ai.ConversationMessage{
			Role:    msg.Role,
			Content: msg.Content,
		})
	}

	aiReq := ai.ChatRequest{
		SessionID:          session.ID,
		Message:            req.Message,
		ProblemSlug:        req.ProblemSlug,
		ProblemTitle:       req.ProblemTitle,
		ProblemDescription: req.ProblemDescription,
		PatternID:          req.PatternID,
		PatternName:        req.PatternName,
		PatternDifficulty:  req.PatternDifficulty,
		TimeComplexity:     req.TimeComplexity,
		SpaceComplexity:    req.SpaceComplexity,
		SectionContent:     req.SectionContent,
		ActiveSection:      req.ActiveSection,
		ContextType:        ai.ContextType(req.ContextType),
		Code:               req.Code,
		Language:           req.Language,
		History:            history,
		ErrorMessage:       req.ErrorMessage,
	}

	resp, err := h.service.Chat(c.Request.Context(), aiReq)
	if err != nil {
		h.handleError(c, err)
		return
	}

	// Save assistant response
	_, err = h.chatRepo.AddMessage(c.Request.Context(), session.ID, "assistant", resp.Content, &msgType, &resp.TokensUsed, &resp.Model)
	if err != nil {
		log.Warn().Err(err).Msg("Chat: Failed to save assistant message")
	}

	resp.SessionID = session.ID
	response.OK(c, resp)
}

// ChatStream handles streaming chat requests using SSE
func (h *Handler) ChatStream(c *gin.Context) {
	var req ChatRequestBody
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, map[string]string{"body": "Invalid request body"})
		return
	}

	userID, ok := middleware.GetUserID(c)
	if !ok {
		response.Unauthorized(c, "User not authenticated")
		return
	}
	userIDStr := userID.String()

	// Get or create session for persistence
	var problemSlug *string
	if req.ProblemSlug != "" {
		problemSlug = &req.ProblemSlug
	}
	var patternID *string
	if req.PatternID != "" {
		patternID = &req.PatternID
	}

	session, err := h.chatRepo.GetOrCreateSession(c.Request.Context(), userIDStr, problemSlug, patternID)
	if err != nil {
		log.Error().Err(err).Str("userID", userIDStr).Msg("ChatStream: Failed to get/create session")
		h.handleError(c, err)
		return
	}

	// Save user message
	msgType := "chat"
	_, err = h.chatRepo.AddMessage(c.Request.Context(), session.ID, "user", req.Message, &msgType, nil, nil)
	if err != nil {
		h.handleError(c, err)
		return
	}

	// Convert history to service format
	var history []ai.ConversationMessage
	for _, msg := range req.History {
		history = append(history, ai.ConversationMessage{
			Role:    msg.Role,
			Content: msg.Content,
		})
	}

	aiReq := ai.ChatRequest{
		SessionID:          session.ID,
		Message:            req.Message,
		ProblemSlug:        req.ProblemSlug,
		ProblemTitle:       req.ProblemTitle,
		ProblemDescription: req.ProblemDescription,
		PatternID:          req.PatternID,
		PatternName:        req.PatternName,
		PatternDifficulty:  req.PatternDifficulty,
		TimeComplexity:     req.TimeComplexity,
		SpaceComplexity:    req.SpaceComplexity,
		SectionContent:     req.SectionContent,
		ActiveSection:      req.ActiveSection,
		ContextType:        ai.ContextType(req.ContextType),
		Code:               req.Code,
		Language:           req.Language,
		Stream:             true,
		History:            history,
		ErrorMessage:       req.ErrorMessage,
	}

	chunks, err := h.service.ChatStream(c.Request.Context(), aiReq)
	if err != nil {
		h.handleError(c, err)
		return
	}

	c.Header("Content-Type", "text/event-stream")
	c.Header("Cache-Control", "no-cache")
	c.Header("Connection", "keep-alive")
	c.Header("Transfer-Encoding", "chunked")

	// Collect full response for saving
	var fullResponse string

	c.Stream(func(_ io.Writer) bool {
		if chunk, ok := <-chunks; ok {
			if chunk.Error != nil {
				c.SSEvent("error", gin.H{"error": chunk.Error.Error()})
				return false
			}
			if chunk.Done {
				// Save assistant response when done
				if fullResponse != "" {
					h.chatRepo.AddMessage(c.Request.Context(), session.ID, "assistant", fullResponse, &msgType, nil, nil)
				}
				c.SSEvent("done", gin.H{"done": true, "session_id": session.ID})
				return false
			}
			fullResponse += chunk.Content
			c.SSEvent("message", gin.H{"content": chunk.Content})
			return true
		}
		return false
	})
}

// HintRequestBody is the request body for hint endpoint
type HintRequestBody struct {
	ProblemSlug        string `json:"problem_slug" binding:"required"`
	ProblemTitle       string `json:"problem_title"`
	ProblemDescription string `json:"problem_description"`
	Code               string `json:"code"`
	Language           string `json:"language" binding:"required"`
	HintLevel          int    `json:"hint_level"`
	PreviousHints      int    `json:"previous_hints"`
}

// GetHint handles hint requests
func (h *Handler) GetHint(c *gin.Context) {
	var req HintRequestBody
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, map[string]string{"body": "Invalid request body"})
		return
	}

	aiReq := ai.HintRequest{
		ProblemSlug:        req.ProblemSlug,
		ProblemTitle:       req.ProblemTitle,
		ProblemDescription: req.ProblemDescription,
		Code:               req.Code,
		Language:           req.Language,
		HintLevel:          req.HintLevel,
		PreviousHints:      req.PreviousHints,
	}

	resp, err := h.service.GetHint(c.Request.Context(), aiReq)
	if err != nil {
		h.handleError(c, err)
		return
	}

	response.OK(c, resp)
}

// ReviewRequestBody is the request body for review endpoint
type ReviewRequestBody struct {
	ProblemSlug        string   `json:"problem_slug" binding:"required"`
	ProblemTitle       string   `json:"problem_title"`
	ProblemDescription string   `json:"problem_description"`
	Code               string   `json:"code" binding:"required"`
	Language           string   `json:"language" binding:"required"`
	FocusAreas         []string `json:"focus_areas"`
}

// ReviewCode handles code review requests
func (h *Handler) ReviewCode(c *gin.Context) {
	var req ReviewRequestBody
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, map[string]string{"body": "Invalid request body"})
		return
	}

	aiReq := ai.ReviewRequest{
		ProblemSlug:        req.ProblemSlug,
		ProblemTitle:       req.ProblemTitle,
		ProblemDescription: req.ProblemDescription,
		Code:               req.Code,
		Language:           req.Language,
		FocusAreas:         req.FocusAreas,
	}

	resp, err := h.service.ReviewCode(c.Request.Context(), aiReq)
	if err != nil {
		h.handleError(c, err)
		return
	}

	response.OK(c, resp)
}

// ExplainRequestBody is the request body for explain endpoint
type ExplainRequestBody struct {
	Code         string `json:"code" binding:"required"`
	Language     string `json:"language" binding:"required"`
	ErrorType    string `json:"error_type"`
	ErrorMessage string `json:"error_message" binding:"required"`
	LineNumber   int    `json:"line_number"`
}

// ExplainError handles error explanation requests
func (h *Handler) ExplainError(c *gin.Context) {
	var req ExplainRequestBody
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, map[string]string{"body": "Invalid request body"})
		return
	}

	aiReq := ai.ExplainRequest{
		Code:         req.Code,
		Language:     req.Language,
		ErrorType:    req.ErrorType,
		ErrorMessage: req.ErrorMessage,
		LineNumber:   req.LineNumber,
	}

	resp, err := h.service.ExplainError(c.Request.Context(), aiReq)
	if err != nil {
		h.handleError(c, err)
		return
	}

	response.OK(c, resp)
}

// Status returns the AI service status
func (h *Handler) Status(c *gin.Context) {
	response.OK(c, gin.H{
		"enabled": h.service.IsEnabled(),
		"status":  "operational",
	})
}

// handleError converts AI errors to HTTP responses
func (h *Handler) handleError(c *gin.Context, err error) {
	switch {
	case err == ai.ErrAIDisabled:
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"success": false,
			"error": gin.H{
				"code":    "AI_DISABLED",
				"message": "AI features are currently disabled",
			},
		})
	case err == ai.ErrRateLimited:
		c.JSON(http.StatusTooManyRequests, gin.H{
			"success": false,
			"error": gin.H{
				"code":    "AI_RATE_LIMITED",
				"message": "Too many requests. Please try again later.",
			},
		})
	case err == ai.ErrCodeTooLong:
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error": gin.H{
				"code":    "AI_CODE_TOO_LONG",
				"message": "Code exceeds maximum length",
			},
		})
	case err == ai.ErrInvalidRequest:
		response.BadRequest(c, err.Error(), nil)
	default:
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error": gin.H{
				"code":    "AI_ERROR",
				"message": "An error occurred while processing your request",
			},
		})
	}
}

// GetSessions handles request for user's AI chat sessions
func (h *Handler) GetSessions(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		response.Unauthorized(c, "User not authenticated")
		return
	}

	sessions, err := h.chatRepo.GetUserSessions(c.Request.Context(), userID.String(), 20)
	if err != nil {
		response.InternalError(c)
		return
	}

	response.OK(c, gin.H{"sessions": sessions})
}

// GetSessionMessages handles request for session messages
func (h *Handler) GetSessionMessages(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		response.Unauthorized(c, "User not authenticated")
		return
	}

	sessionID := c.Param("sessionId")
	if sessionID == "" {
		response.BadRequest(c, "Session ID is required", nil)
		return
	}

	messages, err := h.chatRepo.GetSessionMessages(c.Request.Context(), sessionID, userID.String())
	if err != nil {
		response.InternalError(c)
		return
	}

	response.OK(c, gin.H{"messages": messages})
}

// ClearSession clears all messages in a session
func (h *Handler) ClearSession(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		response.Unauthorized(c, "User not authenticated")
		return
	}

	sessionID := c.Param("sessionId")
	if sessionID == "" {
		response.BadRequest(c, "Session ID is required", nil)
		return
	}

	err := h.chatRepo.ClearSession(c.Request.Context(), sessionID, userID.String())
	if err != nil {
		response.InternalError(c)
		return
	}

	response.OK(c, gin.H{"cleared": true})
}

// ArchiveSessionBody is the request body for archive endpoint
type ArchiveSessionBody struct {
	Title string `json:"title"`
}

// ArchiveSession archives a session and starts a new one
func (h *Handler) ArchiveSession(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		response.Unauthorized(c, "User not authenticated")
		return
	}

	sessionID := c.Param("sessionId")
	if sessionID == "" {
		response.BadRequest(c, "Session ID is required", nil)
		return
	}

	var req ArchiveSessionBody
	if err := c.ShouldBindJSON(&req); err != nil {
		req.Title = ""
	}

	var title *string
	if req.Title != "" {
		title = &req.Title
	}

	err := h.chatRepo.ArchiveSession(c.Request.Context(), sessionID, userID.String(), title)
	if err != nil {
		response.InternalError(c)
		return
	}

	response.OK(c, gin.H{"archived": true})
}

// GetArchivedSessions handles request for archived sessions
func (h *Handler) GetArchivedSessions(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		response.Unauthorized(c, "User not authenticated")
		return
	}

	problemSlug := c.Query("problem_slug")
	patternID := c.Query("pattern_id")

	if problemSlug == "" && patternID == "" {
		response.BadRequest(c, "problem_slug or pattern_id query param is required", nil)
		return
	}

	var sessions []repository.AISession
	var err error

	if patternID != "" {
		sessions, err = h.chatRepo.GetArchivedSessionsForPattern(c.Request.Context(), userID.String(), patternID, 20)
	} else {
		sessions, err = h.chatRepo.GetArchivedSessionsForProblem(c.Request.Context(), userID.String(), problemSlug, 20)
	}

	if err != nil {
		response.InternalError(c)
		return
	}

	response.OK(c, gin.H{"sessions": sessions})
}
