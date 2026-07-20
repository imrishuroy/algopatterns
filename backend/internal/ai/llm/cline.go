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

type ClineProvider struct {
	client   *http.Client
	baseURL  string
	apiKey   string
	model    string
	maxRetry int
}

type ClineConfig struct {
	BaseURL  string
	APIKey   string
	Model    string
	Timeout  time.Duration
	MaxRetry int
}

func NewClineProvider(cfg ClineConfig) *ClineProvider {
	if cfg.BaseURL == "" {
		cfg.BaseURL = "https://api.cline.bot/api/v1"
	}
	if cfg.Model == "" {
		cfg.Model = "deepseek/deepseek-v4-flash"
	}
	if cfg.Timeout == 0 {
		cfg.Timeout = 60 * time.Second
	}
	if cfg.MaxRetry == 0 {
		cfg.MaxRetry = 2
	}

	return &ClineProvider{
		client:   &http.Client{Timeout: cfg.Timeout},
		baseURL:  strings.TrimSuffix(cfg.BaseURL, "/"),
		apiKey:   cfg.APIKey,
		model:    cfg.Model,
		maxRetry: cfg.MaxRetry,
	}
}

type clineRequest struct {
	Model       string    `json:"model"`
	Messages    []Message `json:"messages"`
	Temperature float64   `json:"temperature,omitempty"`
	TopP        float64   `json:"top_p,omitempty"`
	MaxTokens   int       `json:"max_tokens,omitempty"`
	Stream      bool      `json:"stream,omitempty"`
}

type clineResponseData struct {
	ID      string `json:"id"`
	Object  string `json:"object"`
	Created int64  `json:"created"`
	Model   string `json:"model"`
	Choices []struct {
		Index   int `json:"index"`
		Message struct {
			Role             string `json:"role"`
			Content          string `json:"content"`
			ReasoningContent string `json:"reasoning_content"`
		} `json:"message"`
		FinishReason string `json:"finish_reason"`
	} `json:"choices"`
	Usage struct {
		PromptTokens     int `json:"prompt_tokens"`
		CompletionTokens int `json:"completion_tokens"`
		TotalTokens      int `json:"total_tokens"`
	} `json:"usage"`
}

type clineResponse struct {
	Data    clineResponseData `json:"data"`
	Success bool              `json:"success"`
}

type clineStreamResponse struct {
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

func (p *ClineProvider) Chat(ctx context.Context, req ChatRequest) (*ChatResponse, error) {
	model := req.Model
	if model == "" {
		model = p.model
	}

	clineReq := clineRequest{
		Model:       model,
		Messages:    req.Messages,
		Temperature: req.Temperature,
		TopP:        req.TopP,
		MaxTokens:   req.MaxTokens,
		Stream:      false,
	}

	body, err := MarshalWithExtra(clineReq, req.ExtraBody)
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

	// Read body for debugging
	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	var clineResp clineResponse
	if err := json.Unmarshal(respBody, &clineResp); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	if len(clineResp.Data.Choices) == 0 {
		log.Warn().Str("raw_body", string(respBody)).Msg("Cline returned no choices")
		return nil, ErrInvalidResponse
	}

	return &ChatResponse{
		Content:          clineResp.Data.Choices[0].Message.Content,
		ReasoningContent: clineResp.Data.Choices[0].Message.ReasoningContent,
		Model:            clineResp.Data.Model,
		TokensInput:      clineResp.Data.Usage.PromptTokens,
		TokensOutput:     clineResp.Data.Usage.CompletionTokens,
		FinishReason:     clineResp.Data.Choices[0].FinishReason,
	}, nil
}

func (p *ClineProvider) ChatStream(ctx context.Context, req ChatRequest) (<-chan StreamChunk, error) {
	model := req.Model
	if model == "" {
		model = p.model
	}

	clineReq := clineRequest{
		Model:       model,
		Messages:    req.Messages,
		Temperature: req.Temperature,
		TopP:        req.TopP,
		MaxTokens:   req.MaxTokens,
		Stream:      true,
	}

	body, err := MarshalWithExtra(clineReq, req.ExtraBody)
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

			var streamResp clineStreamResponse
			if err := json.Unmarshal([]byte(data), &streamResp); err != nil {
				continue
			}

			if len(streamResp.Choices) > 0 {
				content := streamResp.Choices[0].Delta.Content
				reasoning := streamResp.Choices[0].Delta.ReasoningContent
				if content != "" || reasoning != "" {
					chunks <- StreamChunk{
						Content:          content,
						ReasoningContent: reasoning,
					}
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

func (p *ClineProvider) Name() string {
	return "cline"
}

func (p *ClineProvider) HealthCheck(ctx context.Context) error {
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
