package ai

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/imrishuroy/algopatterns/internal/ai/llm"
	"github.com/imrishuroy/algopatterns/internal/ai/prompts"
	"github.com/imrishuroy/algopatterns/internal/ai/rag"
	"github.com/rs/zerolog/log"
)

var (
	ErrAIDisabled     = errors.New("AI features are disabled")
	ErrRateLimited    = errors.New("rate limit exceeded")
	ErrCodeTooLong    = errors.New("code exceeds maximum length")
	ErrInvalidRequest = errors.New("invalid request")
	ErrProviderFailed = errors.New("AI provider failed")
)

// Service is the main AI service that orchestrates LLM calls
type Service struct {
	llmManager *llm.Manager
	ragService *rag.Service
	config     Config
}

// NewService creates a new AI service
func NewService(llmManager *llm.Manager, config Config) *Service {
	return &Service{
		llmManager: llmManager,
		config:     config,
	}
}

// NewServiceWithRAG creates a new AI service with RAG support
func NewServiceWithRAG(llmManager *llm.Manager, ragService *rag.Service, config Config) *Service {
	return &Service{
		llmManager: llmManager,
		ragService: ragService,
		config:     config,
	}
}

// ConversationMessage represents a message in conversation history
type ConversationMessage struct {
	Role    string
	Content string
}

// mapHistory converts internal ai messages to the prompts package format
func mapHistory(history []ConversationMessage) []prompts.ConversationTurn {
	if len(history) == 0 {
		return nil
	}
	turns := make([]prompts.ConversationTurn, len(history))
	for i, h := range history {
		turns[i] = prompts.ConversationTurn{
			Role:    h.Role,
			Content: h.Content,
		}
	}
	return turns
}

// ContextType discriminates between different AI tutor contexts
type ContextType string

const (
	ContextProblem ContextType = "problem"
	ContextPattern ContextType = "pattern"
	ContextGeneral ContextType = "general"
)

// ChatRequest represents a chat request
type ChatRequest struct {
	SessionID          string
	Message            string
	ProblemSlug        string
	ProblemTitle       string
	ProblemDescription string
	PatternID          string
	PatternName        string
	PatternDifficulty  string
	TimeComplexity     string
	SpaceComplexity    string
	SectionContent     string
	ActiveSection      string
	ContextType        ContextType
	Code               string
	Language           string
	Stream             bool
	History            []ConversationMessage
	ErrorMessage       string
}

// ChatResponse represents a chat response
type ChatResponse struct {
	Content    string `json:"content"`
	SessionID  string `json:"session_id"`
	TokensUsed int    `json:"tokens_used"`
	Model      string `json:"model"`
}

// HintRequest represents a hint request
type HintRequest struct {
	ProblemSlug        string
	ProblemTitle       string
	ProblemDescription string
	Code               string
	Language           string
	HintLevel          int
	PreviousHints      int
	History            []ConversationMessage // Added for contextual awareness
}

// HintResponse represents a hint response
type HintResponse struct {
	Hint       string `json:"hint"`
	Level      int    `json:"level"`
	Pattern    string `json:"pattern,omitempty"`
	TokensUsed int    `json:"tokens_used"`
}

// ReviewRequest represents a code review request
type ReviewRequest struct {
	ProblemSlug        string
	ProblemTitle       string
	ProblemDescription string
	Code               string
	Language           string
	FocusAreas         []string
	History            []ConversationMessage // Added for contextual awareness
}

// ReviewResponse represents a code review response
type ReviewResponse struct {
	Review     string `json:"review"`
	TokensUsed int    `json:"tokens_used"`
}

// ExplainRequest represents an error explanation request
type ExplainRequest struct {
	Code         string
	Language     string
	ErrorType    string
	ErrorMessage string
	LineNumber   int
	History      []ConversationMessage // Added for contextual awareness
}

// ExplainResponse represents an error explanation response
type ExplainResponse struct {
	Explanation    string `json:"explanation"`
	RelatedConcept string `json:"related_concept,omitempty"`
	TokensUsed     int    `json:"tokens_used"`
}

