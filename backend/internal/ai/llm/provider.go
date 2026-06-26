package llm

import (
	"context"
	"errors"
)

var (
	ErrProviderUnavailable = errors.New("llm provider unavailable")
	ErrRateLimited         = errors.New("rate limited by provider")
	ErrContextTooLarge     = errors.New("context exceeds model limit")
	ErrInvalidResponse     = errors.New("invalid response from provider")
)

// Provider is the interface all LLM providers must implement.
// Adding a new provider = implement this interface + add config.
type Provider interface {
	// Chat sends a message and returns a response
	Chat(ctx context.Context, req ChatRequest) (*ChatResponse, error)

	// ChatStream sends a message and streams the response
	ChatStream(ctx context.Context, req ChatRequest) (<-chan StreamChunk, error)

	// Name returns the provider name for logging
	Name() string

	// HealthCheck verifies the provider is available
	HealthCheck(ctx context.Context) error
}

// ChatRequest is the provider-agnostic request format
type ChatRequest struct {
	Messages    []Message
	Model       string
	Temperature float64
	MaxTokens   int
	Stream      bool
}

// Message is a single message in the conversation
type Message struct {
	Role    string `json:"role"`    // "system", "user", "assistant"
	Content string `json:"content"`
}

// ChatResponse is the provider-agnostic response format
type ChatResponse struct {
	Content      string
	Model        string
	TokensInput  int
	TokensOutput int
	FinishReason string
}

// StreamChunk is a single chunk in a streamed response
type StreamChunk struct {
	Content string
	Done    bool
	Error   error
}

// NewMessage creates a new message with the given role and content
func NewMessage(role, content string) Message {
	return Message{Role: role, Content: content}
}

// SystemMessage creates a system message
func SystemMessage(content string) Message {
	return NewMessage("system", content)
}

// UserMessage creates a user message
func UserMessage(content string) Message {
	return NewMessage("user", content)
}

// AssistantMessage creates an assistant message
func AssistantMessage(content string) Message {
	return NewMessage("assistant", content)
}
