package llm

import (
	"bufio"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net"
	"net/http"
	"strings"
	"time"
)

// DeepSeekProvider implements the Provider interface for DeepSeek API
type DeepSeekProvider struct {
	client           *http.Client
	baseURL          string
	apiKey           string
	model            string
	maxRetry         int
	reasoningEffort  string // "low", "medium", "high", or "" to omit
	includeReasoning *bool  // nil to omit, false to suppress reasoning tokens
}

// DeepSeekConfig holds configuration for the DeepSeek provider
type DeepSeekConfig struct {
	BaseURL          string
	APIKey           string
	Model            string
	Timeout          time.Duration
	MaxRetry         int
	ReasoningEffort  string // "low", "medium", "high" (reasoning models only)
	IncludeReasoning *bool  // false to suppress reasoning in response
}

// NewDeepSeekProvider creates a new DeepSeek provider
func NewDeepSeekProvider(cfg DeepSeekConfig) *DeepSeekProvider {
	if cfg.BaseURL == "" {
		cfg.BaseURL = "https://api.deepseek.com/v1"
	}
	if cfg.Model == "" {
		cfg.Model = "deepseek-v4-pro"
	}
	if cfg.Timeout == 0 {
		cfg.Timeout = 30 * time.Second
	}
	if cfg.MaxRetry == 0 {
		cfg.MaxRetry = 2
	}

	return &DeepSeekProvider{
		client: &http.Client{
			Timeout: cfg.Timeout,
			Transport: &http.Transport{
				DialContext: func(ctx context.Context, _, addr string) (net.Conn, error) {
					dialer := &net.Dialer{Timeout: 10 * time.Second}
					return dialer.DialContext(ctx, "tcp4", addr)
				},
			},
		},
		baseURL:          cfg.BaseURL,
		apiKey:           cfg.APIKey,
		model:            cfg.Model,
		maxRetry:         cfg.MaxRetry,
		reasoningEffort:  cfg.ReasoningEffort,
		includeReasoning: cfg.IncludeReasoning,
	}
}

// deepseekRequest is the request format for DeepSeek API (OpenAI-compatible)
type deepseekRequest struct {
	Model            string         `json:"model"`
	Messages         []Message      `json:"messages"`
	Temperature      float64        `json:"temperature,omitempty"`
	MaxTokens        int            `json:"max_tokens,omitempty"`
	Stream           bool           `json:"stream,omitempty"`
	ReasoningEffort  string         `json:"reasoning_effort,omitempty"`
	IncludeReasoning *bool          `json:"include_reasoning,omitempty"`
	Thinking         *thinkingParam `json:"thinking,omitempty"`
}

type thinkingParam struct {
	Type string `json:"type"` // "enabled" or "disabled"
}

// deepseekResponse is the response format from DeepSeek API
type deepseekResponse struct {
	ID      string `json:"id"`
	Object  string `json:"object"`
	Created int64  `json:"created"`
	Model   string `json:"model"`
	Choices []struct {
		Index   int `json:"index"`
		Message struct {
			Role             string `json:"role"`
			Content          string `json:"content"`
			ReasoningContent string `json:"reasoning_content,omitempty"`
		} `json:"message"`
		FinishReason string `json:"finish_reason"`
	} `json:"choices"`
	Usage struct {
		PromptTokens     int `json:"prompt_tokens"`
		CompletionTokens int `json:"completion_tokens"`
		TotalTokens      int `json:"total_tokens"`
		ReasoningTokens  int `json:"reasoning_tokens,omitempty"`
	} `json:"usage"`
}

// deepseekStreamResponse is a single chunk in a streamed response
type deepseekStreamResponse struct {
	ID      string `json:"id"`
	Object  string `json:"object"`
	Created int64  `json:"created"`
	Model   string `json:"model"`
	Choices []struct {
		Index int `json:"index"`
		Delta struct {
			Role             string `json:"role,omitempty"`
			Content          string `json:"content,omitempty"`
			ReasoningContent string `json:"reasoning_content,omitempty"`
		} `json:"delta"`
		FinishReason string `json:"finish_reason,omitempty"`
	} `json:"choices"`
}