// Chat handles a chat message
func (s *Service) Chat(ctx context.Context, req ChatRequest) (*ChatResponse, error) {
	if !s.config.Enabled {
		return nil, ErrAIDisabled
	}

	if !s.config.Features.EnableChat {
		return nil, errors.New("chat feature is disabled")
	}

	if err := s.validateCode(req.Code); err != nil {
		return nil, err
	}

	turns := mapHistory(req.History)

	var systemPrompt string
	var userContent strings.Builder

	if req.ContextType == ContextPattern {
		ragContext := s.getPatternRAGContext(ctx, req.PatternID, req.Message)
		systemPrompt = prompts.BuildPatternChatPrompt(
			req.PatternName,
			req.PatternDifficulty,
			req.TimeComplexity,
			req.SpaceComplexity,
			req.SectionContent,
			req.ActiveSection,
			req.Language,
			turns,
			ragContext,
		)

		userContent.WriteString(req.Message)
	} else {
		ragContext := s.getRAGContext(ctx, req.ProblemSlug, req.Message+" "+req.ProblemTitle, req.Language)
		systemPrompt = prompts.BuildChatPrompt(req.ProblemTitle, req.Language, turns, ragContext)

		if req.ProblemDescription != "" {
			userContent.WriteString(fmt.Sprintf("PROBLEM DESCRIPTION:\n%s\n\n", req.ProblemDescription))
		}
		if req.Code != "" {
			userContent.WriteString(fmt.Sprintf("MY CURRENT CODE:\n```%s\n%s\n```\n\n", req.Language, req.Code))
		}
		if req.ErrorMessage != "" {
			userContent.WriteString(fmt.Sprintf("ERROR FROM RUNNING MY CODE:\n```\n%s\n```\n\n", req.ErrorMessage))
		}
		userContent.WriteString(req.Message)
	}

	messages := []llm.Message{
		llm.SystemMessage(systemPrompt),
		llm.UserMessage(userContent.String()),
	}

	llmReq := llm.ChatRequest{
		Messages:    messages,
		Temperature: 0.7,
		MaxTokens:   2048,
	}

	resp, err := s.llmManager.Chat(ctx, llmReq)
	if err != nil {
		log.Error().Err(err).Msg("LLM chat failed")
		return nil, fmt.Errorf("%w: %v", ErrProviderFailed, err)
	}

	return &ChatResponse{
		Content:    resp.Content,
		SessionID:  req.SessionID,
		TokensUsed: resp.TokensInput + resp.TokensOutput,
		Model:      resp.Model,
	}, nil
}

// ChatStream handles a streaming chat message
func (s *Service) ChatStream(ctx context.Context, req ChatRequest) (<-chan llm.StreamChunk, error) {
	if !s.config.Enabled {
		return nil, ErrAIDisabled
	}

	if !s.config.Features.EnableChat || !s.config.Features.EnableStreaming {
		return nil, errors.New("streaming chat is disabled")
	}

	if err := s.validateCode(req.Code); err != nil {
		return nil, err
	}

	turns := mapHistory(req.History)

	var systemPrompt string
	var userContent strings.Builder

	if req.ContextType == ContextPattern {
		ragContext := s.getPatternRAGContext(ctx, req.PatternID, req.Message)
		systemPrompt = prompts.BuildPatternChatPrompt(
			req.PatternName,
			req.PatternDifficulty,
			req.TimeComplexity,
			req.SpaceComplexity,
			req.SectionContent,
			req.ActiveSection,
			req.Language,
			turns,
			ragContext,
		)

		userContent.WriteString(req.Message)
	} else {
		ragContext := s.getRAGContext(ctx, req.ProblemSlug, req.Message+" "+req.ProblemTitle, req.Language)
		systemPrompt = prompts.BuildChatPrompt(req.ProblemTitle, req.Language, turns, ragContext)

		if req.ProblemDescription != "" {
			userContent.WriteString(fmt.Sprintf("PROBLEM DESCRIPTION:\n%s\n\n", req.ProblemDescription))
		}
		if req.Code != "" {
			userContent.WriteString(fmt.Sprintf("MY CURRENT CODE:\n```%s\n%s\n```\n\n", req.Language, req.Code))
		}
		if req.ErrorMessage != "" {
			userContent.WriteString(fmt.Sprintf("ERROR FROM RUNNING MY CODE:\n```\n%s\n```\n\n", req.ErrorMessage))
		}
		userContent.WriteString(req.Message)
	}

	messages := []llm.Message{
		llm.SystemMessage(systemPrompt),
		llm.UserMessage(userContent.String()),
	}

	llmReq := llm.ChatRequest{
		Messages:    messages,
		Temperature: 0.7,
		MaxTokens:   2048,
		Stream:      true,
	}

	return s.llmManager.ChatStream(ctx, llmReq)
}

