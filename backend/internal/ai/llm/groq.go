package llm

import (
	"bufio"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/rs/zerolog/log"
)

// GroqProvider implements the Provider interface for Groq API (OpenAI-compatible)
type GroqProvider struct {
	client           *http.Client
	baseURL          string
	apiKey           string
	model            string
	maxRetry         int
	reasoningEffort  string // "low", "medium", "high", or "" to omit
	includeReasoning *bool  // nil to omit, false to suppress reasoning tokens
}

// GroqConfig holds configuration for the Groq provider
type GroqConfig struct {
	BaseURL          string
	APIKey           string
	Model            string
	Timeout          time.Duration
	MaxRetry         int
	ReasoningEffort  string // "low", "medium", "high" (GPT-OSS only)
	IncludeReasoning *bool  // false to suppress reasoning in response
}

// NewGroqProvider creates a new Groq provider
func NewGroqProvider(cfg GroqConfig) *GroqProvider {
	if cfg.BaseURL == "" {
		cfg.BaseURL = "https://api.groq.com/openai/v1"
	}
	if cfg.Model == "" {
		cfg.Model = "openai/gpt-oss-120b"
	}
	if cfg.Timeout == 0 {
		cfg.Timeout = 60 * time.Second
	}
	if cfg.MaxRetry == 0 {
		cfg.MaxRetry = 2
	}

	return &GroqProvider{
		client:           &http.Client{Timeout: cfg.Timeout},
		baseURL:          cfg.BaseURL,
		apiKey:           cfg.APIKey,
		model:            cfg.Model,
		maxRetry:         cfg.MaxRetry,
		reasoningEffort:  cfg.ReasoningEffort,
		includeReasoning: cfg.IncludeReasoning,
	}
}

// groqRequest is the request format for Groq API (OpenAI-compatible)
type groqRequest struct {
	Model            string    `json:"model"`
	Messages         []Message `json:"messages"`
	Temperature      float64   `json:"temperature,omitempty"`
	TopP             float64   `json:"top_p,omitempty"`
	MaxTokens        int       `json:"max_completion_tokens,omitempty"`
	Stop             []string  `json:"stop,omitempty"`
	Seed             int       `json:"seed,omitempty"`
	Stream           bool      `json:"stream,omitempty"`
	ReasoningEffort  string    `json:"reasoning_effort,omitempty"`
	IncludeReasoning *bool     `json:"include_reasoning,omitempty"`
}

// groqResponse is the response format from Groq API
type groqResponse struct {
	ID      string `json:"id"`
	Object  string `json:"object"`
	Created int64  `json:"created"`
	Model   string `json:"model"`
	Choices []struct {
		Index   int `json:"index"`
		Message struct {
			Role      string `json:"role"`
			Content   string `json:"content"`
			Reasoning string `json:"reasoning,omitempty"`
		} `json:"message"`
		FinishReason string `json:"finish_reason"`
	} `json:"choices"`
	Usage struct {
		PromptTokens     int `json:"prompt_tokens"`
		CompletionTokens int `json:"completion_tokens"`
		TotalTokens      int `json:"total_tokens"`
	} `json:"usage"`
}

// groqStreamResponse is a single chunk in a streamed response
type groqStreamResponse struct {
	ID      string `json:"id"`
	Object  string `json:"object"`
	Created int64  `json:"created"`
	Model   string `json:"model"`
	Choices []struct {
		Index int `json:"index"`
		Delta struct {
			Role      string `json:"role,omitempty"`
			Content   string `json:"content,omitempty"`
			Reasoning string `json:"reasoning,omitempty"`
		} `json:"delta"`
		FinishReason string `json:"finish_reason,omitempty"`
	} `json:"choices"`
}

// Chat sends a message and returns a response
func (p *GroqProvider) Chat(ctx context.Context, req ChatRequest) (*ChatResponse, error) {
	model := req.Model
	if model == "" {
		model = p.model
	}

	groqReq := groqRequest{
		Model:            model,
		Messages:         req.Messages,
		Temperature:      req.Temperature,
		MaxTokens:        req.MaxTokens,
		Stream:           false,
		ReasoningEffort:  p.reasoningEffort,
		IncludeReasoning: p.includeReasoning,
	}

	body, err := json.Marshal(groqReq)
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

	// Read the full body for debugging
	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %w", err)
	}

	// Log raw response for debugging title generation
	if len(respBody) < 2000 {
		log.Debug().Str("raw_body", string(respBody)).Msg("Groq raw response")
	}

	var groqResp groqResponse
	if err := json.Unmarshal(respBody, &groqResp); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	if len(groqResp.Choices) == 0 {
		return nil, ErrInvalidResponse
	}

	// Use content, or fall back to reasoning if content is empty
	content := groqResp.Choices[0].Message.Content
	if content == "" && groqResp.Choices[0].Message.Reasoning != "" {
		content = groqResp.Choices[0].Message.Reasoning
	}

	log.Debug().
		Str("content", content).
		Str("reasoning", groqResp.Choices[0].Message.Reasoning).
		Str("finish_reason", groqResp.Choices[0].FinishReason).
		Msg("Groq parsed response")

	return &ChatResponse{
		Content:      content,
		Model:        groqResp.Model,
		TokensInput:  groqResp.Usage.PromptTokens,
		TokensOutput: groqResp.Usage.CompletionTokens,
		FinishReason: groqResp.Choices[0].FinishReason,
	}, nil
}

// ChatStream sends a message and streams the response
func (p *GroqProvider) ChatStream(ctx context.Context, req ChatRequest) (<-chan StreamChunk, error) {
	model := req.Model
	if model == "" {
		model = p.model
	}

	groqReq := groqRequest{
		Model:            model,
		Messages:         req.Messages,
		Temperature:      req.Temperature,
		MaxTokens:        req.MaxTokens,
		Stream:           true,
		ReasoningEffort:  p.reasoningEffort,
		IncludeReasoning: p.includeReasoning,
	}

	body, err := json.Marshal(groqReq)
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

			var streamResp groqStreamResponse
			if err := json.Unmarshal([]byte(data), &streamResp); err != nil {
				continue
			}

			if len(streamResp.Choices) > 0 {
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
func (p *GroqProvider) Name() string {
	return "groq"
}

// HealthCheck verifies the provider is available
func (p *GroqProvider) HealthCheck(ctx context.Context) error {
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