// Chat sends a message and returns a response
func (p *DeepSeekProvider) Chat(ctx context.Context, req ChatRequest) (*ChatResponse, error) {
	model := req.Model
	if model == "" {
		model = p.model
	}

	deepseekReq := deepseekRequest{
		Model:            model,
		Messages:         req.Messages,
		Temperature:      req.Temperature,
		MaxTokens:        req.MaxTokens,
		Stream:           false,
		ReasoningEffort:  p.reasoningEffort,
		IncludeReasoning: p.includeReasoning,
	}

	// Enable thinking for V4 Pro reasoning
	if p.includeReasoning != nil && *p.includeReasoning {
		deepseekReq.Thinking = &thinkingParam{Type: "enabled"}
	}

	body, err := json.Marshal(deepseekReq)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	httpReq, err := http.NewRequestWithContext(ctx, "POST", p.baseURL+"/chat/completions", bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Authorization", "Bearer "+p.apiKey)

	resp, err := p.client.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusTooManyRequests {
		return nil, ErrRateLimited
	}

	if resp.StatusCode != http.StatusOK {
		respBody, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("API error (status %d): %s", resp.StatusCode, string(respBody))
	}

	var deepseekResp deepseekResponse
	if err := json.NewDecoder(resp.Body).Decode(&deepseekResp); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	if len(deepseekResp.Choices) == 0 {
		return nil, ErrInvalidResponse
	}

	return &ChatResponse{
		Content:          deepseekResp.Choices[0].Message.Content,
		ReasoningContent: deepseekResp.Choices[0].Message.ReasoningContent,
		Model:            deepseekResp.Model,
		TokensInput:      deepseekResp.Usage.PromptTokens,
		TokensOutput:     deepseekResp.Usage.CompletionTokens,
		FinishReason:     deepseekResp.Choices[0].FinishReason,
	}, nil
}

// ChatStream sends a message and streams the response
func (p *DeepSeekProvider) ChatStream(ctx context.Context, req ChatRequest) (<-chan StreamChunk, error) {
	model := req.Model
	if model == "" {
		model = p.model
	}

	deepseekReq := deepseekRequest{
		Model:            model,
		Messages:         req.Messages,
		Temperature:      req.Temperature,
		MaxTokens:        req.MaxTokens,
		Stream:           true,
		ReasoningEffort:  p.reasoningEffort,
		IncludeReasoning: p.includeReasoning,
	}

	// Enable thinking for V4 Pro reasoning
	if p.includeReasoning != nil && *p.includeReasoning {
		deepseekReq.Thinking = &thinkingParam{Type: "enabled"}
	}

	body, err := json.Marshal(deepseekReq)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	httpReq, err := http.NewRequestWithContext(ctx, "POST", p.baseURL+"/chat/completions", bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Authorization", "Bearer "+p.apiKey)
	httpReq.Header.Set("Accept", "text/event-stream")

	resp, err := p.client.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("request failed: %w", err)
	}

	if resp.StatusCode == http.StatusTooManyRequests {
		resp.Body.Close()
		return nil, ErrRateLimited
	}

	if resp.StatusCode != http.StatusOK {
		respBody, _ := io.ReadAll(resp.Body)
		resp.Body.Close()
		return nil, fmt.Errorf("API error (status %d): %s", resp.StatusCode, string(respBody))
	}

	chunks := make(chan StreamChunk, 100)

	go func() {
		defer close(chunks)
		defer resp.Body.Close()

		scanner := bufio.NewScanner(resp.Body)
		for scanner.Scan() {
			line := scanner.Text()

			if !strings.HasPrefix(line, "data: ") {
				continue
			}

			data := strings.TrimPrefix(line, "data: ")
			if data == "[DONE]" {
				chunks <- StreamChunk{Done: true}
				return
			}

			var streamResp deepseekStreamResponse
			if err := json.Unmarshal([]byte(data), &streamResp); err != nil {
				continue
			}

			if len(streamResp.Choices) > 0 {
				reasoning := streamResp.Choices[0].Delta.ReasoningContent
				if reasoning != "" {
					chunks <- StreamChunk{ReasoningContent: reasoning}
				}

				content := streamResp.Choices[0].Delta.Content
				if content != "" {
					chunks <- StreamChunk{Content: content}
				}

				if streamResp.Choices[0].FinishReason != "" {
					chunks <- StreamChunk{Done: true}
					return
				}
			}
		}

		if err := scanner.Err(); err != nil {
			chunks <- StreamChunk{Error: err}
		}
	}()

	return chunks, nil
}

// Name returns the provider name
func (p *DeepSeekProvider) Name() string {
	return "deepseek"
}

// HealthCheck verifies the provider is available
func (p *DeepSeekProvider) HealthCheck(ctx context.Context) error {
	req := ChatRequest{
		Messages:  []Message{UserMessage("ping")},
		MaxTokens: 5,
	}

	_, err := p.Chat(ctx, req)
	if err != nil {
		return fmt.Errorf("health check failed: %w", err)
	}

	return nil
}