// GetHint provides a contextual hint
func (s *Service) GetHint(ctx context.Context, req HintRequest) (*HintResponse, error) {
	if !s.config.Enabled {
		return nil, ErrAIDisabled
	}

	if !s.config.Features.EnableHints {
		return nil, errors.New("hints feature is disabled")
	}

	if err := s.validateCode(req.Code); err != nil {
		return nil, err
	}

	level := req.HintLevel
	if level < 1 || level > 4 {
		level = min(req.PreviousHints+1, 4)
	}

	ragContext := s.getRAGContext(ctx, req.ProblemSlug, req.Code+" "+req.ProblemTitle, req.Language)
	turns := mapHistory(req.History)

	systemPrompt := prompts.BuildHintPrompt(
		level,
		req.ProblemTitle,
		req.Code,
		req.Language,
		turns,
		ragContext,
	)

	messages := []llm.Message{
		llm.SystemMessage(systemPrompt),
	}

	var userMsg strings.Builder
	if req.ProblemDescription != "" {
		userMsg.WriteString(fmt.Sprintf("PROBLEM DESCRIPTION:\n%s\n\n", req.ProblemDescription))
	}
	userMsg.WriteString("Please give me a hint for this problem.")

	messages = append(messages, llm.UserMessage(userMsg.String()))

	llmReq := llm.ChatRequest{
		Messages:    messages,
		Temperature: 0.7,
		MaxTokens:   1024,
	}

	resp, err := s.llmManager.Chat(ctx, llmReq)
	if err != nil {
		log.Error().Err(err).Msg("LLM hint request failed")
		return nil, fmt.Errorf("%w: %v", ErrProviderFailed, err)
	}

	return &HintResponse{
		Hint:       resp.Content,
		Level:      level,
		TokensUsed: resp.TokensInput + resp.TokensOutput,
	}, nil
}

// ReviewCode provides a code review
func (s *Service) ReviewCode(ctx context.Context, req ReviewRequest) (*ReviewResponse, error) {
	if !s.config.Enabled {
		return nil, ErrAIDisabled
	}

	if !s.config.Features.EnableReview {
		return nil, errors.New("review feature is disabled")
	}

	if req.Code == "" {
		return nil, fmt.Errorf("%w: code is required", ErrInvalidRequest)
	}

	if err := s.validateCode(req.Code); err != nil {
		return nil, err
	}

	ragContext := s.getRAGContext(ctx, req.ProblemSlug, req.Code+" "+req.ProblemTitle, req.Language)
	turns := mapHistory(req.History)

	systemPrompt := prompts.BuildReviewPrompt(
		req.ProblemTitle,
		req.Code,
		req.Language,
		req.FocusAreas,
		turns,
		ragContext,
	)

	messages := []llm.Message{
		llm.SystemMessage(systemPrompt),
	}

	var userMsg strings.Builder
	if req.ProblemDescription != "" {
		userMsg.WriteString(fmt.Sprintf("PROBLEM DESCRIPTION:\n%s\n\n", req.ProblemDescription))
	}
	userMsg.WriteString("Please review my code.")

	messages = append(messages, llm.UserMessage(userMsg.String()))

	llmReq := llm.ChatRequest{
		Messages:    messages,
		Temperature: 0.5,
		MaxTokens:   1536,
	}

	resp, err := s.llmManager.Chat(ctx, llmReq)
	if err != nil {
		log.Error().Err(err).Msg("LLM review request failed")
		return nil, fmt.Errorf("%w: %v", ErrProviderFailed, err)
	}

	return &ReviewResponse{
		Review:     resp.Content,
		TokensUsed: resp.TokensInput + resp.TokensOutput,
	}, nil
}

