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
	"golang.org/x/sync/errgroup"
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
	classifier *Classifier
	config     Config
}

// NewService creates a new AI service
func NewService(llmManager *llm.Manager, config Config) *Service {
	return &Service{
		llmManager: llmManager,
		classifier: NewClassifier(llmManager),
		config:     config,
	}
}

// NewServiceWithRAG creates a new AI service with RAG support
func NewServiceWithRAG(llmManager *llm.Manager, ragService *rag.Service, config Config) *Service {
	return &Service{
		llmManager: llmManager,
		ragService: ragService,
		classifier: NewClassifier(llmManager),
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
	Intent     string `json:"intent,omitempty"`
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
	var intentStr string

	switch req.ContextType {
	case ContextGeneral:
		// Convert history for classifier
		classifierHistory := make([]ConversationTurn, len(req.History))
		for i, h := range req.History {
			classifierHistory[i] = ConversationTurn(h)
		}

		// Classify intent for Omni-Tutor with conversation context
		intent, err := s.classifier.ClassifyWithHistory(ctx, req.Message, classifierHistory)
		if err != nil {
			log.Warn().Err(err).Msg("Intent classification failed, defaulting to concept")
			intent = IntentConcept
		}
		intentStr = string(intent)

		// Handle out-of-scope immediately without LLM call
		if intent == IntentOutOfScope {
			return &ChatResponse{
				Content:   OutOfScopeRefusal,
				SessionID: req.SessionID,
				Intent:    intentStr,
			}, nil
		}

		// Get global RAG context if needed
		var ragContext string
		var ragResults []rag.ContentEmbedding
		if NeedsRAG(intent) {
			ragResults = s.getGlobalRAGResults(ctx, req.Message, intent)
			if s.ragService != nil {
				ragContext = s.ragService.BuildRAGContext(ragResults)
			}
		}

		// Build link manifest from RAG results
		links := BuildLinkManifest(ragResults)
		linkManifest := FormatLinkManifest(links)

		systemPrompt = prompts.BuildOmniTutorPrompt(
			intentStr,
			req.Language,
			turns,
			ragContext,
			linkManifest,
		)

		userContent.WriteString(req.Message)

	case ContextPattern:
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

	default:
		// ContextProblem (default)
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
		Intent:     intentStr,
	}, nil
}

// StreamResult contains the stream channel and metadata for streaming responses
type StreamResult struct {
	Chunks <-chan llm.StreamChunk
	Intent string
}

// ChatStream handles a streaming chat message
func (s *Service) ChatStream(ctx context.Context, req ChatRequest) (*StreamResult, error) {
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
	var intentStr string

	switch req.ContextType {
	case ContextGeneral:
		// Convert history for classifier
		classifierHistory := make([]ConversationTurn, len(req.History))
		for i, h := range req.History {
			classifierHistory[i] = ConversationTurn(h)
		}

		// Classify intent for Omni-Tutor with conversation context
		intent, err := s.classifier.ClassifyWithHistory(ctx, req.Message, classifierHistory)
		if err != nil {
			log.Warn().Err(err).Msg("Intent classification failed, defaulting to concept")
			intent = IntentConcept
		}
		intentStr = string(intent)

		// Handle out-of-scope with a synthetic stream
		if intent == IntentOutOfScope {
			chunks := make(chan llm.StreamChunk, 2)
			go func() {
				chunks <- llm.StreamChunk{Content: OutOfScopeRefusal}
				chunks <- llm.StreamChunk{Done: true}
				close(chunks)
			}()
			return &StreamResult{Chunks: chunks, Intent: intentStr}, nil
		}

		// Get global RAG context if needed
		var ragContext string
		var ragResults []rag.ContentEmbedding
		if NeedsRAG(intent) {
			ragResults = s.getGlobalRAGResults(ctx, req.Message, intent)
			if s.ragService != nil {
				ragContext = s.ragService.BuildRAGContext(ragResults)
			}
		}

		// Build link manifest from RAG results
		links := BuildLinkManifest(ragResults)
		linkManifest := FormatLinkManifest(links)

		systemPrompt = prompts.BuildOmniTutorPrompt(
			intentStr,
			req.Language,
			turns,
			ragContext,
			linkManifest,
		)

		userContent.WriteString(req.Message)

	case ContextPattern:
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

	default:
		// ContextProblem (default)
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

	chunks, err := s.llmManager.ChatStream(ctx, llmReq)
	if err != nil {
		return nil, err
	}

	return &StreamResult{Chunks: chunks, Intent: intentStr}, nil
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

// getGlobalRAGResults retrieves relevant content from all sources for Omni-Tutor
// It runs two concurrent searches (patterns + problems) and merges the results
func (s *Service) getGlobalRAGResults(ctx context.Context, query string, intent Intent) []rag.ContentEmbedding {
	if s.ragService == nil || !s.config.Features.EnableRAG {
		return nil
	}

	// Determine limits based on intent
	patternLimit := 6
	if intent == IntentIntersection {
		patternLimit = 10 // need more to capture both patterns
	}

	// Concurrent two-phase search: patterns + problems
	g, gctx := errgroup.WithContext(ctx)
	var patternResults, problemResults []rag.ContentEmbedding

	g.Go(func() error {
		var err error
		patternResults, err = s.ragService.SearchContext(gctx, query,
			rag.SearchOptions{ContentType: "pattern", Limit: patternLimit, MinScore: 0.65})
		if err != nil {
			log.Warn().Err(err).Msg("Pattern RAG search failed in global context")
		}
		return nil // Non-fatal: continue even if this fails
	})

	g.Go(func() error {
		var err error
		problemResults, err = s.ragService.SearchContext(gctx, query,
			rag.SearchOptions{ContentType: "problem", Limit: 4, MinScore: 0.60})
		if err != nil {
			log.Warn().Err(err).Msg("Problem RAG search failed in global context")
		}
		return nil // Non-fatal: continue even if this fails
	})

	// Wait for both searches (errors are non-fatal)
	_ = g.Wait()

	// Merge and dedupe results
	merged := make([]rag.ContentEmbedding, 0, len(patternResults)+len(problemResults))
	merged = append(merged, patternResults...)
	merged = append(merged, problemResults...)
	return DedupeBySourceID(merged)
}

// IsEnabled returns whether AI features are enabled
func (s *Service) IsEnabled() bool {
	return s.config.Enabled
}

// FilterSolutionContent checks if response might contain a solution
func (s *Service) FilterSolutionContent(response string, _ string) bool {
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

	return countCodeBlockLines(response) > 15
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

// GenerateTitleRequest contains the conversation to generate a title for
type GenerateTitleRequest struct {
	Messages []ConversationMessage
}

// GenerateTitleResponse contains the generated title
type GenerateTitleResponse struct {
	Title string
}

// titleGenerationPrompt is the system prompt for generating chat titles
const titleGenerationPrompt = `You are a title generator. Given a conversation, output a 3-5 word title.

Example input: "How do I solve Two Sum using a hash map?"
Example output: Two Sum Hash Map

Example input: "Help me understand binary search in a rotated array"
Example output: Binary Search Rotated Array

Example input: "What's the best way to find the median from a data stream?"
Example output: Find Median Data Stream

Output ONLY the title, nothing else. No quotes, no explanation.`

// GenerateTitle generates a meaningful title for a chat session based on the conversation
func (s *Service) GenerateTitle(ctx context.Context, req GenerateTitleRequest) (*GenerateTitleResponse, error) {
	if !s.config.Features.EnableChat {
		return nil, ErrAIDisabled
	}

	if len(req.Messages) == 0 {
		return &GenerateTitleResponse{Title: "New Conversation"}, nil
	}

	// Build a summary of the conversation for title generation
	var conversationSummary strings.Builder
	conversationSummary.WriteString("Conversation:\n")

	// Take first few messages (max 4) to keep token usage low
	maxMessages := 4
	if len(req.Messages) < maxMessages {
		maxMessages = len(req.Messages)
	}

	for _, msg := range req.Messages[:maxMessages] {
		role := "User"
		if msg.Role == "assistant" {
			role = "Assistant"
		}
		// Truncate long messages
		content := msg.Content
		if len(content) > 300 {
			content = content[:300] + "..."
		}
		conversationSummary.WriteString(fmt.Sprintf("%s: %s\n", role, content))
	}

	messages := []llm.Message{
		llm.SystemMessage(titleGenerationPrompt),
		llm.UserMessage(conversationSummary.String()),
	}

	llmReq := llm.ChatRequest{
		Messages:    messages,
		Model:       "openai/gpt-4o-mini", // Use simpler model for title generation (reasoning models don't work well)
		Temperature: 0.3,                  // Low temperature for consistent titles
		MaxTokens:   30,                   // Titles are short
	}

	resp, err := s.llmManager.Chat(ctx, llmReq)
	if err != nil {
		log.Warn().Err(err).Msg("Failed to generate title, using fallback")
		// Fallback to first user message truncated
		for _, msg := range req.Messages {
			if msg.Role == "user" {
				title := msg.Content
				if len(title) > 50 {
					title = title[:47] + "..."
				}
				return &GenerateTitleResponse{Title: title}, nil
			}
		}
		return &GenerateTitleResponse{Title: "New Conversation"}, nil
	}

	title := strings.TrimSpace(resp.Content)
	log.Info().Str("raw_response", resp.Content).Str("title", title).Msg("LLM generated title")

	// If LLM returned empty, use heuristic extraction
	if title == "" {
		log.Warn().Msg("LLM returned empty title, using heuristic extraction")
		title = extractTitleHeuristic(req.Messages)
	}

	// Ensure title is not too long
	if len(title) > 50 {
		title = title[:47] + "..."
	}
	// Remove quotes if the LLM added them
	title = strings.Trim(title, "\"'")

	return &GenerateTitleResponse{Title: title}, nil
}

// extractTitleHeuristic extracts a clean title from user message without LLM
func extractTitleHeuristic(messages []ConversationMessage) string {
	var userMsg string
	for _, msg := range messages {
		if msg.Role == "user" {
			userMsg = msg.Content
			break
		}
	}
	if userMsg == "" {
		return "New Conversation"
	}

	// Remove common filler phrases
	fillers := []string{
		"help me solve this",
		"help me solve",
		"help me with",
		"help me understand",
		"how do i solve",
		"how do you solve",
		"how to solve",
		"can you help with",
		"can you explain",
		"i need help with",
		"i want to learn",
		"please explain",
		"what is the best way to",
		"what's the best way to",
		"solve this",
		"question about",
		"problem with",
	}

	title := strings.ToLower(userMsg)
	for _, filler := range fillers {
		title = strings.ReplaceAll(title, filler, "")
	}

	// Clean up and capitalize
	title = strings.TrimSpace(title)
	title = strings.Trim(title, "?!.,")
	title = strings.TrimSpace(title)

	// Capitalize first letter of each word
	words := strings.Fields(title)
	for i, word := range words {
		if len(word) > 0 {
			words[i] = strings.ToUpper(string(word[0])) + word[1:]
		}
	}
	title = strings.Join(words, " ")

	if title == "" {
		return "New Conversation"
	}

	return title
}
