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
)

// ClaudeProvider implements the Provider interface for Claude/Anthropic API
type ClaudeProvider struct {
	apiKey     string
	baseURL    string
	model      string
	httpClient *http.Client
}

// ClaudeConfig holds configuration for the Claude provider
type ClaudeConfig struct {
	APIKey  string
	BaseURL string
	Model   string
	Timeout time.Duration
}

// NewClaudeProvider creates a new Claude provider
func NewClaudeProvider(cfg ClaudeConfig) *ClaudeProvider {
	if cfg.BaseURL == "" {
		cfg.BaseURL = "https://api.anthropic.com/v1"
	}
	if cfg.Model == "" {
		cfg.Model = "claude-sonnet-4-20250514"
	}
	if cfg.Timeout == 0 {
		cfg.Timeout = 60 * time.Second
	}

	return &ClaudeProvider{
		apiKey:  cfg.APIKey,
		baseURL: strings.TrimSuffix(cfg.BaseURL, "/"),
		model:   cfg.Model,
		httpClient: &http.Client{
			Timeout: cfg.Timeout,
		},
	}
}

type claudeMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type claudeRequest struct {
	Model     string          `json:"model"`
	MaxTokens int             `json:"max_tokens"`
	System    string          `json:"system,omitempty"`
	Messages  []claudeMessage `json:"messages"`
	Stream    bool            `json:"stream,omitempty"`
}

type claudeUsage struct {
	InputTokens  int `json:"input_tokens"`
	OutputTokens int `json:"output_tokens"`
}

type claudeContentBlock struct {
	Type string `json:"type"`
	Text string `json:"text"`
}

type claudeResponse struct {
	ID           string               `json:"id"`
	Type         string               `json:"type"`
	Role         string               `json:"role"`
	Content      []claudeContentBlock `json:"content"`
	Model        string               `json:"model"`
	StopReason   string               `json:"stop_reason"`
	StopSequence *string              `json:"stop_sequence"`
	Usage        claudeUsage          `json:"usage"`
}

type claudeStreamEvent struct {
	Type  string `json:"type"`
	Index int    `json:"index,omitempty"`
	Delta *struct {
		Type string `json:"type"`
		Text string `json:"text"`
	} `json:"delta,omitempty"`
	ContentBlock *struct {
		Type string `json:"type"`
		Text string `json:"text"`
	} `json:"content_block,omitempty"`
	Message *claudeResponse `json:"message,omitempty"`
	Usage   *claudeUsage    `json:"usage,omitempty"`
}

// Chat sends a chat request to Claude
func (p *ClaudeProvider) Chat(ctx context.Context, req ChatRequest) (*ChatResponse, error) {
	claudeReq := p.buildRequest(req)

	body, err := json.Marshal(claudeReq)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	httpReq, err := http.NewRequestWithContext(ctx, "POST", p.baseURL+"/messages", bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	p.setHeaders(httpReq)

	resp, err := p.httpClient.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("API error (status %d): %s", resp.StatusCode, string(bodyBytes))
	}

	var claudeResp claudeResponse
	if err := json.NewDecoder(resp.Body).Decode(&claudeResp); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	content := ""
	for _, block := range claudeResp.Content {
		if block.Type == "text" {
			content += block.Text
		}
	}

	return &ChatResponse{
		Content:      content,
		Model:        claudeResp.Model,
		TokensInput:  claudeResp.Usage.InputTokens,
		TokensOutput: claudeResp.Usage.OutputTokens,
		FinishReason: claudeResp.StopReason,
	}, nil
}

// ChatStream sends a streaming chat request to Claude
func (p *ClaudeProvider) ChatStream(ctx context.Context, req ChatRequest) (<-chan StreamChunk, error) {
	claudeReq := p.buildRequest(req)
	claudeReq.Stream = true

	body, err := json.Marshal(claudeReq)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	httpReq, err := http.NewRequestWithContext(ctx, "POST", p.baseURL+"/messages", bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	p.setHeaders(httpReq)

	resp, err := p.httpClient.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("request failed: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		resp.Body.Close()
		return nil, fmt.Errorf("API error (status %d): %s", resp.StatusCode, string(bodyBytes))
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
			if data == "" {
				continue
			}

			var event claudeStreamEvent
			if err := json.Unmarshal([]byte(data), &event); err != nil {
				continue
			}

			switch event.Type {
			case "content_block_delta":
				if event.Delta != nil && event.Delta.Type == "text_delta" {
					chunks <- StreamChunk{
						Content: event.Delta.Text,
					}
				}
			case "message_stop":
				chunks <- StreamChunk{
					Done: true,
				}
				return
			case "error":
				chunks <- StreamChunk{
					Error: fmt.Errorf("stream error"),
					Done:  true,
				}
				return
			}
		}

		if err := scanner.Err(); err != nil && err != context.Canceled {
			chunks <- StreamChunk{
				Error: err,
				Done:  true,
			}
		}
	}()

	return chunks, nil
}

// Name returns the provider name
func (p *ClaudeProvider) Name() string {
	return "claude"
}

// HealthCheck verifies the provider is working
func (p *ClaudeProvider) HealthCheck(ctx context.Context) error {
	req := ChatRequest{
		Messages: []Message{
			UserMessage("Hello"),
		},
		MaxTokens: 10,
	}

	_, err := p.Chat(ctx, req)
	return err
}

func (p *ClaudeProvider) buildRequest(req ChatRequest) claudeRequest {
	var system string
	var messages []claudeMessage

	for _, msg := range req.Messages {
		if msg.Role == "system" {
			system = msg.Content
		} else {
			messages = append(messages, claudeMessage{
				Role:    msg.Role,
				Content: msg.Content,
			})
		}
	}

	maxTokens := req.MaxTokens
	if maxTokens == 0 {
		maxTokens = 1024
	}

	return claudeRequest{
		Model:     p.model,
		MaxTokens: maxTokens,
		System:    system,
		Messages:  messages,
	}
}

func (p *ClaudeProvider) setHeaders(req *http.Request) {
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("anthropic-version", "2023-06-01")
	req.Header.Set("x-api-key", p.apiKey)
}