// ExplainError explains a code error
func (s *Service) ExplainError(ctx context.Context, req ExplainRequest) (*ExplainResponse, error) {
	if !s.config.Enabled {
		return nil, ErrAIDisabled
	}

	if !s.config.Features.EnableExplain {
		return nil, errors.New("explain feature is disabled")
	}

	if req.ErrorMessage == "" {
		return nil, fmt.Errorf("%w: error message is required", ErrInvalidRequest)
	}

	if err := s.validateCode(req.Code); err != nil {
		return nil, err
	}

	ragContext := s.getRAGContext(ctx, "", req.ErrorType+" "+req.ErrorMessage, req.Language)
	turns := mapHistory(req.History)

	systemPrompt := prompts.BuildExplainErrorPrompt(
		req.ErrorType,
		req.ErrorMessage,
		req.LineNumber,
		req.Code,
		req.Language,
		turns,
		ragContext,
	)

	messages := []llm.Message{
		llm.SystemMessage(systemPrompt),
		llm.UserMessage("Please explain this error."),
	}

	llmReq := llm.ChatRequest{
		Messages:    messages,
		Temperature: 0.3,
		MaxTokens:   768,
	}

	resp, err := s.llmManager.Chat(ctx, llmReq)
	if err != nil {
		log.Error().Err(err).Msg("LLM explain request failed")
		return nil, fmt.Errorf("%w: %v", ErrProviderFailed, err)
	}

	return &ExplainResponse{
		Explanation: resp.Content,
		TokensUsed:  resp.TokensInput + resp.TokensOutput,
	}, nil
}

// validateCode checks if the code is within limits
func (s *Service) validateCode(code string) error {
	if len(code) > s.config.RateLimit.MaxCodeLength {
		return fmt.Errorf("%w: max %d bytes", ErrCodeTooLong, s.config.RateLimit.MaxCodeLength)
	}
	return nil
}

// getRAGContext retrieves relevant context from the RAG service
func (s *Service) getRAGContext(ctx context.Context, _, query, language string) string {
	if s.ragService == nil || !s.config.Features.EnableRAG {
		return ""
	}

	results, err := s.ragService.SearchContext(ctx, query, rag.SearchOptions{
		Language: language,
		Limit:    4,
		MinScore: 0.7,
	})
	if err != nil {
		log.Warn().Err(err).Msg("RAG search failed, continuing without context")
		return ""
	}

	return s.ragService.BuildRAGContext(results)
}

// getPatternRAGContext retrieves relevant pattern content for pattern tutoring
func (s *Service) getPatternRAGContext(ctx context.Context, patternID, query string) string {
	if s.ragService == nil || !s.config.Features.EnableRAG {
		return ""
	}

	opts := rag.SearchOptions{
		ContentType: "pattern",
		Limit:       4,
		MinScore:    0.6,
	}
	if patternID != "" {
		opts.SourceID = patternID
	}

	results, err := s.ragService.SearchContext(ctx, query, opts)
	if err != nil {
		log.Warn().Err(err).Msg("Pattern RAG search failed, continuing without context")
		return ""
	}

	return s.ragService.BuildRAGContext(results)
}

// IsEnabled returns whether AI features are enabled
func (s *Service) IsEnabled() bool {
	return s.config.Enabled
}

// FilterSolutionContent checks if response might contain a solution
func (s *Service) FilterSolutionContent(response, problemSlug string) bool {
	indicators := []string{
		"here's the solution",
		"the complete code",
		"final solution",
		"here is the answer",
		"the solution is",
	}

	responseLower := strings.ToLower(response)
	for _, indicator := range indicators {
		if strings.Contains(responseLower, indicator) {
			return true
		}
	}

	codeBlockLines := countCodeBlockLines(response)
	if codeBlockLines > 15 {
		return true
	}

	return false
}

func countCodeBlockLines(s string) int {
	inCodeBlock := false
	lines := 0

	for _, line := range strings.Split(s, "\n") {
		if strings.HasPrefix(strings.TrimSpace(line), "```") {
			inCodeBlock = !inCodeBlock
			continue
		}
		if inCodeBlock {
			lines++
		}
	}

	return lines
}
